
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, Flame, Droplets, Zap, Wind, AlertTriangle, Search, CheckCircle, HelpCircle, XCircle, Clock, User, Shield, MapPin, List, Eye } from "lucide-react";
import { type DisasterUpdate, type DisasterStatus, mockDisasterUpdates } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import React, { useState, useMemo, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";


const disasterInfo: Record<string, { icon: React.ReactNode; color: string; class: string }> = {
    'Fire': { icon: <Flame className="h-5 w-5" />, color: "#ef4444", class: "bg-red-500" },
    'Flood': { icon: <Droplets className="h-5 w-5" />, color: "#3b82f6", class: "bg-blue-500" },
    'Earthquake': { icon: <Zap className="h-5 w-5" />, color: "#eab308", class: "bg-yellow-500" },
    'Hurricane': { icon: <Wind className="h-5 w-5" />, color: "#6b7280", class: "bg-gray-500" },
    'Default': { icon: <AlertTriangle className="h-5 w-5" />, color: "#f97316", class: "bg-orange-500" },
};

const statusConfig: Record<DisasterStatus, { icon: React.ReactNode; text: string; className: string }> = {
  'Verified': { icon: <CheckCircle className="h-4 w-4 mr-2" />, text: "Verified", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  'Under Investigation': { icon: <HelpCircle className="h-4 w-4 mr-2" />, text: "Under Investigation", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  'Fake': { icon: <XCircle className="h-4 w-4 mr-2" />, text: "Fake", className: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const getMapBounds = (updates: DisasterUpdate[]) => {
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
    const [allUpdates, setAllUpdates] = useState<DisasterUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUpdate, setSelectedUpdate] = useState<DisasterUpdate | null>(null);
    
    useEffect(() => {
        // Use mock data
        const mockDataWithIds = mockDisasterUpdates.map((update, index) => ({
            ...update,
            id: `mock-${index}`
        })) as DisasterUpdate[];

        setAllUpdates(mockDataWithIds);
        if (loading) {
            // Select the first report by default after initial load
            setSelectedUpdate(mockDataWithIds[0] || null);
        }
        setLoading(false);

        /*
        // Original Firestore logic
        const q = query(collection(db, "disaster_updates"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const updatesData: DisasterUpdate[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                updatesData.push({ 
                    ...data as Omit<DisasterUpdate, 'id' | 'timestamp'>,
                    id: doc.id,
                    timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
                });
            });
            setAllUpdates(updatesData);
            if (loading) {
                // Select the first report by default after initial load
                setSelectedUpdate(updatesData[0] || null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Firestore error: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
        */
    }, [loading]);

    const filteredUpdates = useMemo(() => {
        return allUpdates.filter(update =>
            update.location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            update.disasterType.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allUpdates]);

    const mapUrl = useMemo(() => {
        const markers = filteredUpdates
          .map(update => `marker=${update.location.latitude},${update.location.longitude}`)
          .join('&');

        if (selectedUpdate) {
            const { latitude, longitude } = selectedUpdate.location;
            const singleMarker = `marker=${latitude},${longitude}`;
            // Zoom level 14 is a good detailed view for a specific point
            return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&${singleMarker}`;
        }
        
        if (filteredUpdates.length === 0) {
            return `https://www.openstreetmap.org/export/embed.html?bbox=68.1,6.5,97.4,35.5&layer=mapnik`;
        }

        const { minLat, maxLat, minLng, maxLng } = getMapBounds(filteredUpdates);
        
        const buffer = Math.max((maxLat - minLat) * 0.1, (maxLng - minLng) * 0.1, 0.1);
        
        return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng - buffer},${minLat - buffer},${maxLng + buffer},${maxLat + buffer}&layer=mapnik&${markers}`;
    }, [filteredUpdates, selectedUpdate]);
    
    if (loading) {
        return <LoadingSpinner />;
    }

    const currentReport = selectedUpdate || filteredUpdates[0];

    return (
        <div className="w-full max-w-7xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Map className="mr-2 h-6 w-6 text-primary" />
                        Interactive Geospatial Feed
                    </CardTitle>
                    <CardDescription>
                        An interactive map displaying all disaster reports. Click a report in the list to focus on its location.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 relative w-full aspect-[16/10] bg-muted rounded-lg overflow-hidden border-2 border-primary/20">
                            <iframe
                                width="100%"
                                height="100%"
                                src={mapUrl}
                                className="border-0"
                                title="Interactive Map of Disaster Reports"
                                key={mapUrl}
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
                                <div className="flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm py-2">
                                     <h3 className="text-lg font-semibold">Reports ({filteredUpdates.length})</h3>
                                     {selectedUpdate && (
                                         <Button variant="outline" size="sm" onClick={() => setSelectedUpdate(null)}>
                                             <List className="mr-2 h-4 w-4" />
                                             Show All Reports
                                         </Button>
                                     )}
                                </div>
                                {filteredUpdates.map((update) => {
                                    const info = disasterInfo[update.disasterType] || disasterInfo['Default'];
                                    const isSelected = selectedUpdate?.id === update.id;
                                    return (
                                        <button
                                            key={update.id}
                                            onClick={() => setSelectedUpdate(update)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg border bg-muted/50 transition-all",
                                                isSelected ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted"
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
                                                <Eye className={cn("h-5 w-5 text-primary transition-opacity", isSelected ? "opacity-100": "opacity-0")} />
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
                     {currentReport && (
                        <Card className="mt-6 bg-muted/50 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <span className={cn("h-10 w-10 rounded-full flex items-center justify-center text-primary-foreground", disasterInfo[currentReport.disasterType]?.class || disasterInfo['Default'].class)}>
                                        {disasterInfo[currentReport.disasterType]?.icon || disasterInfo['Default'].icon}
                                    </span>
                                    <span>Report Details: {currentReport.disasterType} in {currentReport.location.name}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-muted-foreground">Location</h4>
                                    <p className="text-lg font-mono">{currentReport.location.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-muted-foreground">Coordinates</h4>
                                    <p className="text-lg font-mono">{currentReport.location.latitude.toFixed(4)}, {currentReport.location.longitude.toFixed(4)}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-muted-foreground">Time</h4>
                                    <p className="text-lg font-mono">{format(new Date(currentReport.timestamp), "PPpp")}</p>

                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold text-muted-foreground">Status</h4>
                                    <Badge variant="outline" className={cn("text-lg", statusConfig[currentReport.status].className)}>
                                        {statusConfig[currentReport.status].icon}
                                        {statusConfig[currentReport.status].text}
                                    </Badge>
                                </div>
                                 <div className="col-span-full md:col-span-2 space-y-1">
                                    <h4 className="text-sm font-semibold text-muted-foreground">Message</h4>
                                    <p className="text-lg font-mono">{currentReport.message}</p>
                                </div>
                            </CardContent>
                        </Card>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
