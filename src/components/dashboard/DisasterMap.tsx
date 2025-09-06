"use client";

import Image from "next/image";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import type { DisasterUpdate } from "@/lib/mock-data";
import { summarizeDisasterUpdates } from "@/ai/flows/summarize-disaster-updates";
import { Loader2 } from "lucide-react";

interface DisasterMapProps {
  updates: DisasterUpdate[];
}

const locationToPosition: Record<string, { top: string; left: string }> = {
  "Los Angeles, CA": { top: "55%", left: "12%" },
  "San Francisco, CA": { top: "42%", left: "7%" },
  "Lake Tahoe Area": { top: "35%", left: "9%" },
  "Miami, FL": { top: "80%", left: "75%" },
};

const disasterTypeToColor: Record<DisasterUpdate['disasterType'], string> = {
    Flood: 'bg-chart-3',
    Earthquake: 'bg-chart-4',
    Fire: 'bg-destructive',
    Hurricane: 'bg-chart-2',
};

export function DisasterMap({ updates }: DisasterMapProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [activePin, setActivePin] = useState<number | null>(null);

  const handlePinHover = async (update: DisasterUpdate) => {
    if (activePin === update.id) return;
    
    setLoadingSummary(true);
    setActivePin(update.id);
    setSummary(null);

    try {
      const result = await summarizeDisasterUpdates({
        latitude: update.location.latitude,
        longitude: update.location.longitude,
        disasterType: update.disasterType,
        updates: update.updates,
      });
      setSummary(result.summary);
    } catch (error) {
      console.error("Failed to get summary:", error);
      setSummary("Could not load summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[60vh] md:min-h-0">
      <Image
        src="https://picsum.photos/seed/map/1200/800"
        alt="Map of disaster areas"
        fill
        className="object-cover"
        data-ai-hint="world map"
        priority
      />
      <div className="absolute inset-0 bg-black/20" />
      
      {updates.map((update) => {
        const position = locationToPosition[update.location.name];
        if (!position) return null;

        return (
          <Popover key={update.id} onOpenChange={(open) => !open && setActivePin(null)}>
            <PopoverTrigger
              asChild
              style={{ top: position.top, left: position.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              onMouseEnter={() => handlePinHover(update)}
            >
              <button className="relative flex items-center justify-center w-4 h-4 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 animate-pulse hover:animate-none">
                <span className={`absolute inline-flex h-full w-full rounded-full ${disasterTypeToColor[update.disasterType]} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${disasterTypeToColor[update.disasterType]}`}></span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium leading-none font-headline">{update.location.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${disasterTypeToColor[update.disasterType]}`}></div>
                    <p className="text-sm font-medium">{update.disasterType}</p>
                    <p className="text-sm text-muted-foreground">{new Date(update.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                    <h4 className="font-medium text-sm mb-2">AI Summary</h4>
                    {(loadingSummary && activePin === update.id) ? (
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/> 
                            <p className="text-sm text-muted-foreground">Generating summary...</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{activePin === update.id ? summary : "Hover over a pin to see a summary."}</p>
                    )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
