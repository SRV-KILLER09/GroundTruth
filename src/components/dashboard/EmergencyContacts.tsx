
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Siren, Flame, Hospital, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Contact {
    name: string;
    number: string;
}

interface Contacts {
    police: Contact;
    hospital: Contact;
    fire: Contact;
    location: string;
}

// In a real app, this data would be fetched from an API based on coordinates.
// This function simulates that by generating more varied mock data.
const getMockContacts = (lat: number, lon: number): Omit<Contacts, 'location'> => {
    // Simple hashing of coordinates to get deterministic but varied results
    const latInt = Math.floor(lat);
    const lonInt = Math.floor(lon);
    
    // Pre-defined sets of mock data
    const locations = [
        { city: "Mumbai, MH", police: "Marine Drive Police", hospital: "Bombay Hospital", fire: "Fort Fire Station" },
        { city: "New Delhi, DL", police: "Connaught Place Police", hospital: "Sir Ganga Ram Hospital", fire: "Connaught Circus Fire Stn" },
        { city: "Chennai, TN", police: "Teynampet Police Station", hospital: "Apollo Hospital", fire: "Guindy Fire Station" },
        { city: "Kolkata, WB", police: "Park Street Police", hospital: "AMRI Hospital", fire: "Tollygunge Fire Station" },
        { city: "Bengaluru, KA", police: "Koramangala Police", hospital: "Fortis Hospital", fire: "Indiranagar Fire Station" },
    ];

    const determinedIndex = (latInt + lonInt) % locations.length;
    const loc = locations[determinedIndex];

    // Generate pseudo-random but consistent phone numbers based on coordinates
    const randomSuffix = (num: number) => Math.floor(Math.abs(Math.sin(num) * 10000));
    const policeNum = `(0${Math.floor(lat) % 10}${Math.floor(lon) % 10}) 2${randomSuffix(latInt)}-${randomSuffix(lonInt)}`;
    const hospitalNum = `(0${Math.floor(lat) % 10}${Math.floor(lon) % 10}) 4${randomSuffix(lonInt)}-${randomSuffix(latInt)}`;
    const fireNum = `(0${Math.floor(lat) % 10}${Math.floor(lon) % 10}) 101-${randomSuffix(lat + lon)}`;
    
    return {
        police: { name: loc.police, number: policeNum },
        hospital: { name: loc.hospital, number: hospitalNum },
        fire: { name: loc.fire, number: fireNum },
    };
};

const getMockLocationName = (lat: number, lon: number): string => {
     const locations = ["Mumbai, MH", "New Delhi, DL", "Chennai, TN", "Kolkata, WB", "Bengaluru, KA", "Jaipur, RJ", "Pune, MH"];
     const determinedIndex = (Math.floor(lat) + Math.floor(lon)) % locations.length;
     return locations[determinedIndex];
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
                const { latitude, longitude } = position.coords;
                // Simulate API call
                setTimeout(() => {
                    const locationName = getMockLocationName(latitude, longitude);
                    const fetchedContacts = getMockContacts(latitude, longitude);

                    setContacts({
                        ...fetchedContacts,
                        location: `${locationName} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                    });
                    setIsLoading(false);
                }, 1500);
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
                            Click the button to get simulated emergency contacts for your current location.
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
                                <h3 className="font-semibold">{contacts.police.name}</h3>
                                <p className="text-lg font-bold text-primary">{contacts.police.number}</p>
                            </div>
                             <div className="bg-muted p-4 rounded-lg">
                                <Hospital className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                <h3 className="font-semibold">{contacts.hospital.name}</h3>
                                <p className="text-lg font-bold text-primary">{contacts.hospital.number}</p>
                            </div>
                            <div className="bg-muted p-4 rounded-lg">
                                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                <h3 className="font-semibold">{contacts.fire.name}</h3>
                                <p className="text-lg font-bold text-primary">{contacts.fire.number}</p>
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
