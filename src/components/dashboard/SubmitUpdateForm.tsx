
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
import { useState, useRef, useEffect } from "react";
import { Loader2, MapPin, Mic, FileText, Video, StopCircle, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoRecorder } from "./VideoRecorder";
import { cn } from "@/lib/utils";


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

  // Voice note recording
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  

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
    if (isRecordingVoice) {
        voiceRecorderRef.current?.stop();
        setIsRecordingVoice(false);
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        voiceChunksRef.current = [];
        setMediaFile(null);
        setVoiceNoteUrl(null);
        
        voiceRecorderRef.current.ondataavailable = event => {
            voiceChunksRef.current.push(event.data);
        }

        voiceRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(voiceChunksRef.current, { type: 'audio/webm' });
            const audioFile = new File([audioBlob], "voice-note.webm", { type: "audio/webm" });
            setMediaFile(audioFile);
            setVoiceNoteUrl(URL.createObjectURL(audioBlob));
            stream.getTracks().forEach(track => track.stop());
            toast({ title: "Voice Note Recorded", description: "The audio has been attached to your report."});
        }
        
        voiceRecorderRef.current.start();
        setIsRecordingVoice(true);
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
    
    if (inputMode === 'text' && !values.message?.trim()) {
        form.setError('message', { type: 'manual', message: 'Update message is required for a text report.' });
        setIsSubmitting(false);
        return;
    }
    
    if ((inputMode === 'voice' || inputMode === 'video') && !mediaFile) {
        toast({ variant: 'destructive', title: 'Media Required', description: `Please record a ${inputMode} note for this report type.` });
        setIsSubmitting(false);
        return;
    }

    const disasterType = values.disasterType === 'Other' ? values.otherDisasterType! : values.disasterType;

    let mediaUrl: string | null = null;
    let mediaType: 'image' | 'audio' | 'video' | null = null;

    try {
        if (mediaFile) {
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
            message: values.message || `${inputMode.charAt(0).toUpperCase() + inputMode.slice(1)} report submitted.`,
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
        setVoiceNoteUrl(null);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-2">
        <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)} className="w-full">
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
                            <Textarea rows={5} placeholder="Provide a detailed update on the situation..." {...field} disabled={isSubmitting}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </TabsContent>
             <TabsContent value="voice" className="pt-4 space-y-4">
                <div className="flex flex-col items-center justify-center gap-4 p-4 border rounded-lg bg-muted">
                    <Button 
                        type="button"
                        size="lg"
                        variant={isRecordingVoice ? "destructive" : "outline"}
                        onClick={handleToggleVoiceRecording}
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isRecordingVoice ? <StopCircle className="mr-2 h-5 w-5"/> : <Mic className="mr-2 h-5 w-5" />}
                        {isRecordingVoice ? "Stop Recording" : "Start Recording"}
                    </Button>
                    {isRecordingVoice && <p className="text-sm text-muted-foreground animate-pulse">Recording...</p>}
                </div>
                {voiceNoteUrl && (
                    <div className="space-y-2">
                        <Label>Voice Note Preview</Label>
                        <audio src={voiceNoteUrl} controls className="w-full h-10" />
                         <div className="text-sm text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4"/>
                            <span>Voice note is ready to submit.</span>
                        </div>
                    </div>
                )}
                {!voiceNoteUrl && !isRecordingVoice && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                         <AlertCircle className="h-4 w-4"/>
                         <span>Record a voice note for your report.</span>
                    </div>
                )}
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
            <div className="grid grid-cols-2 gap-4 hidden">
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
        
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || isRecordingVoice}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting Report...' : 'Submit Update'}
        </Button>
      </form>
    </Form>
  );
}

