"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Siren, Flame, Ambulance, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Contacts {
    police: string;
    ambulance: string;
    fire: string;
    location: string;
}

export function EmergencyContacts() {
    const [contacts, setContacts] = useState<Contacts | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFetchContacts = () => {
        setIsLoading(true);
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
            (position) => {
                // In a real app, you would use these coordinates to query an API
                // for the nearest emergency services. For this prototype, we'll
                // use mock data and a timeout to simulate an API call.
                setTimeout(() => {
                    setContacts({
                        police: "100",
                        ambulance: "102",
                        fire: "101",
                        location: `Near you (${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)})`
                    });
                    setIsLoading(false);
                }, 1000);
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

    return (
        <Card className="mb-6 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Siren className="mr-2 h-6 w-6 text-primary" />
                    Emergency Contacts
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!contacts && (
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                            Click the button to get emergency contact numbers for your current location.
                        </p>
                        <Button onClick={handleFetchContacts} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Phone className="mr-2 h-4 w-4" />
                            )}
                            Get Local Contacts
                        </Button>
                    </div>
                )}
                {contacts && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Showing contacts for: <strong>{contacts.location}</strong>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="bg-muted p-4 rounded-lg">
                                <Siren className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                <h3 className="font-semibold">Police</h3>
                                <p className="text-lg font-bold text-primary">{contacts.police}</p>
                            </div>
                             <div className="bg-muted p-4 rounded-lg">
                                <Ambulance className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                <h3 className="font-semibold">Ambulance</h3>
                                <p className="text-lg font-bold text-primary">{contacts.ambulance}</p>
                            </div>
                            <div className="bg-muted p-4 rounded-lg">
                                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                <h3 className="font-semibold">Fire Brigade</h3>
                                <p className="text-lg font-bold text-primary">{contacts.fire}</p>
                            </div>
                        </div>
                         <Button variant="outline" size="sm" onClick={handleFetchContacts} disabled={isLoading} className="mt-4 mx-auto flex">
                             {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Phone className="mr-2 h-4 w-4" />
                            )}
                            Refresh Location
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
