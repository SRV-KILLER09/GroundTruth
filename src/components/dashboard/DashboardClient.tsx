"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/dashboard/Header";
import { DisasterMap } from "@/components/dashboard/DisasterMap";
import { UpdatesFeed } from "@/components/dashboard/UpdatesFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { mockDisasterUpdates, DisasterUpdate } from "@/lib/mock-data";
import React from 'react';

export default function DashboardClient() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = React.useState<DisasterUpdate[]>(mockDisasterUpdates);
  const [filteredUpdates, setFilteredUpdates] = React.useState<DisasterUpdate[]>(mockDisasterUpdates);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </header>
        <div className="flex-1 grid md:grid-cols-5 lg:grid-cols-3 gap-6 p-4 md:p-6">
          <div className="md:col-span-3 lg:col-span-2 h-[60vh] md:h-auto">
             <Skeleton className="h-full w-full rounded-lg" />
          </div>
          <div className="md:col-span-2 lg:col-span-1 space-y-4">
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-40 w-full" />
             <Skeleton className="h-40 w-full" />
             <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 grid md:grid-cols-5 lg:grid-cols-3 gap-6 p-4 md:p-6">
        <div className="md:col-span-3 lg:col-span-2 rounded-lg shadow-md overflow-hidden">
          <DisasterMap updates={filteredUpdates} />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <UpdatesFeed allUpdates={updates} filteredUpdates={filteredUpdates} setFilteredUpdates={setFilteredUpdates} setUpdates={setUpdates} />
        </div>
      </main>
    </div>
  );
}
