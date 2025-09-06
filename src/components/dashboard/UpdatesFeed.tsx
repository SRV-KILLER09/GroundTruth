"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Flame, Droplets, Zap, Wind, AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { UpdateCard } from './UpdateCard';
import type { DisasterUpdate } from '@/lib/mock-data';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SubmitUpdateForm } from './SubmitUpdateForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface UpdatesFeedProps {
    allUpdates: DisasterUpdate[];
    filteredUpdates: DisasterUpdate[];
    setFilteredUpdates: React.Dispatch<React.SetStateAction<DisasterUpdate[]>>;
    setUpdates: React.Dispatch<React.SetStateAction<DisasterUpdate[]>>;
}

const disasterTypes = ['All', 'Flood', 'Earthquake', 'Fire', 'Hurricane'] as const;
type DisasterType = typeof disasterTypes[number];
type SortOrder = 'recent' | 'city' | 'closest';

// Haversine formula to calculate distance between two lat/lng points
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export function UpdatesFeed({ allUpdates, filteredUpdates, setFilteredUpdates, setUpdates }: UpdatesFeedProps) {
    const [activeFilter, setActiveFilter] = React.useState<DisasterType>('All');
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [sortOrder, setSortOrder] = React.useState<SortOrder>('recent');
    const [userLocation, setUserLocation] = React.useState<{latitude: number, longitude: number} | null>(null);
    const [isLocating, setIsLocating] = React.useState(false);
    const { toast } = useToast();

    const handleSortChange = (value: SortOrder) => {
        if (value === 'closest' && !userLocation) {
            handleGetUserLocation(value);
        } else {
            setSortOrder(value);
        }
    };
    
    const handleGetUserLocation = (value: SortOrder) => {
        setIsLocating(true);
        if (!navigator.geolocation) {
          toast({
            variant: "destructive",
            title: "Geolocation Error",
            description: "Geolocation is not supported by your browser.",
          });
          setIsLocating(false);
          return;
        }
    
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
            setSortOrder(value);
            toast({
                title: "Location Acquired",
                description: "Sorting by closest location.",
            });
            setIsLocating(false);
          },
          (error) => {
            toast({
              variant: "destructive",
              title: "Geolocation Error",
              description: `Could not get location: ${error.message}`,
            });
            setIsLocating(false);
          }
        );
    };

    const sortedUpdates = React.useMemo(() => {
        let sorted = [...allUpdates];
        if (sortOrder === 'city') {
            sorted.sort((a, b) => a.location.name.localeCompare(b.location.name));
        } else if (sortOrder === 'closest' && userLocation) {
            sorted.sort((a, b) => {
                const distA = getDistance(userLocation.latitude, userLocation.longitude, a.location.latitude, a.location.longitude);
                const distB = getDistance(userLocation.latitude, userLocation.longitude, b.location.latitude, b.location.longitude);
                return distA - distB;
            });
        } else { // 'recent'
            sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        return sorted;
    }, [allUpdates, sortOrder, userLocation]);


    const handleFilter = (type: DisasterType) => {
        setActiveFilter(type);
        if (type === 'All') {
            setFilteredUpdates(sortedUpdates);
        } else {
            const newFilteredUpdates = sortedUpdates.filter(u => u.disasterType === type);
            setFilteredUpdates(newFilteredUpdates);
        }
    }
    
    React.useEffect(() => {
        handleFilter(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allUpdates, sortedUpdates]);

    const addUpdate = (newUpdate: Omit<DisasterUpdate, 'id' | 'timestamp'>) => {
        const updateToAdd: DisasterUpdate = {
            ...newUpdate,
            id: allUpdates.length + 1,
            timestamp: new Date().toISOString()
        };
        const newUpdates = [updateToAdd, ...allUpdates];
        setUpdates(newUpdates);
        setSortOrder('recent'); // Reset sort to show new update first
        setActiveFilter('All');
        setIsSheetOpen(false);
    }
    
    const disasterIcons: Record<Exclude<DisasterType, 'All'>, React.ReactNode> = {
        'Flood': <Droplets className="mr-2 h-4 w-4" />,
        'Earthquake': <Zap className="mr-2 h-4 w-4" />,
        'Fire': <Flame className="mr-2 h-4 w-4" />,
        'Hurricane': <Wind className="mr-2 h-4 w-4" />
    };

    const otherDisasterTypes = allUpdates
        .map(u => u.disasterType)
        .filter(t => !disasterTypes.includes(t as DisasterType));
    const uniqueOtherTypes = [...new Set(otherDisasterTypes)];
    const allFilterTypes: string[] = [...disasterTypes, ...uniqueOtherTypes];

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-2xl font-headline font-bold">Community Updates</h2>
                <div className="flex items-center gap-4">
                    <Select onValueChange={(value: SortOrder) => handleSortChange(value)} value={sortOrder}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">Most Recent</SelectItem>
                            <SelectItem value="city">By City</SelectItem>
                            <SelectItem value="closest">
                                <div className="flex items-center">
                                    {isLocating && sortOrder !== 'closest' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MapPin className="mr-2 h-4 w-4" />}
                                    Closest to Me
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Update
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-lg">
                            <SheetHeader>
                                <SheetTitle>Submit a New Disaster Update</SheetTitle>
                                <SheetDescription>
                                    Help your community by providing real-time information.
                                </SheetDescription>
                            </SheetHeader>
                            <SubmitUpdateForm onSubmit={addUpdate} />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {allFilterTypes.map(type => (
                    <Button 
                        key={type}
                        variant={activeFilter === type ? 'default' : 'outline'}
                        onClick={() => handleFilter(type as DisasterType)}
                        className="capitalize shrink-0"
                    >
                        {
                            //@ts-ignore
                            disasterIcons[type] ? disasterIcons[type] : (type !== 'All' ? <AlertTriangle className="mr-2 h-4 w-4" /> : null)
                        }
                        {type}
                    </Button>
                ))}
            </div>
            <div className="space-y-4">
                {filteredUpdates.length > 0 ? (
                    filteredUpdates.map(update => (
                        <UpdateCard key={update.id} update={update} />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No updates found for this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
