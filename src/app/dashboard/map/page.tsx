
"use client"

import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, Flame, Droplets, Zap, Wind, AlertTriangle } from "lucide-react";
import { mockDisasterUpdates } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";

const disasterInfo: Record<string, { icon: React.ReactNode; color: string; class: string }> = {
    'Fire': { icon: <Flame className="h-5 w-5" />, color: "#ef4444", class: "bg-red-500" },
    'Flood': { icon: <Droplets className="h-5 w-5" />, color: "#3b82f6", class: "bg-blue-500" },
    'Earthquake': { icon: <Zap className="h-5 w-5" />, color: "#eab308", class: "bg-yellow-500" },
    'Hurricane': { icon: <Wind className="h-5 w-5" />, color: "#6b7280", class: "bg-gray-500" },
    'Default': { icon: <AlertTriangle className="h-5 w-5" />, color: "#f97316", class: "bg-orange-500" },
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

export default function MapViewPage() {
    const [selectedUpdate, setSelectedUpdate] = useState(mockDisasterUpdates[0]);

    const mapBounds = useMemo(() => getMapBounds(mockDisasterUpdates), []);

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds.minLng},${mapBounds.minLat},${mapBounds.maxLng},${mapBounds.maxLat}&layer=mapnik`;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 md:p-6">
                <div className="w-full max-w-7xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Map className="mr-2 h-6 w-6 text-primary" />
                                Interactive Geospatial Feed
                            </CardTitle>
                            <CardDescription>
                                An interactive map displaying real-time disaster reports. Click on a report from the list to view its location.
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
                                    ></iframe>
                                    {/* Marker for selected update */}
                                    {selectedUpdate && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className="absolute"
                                                        style={{
                                                            left: `${((selectedUpdate.location.longitude - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100}%`,
                                                            top: `${100 - ((selectedUpdate.location.latitude - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100}%`,
                                                            transform: 'translate(-50%, -50%)',
                                                        }}
                                                    >
                                                        <div className={cn("relative h-4 w-4 rounded-full flex items-center justify-center animate-pulse", disasterInfo[selectedUpdate.disasterType]?.class || disasterInfo['Default'].class)}>
                                                            <div className={cn("absolute h-4 w-4 rounded-full opacity-75", disasterInfo[selectedUpdate.disasterType]?.class || disasterInfo['Default'].class)}></div>
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-bold">{selectedUpdate.disasterType} in {selectedUpdate.location.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                <div className="lg:col-span-1">
                                    <h3 className="text-lg font-semibold mb-3">Report List</h3>
                                    <div className="space-y-2 h-[450px] overflow-y-auto pr-2">
                                        {mockDisasterUpdates.map((update) => {
                                            const info = disasterInfo[update.disasterType] || disasterInfo['Default'];
                                            return (
                                                <button
                                                    key={update.id}
                                                    onClick={() => setSelectedUpdate(update)}
                                                    className={cn(
                                                        "w-full text-left p-3 rounded-lg border transition-colors",
                                                        selectedUpdate.id === update.id ? "bg-primary/10 border-primary" : "bg-muted/50 hover:bg-muted"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground", info.class)}>
                                                            {info.icon}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{update.disasterType} - {update.location.name}</p>
                                                            <p className="text-sm text-muted-foreground truncate">{update.message}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
