
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Siren, Flame, Hospital, Loader2, Bot, ListChecks, Route, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSafetyChecklist } from '@/ai/flows/generate-safety-checklist';

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

interface SafetyChecklist {
    checklist: string[];
    evacuationRoute: string;
}

const areaPrefixes = ["North", "South", "East", "West", "Central", "Greenwood", "Riverdale", "Hillcrest", "Lakeview", "Sunrise"];
const areaSuffixes = ["Nagar", "Ganj", "Pura", "Colony", "Sector", "Vihar", "Park", "Township", "Enclave", "Heights"];
const streetNames = ["Gandhi Marg", "Nehru Road", "Patel Avenue", "Tagore Street", "Bose Lane", "Vivekananda Path", "Shivaji Crescent", "Lajpat Rai Square"];
const hospitalTypes = ["Community Hospital", "City Medical Center", "Sanjeevani Clinic", "Lifeline Care", "General Hospital"];
const policeTypes = ["Police Station", "District Chowki", "City Police Post", "Area Command"];
const fireTypes = ["Fire Station", "Regional Fire & Rescue", "City Fire Brigade"];


const generateDeterministicValue = (seed1: number, seed2: number, list: string[]) => {
    const intSeed1 = Math.floor(Math.abs(seed1 * 1000));
    const intSeed2 = Math.floor(Math.abs(seed2 * 1000));
    const index = (intSeed1 * 19 + intSeed2 * 31) % list.length;
    return list[index];
};

const getMockContacts = (lat: number, lon: number): Omit<Contacts, 'location'> => {
    const sector = `Sector ${Math.floor(Math.abs(Math.sin(lat) * 100))}`;
    const streetName = generateDeterministicValue(lat, lon, streetNames);

    const randomSuffix = (num: number, offset: number) => Math.floor(Math.abs(Math.sin(num + offset) * 10000));
    const cityCode = `0${Math.floor(lat) % 90 + 10}`;
    const policeNum = `(${cityCode}) 2${randomSuffix(lat, 1)}-${randomSuffix(lon, 2)}`;
    const hospitalNum = `(${cityCode}) 4${randomSuffix(lon, 3)}-${randomSuffix(lat, 4)}`;
    const fireNum = `(${cityCode}) 101-${randomSuffix(lat + lon, 5)}`;
    
    return {
        police: { name: `${sector} ${generateDeterministicValue(lon, lat, policeTypes)}`, number: policeNum },
        hospital: { name: `${streetName} ${generateDeterministicValue(lat, lon, hospitalTypes)}`, number: hospitalNum },
        fire: { name: `${sector} ${generateDeterministicValue(lat, lon, fireTypes)}`, number: fireNum },
    };
};

const getMockLocationName = (lat: number, lon: number): string => {
     const sector = `Sector ${Math.floor(Math.abs(Math.sin(lat) * 100))}`;
     const areaName = `${generateDeterministicValue(lat, lon, areaPrefixes)} ${generateDeterministicValue(lon, lat, areaSuffixes)}`;
     return `${sector}, ${areaName}`;
}


export function EmergencyContacts() {
    const [contacts, setContacts] = useState<Contacts | null>(null);
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
            (position) => {
                const { latitude, longitude } = position.coords;
                // Simulate API call for contacts
                setTimeout(() => {
                    const locationName = getMockLocationName(latitude, longitude);
                    const fetchedContacts = getMockContacts(latitude, longitude);
                    const newContacts = {
                        ...fetchedContacts,
                        location: `Simulated for: ${locationName} (Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)})`
                    };
                    setContacts(newContacts);
                    setIsLoading(false);
                    
                    // Trigger AI checklist generation
                    handleGenerateChecklist(locationName);
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
                    description: "Could not generate a safety checklist at this time.",
                });
            })
            .finally(() => {
                setIsAiLoading(false);
            });
    };

    return (
        <Card className="mb-6 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Siren className="mr-2 h-6 w-6 text-primary" />
                    Local Emergency Support
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!contacts && (
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                            Click to get simulated local contacts and an AI-generated safety plan for your area.
                        </p>
                        <Button onClick={handleFetchContacts} disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Phone className="mr-2 h-4 w-4" />
                            )}
                            Get Local Support
                        </Button>
                    </div>
                )}
                {contacts && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-center text-center text-sm text-muted-foreground mb-4 bg-muted p-3 rounded-lg">
                                <MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                                <span className="font-semibold">{contacts.location}</span>
                            </div>
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
                        </div>

                        <div className="bg-card border rounded-lg p-4">
                            <h3 className="font-semibold flex items-center mb-3">
                                <Bot className="mr-2 h-5 w-5 text-primary" />
                                AI Safety Assistant
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
                                <Phone className="mr-2 h-4 w-4" />
                            )}
                            Refresh Location & Plan
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
