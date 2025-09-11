
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DisasterUpdate, DisasterUpdateReply, mockDisasterUpdates } from "@/lib/mock-data";
import { useNotifications } from "@/contexts/NotificationsContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { UpdatesFeed } from "@/components/dashboard/UpdatesFeed";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmergencyContacts } from "@/components/dashboard/EmergencyContacts";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, deleteDoc, getDocs, limit, startAfter, DocumentData, QueryDocumentSnapshot, arrayRemove, runTransaction } from "firebase/firestore";


export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
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
    if (isAuthenticated) {
        // Use mock data instead of Firestore for now
        const mockDataWithIds = mockDisasterUpdates.map((update, index) => ({
            ...update,
            id: `mock-${index}`
        })) as DisasterUpdate[];
        
        setUpdates(mockDataWithIds);
        setUpdatesLoading(false);
        setHasMore(false); // No pagination for mock data for now

        /*
        // Original Firestore logic
        const q = query(collection(db, "disaster_updates"), orderBy("timestamp", "desc"), limit(10));
        
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
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setHasMore(querySnapshot.docs.length === 10);
            if (updatesLoading) setUpdatesLoading(false);
        });

        return () => unsubscribe();
        */
    }
  }, [isAuthenticated, updatesLoading]);

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
    // This function will need to be adapted if you want it to work with mock data
    // For now, it will only work if you switch back to Firestore.
    if (updateId.startsWith('mock-')) {
        console.log("Replying to mock data (local state only):", { updateId, reply });
        setUpdates(currentUpdates =>
            currentUpdates.map(u =>
                u.id === updateId ? { ...u, replies: [...u.replies, reply], status: 'Verified' } : u
            )
        );
        return;
    }
    const updateRef = doc(db, "disaster_updates", updateId);
    await updateDoc(updateRef, {
      replies: arrayUnion({ ...reply, timestamp: new Date().toISOString() }),
      status: 'Verified', 
    });
  };

  const deleteUpdate = async (updateId: string) => {
     if (updateId.startsWith('mock-')) {
        console.log("Deleting mock data (local state only):", { updateId });
        setUpdates(currentUpdates => currentUpdates.filter(u => u.id !== updateId));
        return;
    }
    await deleteDoc(doc(db, "disaster_updates", updateId));
  };
  
  const handleInteraction = async (updateId: string, interactionType: 'like' | 'dislike') => {
    if (!user) return;
    const userId = user.uid;

    if (updateId.startsWith('mock-')) {
        console.log("Interacting with mock data (local state only):", { updateId, interactionType });
        setUpdates(currentUpdates =>
            currentUpdates.map(u => {
                if (u.id === updateId) {
                    const likedBy = u.likedBy || [];
                    const dislikedBy = u.dislikedBy || [];
                    
                    const isLiked = likedBy.includes(userId);
                    const isDisliked = dislikedBy.includes(userId);

                    let newLikedBy = [...likedBy];
                    let newDislikedBy = [...dislikedBy];

                    if (interactionType === 'like') {
                        if (isLiked) {
                            newLikedBy = newLikedBy.filter(uid => uid !== userId);
                        } else {
                            newLikedBy.push(userId);
                            if (isDisliked) newDislikedBy = newDislikedBy.filter(uid => uid !== userId);
                        }
                    } else { // dislike
                        if (isDisliked) {
                            newDislikedBy = newDislikedBy.filter(uid => uid !== userId);
                        } else {
                            newDislikedBy.push(userId);
                            if (isLiked) newLikedBy = newLikedBy.filter(uid => uid !== userId);
                        }
                    }
                    return { ...u, likedBy: newLikedBy, dislikedBy: newDislikedBy };
                }
                return u;
            })
        );
        return;
    }


    const updateRef = doc(db, "disaster_updates", updateId);
    
    await runTransaction(db, async (transaction) => {
      const updateDoc = await transaction.get(updateRef);
      if (!updateDoc.exists()) {
        throw "Document does not exist!";
      }

      const data = updateDoc.data();
      const likedBy = data.likedBy || [];
      const dislikedBy = data.dislikedBy || [];
      
      const isLiked = likedBy.includes(userId);
      const isDisliked = dislikedBy.includes(userId);

      if (interactionType === 'like') {
        if (isLiked) {
          // User is unliking
          transaction.update(updateRef, { likedBy: arrayRemove(userId) });
        } else {
          // User is liking, remove from dislikes if present
          const updates: any = { likedBy: arrayUnion(userId) };
          if (isDisliked) {
            updates.dislikedBy = arrayRemove(userId);
          }
          transaction.update(updateRef, updates);
        }
      } else if (interactionType === 'dislike') {
        if (isDisliked) {
          // User is un-disliking
          transaction.update(updateRef, { dislikedBy: arrayRemove(userId) });
        } else {
          // User is disliking, remove from likes if present
          const updates: any = { dislikedBy: arrayUnion(userId) };
          if (isLiked) {
            updates.likedBy = arrayRemove(userId);
          }
          transaction.update(updateRef, updates);
        }
      }
    });
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
      <UpdatesFeed 
        allUpdates={updates} 
        onReply={addReply} 
        onDelete={deleteUpdate}
        onInteraction={handleInteraction}
        loadMore={fetchMoreUpdates}
        hasMore={hasMore}
      />
    </div>
  );
}
