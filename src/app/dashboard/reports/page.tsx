
"use client";

import React, { useMemo, useState } from 'react';
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { mockDisasterUpdates } from "@/lib/mock-data";
import { BarChart3, List, Flame, Droplets, Zap, Wind, AlertTriangle } from 'lucide-react';
import { subDays, format, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type TimeRange = '7d' | '30d' | '3m' | '6m';

const timeRangeConfig = {
    '7d': { days: 7, label: 'Last 7 Days' },
    '30d': { days: 30, label: 'Last 30 Days' },
    '3m': { days: 90, label: 'Last 3 Months' },
    '6m': { days: 180, label: 'Last 6 Months' },
};

const disasterIcons: Record<string, React.ReactNode> = {
    'Flood': <Droplets className="h-4 w-4" />,
    'Earthquake': <Zap className="h-4 w-4" />,
    'Fire': <Flame className="h-4 w-4" />,
    'Hurricane': <Wind className="h-4 w-4" />
};

const DefaultIcon = <AlertTriangle className="h-4 w-4" />;


export default function ReportsPage() {
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');

    const chartData = useMemo(() => {
        const { days } = timeRangeConfig[timeRange];
        const today = startOfDay(new Date());
        const startDate = subDays(today, days - 1);

        const updatesInRange = mockDisasterUpdates.filter(update => {
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
    }, [timeRange]);


    const chartConfig = {
        Flood: { label: "Flood", color: "hsl(var(--chart-1))" },
        Fire: { label: "Fire", color: "hsl(var(--chart-2))" },
        Earthquake: { label: "Earthquake", color: "hsl(var(--chart-3))" },
        Hurricane: { label: "Hurricane", color: "hsl(var(--chart-4))" },
        Other: { label: "Other", color: "hsl(var(--chart-5))" },
    };

    const recentUpdates = mockDisasterUpdates
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 p-4 md:p-6">
                <div className="w-full max-w-6xl mx-auto grid gap-6">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <CardTitle className="flex items-center">
                                    <BarChart3 className="mr-2 h-6 w-6 text-primary" />
                                    Hazard Reports Trend
                                </CardTitle>
                                <CardDescription>
                                    An overview of reported disaster types. Select a time range to view trends.
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
                                The latest reports from the community, updating automatically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Carousel
                                opts={{
                                    align: "start",
                                    loop: true,
                                }}
                                plugins={[
                                    Autoplay({
                                        delay: 5000,
                                        stopOnInteraction: false,
                                    }),
                                ]}
                                className="w-full"
                            >
                                <CarouselContent>
                                    {recentUpdates.map((update) => (
                                        <CarouselItem key={update.id}>
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                {update.mediaUrl && (
                                                    <div className="relative aspect-video md:col-span-2 rounded-lg overflow-hidden">
                                                        <Image src={update.mediaUrl} alt={update.disasterType} fill className="object-cover" data-ai-hint={`${update.disasterType} disaster`} />
                                                    </div>
                                                )}
                                                <div className={cn("md:col-span-3", !update.mediaUrl && "md:col-span-5")}>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={update.user.avatarUrl} alt={update.user.name} />
                                                            <AvatarFallback>{update.user.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold">{update.user.name}</p>
                                                            <p className="text-xs text-muted-foreground">{format(parseISO(update.timestamp), "PPp")}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-lg mb-1">{update.disasterType} in {update.location.name}</p>
                                                    <p className="text-muted-foreground text-sm">{update.message}</p>
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
