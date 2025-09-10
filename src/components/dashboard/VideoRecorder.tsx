
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Video, Camera, StopCircle, Redo, Send, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VideoRecorderProps {
  onVideoRecorded: (videoFile: File) => void;
}

export function VideoRecorder({ onVideoRecorded }: VideoRecorderProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getCameraPermission = useCallback(async () => {
    // Reset state for re-enabling camera
    setRecordedVideoUrl(null);
    setVideoBlob(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
            variant: 'destructive',
            title: 'Media Devices Not Supported',
            description: 'Your browser does not support camera access.',
        });
        return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
      return null;
    }
  }, [toast]);
  
  // Effect to request camera permission when the component mounts or becomes visible
  useEffect(() => {
    getCameraPermission();

    // Cleanup function to stop media stream when component unmounts
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [getCameraPermission]);

  const handleStartRecording = async () => {
    const stream = await getCameraPermission();
    if (!stream) return;

    setIsRecording(true);
    const options = { mimeType: 'video/webm; codecs=vp9' };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);

        // Stop camera stream after recording
         if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    mediaRecorder.start();
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleRecordAgain = () => {
    setRecordedVideoUrl(null);
    setVideoBlob(null);
    getCameraPermission();
  }

  const handleSendVideo = () => {
    if (videoBlob) {
        setIsProcessing(true);
        const videoFile = new File([videoBlob], 'video-report.webm', { type: 'video/webm' });
        onVideoRecorded(videoFile);
        // The parent component will set processing to false after submission
    }
  };
  
  if (!hasCameraPermission) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
                Camera access is disabled. Please grant permission to record a video report.
                <Button onClick={getCameraPermission} variant="secondary" className="mt-4 w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Retry Camera Access
                </Button>
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border">
         <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          src={recordedVideoUrl || undefined} // Use src for recorded video, srcObject for live
          style={{ display: isRecording || !recordedVideoUrl ? 'block' : 'block' }}
        />
      </div>
      
       <div className="flex w-full justify-center gap-4">
        {!isRecording && !recordedVideoUrl && (
          <Button onClick={handleStartRecording} size="lg" className="w-full">
            <Camera className="mr-2 h-5 w-5" /> Start Recording
          </Button>
        )}
        {isRecording && (
          <Button onClick={handleStopRecording} size="lg" variant="destructive" className="w-full">
            <StopCircle className="mr-2 h-5 w-5" /> Stop Recording
          </Button>
        )}
        {recordedVideoUrl && (
            <>
                <Button onClick={handleRecordAgain} size="lg" variant="outline" className="w-full" disabled={isProcessing}>
                    <Redo className="mr-2 h-5 w-5" /> Record Again
                </Button>
                <Button onClick={handleSendVideo} size="lg" className="w-full" disabled={isProcessing}>
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-5 w-5" />
                    )}
                    Send Report
                </Button>
            </>
        )}
      </div>
    </div>
  );
}
