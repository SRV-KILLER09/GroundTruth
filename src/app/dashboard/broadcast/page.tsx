
"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Send, Loader2, Info } from "lucide-react";
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BroadcastPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const adminEmails = ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;
    
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        if (!loading && (!isAuthenticated || !isAdmin)) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, loading, router, isAdmin]);

    if (loading || !isAuthenticated || !isAdmin) {
        return <LoadingSpinner />;
    }

    const handleSendBroadcast = () => {
        if (!message.trim()) {
            toast({
                variant: "destructive",
                title: "Cannot Send Empty Message",
                description: "Please write a message to broadcast.",
            });
            return;
        }

        setIsSending(true);
        // Simulate sending the broadcast
        setTimeout(() => {
            setIsSending(false);
            setMessage("");
            toast({
                title: "Broadcast Sent",
                description: "Your message has been queued for delivery to all users.",
            });
        }, 1500);
    };
  
    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Megaphone className="mr-2 h-6 w-6 text-primary" />
                        System-Wide Broadcast
                    </CardTitle>
                    <CardDescription>
                        Send a critical alert message to all registered users via simulated email and SMS.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                            This is a simulation. No actual emails or SMS messages will be sent. Use this tool for demonstration purposes only.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <label htmlFor="broadcast-message" className="font-medium">
                            Broadcast Message
                        </label>
                        <Textarea
                            id="broadcast-message"
                            placeholder="Type your critical alert here..."
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isSending}
                        />
                    </div>

                    <Button 
                        onClick={handleSendBroadcast} 
                        disabled={isSending || !message.trim()}
                        className="w-full sm:w-auto"
                    >
                        {isSending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        {isSending ? "Broadcasting..." : "Send Broadcast to All Users"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
