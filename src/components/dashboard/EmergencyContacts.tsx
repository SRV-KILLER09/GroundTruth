
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

// --- Enhanced Mock Data Simulation ---

// Arrays of plausible name parts for generating realistic-sounding local services
const areaPrefixes = ["North", "South", "East", "West", "Central", "Old", "New", "Lakeview", "Riverbend", "Hillside"];
const areaSuffixes = ["Nagar", "Ganj", "Pura", "Colony", "Sector", "Vihar", "Park", "Township", "Circle", "Market"];
const streetNames = ["Gandhi", "Nehru", "Patel", "Tagore", "Bose", "Vivekananda", "Shivaji", "Lajpat Rai"];
const hospitalTypes = ["General Hospital", "Community Clinic", "Medical Center", "Sanjeevani Hospital", "Care Center"];
const policeTypes = ["Police Station", "Chowki", "Police Post", "District Police"];
const fireTypes = ["Fire Station", "Fire & Rescue", "Fire Brigade"];


// Generates a deterministic but unique-looking value from coordinates
const generateDeterministicValue = (seed1: number, seed2: number, list: string[]) => {
    const intSeed1 = Math.floor(Math.abs(seed1));
    const intSeed2 = Math.floor(Math.abs(seed2));
    const index = (intSeed1 * 19 + intSeed2 * 31) % list.length;
    return list[index];
};


// In a real app, this data would be fetched from an API.
// This function simulates that by generating more varied and plausible mock data.
const getMockContacts = (lat: number, lon: number): Omit<Contacts, 'location'> => {
    // Use coordinates to generate a plausible local area name
    const areaName = `${generateDeterministicValue(lat, lon, areaPrefixes)} ${generateDeterministicValue(lon, lat, areaSuffixes)}`;
    const streetName = generateDeterministicValue(lat, lon, streetNames);

    // Generate pseudo-random but consistent phone numbers based on coordinates
    const randomSuffix = (num: number, offset: number) => Math.floor(Math.abs(Math.sin(num + offset) * 10000));
    const cityCode = `0${Math.floor(lat) % 90 + 10}`;
    const policeNum = `(${cityCode}) 2${randomSuffix(lat, 1)}-${randomSuffix(lon, 2)}`;
    const hospitalNum = `(${cityCode}) 4${randomSuffix(lon, 3)}-${randomSuffix(lat, 4)}`;
    const fireNum = `(${cityCode}) 101-${randomSuffix(lat + lon, 5)}`;
    
    return {
        police: { name: `${areaName} ${generateDeterministicValue(lon, lat, policeTypes)}`, number: policeNum },
        hospital: { name: `${streetName} ${generateDeterministicValue(lat, lon, hospitalTypes)}`, number: hospitalNum },
        fire: { name: `${areaName} ${generateDeterministicValue(lat, lon, fireTypes)}`, number: fireNum },
    };
};

const getMockLocationName = (lat: number, lon: number): string => {
     const areaName = `${generateDeterministicValue(lat, lon, areaPrefixes)} ${generateDeterministicValue(lon, lat, areaSuffixes)}`;
     const cityName = `${generateDeterministicValue(lon, lat, areaPrefixes)} City`; // Fake city name for flavor
     return `${areaName}, ${cityName}`;
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
                            Showing simulated contacts for: <strong>{contacts.location}</strong>
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
