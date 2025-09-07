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
import { DisasterUpdate } from "@/lib/mock-data";
import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateDisasterImage } from "@/ai/flows/generate-disaster-image";

const formSchema = z.object({
  disasterType: z.enum(['Flood', 'Earthquake', 'Fire', 'Hurricane', 'Other']),
  otherDisasterType: z.string().optional(),
  locationName: z.string().min(1, { message: "Location is required." }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
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
    onSubmit: (data: Omit<DisasterUpdate, 'id' | 'timestamp' | 'replies'>) => void;
}

export function SubmitUpdateForm({ onSubmit }: SubmitUpdateFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disasterType: 'Flood',
      otherDisasterType: "",
      locationName: "",
      latitude: undefined,
      longitude: undefined,
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
        form.setValue("latitude", position.coords.latitude, { shouldValidate: true });
        form.setValue("longitude", position.coords.longitude, { shouldValidate: true });
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

    let imageUrl;
    try {
        toast({
            title: "Generating Image...",
            description: "Our AI is creating an image for your report. Please wait."
        });
        const imageResult = await generateDisasterImage({
            disasterType: disasterType,
            description: values.message,
        });
        imageUrl = imageResult.imageUrl;
    } catch (error) {
        console.error("Image generation failed:", error);
        toast({
            variant: "destructive",
            title: "Image Generation Failed",
            description: "Could not generate an image, but your report will be submitted without one.",
        });
    }

    const newUpdate = {
        user: {
            name: user.displayName,
            avatarUrl: `https://picsum.photos/seed/${user.email}/40/40`
        },
        disasterType: disasterType as any,
        location: {
            name: values.locationName,
            latitude: values.latitude,
            longitude: values.longitude
        },
        message: values.message,
        mediaUrl: imageUrl,
        history: [values.message]
    };
    
    onSubmit(newUpdate);
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-6">
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
                {form.getValues().latitude ? 'Re-acquire Location' : 'Acquire My Location'}
            </Button>
            {form.formState.errors.latitude && <p className="text-sm font-medium text-destructive">{form.formState.errors.latitude.message}</p>}
            {form.formState.errors.longitude && <p className="text-sm font-medium text-destructive">{form.formState.errors.longitude.message}</p>}
             {form.getValues().latitude && (
                <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                    Lat: {form.getValues().latitude?.toFixed(4)}, Lng: {form.getValues().longitude?.toFixed(4)}
                </div>
            )}
        </div>
        
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting Report...' : 'Submit Update'}
        </Button>
      </form>
    </Form>
  );
}
