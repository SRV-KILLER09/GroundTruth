"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/dashboard/Header";
import { UpdatesFeed } from "@/components/dashboard/UpdatesFeed";
import { mockDisasterUpdates, DisasterUpdate } from "@/lib/mock-data";
import { EmergencyContacts } from "@/components/dashboard/EmergencyContacts";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
    return <LoadingSpinner />;
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
