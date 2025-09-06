"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/dashboard/Header";
import { UpdatesFeed } from "@/components/dashboard/UpdatesFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { mockDisasterUpdates, DisasterUpdate } from "@/lib/mock-data";
import { EmergencyContacts } from "@/components/dashboard/EmergencyContacts";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = useState<DisasterUpdate[]>(mockDisasterUpdates);
  const [filteredUpdates, setFilteredUpdates] = useState<DisasterUpdate[]>(mockDisasterUpdates);

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
        <main className="flex-1 p-4 md:p-6">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="flex space-x-2 mb-4">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="w-full max-w-4xl mx-auto">
            <EmergencyContacts />
            <UpdatesFeed 
                allUpdates={updates} 
                filteredUpdates={filteredUpdates} 
                setFilteredUpdates={setFilteredUpdates} 
                setUpdates={setUpdates} 
            />
        </div>
      </main>
    </div>
  );
}
