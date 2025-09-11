
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Flame, Droplets, Zap, Wind, AlertTriangle, MapPin, Loader2, Search, CheckCircle, HelpCircle, XCircle, Bell, Users } from 'lucide-react';
import { UpdateCard } from './UpdateCard';
import type { DisasterUpdate, DisasterUpdateReply, DisasterStatus } from '@/lib/mock-data';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SubmitUpdateForm } from './SubmitUpdateForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';


interface UpdatesFeedProps {
    allUpdates: DisasterUpdate[];
    onReply: (updateId: string, reply: DisasterUpdateReply) => void;
    onDelete: (updateId: string) => void;
    onInteraction: (updateId: string, interactionType: 'like' | 'dislike') => void;
    loadMore: () => void;
    hasMore: boolean;
}

const disasterTypes = ['All', 'Flood', 'Earthquake', 'Fire', 'Hurricane'] as const;
type DisasterType = typeof disasterTypes[number];
type SortOrder = 'recent' | 'closest';


const statusConfig: Record<DisasterStatus, { icon: React.ReactNode, className: string }> = {
    'Verified': { icon: <CheckCircle className="mr-2 h-4 w-4" />, className: "hover:bg-green-500/10 hover:text-green-500 border-green-500/20 text-green-500 [&[data-active=true]]:bg-green-500/10" },
    'Under Investigation': { icon: <HelpCircle className="mr-2 h-4 w-4" />, className: "hover:bg-yellow-500/10 hover:text-yellow-500 border-yellow-500/20 text-yellow-500 [&[data-active=true]]:bg-yellow-500/10" },
    'Fake': { icon: <XCircle className="mr-2 h-4 w-4" />, className: "hover:bg-red-500/10 hover:text-red-500 border-red-500/20 text-red-500 [&[data-active=true]]:bg-red-500/10" }
}

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

export function UpdatesFeed({ allUpdates, onReply, onDelete, onInteraction, loadMore, hasMore }: UpdatesFeedProps) {
    const { user, isAdmin, isAuthority } = useAuth();
    const [filteredUpdates, setFilteredUpdates] = React.useState<DisasterUpdate[]>(allUpdates);
    const [activeDisasterType, setActiveDisasterType] = React.useState<DisasterType>('All');
    const [activeStatusFilter, setActiveStatusFilter] = React.useState<DisasterStatus | 'All'>('All');
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
        if (activeDisasterType !== 'All') {
            updatesToFilter = updatesToFilter.filter(u => u.disasterType === activeDisasterType);
        }

        // Filter by status
        if (activeStatusFilter !== 'All') {
            updatesToFilter = updatesToFilter.filter(u => u.status === activeStatusFilter);
        }

        // Filter by city search
        if (citySearch.trim() !== "") {
            updatesToFilter = updatesToFilter.filter(u => 
                u.location.name.toLowerCase().includes(citySearch.toLowerCase())
            );
        }

        setFilteredUpdates(updatesToFilter);
    }, [sortedUpdates, activeDisasterType, activeStatusFilter, citySearch, setFilteredUpdates]);
    
    React.useEffect(() => {
        applyFilters();
    }, [allUpdates, sortedUpdates, activeDisasterType, activeStatusFilter, citySearch, applyFilters]);

    
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
    
    const handleSuccessfulSubmit = () => {
        setIsSheetOpen(false);
        setSortOrder('recent');
        setActiveDisasterType('All');
        setCitySearch('');
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h1 className="text-3xl font-bold font-headline">Live Feed</h1>
                <div className="flex items-center gap-2">
                    {isAdmin && !isAuthority && (
                        <>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/notifications">
                                    <Bell className="mr-2 h-4 w-4" />
                                    Notifications
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/updates">
                                    <Users className="mr-2 h-4 w-4" />
                                    User Activity
                                </Link>
                            </Button>
                        </>
                    )}
                    {!isAuthority && (
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Report
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                                <SheetHeader className="mb-4">
                                    <SheetTitle>Submit a New Disaster Report</SheetTitle>
                                    <SheetDescription>
                                        Help your community by providing real-time information. Your report will automatically alert the correct authorities.
                                    </SheetDescription>
                                </SheetHeader>
                                <SubmitUpdateForm onSuccessfulSubmit={handleSuccessfulSubmit} />
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                 <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by city or location..."
                        className="pl-8 w-full"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                    />
                </div>
                <Select onValueChange={(value: SortOrder) => handleSortChange(value)} value={sortOrder}>
                    <SelectTrigger className="w-full sm:w-[180px]">
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
            </div>
            
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                 <Button 
                    variant={activeStatusFilter === 'All' ? 'default' : 'outline'}
                    onClick={() => setActiveStatusFilter('All')}
                    className="shrink-0"
                >
                    All Statuses
                </Button>
                {(Object.keys(statusConfig) as DisasterStatus[]).map(status => (
                    <Button 
                        key={status}
                        variant={activeStatusFilter === status ? 'default' : 'outline'}
                        data-active={activeStatusFilter === status}
                        onClick={() => setActiveStatusFilter(status)}
                        className={cn("shrink-0", activeStatusFilter === status ? statusConfig[status].className.replace("hover:", "") : "")}
                    >
                        {statusConfig[status].icon}
                        {status}
                    </Button>
                ))}
            </div>


            <div className="space-y-4">
                {filteredUpdates.length > 0 ? (
                    filteredUpdates.map(update => (
                        <UpdateCard key={update.id} update={update} onReply={onReply} onDelete={onDelete} onInteraction={onInteraction} />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No updates found for the selected filters.</p>
                    </div>
                )}
                {hasMore && filteredUpdates.length > 0 && (
                    <Button variant="outline" className="w-full" onClick={loadMore}>
                        Load More
                    </Button>
                )}
            </div>
        </div>
    );
}
