
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Video, Mic, MicOff, VideoOff, Send, Loader2, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoRecorderProps {
    onVideoSubmit: () => void;
    isSubmitting: boolean;
}

export function VideoRecorder({ onVideoSubmit, isSubmitting }: VideoRecorderProps) {
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setHasCameraPermission(true);
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera and microphone permissions in your browser settings.',
            });
          }
        };
    
        getCameraPermission();
    
        return () => {
          // Cleanup: stop the stream when the component unmounts
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
        };
      }, [toast]);

    const handleToggleMute = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };
    
    const handleToggleVideo = () => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleRecord = () => {
        setIsRecording(true);
        // In a real app, you would start MediaRecorder here.
        // For this demo, we'll just simulate a 5-second recording.
        setTimeout(() => {
            setIsRecording(false);
            toast({
                title: "Video Recorded",
                description: "Your video has been captured. Please submit your report.",
            });
            onVideoSubmit(); // Notify parent form that a video is "ready"
        }, 5000);
    };

    if (hasCameraPermission === null) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Requesting camera access...</p>
            </div>
        );
    }
    
    if (!hasCameraPermission) {
        return (
            <Alert variant="destructive">
                <Camera className="h-4 w-4"/>
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    You need to grant camera and microphone permissions to record a video update. Please check your browser settings.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {isRecording && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/80 text-white text-xs font-bold px-2 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        REC
                    </div>
                )}
                 {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <VideoOff className="h-12 w-12 text-muted-foreground" />
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center">
                 <div className="flex gap-2">
                    <Button type="button" variant={isMuted ? "destructive" : "outline"} size="icon" onClick={handleToggleMute} disabled={isRecording || isSubmitting}>
                        {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                     <Button type="button" variant={isVideoOff ? "destructive" : "outline"} size="icon" onClick={handleToggleVideo} disabled={isRecording || isSubmitting}>
                        {isVideoOff ? <VideoOff /> : <Video />}
                    </Button>
                </div>
                <Button type="button" onClick={handleRecord} disabled={isRecording || isSubmitting}>
                    {isRecording ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <StopCircle className="mr-2 h-4 w-4" />}
                    {isRecording ? "Recording..." : "Record Video"}
                </Button>
            </div>
            <Alert>
                <Video className="h-4 w-4"/>
                <AlertTitle>Video Reporting</AlertTitle>
                <AlertDescription>
                    Click "Record Video" to start a short recording. This will be sent to admins for verification.
                </AlertDescription>
            </Alert>
        </div>
    );
}
