"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Flame, Droplets, Zap, Wind, AlertTriangle, MapPin, Loader2, Search } from 'lucide-react';
import { UpdateCard } from './UpdateCard';
import type { DisasterUpdate, DisasterUpdateReply } from '@/lib/mock-data';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SubmitUpdateForm } from './SubmitUpdateForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface UpdatesFeedProps {
    allUpdates: DisasterUpdate[];
    filteredUpdates: DisasterUpdate[];
    setFilteredUpdates: React.Dispatch<React.SetStateAction<DisasterUpdate[]>>;
    setUpdates: React.Dispatch<React.SetStateAction<DisasterUpdate[]>>;
}

const disasterTypes = ['All', 'Flood', 'Earthquake', 'Fire', 'Hurricane'] as const;
type DisasterType = typeof disasterTypes[number];
type SortOrder = 'recent' | 'closest';

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
    const [citySearch, setCitySearch] = React.useState("");
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
        if (sortOrder === 'closest' && userLocation) {
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


    const applyFilters = React.useCallback(() => {
        let updatesToFilter = [...sortedUpdates];
        
        // Filter by disaster type
        if (activeFilter !== 'All') {
            updatesToFilter = updatesToFilter.filter(u => u.disasterType === activeFilter);
        }

        // Filter by city search
        if (citySearch.trim() !== "") {
            updatesToFilter = updatesToFilter.filter(u => 
                u.location.name.toLowerCase().includes(citySearch.toLowerCase())
            );
        }

        setFilteredUpdates(updatesToFilter);
    }, [sortedUpdates, activeFilter, citySearch, setFilteredUpdates]);
    
    React.useEffect(() => {
        applyFilters();
    }, [allUpdates, sortedUpdates, activeFilter, citySearch, applyFilters]);

    const addUpdate = (newUpdate: Omit<DisasterUpdate, 'id' | 'timestamp' | 'replies'>) => {
        const updateToAdd: DisasterUpdate = {
            ...newUpdate,
            id: allUpdates.length + 1,
            timestamp: new Date().toISOString(),
            replies: [],
        };
        const newUpdates = [updateToAdd, ...allUpdates];
        setUpdates(newUpdates);
        setSortOrder('recent'); // Reset sort to show new update first
        setActiveFilter('All');
        setCitySearch('');
        setIsSheetOpen(false);
    }

    const addReply = (updateId: number, reply: DisasterUpdateReply) => {
        const newUpdates = allUpdates.map(update => {
            if (update.id === updateId) {
                return {
                    ...update,
                    replies: [...update.replies, reply]
                };
            }
            return update;
        });
        setUpdates(newUpdates);
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
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
                    {allFilterTypes.map(type => (
                        <Button 
                            key={type}
                            variant={activeFilter === type ? 'default' : 'outline'}
                            onClick={() => setActiveFilter(type as DisasterType)}
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
                <div className="relative sm:ml-auto sm:w-auto w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by city..."
                        className="pl-8 sm:w-64"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="space-y-4">
                {filteredUpdates.length > 0 ? (
                    filteredUpdates.map(update => (
                        <UpdateCard key={update.id} update={update} onReply={addReply} />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No updates found for the selected filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
