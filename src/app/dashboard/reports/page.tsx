
"use client";

import React, { useMemo } from 'react';
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import { mockDisasterUpdates, DisasterUpdate } from "@/lib/mock-data";
import { BarChart3, List } from 'lucide-react';
import { subDays, format, parseISO } from 'date-fns';

export default function ReportsPage() {

    const chartData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), i);
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

        const dataMap = new Map(last7Days.map(d => [d.date, d]));

        mockDisasterUpdates.forEach(update => {
            const updateDate = format(parseISO(update.timestamp), 'yyyy-MM-dd');
            if (dataMap.has(updateDate)) {
                const dayData = dataMap.get(updateDate)!;
                const disasterType = update.disasterType;

                if (['Flood', 'Fire', 'Earthquake', 'Hurricane'].includes(disasterType)) {
                    dayData[disasterType as keyof typeof dayData] += 1;
                } else {
                    dayData['Other'] += 1;
                }
            }
        });

        return Array.from(dataMap.values());
    }, []);

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
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="mr-2 h-6 w-6 text-primary" />
                                Hazard Reports Trend (Last 7 Days)
                            </CardTitle>
                            <CardDescription>
                                An overview of reported disaster types over the past week.
                            </CardDescription>
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
                                        tickFormatter={(value) => value.slice(0, 6)}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar dataKey="Flood" fill="var(--color-Flood)" radius={4} stackId="a">
                                        <LabelList position="top" offset={4} className="fill-foreground" fontSize={12} />
                                    </Bar>
                                    <Bar dataKey="Fire" fill="var(--color-Fire)" radius={4} stackId="a">
                                         <LabelList position="top" offset={4} className="fill-foreground" fontSize={12} />
                                    </Bar>
                                    <Bar dataKey="Earthquake" fill="var(--color-Earthquake)" radius={4} stackId="a">
                                         <LabelList position="top" offset={4} className="fill-foreground" fontSize={12} />
                                    </Bar>
                                    <Bar dataKey="Hurricane" fill="var(--color-Hurricane)" radius={4} stackId="a">
                                         <LabelList position="top" offset={4} className="fill-foreground" fontSize={12} />
                                    </Bar>
                                    <Bar dataKey="Other" fill="var(--color-Other)" radius={4} stackId="a">
                                        <LabelList position="top" offset={4} className="fill-foreground" fontSize={12} />
                                    </Bar>
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
                                The latest 5 reports from the community.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Disaster Type</TableHead>
                                        <TableHead>Reporter</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead className="text-right">Message</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentUpdates.map((update) => (
                                        <TableRow key={update.id}>
                                            <TableCell className="font-medium">{update.location.name}</TableCell>
                                            <TableCell>{update.disasterType}</TableCell>
                                            <TableCell>{update.user.name}</TableCell>
                                            <TableCell>{format(parseISO(update.timestamp), "PPp")}</TableCell>
                                            <TableCell className="text-right text-muted-foreground truncate max-w-xs">{update.message}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
