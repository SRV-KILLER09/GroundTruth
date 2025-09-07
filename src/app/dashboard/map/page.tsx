
"use client"

import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, Flame, Droplets, Zap, Wind, AlertTriangle, Search, CheckCircle, HelpCircle, XCircle } from "lucide-react";
import { mockDisasterUpdates, DisasterStatus } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

export default function MapViewPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUpdate, setSelectedUpdate] = useState(mockDisasterUpdates[0]);

    const filteredUpdates = useMemo(() => {
        return mockDisasterUpdates.filter(update =>
            update.location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            update.disasterType.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const mapBounds = useMemo(() => getMapBounds(mockDisasterUpdates), []);

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds.minLng},${mapBounds.minLat},${mapBounds.maxLng},${mapBounds.maxLat}&layer=mapnik`;
    
    const handleSelectUpdate = (update: typeof mockDisasterUpdates[0]) => {
      setSelectedUpdate(update);
    }

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
                                An interactive map displaying disaster reports. Click a report to view its location or search for an incident.
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
                                    {/* Markers for all updates */}
                                    {filteredUpdates.map(update => {
                                        const info = disasterInfo[update.disasterType] || disasterInfo['Default'];
                                        const status = statusConfig[update.status];
                                        const isSelected = selectedUpdate && update.id === selectedUpdate.id;
                                        return (
                                        <TooltipProvider key={update.id}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className="absolute cursor-pointer"
                                                        style={{
                                                            left: `${((update.location.longitude - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100}%`,
                                                            top: `${100 - ((update.location.latitude - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100}%`,
                                                            transform: 'translate(-50%, -50%)',
                                                            zIndex: isSelected ? 10 : 1,
                                                        }}
                                                        onClick={() => handleSelectUpdate(update)}
                                                    >
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground transition-all duration-300", 
                                                            info.class,
                                                            isSelected ? 'ring-4 ring-offset-2 ring-offset-background ring-primary scale-125' : 'ring-2 ring-background'
                                                            )}>
                                                            {info.icon}
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-bold">{update.disasterType} in {update.location.name}</p>
                                                    <p className="text-sm text-muted-foreground">{format(new Date(update.timestamp), "PPp")}</p>
                                                    <Badge variant="outline" className={cn("mt-1.5", status.className)}>{status.icon} {status.text}</Badge>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )})}
                                </div>
                                <div className="lg:col-span-1">
                                    <div className="relative mb-3">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search by location or type..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 w-full"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-3">Report List ({filteredUpdates.length})</h3>
                                    <div className="space-y-2 h-[450px] overflow-y-auto pr-2">
                                        {filteredUpdates.map((update) => {
                                            const info = disasterInfo[update.disasterType] || disasterInfo['Default'];
                                            const status = statusConfig[update.status];
                                            return (
                                                <button
                                                    key={update.id}
                                                    onClick={() => handleSelectUpdate(update)}
                                                    className={cn(
                                                        "w-full text-left p-3 rounded-lg border transition-colors",
                                                        selectedUpdate && selectedUpdate.id === update.id ? "bg-primary/10 border-primary" : "bg-muted/50 hover:bg-muted"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn("h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-primary-foreground", info.class)}>
                                                            {info.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center">
                                                                <p className="font-semibold">{update.disasterType} - {update.location.name}</p>
                                                                 <Badge variant="outline" className={status.className}>{status.icon} <span className="hidden sm:inline-block">{status.text}</span></Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{format(new Date(update.timestamp), "MMM d, yyyy HH:mm")}</p>
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
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
