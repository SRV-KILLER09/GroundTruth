
"use client";

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, StopCircle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { transcribeAudio } from '@/ai/flows/speech-to-text-flow';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';

export default function VoiceCommandWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleToggleListening = async () => {
    if (isListening) {
      mediaRecorderRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setTranscribedText('');

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const result = await transcribeAudio({ audioDataUri: base64Audio });
            setTranscribedText(result.transcription);
            toast({ title: 'Transcription Successful', description: 'Your speech has been converted to text.' });
          } catch (error) {
            console.error('Transcription error:', error);
            toast({ variant: 'destructive', title: 'Transcription Failed', description: 'Could not convert audio to text.' });
            setTranscribedText('Sorry, I could not understand that. Please try again.');
          } finally {
            setIsTranscribing(false);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Microphone Error', description: 'Could not access microphone. Please check permissions.' });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcribedText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };
  
  const handleOpenChange = (open: boolean) => {
    if(!open && isListening) {
        mediaRecorderRef.current?.stop();
        setIsListening(false);
    }
    setIsOpen(open);
    setTranscribedText('');
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-36 h-12 w-12 rounded-full shadow-lg z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => handleOpenChange(true)}
      >
        <Mic className="h-6 w-6" />
        <span className="sr-only">Open Voice Commands</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" /> Voice-to-Text Transcription
            </DialogTitle>
            <DialogDescription>
              Click the button to start recording. Your speech will be converted to text.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center gap-4">
            <Button
              size="lg"
              variant={isListening ? 'destructive' : 'default'}
              onClick={handleToggleListening}
              disabled={isTranscribing}
              className="w-48 h-16 text-lg"
            >
              {isListening ? (
                <>
                  <StopCircle className="mr-2 h-5 w-5" />
                  Stop Recording
                </>
              ) : isTranscribing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                </>
              )}
            </Button>
            {isListening && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                    Recording in progress...
                </div>
            )}
          </div>
           {transcribedText && (
            <div className="space-y-2">
                <label htmlFor="transcribed-text" className="text-sm font-medium">Transcribed Text:</label>
                <Textarea id="transcribed-text" value={transcribedText} readOnly rows={4} className="bg-muted"/>
                <Button onClick={handleCopy} size="sm" className="w-full">
                    {hasCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {hasCopied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
            </div>
           )}
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
