
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, Flame, Droplets, Zap, Wind, AlertTriangle, Search, CheckCircle, HelpCircle, XCircle, Clock, User, Shield, MapPin } from "lucide-react";
import { mockDisasterUpdates, DisasterStatus, DisasterUpdate } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";

const disasterInfo: Record<string, { icon: React.ReactNode; color: string; class: string }> = {
    'Fire': { icon: <Flame className="h-5 w-5" />, color: "#ef4444", class: "bg-red-500" },
    'Flood': { icon: <Droplets className="h-5 w-5" />, color: "#3b82f6", class: "bg-blue-500" },
    'Earthquake': { icon: <Zap className="h-5 w-5" />, color: "#eab308", class: "bg-yellow-500" },
    'Hurricane': { icon: <Wind className="h-5 w-5" />, color: "#6b7280", class: "bg-gray-500" },
    'Default': { icon: <AlertTriangle className="h-5 w-5" />, color: "#f97316", class: "bg-orange-500" },
};

const statusConfig: Record<DisasterStatus, { icon: React.ReactNode; text: string; className: string }> = {
  'Verified': { icon: <CheckCircle className="h-3 w-3 mr-1" />, text: "Verified", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  'Under Investigation': { icon: <HelpCircle className="h-3 w-3 mr-1" />, text: "Under Investigation", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  'Fake': { icon: <XCircle className="h-3 w-3 mr-1" />, text: "Fake", className: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const getMapBounds = (updates: typeof mockDisasterUpdates) => {
    if (updates.length === 0) {
        return { lat: 20.5937, lon: 78.9629, zoom: 4 }; // Default to India
    }
    const latitudes = updates.map(u => u.location.latitude);
    const longitudes = updates.map(u => u.location.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return {
        minLat, maxLat, minLng, maxLng
    };
};

const IncidentDetailCard = ({ update }: { update: DisasterUpdate }) => {
    const status = statusConfig[update.status];
    const info = disasterInfo[update.disasterType] || disasterInfo['Default'];

    return (
        <Card className="bg-muted/50 border-primary/20">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-primary-foreground", info.class)}>
                        {info.icon}
                    </div>
                    <span>{update.disasterType} in {update.location.name}</span>
                </CardTitle>
                <CardDescription>
                    <Badge variant="outline" className={status.className}>{status.icon} {status.text}</Badge>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {update.mediaUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4 border">
                        <Image 
                            src={update.mediaUrl} 
                            alt={`Update from ${update.user.name}`} 
                            fill 
                            className="object-cover" 
                            data-ai-hint={`${update.disasterType} disaster`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                )}
                 <p className="mb-4 text-foreground/90">{update.message}</p>
                 <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-primary"/> {format(new Date(update.timestamp), "PPp")}</li>
                    <li className="flex items-center"><User className="h-4 w-4 mr-2 text-primary"/> Reported by {update.user.name}</li>
                    <li className="flex items-center"><Shield className="h-4 w-4 mr-2 text-primary"/> Authority: {update.authority}</li>
                    <li className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary"/> Coords: {update.location.latitude.toFixed(4)}, {update.location.longitude.toFixed(4)}</li>
                </ul>
            </CardContent>
        </Card>
    )
}

export default function MapViewPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUpdate, setSelectedUpdate] = useState<DisasterUpdate | null>(mockDisasterUpdates[0]);

    const filteredUpdates = useMemo(() => {
        return mockDisasterUpdates.filter(update =>
            update.location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            update.disasterType.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);
    
    const mapBounds = useMemo(() => getMapBounds(filteredUpdates), [filteredUpdates]);

    const mapUrl = useMemo(() => {
        const { minLat, maxLat, minLng, maxLng } = mapBounds;
        const markers = filteredUpdates
          .map(update => `marker=${update.location.latitude},${update.location.longitude}`)
          .join('&');
        
        const buffer = 0.5;
        // The bbox parameter is what sets the initial view of the map.
        return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng - buffer},${minLat - buffer},${maxLng + buffer},${maxLat + buffer}&layer=mapnik&${markers}`;
    }, [filteredUpdates, mapBounds]);

    const handleSelectUpdate = (update: DisasterUpdate) => {
      setSelectedUpdate(update);
    }

    return (
        <div className="w-full max-w-7xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Map className="mr-2 h-6 w-6 text-primary" />
                        Interactive Geospatial Feed
                    </CardTitle>
                    <CardDescription>
                        An interactive map displaying disaster reports. Select a report to view details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 relative w-full aspect-[16/10] bg-muted rounded-lg overflow-hidden border-2 border-primary/20">
                            <iframe
                                width="100%"
                                height="100%"
                                src={mapUrl}
                                className="border-0"
                                title="Interactive Map of Disaster Reports"
                            ></iframe>
                        </div>
                        <div className="lg:col-span-1 h-[500px] flex flex-col gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by location or type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full"
                                />
                            </div>
                            <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                                <h3 className="text-lg font-semibold sticky top-0 bg-background/80 backdrop-blur-sm py-2">Reports ({filteredUpdates.length})</h3>
                                {filteredUpdates.map((update) => {
                                    const info = disasterInfo[update.disasterType] || disasterInfo['Default'];
                                    return (
                                        <button
                                            key={update.id}
                                            onClick={() => handleSelectUpdate(update)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg border transition-colors",
                                                selectedUpdate && selectedUpdate.id === update.id ? "bg-primary/10 border-primary" : "bg-muted/50 hover:bg-muted"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-primary-foreground", info.class)}>
                                                    {info.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold truncate">{update.disasterType} - {update.location.name}</p>
                                                    <p className="text-sm text-muted-foreground">{format(new Date(update.timestamp), "MMM d, HH:mm")}</p>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                                 {filteredUpdates.length === 0 && (
                                    <div className="text-center p-8 text-muted-foreground">
                                        <p>No matching reports found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {selectedUpdate && (
                        <div className="mt-6">
                            <h2 className="text-2xl font-bold font-headline mb-4">Incident Details</h2>
                            <IncidentDetailCard update={selectedUpdate} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    
}
