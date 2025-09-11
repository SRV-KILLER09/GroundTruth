
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { DisasterUpdate } from "@/lib/mock-data";
import { BarChart3, List, Flame, Droplets, Zap, Wind, AlertTriangle, User, Shield } from 'lucide-react';
import { subDays, format, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';


type TimeRange = '7d' | '30d' | '3m' | '6m';

const timeRangeConfig = {
    '7d': { days: 7, label: 'Last 7 Days' },
    '30d': { days: 30, label: 'Last 30 Days' },
    '3m': { days: 90, label: 'Last 3 Months' },
    '6m': { days: 180, label: 'Last 6 Months' },
};

const disasterIcons: Record<string, React.ReactNode> = {
    'Flood': <Droplets className="h-4 w-4 text-blue-500" />,
    'Earthquake': <Zap className="h-4 w-4 text-yellow-500" />,
    'Fire': <Flame className="h-4 w-4 text-orange-500" />,
    'Hurricane': <Wind className="h-4 w-4 text-gray-500" />
};

const DefaultIcon = <AlertTriangle className="h-4 w-4 text-red-500" />;


export default function ReportsPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [allUpdates, setAllUpdates] = useState<DisasterUpdate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We fetch up to 100 recent documents for reporting purposes.
        // For very large datasets, a more advanced aggregation solution (e.g., Cloud Functions) would be needed.
        const q = query(collection(db, "disaster_updates"), orderBy("timestamp", "desc"), limit(100));
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
            setLoading(false);
        }, (error) => {
            console.error("Firestore error: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const liveUpdates = useMemo(() => {
        // Sort by timestamp to get the most recent ones for the live feed table
        return [...allUpdates]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
    }, [allUpdates]);
    

    const chartData = useMemo(() => {
        const { days } = timeRangeConfig[timeRange];
        const today = startOfDay(new Date());
        const startDate = subDays(today, days - 1);

        const updatesInRange = allUpdates.filter(update => {
            const updateDate = parseISO(update.timestamp);
            return differenceInDays(today, updateDate) < days && updateDate >= startDate;
        });

        const dateEntries = Array.from({ length: days }, (_, i) => {
            const date = subDays(today, i);
            return {
                name: format(date, 'MMM d'),
                date: format(date, 'yyyy-MM-dd'),
                Flood: 0,
                Fire: 0,
                Earthquake: 0,
                Hurricane: 0,
                Other: 0,
            };
        }).reverse();
        
        const dataMap = new Map(dateEntries.map(d => [d.date, d]));
        
        updatesInRange.forEach(update => {
            const updateDateStr = format(parseISO(update.timestamp), 'yyyy-MM-dd');
            if (dataMap.has(updateDateStr)) {
                const dayData = dataMap.get(updateDateStr)!;
                const disasterType = update.disasterType;

                if (['Flood', 'Fire', 'Earthquake', 'Hurricane'].includes(disasterType)) {
                    dayData[disasterType as keyof typeof dayData] = (dayData[disasterType as keyof typeof dayData] || 0) + 1;
                } else {
                    dayData['Other'] = (dayData['Other'] || 0) + 1;
                }
            }
        });

        return Array.from(dataMap.values());
    }, [timeRange, allUpdates]);


    const chartConfig = {
        Flood: { label: "Flood", color: "hsl(var(--chart-1))" },
        Fire: { label: "Fire", color: "hsl(var(--chart-2))" },
        Earthquake: { label: "Earthquake", color: "hsl(var(--chart-3))" },
        Hurricane: { label: "Hurricane", color: "hsl(var(--chart-4))" },
        Other: { label: "Other", color: "hsl(var(--chart-5))" },
    };
    
    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full max-w-6xl mx-auto grid gap-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <CardTitle className="flex items-center">
                            <BarChart3 className="mr-2 h-6 w-6 text-primary" />
                            Hazard Reports Trend
                        </CardTitle>
                        <CardDescription>
                            An overview of reported disaster types based on the latest 100 reports.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        {(Object.keys(timeRangeConfig) as TimeRange[]).map(range => (
                             <Button
                                key={range}
                                variant={timeRange === range ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTimeRange(range)}
                                className={cn("whitespace-nowrap")}
                            >
                                {timeRangeConfig[range].label}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart data={chartData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value, index) => {
                                    const { days } = timeRangeConfig[timeRange];
                                    const interval = Math.ceil(days / 7); // Show ~7 labels
                                    if (index % interval === 0) {
                                        return value.slice(0, 6);
                                    }
                                    return "";
                                }}
                            />
                            <YAxis tickLine={false} axisLine={false} allowDecimals={false}/>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                            />
                            <Bar dataKey="Flood" fill="var(--color-Flood)" radius={4} stackId="a" />
                            <Bar dataKey="Fire" fill="var(--color-Fire)" radius={4} stackId="a" />
                            <Bar dataKey="Earthquake" fill="var(--color-Earthquake)" radius={4} stackId="a" />
                            <Bar dataKey="Hurricane" fill="var(--color-Hurricane)" radius={4} stackId="a" />
                            <Bar dataKey="Other" fill="var(--color-Other)" radius={4} stackId="a" />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <List className="mr-2 h-6 w-6 text-primary" />
                        Live Reports Feed
                    </CardTitle>
                     <CardDescription>
                        The latest reports from the community, updating in real-time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Reported By</TableHead>
                                <TableHead>Authority</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {liveUpdates.map((update) => (
                                <TableRow key={update.id} className="transition-opacity duration-500">
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium">
                                            {disasterIcons[update.disasterType] || DefaultIcon}
                                            {update.disasterType}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{update.location.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {update.location.latitude.toFixed(4)}, {update.location.longitude.toFixed(4)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{update.message}</TableCell>
                                    <TableCell>
                                        <Badge variant={update.status === 'Verified' ? 'default' : 'secondary'}>
                                            {update.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            {update.user.name}
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            {update.authority}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{format(parseISO(update.timestamp), "HH:mm:ss")}</TableCell>
                                </TableRow>
                            ))}
                             {liveUpdates.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No reports found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

    
