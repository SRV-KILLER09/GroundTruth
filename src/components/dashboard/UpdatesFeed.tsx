"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Flame, Droplets, Zap, Wind } from 'lucide-react';
import { UpdateCard } from './UpdateCard';
import type { DisasterUpdate } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SubmitUpdateForm } from './SubmitUpdateForm';

interface UpdatesFeedProps {
    allUpdates: DisasterUpdate[];
    filteredUpdates: DisasterUpdate[];
    setFilteredUpdates: React.Dispatch<React.SetStateAction<DisasterUpdate[]>>;
    setUpdates: React.Dispatch<React.SetStateAction<DisasterUpdate[]>>;
}

const disasterTypes = ['All', 'Flood', 'Earthquake', 'Fire', 'Hurricane'] as const;

export function UpdatesFeed({ allUpdates, filteredUpdates, setFilteredUpdates, setUpdates }: UpdatesFeedProps) {
    const [activeFilter, setActiveFilter] = React.useState<typeof disasterTypes[number]>('All');
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);

    const handleFilter = (type: typeof disasterTypes[number]) => {
        setActiveFilter(type);
        if (type === 'All') {
            setFilteredUpdates(allUpdates);
        } else {
            const newFilteredUpdates = allUpdates.filter(u => u.disasterType === type);
            setFilteredUpdates(newFilteredUpdates);
        }
    }
    
    React.useEffect(() => {
        handleFilter(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allUpdates]);

    const addUpdate = (newUpdate: Omit<DisasterUpdate, 'id' | 'timestamp'>) => {
        const updateToAdd: DisasterUpdate = {
            ...newUpdate,
            id: allUpdates.length + 1,
            timestamp: new Date().toISOString()
        };
        const newUpdates = [updateToAdd, ...allUpdates];
        setUpdates(newUpdates);
        setIsSheetOpen(false);
    }
    
    const disasterIcons = {
        'Flood': <Droplets className="mr-2 h-4 w-4" />,
        'Earthquake': <Zap className="mr-2 h-4 w-4" />,
        'Fire': <Flame className="mr-2 h-4 w-4" />,
        'Hurricane': <Wind className="mr-2 h-4 w-4" />
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-headline font-bold">Community Updates</h2>
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
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {disasterTypes.map(type => (
                    <Button 
                        key={type}
                        variant={activeFilter === type ? 'default' : 'outline'}
                        onClick={() => handleFilter(type)}
                        className="capitalize shrink-0"
                    >
                        {type !== 'All' && disasterIcons[type as Exclude<typeof disasterTypes[number], 'All'>]}
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
