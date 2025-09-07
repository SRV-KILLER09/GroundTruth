
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Flame, Droplets, Zap, Wind, AlertTriangle } from "lucide-react";
import { mockDisasterUpdates, DisasterUpdate } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";

const disasterInfo: Record<string, { icon: React.ReactNode; color: string }> = {
    'Fire': { icon: <Flame className="h-5 w-5" />, color: "bg-red-500" },
    'Flood': { icon: <Droplets className="h-5 w-5" />, color: "bg-blue-500" },
    'Earthquake': { icon: <Zap className="h-5 w-5" />, color: "bg-yellow-500" },
    'Hurricane': { icon: <Wind className="h-5 w-5" />, color: "bg-gray-500" },
    'Default': { icon: <AlertTriangle className="h-5 w-5" />, color: "bg-orange-500" },
};

// Normalize coordinates to fit within a 100x100 grid
const normalizeCoordinates = (updates: DisasterUpdate[]) => {
    if (updates.length === 0) return [];
    
    const latitudes = updates.map(u => u.location.latitude);
    const longitudes = updates.map(u => u.location.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    return updates.map(update => ({
        ...update,
        mapX: ((update.location.longitude - minLng) / lngRange) * 90 + 5, // % position
        mapY: ((maxLat - update.location.latitude) / latRange) * 90 + 5, // % position
    }));
};


export default function MapViewPage() {
    const mappedUpdates = normalizeCoordinates(mockDisasterUpdates.slice(0, 8)); // Limit for clarity

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 md:p-6">
                <div className="w-full max-w-6xl mx-auto">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Map className="mr-2 h-6 w-6 text-primary" />
                                    Geospatial Disaster Feed
                                </CardTitle>
                                <p className="text-muted-foreground text-sm mt-1">
                                    This map displays real-time disaster reports. Hover over beacons for precise location details.
                                </p>
                            </div>
                             <div className="flex space-x-4">
                                {Object.entries(disasterInfo).map(([key, { icon, color }]) => (
                                   key !== 'Default' && <div key={key} className="flex items-center gap-2">
                                        <div className={cn("h-4 w-4 rounded-full", color)}></div>
                                        <span className="text-sm text-muted-foreground">{key}</span>
                                    </div>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                             <TooltipProvider>
                                <div className="relative w-full aspect-[2/1] bg-black rounded-lg overflow-hidden border-2 border-primary/20">
                                    {/* Map Background Image */}
                                    <Image
                                        src="https://images.unsplash.com/photo-1572422776384-1fdf502851d5?q=80&w=1800&auto=format&fit=crop"
                                        alt="Satellite map background"
                                        fill
                                        className="object-cover opacity-60"
                                        data-ai-hint="satellite map"
                                    />

                                    {/* Data Points */}
                                    {mappedUpdates.map((update) => {
                                        const info = disasterInfo[update.disasterType] || disasterInfo['Default'];
                                        return (
                                            <Tooltip key={update.id}>
                                                <TooltipTrigger asChild>
                                                    <div 
                                                        className="absolute -translate-x-1/2 -translate-y-1/2"
                                                        style={{ left: `${update.mapX}%`, top: `${update.mapY}%` }}
                                                    >
                                                        <div className={cn("relative h-4 w-4 rounded-full flex items-center justify-center animate-pulse", info.color)}>
                                                           <div className={cn("absolute h-4 w-4 rounded-full", info.color, "opacity-75")}></div>
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="flex items-center gap-3">
                                                         <div className="text-white bg-card p-2 rounded-full border border-primary/50">
                                                            {info.icon}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold">{update.disasterType} in {update.location.name}</p>
                                                            <p className="text-sm text-muted-foreground truncate max-w-xs">{update.message}</p>
                                                            <p className="text-xs text-muted-foreground/80 mt-1">
                                                                Coords: {update.location.latitude.toFixed(4)}, {update.location.longitude.toFixed(4)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            </TooltipProvider>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
