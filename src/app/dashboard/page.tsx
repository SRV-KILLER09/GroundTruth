
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { mockDisasterUpdates, DisasterUpdate, createNewMockUpdate } from "@/lib/mock-data";
import { useNotifications } from "@/contexts/NotificationsContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { DisasterUpdateReply } from "@/lib/mock-data";
import { UpdatesFeed } from "@/components/dashboard/UpdatesFeed";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmergencyContacts } from "@/components/dashboard/EmergencyContacts";


export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const { notifications } = useNotifications();
  const router = useRouter();
  const [updates, setUpdates] = useState<DisasterUpdate[]>(mockDisasterUpdates);
  const latestNotification = notifications.length > 0 ? notifications[0] : null;
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (latestNotification) {
      const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
      if (!dismissedNotifications.includes(latestNotification.id)) {
        setIsNotificationVisible(true);
      }
    }
  }, [latestNotification]);

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

  const handleDismissNotification = () => {
    if (latestNotification) {
        const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
        localStorage.setItem('dismissedNotifications', JSON.stringify([...dismissedNotifications, latestNotification.id]));
        setIsNotificationVisible(false);
    }
  }
  
  if (loading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
       {latestNotification && isNotificationVisible && (
        <Alert className="relative pr-10">
          <Bell className="h-4 w-4" />
          <AlertTitle>Latest Notification</AlertTitle>
          <AlertDescription>
            {latestNotification.message}
            <Link href="/dashboard/notifications" className="ml-2 font-semibold underline text-primary">
              View all
            </Link>
          </AlertDescription>
           <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleDismissNotification}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close notification</span>
          </Button>
        </Alert>
      )}
      <EmergencyContacts />
      <UpdatesFeed allUpdates={updates} setUpdates={setUpdates} onReply={addReply} onDelete={deleteUpdate} />
    </div>
  );
}
