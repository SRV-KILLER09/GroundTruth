
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
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, deleteDoc, getDocs, limit, startAfter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";


export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const { notifications } = useNotifications();
  const router = useRouter();
  const [updates, setUpdates] = useState<DisasterUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

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
    if (isAuthenticated && updatesLoading) { // Only run initial load once
        const firstBatch = query(collection(db, "disaster_updates"), orderBy("timestamp", "desc"), limit(10));
        
        const unsubscribe = onSnapshot(firstBatch, (querySnapshot) => {
            const updatesData: DisasterUpdate[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                updatesData.push({ 
                    ...data as Omit<DisasterUpdate, 'id' | 'timestamp'>, 
                    id: doc.id,
                    timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
                });
            });

            // For real-time updates, we only update if the new data is different.
            // This naive check avoids flickering on "Load More". A more robust solution would diff the arrays.
            setUpdates(currentUpdates => {
                const newIds = new Set(updatesData.map(u => u.id));
                const currentIds = new Set(currentUpdates.slice(0, updatesData.length).map(u => u.id));
                const areSetsEqual = (a: Set<string | undefined>, b: Set<string | undefined>) => a.size === b.size && [...a].every(value => b.has(value));

                if (!areSetsEqual(newIds, currentIds)) {
                     // The first page of data has changed, so we reset the list.
                     // This handles new posts being added in real-time.
                     setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
                     setHasMore(querySnapshot.docs.length === 10);
                     return updatesData;
                }
                return currentUpdates;
            });
            
            if (updates.length === 0) {
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
                setHasMore(querySnapshot.docs.length === 10);
            }
            setUpdatesLoading(false);
        });

        return () => unsubscribe();
    }
  }, [isAuthenticated, updates.length, updatesLoading]);

  const fetchMoreUpdates = async () => {
    if (!lastVisible) {
        setHasMore(false);
        return;
    };

    const nextBatch = query(collection(db, "disaster_updates"), orderBy("timestamp", "desc"), startAfter(lastVisible), limit(10));
    
    const documentSnapshots = await getDocs(nextBatch);
    const newUpdates: DisasterUpdate[] = [];
    documentSnapshots.forEach((doc) => {
        const data = doc.data();
        newUpdates.push({ 
            ...data as Omit<DisasterUpdate, 'id' | 'timestamp'>, 
            id: doc.id,
            timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
        });
    });

    setUpdates(prevUpdates => [...prevUpdates, ...newUpdates]);
    setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length-1]);
    if (documentSnapshots.docs.length < 10) {
        setHasMore(false);
    }
  }

  
  const addReply = async (updateId: string, reply: DisasterUpdateReply) => {
    const updateRef = doc(db, "disaster_updates", updateId);
    await updateDoc(updateRef, {
      replies: arrayUnion({ ...reply, timestamp: new Date().toISOString() }),
      status: 'Verified', 
    });
  };

  const deleteUpdate = async (updateId: string) => {
    await deleteDoc(doc(db, "disaster_updates", updateId));
    setUpdates(prev => prev.filter(u => u.id !== updateId));
  };

  const handleDismissNotification = () => {
    if (latestNotification) {
        const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
        localStorage.setItem('dismissedNotifications', JSON.stringify([...dismissedNotifications, latestNotification.id]));
        setIsNotificationVisible(false);
    }
  }
  
  if (loading || (updatesLoading && updates.length === 0)) {
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
      <UpdatesFeed 
        allUpdates={updates} 
        onReply={addReply} 
        onDelete={deleteUpdate}
        loadMore={fetchMoreUpdates}
        hasMore={hasMore}
      />
    </div>
  );
}

    