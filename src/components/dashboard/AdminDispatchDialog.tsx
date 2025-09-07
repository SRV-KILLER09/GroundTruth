
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, TriangleAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeDisasterUpdate } from '@/ai/flows/summarize-disaster-updates';
import type { DisasterUpdate } from '@/lib/mock-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AdminDispatchDialogProps {
  update: DisasterUpdate | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type PriorityLevel = 'Info' | 'Caution' | 'Critical';

const priorityConfig: Record<PriorityLevel, { class: string, icon: React.ReactNode }> = {
    'Info': { class: 'text-blue-500', icon: <TriangleAlert className="h-4 w-4 mr-2" /> },
    'Caution': { class: 'text-yellow-500', icon: <TriangleAlert className="h-4 w-4 mr-2" /> },
    'Critical': { class: 'text-red-500', icon: <TriangleAlert className="h-4 w-4 mr-2" /> },
}

export function AdminDispatchDialog({ update, isOpen, onOpenChange }: AdminDispatchDialogProps) {
  const [summary, setSummary] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Caution');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (update?.message && isOpen) {
      setIsGenerating(true);
      setSummary('');
      setPhoneNumber('');
      setPriority('Caution');
      summarizeDisasterUpdate({ updateMessage: update.message })
        .then((result) => {
          setSummary(result.summary);
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'AI Error',
            description: 'Failed to generate summary.',
          });
          console.error(error);
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [update, isOpen, toast]);
  
  const handleSend = () => {
    if (!phoneNumber.trim() || !/^\d{10}$/.test(phoneNumber.trim())) {
        toast({
            variant: "destructive",
            title: "Invalid Phone Number",
            description: "Please enter a valid 10-digit phone number.",
        });
        return;
    }

    setIsSending(true);
    // Simulate API call to dispatch message
    setTimeout(() => {
        toast({
            title: "Alert Dispatched",
            description: `A '${priority}' priority alert was sent to ${phoneNumber}.`,
        });
        setIsSending(false);
        onOpenChange(false);
        setPhoneNumber('');
    }, 1000);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dispatch Emergency Alert</DialogTitle>
          <DialogDescription>
            Review summary, set priority, and enter the authority's phone number to send.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="summary">AI-Generated Summary</Label>
                {isGenerating ? (
                    <div className="flex items-center justify-center h-24 bg-muted rounded-md">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ): (
                    <Textarea id="summary" value={summary} readOnly rows={4} className="bg-muted"/>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Authority Phone Number</Label>
                    <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="e.g., 1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                     <Select value={priority} onValueChange={(value: PriorityLevel) => setPriority(value)}>
                        <SelectTrigger id="priority" className={cn("font-bold", priorityConfig[priority].class)}>
                            <SelectValue placeholder="Set priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(priorityConfig) as PriorityLevel[]).map(level => (
                                <SelectItem key={level} value={level} className={cn("font-semibold", priorityConfig[level].class)}>
                                    <div className="flex items-center">
                                        {priorityConfig[level].icon}
                                        {level}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSend} disabled={isGenerating || isSending || !summary}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
            Send Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
