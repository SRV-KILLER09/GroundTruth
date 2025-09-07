
"use client";

import { useState, useEffect } from 'react';
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Rss, Newspaper, Building, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { mockNewsItems, createNewMockNewsItem, type MockNewsItem } from '@/lib/mock-data';

const categoryStyles = {
    alert: "bg-red-500/10 text-red-500 border-red-500/20",
    news: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    corporate: "bg-green-500/10 text-green-500 border-green-500/20"
}

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<MockNewsItem[]>(mockNewsItems);

  useEffect(() => {
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
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="w-full max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rss className="mr-2 h-6 w-6 text-primary" />
                National News Feed
              </CardTitle>
              <CardDescription>
                A simulated feed of the latest disaster-related news from trusted national sources and PSUs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {newsItems.map((item, index) => (
                  <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
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
                ))}
              </div>
            </CardContent>
             <CardFooter className="text-center text-muted-foreground text-sm">
                <p>This is a simulated news feed for demonstration purposes.</p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
