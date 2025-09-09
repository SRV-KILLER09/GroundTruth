
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Siren, Flame, Hospital, Loader2, Bot, ListChecks, Route, MapPin, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSafetyChecklist } from '@/ai/flows/generate-safety-checklist';
import Link from 'next/link';

interface SafetyChecklist {
    checklist: string[];
    evacuationRoute: string;
}

interface LocationData {
    latitude: number;
    longitude: number;
    name: string;
}

export function EmergencyContacts() {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [safetyChecklist, setSafetyChecklist] = useState<SafetyChecklist | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const { toast } = useToast();

    const handleFetchContacts = () => {
        setIsLoading(true);
        setSafetyChecklist(null);
        if (!navigator.geolocation) {
            toast({
                variant: "destructive",
                title: "Geolocation Error",
                description: "Geolocation is not supported by your browser.",
            });
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                // Simulate reverse geocoding to get a location name
                // In a real app, you'd use a service like Google's Geocoding API
                const locationName = `Your Current Area (Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)})`;
                
                setLocation({ latitude, longitude, name: locationName });
                setIsLoading(false);
                
                // Trigger AI checklist generation
                handleGenerateChecklist(locationName);
            },
            (error) => {
                toast({
                    variant: "destructive",
                    title: "Geolocation Error",
                    description: `Could not get location: ${error.message}`,
                });
                setIsLoading(false);
            }
        );
    };
    
    const handleGenerateChecklist = (locationName: string) => {
        setIsAiLoading(true);
        generateSafetyChecklist({ location: locationName })
            .then(result => {
                setSafetyChecklist(result);
            })
            .catch(error => {
                console.error("AI Safety Checklist Error:", error);
                toast({
                    variant: "destructive",
                    title: "AI Assistant Error",
                    description: "Could not generate a safety plan at this time.",
                });
            })
            .finally(() => {
                setIsAiLoading(false);
            });
    };
    
    const createGoogleMapsLink = (query: string) => {
        if (!location) return "#";
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&ll=${location.latitude},${location.longitude}`;
    }

    const serviceLinks = [
        { name: "Hospitals", query: "nearby hospitals", icon: <Hospital className="mr-2 h-5 w-5" />, link: createGoogleMapsLink("nearby hospitals") },
        { name: "Police Stations", query: "nearby police stations", icon: <Siren className="mr-2 h-5 w-5" />, link: createGoogleMapsLink("nearby police stations") },
        { name: "Fire Stations", query: "nearby fire stations", icon: <Flame className="mr-2 h-5 w-5" />, link: createGoogleMapsLink("nearby fire stations") }
    ]

    return (
        <Card className="mb-6 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Siren className="mr-2 h-6 w-6 text-primary" />
                    Real-Time Emergency Support
                </CardTitle>
                <CardDescription>Get your location and find the closest emergency services instantly.</CardDescription>
            </CardHeader>
            <CardContent>
                {!location && (
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                            Click to get your live location and find the nearest help.
                        </p>
                        <Button onClick={handleFetchContacts} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <MapPin className="mr-2 h-4 w-4" />
                            )}
                            Get My Location & Support
                        </Button>
                    </div>
                )}
                {location && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-center text-center text-sm text-muted-foreground mb-4 bg-muted p-3 rounded-lg">
                                <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                                <span className="font-semibold">{location.name}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {serviceLinks.map((service) => (
                                    <Button key={service.name} asChild variant="outline" size="lg">
                                        <Link href={service.link} target="_blank" rel="noopener noreferrer">
                                            {service.icon}
                                            Find {service.name}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card border rounded-lg p-4">
                            <h3 className="font-semibold flex items-center mb-3">
                                <Bot className="mr-2 h-5 w-5 text-primary" />
                                AI-Generated Safety Plan
                            </h3>
                            {isAiLoading ? (
                                <div className="flex items-center justify-center p-6 bg-muted rounded-md">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <p className="ml-3 text-muted-foreground">Generating safety plan for your area...</p>
                                </div>
                            ) : safetyChecklist ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <h4 className="font-medium flex items-center mb-2"><ListChecks className="mr-2 h-4 w-4"/>Safety Checklist</h4>
                                        <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
                                            {safetyChecklist.checklist.map((item, index) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium flex items-center mb-2"><Route className="mr-2 h-4 w-4"/>Evacuation Advice</h4>
                                        <p className="text-muted-foreground">{safetyChecklist.evacuationRoute}</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                         <Button variant="outline" size="sm" onClick={handleFetchContacts} disabled={isLoading} className="mx-auto flex">
                             {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <MapPin className="mr-2 h-4 w-4" />
                            )}
                            Refresh Location & Plan
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
