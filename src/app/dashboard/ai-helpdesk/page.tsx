
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, Loader2 } from 'lucide-react';
import { askAIHelpDesk } from '@/ai/flows/ai-helpdesk-flow';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export default function AIHelpDeskPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        
        const userMessage: ChatMessage = { sender: 'user', text: newMessage };
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsThinking(true);
        
        try {
            const aiResponse = await askAIHelpDesk({ query: newMessage });
            const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse.response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI HelpDesk Error:", error);
            const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <Card className="flex-1 flex flex-col bg-background/80 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl font-headline">
                        <Bot className="mr-3 h-8 w-8 text-primary" />
                        AI HelpDesk
                    </CardTitle>
                    <CardDescription>
                        Your personal assistant for any questions you might have.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                             <Bot className="h-24 w-24 mb-4 text-primary/50" />
                             <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to the AI HelpDesk!</h2>
                             <p>You can ask me anything from "What are the safety procedures for an earthquake?" to "What's the capital of Mongolia?".</p>
                             <p>How can I help you today?</p>
                        </div>
                    )}
                    {messages.map((msg, index) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <div key={index} className={cn("flex items-start gap-4", isUser ? "justify-end" : "justify-start")}>
                                {!isUser && (
                                     <Avatar className="h-10 w-10 border-2 border-primary/50">
                                        <div className="flex items-center justify-center h-full w-full bg-black">
                                          <Bot className="h-6 w-6 text-primary" />
                                        </div>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-xl p-4 rounded-2xl relative",
                                    isUser 
                                        ? "bg-primary text-primary-foreground rounded-br-lg" 
                                        : "bg-muted text-foreground rounded-bl-lg"
                                )}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                {isUser && user && (
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.email}/40/40`} alt={user.displayName || ''} />
                                        <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        )
                    })}
                     {isThinking && (
                        <div className="flex items-start gap-4 justify-start">
                             <Avatar className="h-10 w-10 border-2 border-primary/50">
                                <div className="flex items-center justify-center h-full w-full bg-black">
                                    <Bot className="h-6 w-6 text-primary" />
                                </div>
                            </Avatar>
                            <div className="max-w-xl p-4 rounded-2xl bg-muted text-foreground rounded-bl-lg">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t border-primary/20">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Ask the AI HelpDesk anything..."
                            autoComplete="off"
                            disabled={isThinking}
                            className="bg-muted/50 focus-visible:ring-primary"
                        />
                        <Button type="submit" disabled={isThinking || !newMessage.trim()}>
                            {isThinking ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
