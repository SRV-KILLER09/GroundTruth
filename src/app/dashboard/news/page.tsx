
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Rss, Newspaper, Building, TriangleAlert, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { mockNewsItems, createNewMockNewsItem, type MockNewsItem } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

const categoryStyles = {
    alert: "bg-red-500/10 text-red-500 border-red-500/20",
    news: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    corporate: "bg-green-500/10 text-green-500 border-green-500/20"
}

const NewsArticle = ({ item }: { item: MockNewsItem }) => (
    <div className="border-b pb-6 last:border-b-0 last:pb-0">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {item.categoryType === 'corporate' ? <Building className="h-4 w-4" /> : <Newspaper className="h-4 w-4" />}
                <span>{item.source}</span>
            </div>
            <Badge variant="outline" className={categoryStyles[item.categoryType as keyof typeof categoryStyles]}>
                {item.categoryType === 'alert' && <TriangleAlert className="h-3 w-3 mr-1.5" />}
                {item.category}
            </Badge>
        </div>
        <h3 className="text-xl font-headline font-semibold mb-2 text-foreground">
            <Link href={item.link} className="hover:text-primary transition-colors">
            {item.headline}
            </Link>
        </h3>
        <p className="text-muted-foreground mb-3">
            {item.summary}
        </p>
        <div className="text-xs text-muted-foreground/80">
            {new Date(item.timestamp).toLocaleString()}
        </div>
    </div>
);

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<MockNewsItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setNewsItems(mockNewsItems);
    
    // Fetch location on mount
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Simple reverse geocoding simulation
            if (latitude > 28.4 && latitude < 28.8 && longitude > 76.8 && longitude < 77.4) {
                 setLocationName("Delhi");
            } else {
                 setLocationName("your area");
            }
            setIsLocating(false);
        },
        () => {
            toast({
                variant: 'destructive',
                title: 'Location Access Denied',
                description: 'Could not fetch local news. Please enable location permissions.',
            });
            setLocationName('your region');
            setIsLocating(false);
        }
    );

    const interval = setInterval(() => {
      setNewsItems(prevItems => {
        const newItem = createNewMockNewsItem();
        // Prevent duplicate headlines
        if (prevItems.some(item => item.headline === newItem.headline)) {
          return prevItems;
        }
        return [newItem, ...prevItems];
      });
    }, 8000); // Add a new item every 8 seconds

    return () => clearInterval(interval);
  }, [toast]);

  const localNewsItems = newsItems.filter(item => 
      item.categoryType === 'alert' ||
      (locationName && item.headline.toLowerCase().includes(locationName.toLowerCase()))
  );

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Rss className="mr-2 h-6 w-6 text-primary" />
            News Feed
          </CardTitle>
          <CardDescription>
            A simulated feed of the latest disaster-related news. In a real app, this would be powered by a live news API.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="national" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="national">National News</TabsTrigger>
                    <TabsTrigger value="local">Local Alerts</TabsTrigger>
                </TabsList>
                <TabsContent value="national" className="pt-6">
                    <div className="space-y-6">
                        {newsItems.map((item, index) => (
                           <NewsArticle key={`national-${index}`} item={item} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="local" className="pt-6">
                    <div className="p-4 mb-6 rounded-lg bg-muted/50 border flex items-center gap-3">
                         {isLocating ? (
                            <Loader2 className="h-5 w-5 text-primary animate-spin"/>
                         ) : (
                            <MapPin className="h-5 w-5 text-primary"/>
                         )}
                         <p className="text-sm text-muted-foreground">
                            {isLocating 
                                ? "Getting your location for relevant news..." 
                                : `Showing alerts and news relevant to ${locationName || "your region"} (Simulated).`}
                         </p>
                    </div>
                    <div className="space-y-6">
                        {localNewsItems.length > 0 ? (
                            localNewsItems.map((item, index) => (
                                <NewsArticle key={`local-${index}`} item={item} />
                            ))
                        ) : (
                             <div className="text-center p-8 text-muted-foreground">
                                <p>No specific local alerts for {locationName || "your region"} at this time.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
         <CardFooter className="text-center text-muted-foreground text-sm pt-6">
            <p>This is a simulated news feed for demonstration purposes.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
