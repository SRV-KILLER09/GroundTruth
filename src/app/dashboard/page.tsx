
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { DisasterUpdate, DisasterUpdateReply } from "@/lib/mock-data";
import { useNotifications } from "@/contexts/NotificationsContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { UpdatesFeed } from "@/components/dashboard/UpdatesFeed";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmergencyContacts } from "@/components/dashboard/EmergencyContacts";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, deleteDoc, serverTimestamp } from "firebase/firestore";


export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const { notifications } = useNotifications();
  const router = useRouter();
  const [updates, setUpdates] = useState<DisasterUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
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
    if (isAuthenticated) {
        const q = query(collection(db, "disaster_updates"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const updatesData: DisasterUpdate[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                updatesData.push({ 
                    ...data as Omit<DisasterUpdate, 'id' | 'timestamp'>, 
                    id: doc.id,
                    timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
                });
            });
            setUpdates(updatesData);
            setUpdatesLoading(false);
        });

        return () => unsubscribe();
    }
  }, [isAuthenticated]);

  
  const addReply = async (updateId: string, reply: DisasterUpdateReply) => {
    const updateRef = doc(db, "disaster_updates", updateId);
    await updateDoc(updateRef, {
      replies: arrayUnion({ ...reply, timestamp: new Date().toISOString() }),
      status: 'Verified', 
    });
  };

  const deleteUpdate = async (updateId: string) => {
    await deleteDoc(doc(db, "disaster_updates", updateId));
  };

  const handleDismissNotification = () => {
    if (latestNotification) {
        const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
        localStorage.setItem('dismissedNotifications', JSON.stringify([...dismissedNotifications, latestNotification.id]));
        setIsNotificationVisible(false);
    }
  }
  
  if (loading || updatesLoading) {
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
