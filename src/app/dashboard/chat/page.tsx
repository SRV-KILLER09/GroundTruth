
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ChatMessage {
    id: string;
    text: string;
    uid: string;
    displayName: string;
    photoURL: string;
    timestamp: Timestamp | null;
}

export default function ChatPage() {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const q = query(collection(db, "chat_messages"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: ChatMessage[] = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
            });
            setMessages(msgs);
            setMessagesLoading(false);
        }, (error) => {
            console.error("Error fetching chat messages: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load chat messages. Please check your Firestore rules."
            });
            setMessagesLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setIsSending(true);

        try {
            await addDoc(collection(db, "chat_messages"), {
                text: newMessage,
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL,
                timestamp: serverTimestamp(),
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message: ", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not send message.',
            });
        } finally {
            setIsSending(false);
        }
    };
    
    if (authLoading || messagesLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MessageSquare className="mr-2 h-6 w-6 text-primary" />
                        Community Chat
                    </CardTitle>
                    <CardDescription>
                        A real-time public chat for all community members. Be respectful.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                        const isCurrentUser = msg.uid === user?.uid;
                        return (
                            <div key={msg.id} className={cn("flex items-start gap-3", isCurrentUser ? "justify-end" : "justify-start")}>
                                {!isCurrentUser && (
                                    <Avatar className="h-10 w-10 border-2 border-primary/50">
                                        <AvatarImage src={msg.photoURL} alt={msg.displayName} />
                                        <AvatarFallback>{msg.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                    {!isCurrentUser && <p className="text-xs font-bold text-primary mb-1">{msg.displayName}</p>}
                                    <p className="text-sm">{msg.text}</p>
                                    {msg.timestamp && (
                                        <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                            {formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true })}
                                        </p>
                                    )}
                                </div>
                                {isCurrentUser && (
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={msg.photoURL} alt={msg.displayName} />
                                        <AvatarFallback>{msg.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        )
                    })}
                     {messages.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            <p>No messages yet. Be the first to start a conversation!</p>
                        </div>
                     )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            autoComplete="off"
                            disabled={isSending}
                        />
                        <Button type="submit" disabled={isSending || !newMessage.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
