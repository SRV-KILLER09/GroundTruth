
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockChatMessages, createNewMockChatMessage, type ChatMessage } from "@/lib/mock-data";
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';

const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
        return format(date, 'p');
    }
    if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'p')}`;
    }
    return format(date, 'PPp');
};

export default function CommunityChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessages(prevMessages => {
                const newBotMessage = createNewMockChatMessage(prevMessages.length + 1);
                return [...prevMessages, newBotMessage];
            });
        }, 15000); // Add a new bot message every 15 seconds

        return () => clearInterval(interval);
    }, []);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && user && user.displayName) {
            const message: ChatMessage = {
                id: messages.length + 1,
                user: {
                    name: user.displayName,
                    username: user.displayName.toLowerCase(),
                    avatarUrl: `https://picsum.photos/seed/${user.email}/40/40`,
                },
                message: newMessage,
                timestamp: new Date().toISOString(),
            };
            setMessages([...messages, message]);
            setNewMessage("");
        }
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="flex flex-col h-[calc(100vh-8rem)]">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MessageSquare className="mr-2 h-6 w-6 text-primary" />
                        Community Chat
                    </CardTitle>
                    <CardDescription>
                        A real-time chat for community members to connect and share information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.map((msg, index) => {
                        const isCurrentUser = msg.user.username === user?.displayName?.toLowerCase();
                        return (
                            <div key={index} className={cn("flex items-end gap-3", isCurrentUser ? "justify-end" : "justify-start")}>
                                {!isCurrentUser && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={msg.user.avatarUrl} alt={msg.user.name} />
                                        <AvatarFallback>{msg.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                    {!isCurrentUser && (
                                        <p className="text-xs font-semibold text-primary mb-1">{msg.user.name}</p>
                                    )}
                                    <p className="text-sm">{msg.message}</p>
                                    <p className={cn("text-xs mt-2", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                        {formatMessageTime(msg.timestamp)}
                                    </p>
                                </div>
                                 {isCurrentUser && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={msg.user.avatarUrl} alt={msg.user.name} />
                                        <AvatarFallback>{msg.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            autoComplete="off"
                        />
                        <Button type="submit" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
