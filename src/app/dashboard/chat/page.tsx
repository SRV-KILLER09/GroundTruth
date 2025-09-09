
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


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
    const adminEmails = ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

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
    
    const handleDeleteMessage = async (messageId: string) => {
        if (!isAdmin) return;
        try {
            await deleteDoc(doc(db, "chat_messages", messageId));
            toast({
                title: "Message Deleted",
                description: "The chat message has been removed.",
            });
        } catch (error) {
            console.error("Error deleting message:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete the message. Check Firestore rules.",
            });
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
                            <div key={msg.id} className={cn("flex items-start gap-3 group", isCurrentUser ? "justify-end" : "justify-start")}>
                                {!isCurrentUser && (
                                    <Avatar className="h-10 w-10 border-2 border-primary/50">
                                        <AvatarImage src={msg.photoURL} alt={msg.displayName} />
                                        <AvatarFallback>{msg.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className="flex items-center gap-2">
                                     {isAdmin && !isCurrentUser && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this message from the chat? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteMessage(msg.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Delete Message
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                                    {isAdmin && isCurrentUser && (
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete your message? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteMessage(msg.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Delete Message
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
