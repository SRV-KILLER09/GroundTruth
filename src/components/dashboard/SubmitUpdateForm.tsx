
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
import { Loader2, MapPin, Upload, Bot, Mic, MicOff, Video, AudioLines } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { transcribeAudio } from "@/ai/flows/speech-to-text-flow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { VideoRecorder } from "./VideoRecorder";


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

export function SubmitUpdateForm({ onSuccessfulSubmit }: SubmitUpdateFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Voice input state
  const [isDictating, setIsDictating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const dictationRecorderRef = useRef<MediaRecorder | null>(null);
  const dictationChunksRef = useRef<Blob[]>([]);

  // Voice note recording
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);


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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 25 * 1024 * 1024) { // 25MB limit for all media
             toast({
                variant: "destructive",
                title: "File Too Large",
                description: "Please select a file smaller than 25MB.",
            });
            return;
        }
        setMediaFile(file);
    }
  }

  const handleToggleDictation = async () => {
    if (isDictating) {
        dictationRecorderRef.current?.stop();
        setIsDictating(false);
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        dictationRecorderRef.current = new MediaRecorder(stream);
        dictationChunksRef.current = [];

        dictationRecorderRef.current.ondataavailable = (event) => {
            dictationChunksRef.current.push(event.data);
        };

        dictationRecorderRef.current.onstop = async () => {
            setIsTranscribing(true);
            toast({ title: "Processing audio...", description: "AI is transcribing your message." });
            const audioBlob = new Blob(dictationChunksRef.current, { type: 'audio/webm' });

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                try {
                    const result = await transcribeAudio({ audioDataUri: base64Audio });
                    const currentMessage = form.getValues("message");
                    form.setValue("message", (currentMessage ? currentMessage + " " : "") + result.transcription, { shouldValidate: true });
                } catch (error) {
                    console.error("Transcription error:", error);
                    toast({ variant: "destructive", title: "Transcription Failed", description: "Could not convert audio to text." });
                } finally {
                    setIsTranscribing(false);
                }
            };
            stream.getTracks().forEach(track => track.stop());
        };

        dictationRecorderRef.current.start();
        setIsDictating(true);
    } catch (err) {
        toast({ variant: "destructive", title: "Microphone Error", description: "Could not access microphone. Please check permissions." });
    }
  };

  const handleToggleVoiceRecording = async () => {
    if (isRecordingVoice) {
        voiceRecorderRef.current?.stop();
        setIsRecordingVoice(false);
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceRecorderRef.current = new MediaRecorder(stream);
        voiceChunksRef.current = [];
        
        voiceRecorderRef.current.ondataavailable = event => {
            voiceChunksRef.current.push(event.data);
        }

        voiceRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(voiceChunksRef.current, { type: 'audio/mp3' });
            const audioFile = new File([audioBlob], "voice-note.mp3", { type: "audio/mp3" });
            setMediaFile(audioFile);
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
  
  const onVideoRecorded = (videoFile: File) => {
    setMediaFile(videoFile);
    setIsVideoDialogOpen(false);
    toast({ title: "Video Recorded", description: "The video has been attached to your report."});
  }

  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true);

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

    const disasterType = values.disasterType === 'Other' ? values.otherDisasterType! : values.disasterType;

    let mediaUrl: string | null = null;
    let mediaType: 'image' | 'audio' | 'video' = 'image';

    try {
        if (mediaFile) {
            toast({ title: "Uploading Media...", description: "Please wait while we upload your file."});
            const fileType = mediaFile.type.split('/')[0];
            const folder = fileType === 'video' ? 'videos' : fileType === 'audio' ? 'audios' : 'uploads';
            mediaType = fileType as 'image' | 'audio' | 'video';
            
            const storageRef = ref(storage, `${folder}/${user.uid}/${Date.now()}-${mediaFile.name}`);
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
            message: values.message,
            mediaUrl: mediaUrl,
            mediaType: mediaFile ? mediaType : null,
            history: [values.message],
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
        if(fileInputRef.current) fileInputRef.current.value = "";
        onSuccessfulSubmit();

    } catch (error) {
        console.error("Error submitting report: ", error);
        toast({ variant: "destructive", title: "Submission Error" });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-6">
        <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Update Message</FormLabel>
                <div className="relative">
                    <FormControl>
                        <Textarea rows={4} placeholder="Provide a detailed update on the situation..." {...field} disabled={isSubmitting || isDictating || isTranscribing} />
                    </FormControl>
                    <Button 
                        type="button" 
                        variant={isDictating ? "destructive" : "outline"} 
                        size="icon" 
                        onClick={handleToggleDictation}
                        disabled={isSubmitting || isTranscribing}
                        className="absolute bottom-2 right-2 h-8 w-8"
                        title="Dictate message"
                    >
                        {isDictating ? (
                            <MicOff className="h-4 w-4" />
                        ) : isTranscribing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Mic className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle voice dictation</span>
                    </Button>
                </div>
                <FormMessage />
                </FormItem>
            )}
        />
        <div className="space-y-2">
            <FormLabel>Attach Media (Optional)</FormLabel>
            <div className="grid grid-cols-2 gap-2">
                 <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                </Button>
                <Button type="button" variant={isRecordingVoice ? "destructive" : "outline"} className="w-full" onClick={handleToggleVoiceRecording} disabled={isSubmitting}>
                    <AudioLines className="mr-2 h-4 w-4" />
                    {isRecordingVoice ? "Stop" : "Record Voice"}
                </Button>
            </div>
            
            <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                <DialogTrigger asChild>
                     <Button type="button" variant="outline" className="w-full">
                        <Video className="mr-2 h-4 w-4" />
                        Record Video
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Record Video Report</DialogTitle>
                    </DialogHeader>
                    <VideoRecorder onVideoRecorded={onVideoRecorded} />
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>

            <Input type="file" ref={fileInputRef} className="hidden" accept="image/*,audio/*,video/*" onChange={handleFileChange} />

            {mediaFile && (
                <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md flex items-center gap-2">
                    {mediaFile.type.startsWith("image/") && <img src={URL.createObjectURL(mediaFile)} alt="preview" className="h-10 w-10 rounded object-cover" />}
                    {mediaFile.type.startsWith("video/") && <Video className="h-10 w-10 text-primary" />}
                     {mediaFile.type.startsWith("audio/") && <AudioLines className="h-10 w-10 text-primary" />}
                    <span>{mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
            )}
            {!mediaFile && (
                <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertTitle>No Image?</AlertTitle>
                    <AlertDescription>
                        If you don't provide an image, a stock photo will be used for your report.
                    </AlertDescription>
                </Alert>
            )}
        </div>

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
        
        <Button type="submit" className="w-full" disabled={isSubmitting || isDictating || isTranscribing || isRecordingVoice}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting Report...' : 'Submit Update'}
        </Button>
      </form>
    </Form>
  );
}
