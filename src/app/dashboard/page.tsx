
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { mockDisasterUpdates, DisasterUpdate, createNewMockUpdate, mockAnnouncements } from "@/lib/mock-data";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { DisasterUpdateReply } from "@/lib/mock-data";
import { UpdatesFeed } from "@/components/dashboard/UpdatesFeed";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = useState<DisasterUpdate[]>(mockDisasterUpdates);
  const latestAnnouncement = mockAnnouncements.length > 0 ? mockAnnouncements[0] : null;
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates(prevUpdates => {
        const newUpdate = createNewMockUpdate(prevUpdates.length + 1);
        // Prevent duplicate IDs if updates are added manually
        if (prevUpdates.some(u => u.id === newUpdate.id)) {
            newUpdate.id = Math.max(...prevUpdates.map(u => u.id)) + 1;
        }
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

  const deleteUpdate = (updateId: number) => {
    setUpdates(currentUpdates => 
      currentUpdates.filter(update => update.id !== updateId)
    );
  };
  
  if (loading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
       {latestAnnouncement && isAnnouncementVisible && (
        <Alert className="relative">
          <Megaphone className="h-4 w-4" />
          <AlertTitle>Latest Announcement</AlertTitle>
          <AlertDescription>
            {latestAnnouncement.message}
            <Link href="/dashboard/announcements" className="ml-2 font-semibold underline text-primary">
              View all
            </Link>
          </AlertDescription>
           <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setIsAnnouncementVisible(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close announcement</span>
          </Button>
        </Alert>
      )}
      <UpdatesFeed allUpdates={updates} setUpdates={setUpdates} onReply={addReply} onDelete={deleteUpdate} />
    </div>
  );
}
