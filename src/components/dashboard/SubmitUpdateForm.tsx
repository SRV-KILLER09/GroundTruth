
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
import { Loader2, MapPin, Mic, FileText, Video, StopCircle, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoRecorder } from "./VideoRecorder";
import { transcribeAudio } from "@/ai/flows/speech-to-text-flow";
import { generateDisasterImage } from "@/ai/flows/generate-disaster-image";


const formSchema = z.object({
  disasterType: z.enum(['Flood', 'Earthquake', 'Fire', 'Hurricane', 'Other']),
  otherDisasterType: z.string().optional(),
  locationName: z.string().min(1, { message: "Location is required." }),
  latitude: z.coerce.number().min(-90, "Must be > -90").max(90, "Must be < 90"),
  longitude: z.coerce.number().min(-180, "Must be > -180").max(180, "Must be < 180"),
  message: z.string().optional(),
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
type InputMode = 'text' | 'voice' | 'video';

interface SubmitUpdateFormProps {
    onSuccessfulSubmit: () => void;
}

export function SubmitUpdateForm({ onSuccessfulSubmit }: SubmitUpdateFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('text');

  // Voice to text recording
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  

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
  
  const onVideoRecorded = (videoFile: File) => {
    setMediaFile(videoFile);
    toast({ title: "Video Recorded", description: "The video has been attached to your report."});
  }

  const handleToggleVoiceRecording = async () => {
    if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = event => {
            audioChunksRef.current.push(event.data);
        }

        mediaRecorderRef.current.onstop = async () => {
            setIsTranscribing(true);
            toast({ title: "Processing audio...", description: "AI is transcribing your message." });
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                try {
                    const result = await transcribeAudio({ audioDataUri: base64Audio });
                    form.setValue('message', result.transcription);
                    setInputMode('text'); // Switch to text tab to show the result
                    toast({ title: "Transcription successful!"});
                } catch (error) {
                    console.error("Transcription error:", error);
                    toast({ variant: "destructive", title: "Transcription Failed", description: "Could not convert audio to text." });
                } finally {
                    setIsTranscribing(false);
                }
            };
            stream.getTracks().forEach(track => track.stop());
        }
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
        toast({ title: "Recording Voice Note..."});

    } catch (error) {
         toast({ variant: "destructive", title: "Microphone Error", description: "Could not access microphone. Please check permissions." });
    }
  }
  
  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true);
    let submissionError = false;

    if (!user || !user.displayName) {
        toast({ variant: "destructive", title: "Authentication Error" });
        setIsSubmitting(false);
        return;
    };
    
    if(values.latitude === undefined || values.longitude === undefined){
        toast({ variant: "destructive", title: "Location Required" });
        setIsSubmitting(false);
        return;
    }
    
    if (inputMode !== 'video' && !values.message?.trim()) {
        form.setError('message', { type: 'manual', message: 'Update message is required for a text or voice report.' });
        setIsSubmitting(false);
        return;
    }
    
    if (inputMode === 'video' && !mediaFile) {
        toast({ variant: 'destructive', title: 'Media Required', description: `Please record a video for this report type.` });
        setIsSubmitting(false);
        return;
    }

    const disasterType = values.disasterType === 'Other' ? values.otherDisasterType! : values.disasterType;

    let mediaUrl: string | null = null;
    let mediaType: 'image' | 'audio' | 'video' | null = null;

    try {
      if (inputMode === 'text' || inputMode === 'voice') {
        mediaType = 'image';
        toast({ title: "Generating AI Image...", description: "Please wait while our AI creates an image for your report." });
        const imageResult = await generateDisasterImage({ prompt: `${disasterType} at ${values.locationName}: ${values.message}`});
        
        toast({ title: "Uploading Image...", description: "Saving the generated image to storage."});
        const storageRef = ref(storage, `images/${user.uid}/${Date.now()}-ai.png`);
        // The data URI needs the prefix removed before uploading
        const uploadResult = await uploadString(storageRef, imageResult.imageDataUri.split(',')[1], 'base64', { contentType: 'image/png'});
        mediaUrl = await getDownloadURL(uploadResult.ref);

      } else if (mediaFile && inputMode === 'video') {
          // This logic for video upload is preserved.
          toast({ title: "Uploading Media...", description: "Please wait while we upload your file."});
          const fileType = mediaFile.type.split('/')[0] as 'image' | 'audio' | 'video';
          mediaType = fileType;
          
          const storageRef = ref(storage, `${mediaType}s/${user.uid}/${Date.now()}-${mediaFile.name}`);
          const uploadResult = await uploadBytes(storageRef, mediaFile);
          mediaUrl = await getDownloadURL(uploadResult.ref);
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
            message: values.message || `Video report submitted.`,
            mediaUrl: mediaUrl,
            mediaType: mediaType,
            history: [values.message || 'Media report submitted.'],
            replies: [],
            status: 'Under Investigation',
            authority: 'Local Police',
            likedBy: [],
            dislikedBy: [],
            timestamp: serverTimestamp(),
        });
        
        toast({ title: "Update Submitted", description: "Thank you for your report." });
        
        form.reset();
        setMediaFile(null);
        onSuccessfulSubmit();

    } catch (error) {
        console.error("Error submitting report: ", error);
        toast({ variant: "destructive", title: "Submission Error" });
        submissionError = true;
    } finally {
        setIsSubmitting(false);
        if(!submissionError) onSuccessfulSubmit();
    }
  }

  const handleTabChange = (value: string) => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
    setMediaFile(null);
    setInputMode(value as InputMode);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-2">
        <Tabs value={inputMode} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4"/>Text</TabsTrigger>
                <TabsTrigger value="voice"><Mic className="mr-2 h-4 w-4"/>Voice</TabsTrigger>
                <TabsTrigger value="video"><Video className="mr-2 h-4 w-4"/>Video</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="pt-4">
                 <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Update Message</FormLabel>
                        <FormControl>
                            <Textarea rows={5} placeholder="Provide a detailed update on the situation... An AI image will be generated from this description." {...field} disabled={isSubmitting}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </TabsContent>
             <TabsContent value="voice" className="pt-4 space-y-4">
                <div className="flex flex-col items-center justify-center gap-4 p-4 border rounded-lg bg-muted">
                     <p className="text-sm text-center text-muted-foreground">
                        Click to record your voice. It will be transcribed into the message field, and an AI image will be generated from it.
                     </p>
                    <Button 
                        type="button"
                        size="lg"
                        variant={isRecording ? "destructive" : "outline"}
                        onClick={handleToggleVoiceRecording}
                        className="w-full"
                        disabled={isSubmitting || isTranscribing}
                    >
                        {isRecording && <StopCircle className="mr-2 h-5 w-5"/>}
                        {!isRecording && !isTranscribing && <Mic className="mr-2 h-5 w-5" />}
                        {isTranscribing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        
                        {isRecording ? "Stop Recording" : (isTranscribing ? "Transcribing..." : "Record Voice")}
                    </Button>
                    {isRecording && <p className="text-sm text-muted-foreground animate-pulse">Recording...</p>}
                </div>
            </TabsContent>
            <TabsContent value="video" className="pt-4">
                <VideoRecorder onVideoRecorded={onVideoRecorded} />
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
        
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || isRecording}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting Report...' : 'Submit Update'}
        </Button>
      </form>
    </Form>
  );
}
