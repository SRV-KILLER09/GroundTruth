
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef } from "react";
import { Loader2, MapPin, Video, FileText, Upload, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoRecorder } from "./VideoRecorder";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


const formSchema = z.object({
  disasterType: z.enum(['Flood', 'Earthquake', 'Fire', 'Hurricane', 'Other']),
  otherDisasterType: z.string().optional(),
  locationName: z.string().min(1, { message: "Location is required." }),
  latitude: z.coerce.number().min(-90, "Must be > -90").max(90, "Must be < 90"),
  longitude: z.coerce.number().min(-180, "Must be > -180").max(180, "Must be < 180"),
  message: z.string().min(10, { message: "Update message must be at least 10 characters." }),
}).refine((data) => {
    if (data.disasterType === 'Other') {
        return !!data.otherDisasterType && data.otherDisasterType.trim().length > 0;
    }
    return true;
}, {
    message: "Please specify the disaster type.",
    path: ["otherDisasterType"],
});

type FormValues = z.infer<typeof formSchema>;

interface SubmitUpdateFormProps {
    onSuccessfulSubmit: () => void;
}

const placeholderImages = [
    'https://picsum.photos/seed/report1/800/600',
    'https://picsum.photos/seed/report2/800/600',
    'https://picsum.photos/seed/report3/800/600',
    'https://picsum.photos/seed/report4/800/600',
    'https://picsum.photos/seed/report5/800/600',
];

export function SubmitUpdateForm({ onSuccessfulSubmit }: SubmitUpdateFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVideoSubmitted, setIsVideoSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disasterType: 'Flood',
      otherDisasterType: "",
      locationName: "",
      latitude: "" as any,
      longitude: "" as any,
      message: "",
    },
  });

  const selectedDisasterType = form.watch("disasterType");

  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Error",
        description: "Geolocation is not supported by your browser.",
      });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude as any, { shouldValidate: true });
        form.setValue("longitude", position.coords.longitude as any, { shouldValidate: true });
        toast({
            title: "Location Acquired",
            description: "Your current location has been filled in.",
        })
        setIsLocating(false);
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Geolocation Error",
          description: `Could not get location: ${error.message}`,
        });
        setIsLocating(false);
      }
    );
  };
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
             toast({
                variant: "destructive",
                title: "File Too Large",
                description: "Please select an image file smaller than 10MB.",
            });
            return;
        }
        setImageFile(file);
    }
  }


  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true);

    if (!user || !user.displayName) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to submit an update.",
        });
        setIsSubmitting(false);
        return;
    };
    
    if(values.latitude === undefined || values.longitude === undefined){
        toast({
            variant: "destructive",
            title: "Location Required",
            description: "Please acquire your location before submitting.",
        });
        setIsSubmitting(false);
        return;
    }

    const disasterType = values.disasterType === 'Other' ? values.otherDisasterType! : values.disasterType;

    let mediaUrl: string | null = null;
    try {
        if (isVideoSubmitted) {
            // This is a placeholder for when video recording is implemented fully
            mediaUrl = "https://picsum.photos/600/400?blur";
        } else if (imageFile) {
            toast({ title: "Uploading Image...", description: "Please wait while we upload your image."});
            const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}-${imageFile.name}`);
            const uploadResult = await uploadBytes(storageRef, imageFile);
            mediaUrl = await getDownloadURL(uploadResult.ref);
        } else {
            const randomIndex = Math.floor(Math.random() * placeholderImages.length);
            mediaUrl = placeholderImages[randomIndex];
        }

        await addDoc(collection(db, "disaster_updates"), {
            user: {
                uid: user.uid,
                name: user.displayName,
                username: user.displayName.toLowerCase(),
                avatarUrl: user.photoURL || `https://picsum.photos/seed/${user.email}/40/40`
            },
            disasterType: disasterType,
            location: {
                name: values.locationName,
                latitude: values.latitude,
                longitude: values.longitude
            },
            message: values.message,
            mediaUrl: mediaUrl,
            history: [values.message],
            replies: [],
            status: 'Under Investigation',
            authority: 'Local Police',
            likedBy: [],
            dislikedBy: [],
            timestamp: serverTimestamp(),
        });
        
        toast({
            title: "Update Submitted",
            description: "Thank you for contributing to community safety.",
        });
        
        form.reset();
        setIsVideoSubmitted(false);
        setImageFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
        onSuccessfulSubmit();

    } catch (error) {
        console.error("Error submitting report: ", error);
        toast({
            variant: "destructive",
            title: "Submission Error",
            description: "Could not submit your report. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-6">
       <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4"/>Text Report</TabsTrigger>
                <TabsTrigger value="video"><Video className="mr-2 h-4 w-4"/>Video Report</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="space-y-6 pt-4">
                 <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Update Message</FormLabel>
                        <FormControl>
                            <Textarea rows={4} placeholder="Provide a detailed update on the situation..." {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="space-y-2">
                      <FormLabel>Attach Image (Optional)</FormLabel>
                       <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                         <Upload className="mr-2 h-4 w-4" />
                         {imageFile ? 'Change Image' : 'Upload Image'}
                      </Button>
                      <Input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageFileChange}
                      />
                      {imageFile && (
                          <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md flex items-center gap-2">
                              {imageFile.type.startsWith("image/") && (
                                <img src={URL.createObjectURL(imageFile)} alt="preview" className="h-10 w-10 rounded object-cover" />
                              )}
                              <span>{imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)</span>
                          </div>
                      )}
                      <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>No Image? No Problem.</AlertTitle>
                        <AlertDescription>
                            If you don't provide an image, a stock photo will be used for your report.
                        </AlertDescription>
                    </Alert>
                    </div>
            </TabsContent>
            <TabsContent value="video" className="pt-4">
                <VideoRecorder onVideoSubmit={() => setIsVideoSubmitted(true)} isSubmitting={isSubmitting} />
            </TabsContent>
        </Tabs>

        <FormField
          control={form.control}
          name="disasterType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disaster Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a disaster type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Flood">Flood</SelectItem>
                  <SelectItem value="Earthquake">Earthquake</SelectItem>
                  <SelectItem value="Fire">Fire</SelectItem>
                  <SelectItem value="Hurricane">Hurricane</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedDisasterType === 'Other' && (
            <FormField
            control={form.control}
            name="otherDisasterType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Please Specify</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Landslide, Tsunami" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
         <FormField
          control={form.control}
          name="locationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Downtown, City Park" {...field} disabled={isSubmitting}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
            <FormLabel>Location Coordinates</FormLabel>
            <Button type="button" variant="outline" className="w-full" onClick={handleGetLocation} disabled={isLocating || isSubmitting}>
                {isLocating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                )}
                Acquire My Location
            </Button>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="-23.5505" {...field} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="-46.6333" {...field} disabled={isSubmitting}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting Report...' : 'Submit Update'}
        </Button>
      </form>
    </Form>
  );
}
