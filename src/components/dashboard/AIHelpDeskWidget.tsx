
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Send, Bot, Loader2, Power, PowerOff, RefreshCw } from 'lucide-react';
import { askAIHelpDesk } from '@/ai/flows/ai-helpdesk-flow';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

type ChatbotStatus = 'online' | 'offline' | 'restarting';

export default function AIHelpDeskWidget() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [chatbotStatus, setChatbotStatus] = useState<ChatbotStatus>('online');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const adminEmails = ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || chatbotStatus !== 'online') return;
        
        const userMessage: ChatMessage = { sender: 'user', text: newMessage };
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsThinking(true);
        
        try {
            const aiResponse = await askAIHelpDesk({ query: newMessage, userName: user.displayName || 'User' });
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

    const handleStatusChange = (status: ChatbotStatus) => {
        if (!isAdmin) return;
        
        if (status === 'restarting') {
            setChatbotStatus('restarting');
            toast({ title: "Chatbot is restarting..."});
            setTimeout(() => {
                setMessages([]);
                setChatbotStatus('online');
                toast({ title: "AI HelpDesk Restarted", description: "The chat history has been cleared."});
            }, 2000);
        } else {
            setChatbotStatus(status);
            toast({ title: `AI HelpDesk is now ${status}.`});
        }
    }
    
    const StatusIndicator = () => {
        const config = {
            online: { text: 'Online', className: 'bg-green-500' },
            offline: { text: 'Offline', className: 'bg-red-500' },
            restarting: { text: 'Restarting...', className: 'bg-yellow-500 animate-pulse' },
        }
        const currentStatus = chatbotStatus === 'restarting' ? 'restarting' : chatbotStatus;

        return (
             <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", config[currentStatus].className)}></div>
                <span className="text-xs text-muted-foreground">{config[currentStatus].text}</span>
            </div>
        )
    }
    
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                 <Button
                    variant="outline"
                    size="icon"
                    className="fixed bottom-6 right-20 h-12 w-12 rounded-full shadow-lg z-50 bg-background/80 backdrop-blur-sm"
                >
                    <Bot className="h-6 w-6" />
                    <span className="sr-only">Open AI HelpDesk</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                side="top" 
                align="end" 
                className="w-[400px] p-0 rounded-lg shadow-2xl mr-4 mb-2"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <Card className="flex flex-col bg-background/80 backdrop-blur-sm border-primary/20 h-[60vh] shadow-none border-none">
                    <CardHeader className="border-b border-primary/20">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center text-xl font-headline">
                                <Bot className="mr-3 h-6 w-6 text-primary" />
                                AI HelpDesk
                            </CardTitle>
                             {isAdmin && (
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStatusChange('online')} disabled={chatbotStatus === 'online' || chatbotStatus === 'restarting'}>
                                        <Power className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStatusChange('offline')} disabled={chatbotStatus === 'offline' || chatbotStatus === 'restarting'}>
                                        <PowerOff className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStatusChange('restarting')} disabled={chatbotStatus === 'restarting'}>
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <CardDescription>
                                Your personal AI assistant.
                            </CardDescription>
                            <StatusIndicator />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                        {chatbotStatus === 'offline' && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                <Bot className="h-16 w-16 mb-4 text-primary/50" />
                                <h2 className="text-xl font-semibold text-foreground mb-2">HelpDesk is Offline</h2>
                                <p className="text-sm">The admin has currently disabled the chatbot.</p>
                            </div>
                        )}
                        {chatbotStatus === 'restarting' && (
                           <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                <Loader2 className="h-16 w-16 mb-4 text-primary/50 animate-spin" />
                                <h2 className="text-xl font-semibold text-foreground mb-2">Restarting...</h2>
                                <p className="text-sm">Please wait a moment.</p>
                            </div>
                        )}
                        {chatbotStatus === 'online' && messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                <Bot className="h-16 w-16 mb-4 text-primary/50" />
                                <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to the HelpDesk!</h2>
                                <p className="text-sm">How can I help you today, {user?.displayName || 'friend'}?</p>
                            </div>
                        )}
                        {chatbotStatus === 'online' && messages.map((msg, index) => {
                            const isUser = msg.sender === 'user';
                            return (
                                <div key={index} className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
                                    {!isUser && (
                                        <Avatar className="h-8 w-8 border-2 border-primary/50">
                                            <div className="flex items-center justify-center h-full w-full bg-black">
                                            <Bot className="h-5 w-5 text-primary" />
                                            </div>
                                        </Avatar>
                                    )}
                                    <div className={cn("max-w-xs p-3 rounded-2xl relative text-sm", isUser ? "bg-primary text-primary-foreground rounded-br-lg" : "bg-muted text-foreground rounded-bl-lg")}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    {isUser && user && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.email}/40/40`} alt={user.displayName || ''} />
                                            <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            )
                        })}
                        {isThinking && (
                            <div className="flex items-start gap-3 justify-start">
                                <Avatar className="h-8 w-8 border-2 border-primary/50">
                                    <div className="flex items-center justify-center h-full w-full bg-black">
                                        <Bot className="h-5 w-5 text-primary" />
                                    </div>
                                </Avatar>
                                <div className="max-w-xs p-3 rounded-2xl bg-muted text-foreground rounded-bl-lg">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>
                    <div className="p-3 border-t border-primary/20">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={chatbotStatus === 'online' ? "Ask anything..." : `Chatbot is ${chatbotStatus}.`}
                                autoComplete="off"
                                disabled={isThinking || chatbotStatus !== 'online'}
                                className="bg-muted/50 focus-visible:ring-primary h-9"
                            />
                            <Button type="submit" size="icon" className="h-9 w-9" disabled={isThinking || !newMessage.trim() || chatbotStatus !== 'online'}>
                                {isThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                    </div>
                </Card>
            </PopoverContent>
        </Popover>
    );
}
