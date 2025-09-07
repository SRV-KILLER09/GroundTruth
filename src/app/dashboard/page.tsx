
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/dashboard/Header";
import { mockDisasterUpdates, DisasterUpdate, createNewMockUpdate } from "@/lib/mock-data";
import { EmergencyContacts } from "@/components/dashboard/EmergencyContacts";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StatusSection } from "@/components/dashboard/StatusSection";
import type { DisasterUpdateReply } from "@/lib/mock-data";

export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = useState<DisasterUpdate[]>(mockDisasterUpdates);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates(prevUpdates => {
        const newUpdate = createNewMockUpdate(prevUpdates.length + 1);
        return [newUpdate, ...prevUpdates];
      });
    }, 15000); // Add a new update every 15 seconds

    return () => clearInterval(interval);
  }, []);
  
  const addReply = (updateId: number, reply: DisasterUpdateReply) => {
    setUpdates(currentUpdates => 
      currentUpdates.map(update => {
        if (update.id === updateId) {
          // Also update status to Verified when an admin replies
          return {
            ...update,
            replies: [...update.replies, reply],
            status: 'Verified', 
          };
        }
        return update;
      })
    );
  };

  if (loading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  const verifiedUpdates = updates.filter(u => u.status === 'Verified');
  const investigationUpdates = updates.filter(u => u.status === 'Under Investigation');
  const fakeUpdates = updates.filter(u => u.status === 'Fake');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <EmergencyContacts />
            
            <StatusSection title="Verified Reports" status="Verified" updates={verifiedUpdates} onReply={addReply} />
            <StatusSection title="Under Investigation" status="Under Investigation" updates={investigationUpdates} onReply={addReply} />
            <StatusSection title="Potentially Fake Reports" status="Fake" updates={fakeUpdates} onReply={addReply} />

        </div>
      </main>
    </div>
  );
}
