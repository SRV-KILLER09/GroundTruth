
"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DisasterUpdate, DisasterUpdateReply } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Mail, List, Edit } from "lucide-react";
import { UpdateCard } from "@/components/dashboard/UpdateCard";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { db, updateUserAvatarInFirestore } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, arrayUnion, deleteDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { mockUserActivity } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const username = params.username as string;
  
  const [updates, setUpdates] = useState<DisasterUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any | null>(null);

  const adminEmails = ['vardaansaxena096@gmail.com'];
  const isAdmin = currentUser?.email ? adminEmails.includes(currentUser.email) : false;
  const isOwnProfile = currentUser?.displayName?.toLowerCase() === username?.toLowerCase();

  useEffect(() => {
    if (username) {
        const q = query(
            collection(db, "disaster_updates"),
            where("user.username", "==", username.toLowerCase()),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const updatesData: DisasterUpdate[] = [];
            if (querySnapshot.empty && !userProfile) {
                // If there are no posts, we need another way to get user data.
                // We can query the 'users' collection.
                const usersQuery = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
                getDocs(usersQuery).then(userSnapshot => {
                    if (!userSnapshot.empty) {
                        const userData = userSnapshot.docs[0].data();
                        setUserProfile({
                            name: userData.username,
                            username: userData.username,
                            avatarUrl: userData.photoURL
                        });
                    }
                });
            }
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (!userProfile) {
                    setUserProfile(data.user);
                }
                updatesData.push({ 
                    ...data as Omit<DisasterUpdate, 'id' | 'timestamp'>,
                    id: doc.id,
                    timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString() 
                });
            });
            setUpdates(updatesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user updates:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }
  }, [username, userProfile]);

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
  
  const handleInteraction = async (updateId: string, interactionType: 'like' | 'dislike') => {
      const updateRef = doc(db, "disaster_updates", updateId);
      const fieldToIncrement = interactionType === 'like' ? 'likes' : 'dislikes';
      await updateDoc(updateRef, {
          [fieldToIncrement]: increment(1)
      });
  }

  const handleStartDirectMessage = async () => {
    // This is a placeholder for the real implementation
    toast({
      title: "Coming Soon!",
      description: "Direct messaging will be implemented in a future update."
    });
  }


  if (loading) {
      return <LoadingSpinner />;
  }

  if (!loading && !userProfile) {
    return (
       <div className="w-full max-w-4xl mx-auto text-center">
             <Card>
                <CardHeader>
                    <CardTitle>User Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The user profile you are looking for does not exist.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const honorScore = 100; // This can be moved to the user profile data in Firestore later
  const userProfileData = mockUserActivity.find(u => u.username.toLowerCase() === username.toLowerCase());


  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {userProfile && (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col items-center text-center space-y-4 p-6 bg-muted/50">
            <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} key={userProfile.avatarUrl} />
                <AvatarFallback className="text-4xl">{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center">
                <CardTitle className="text-3xl font-bold font-headline">{userProfile.name}</CardTitle>
              </div>
              <CardDescription>@{userProfile.username}</CardDescription>
              {isAdmin && userProfileData && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{userProfileData.email}</span>
                  </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                <Award className="h-5 w-5" />
                <span className="font-bold text-lg">{honorScore}</span>
                <span className="font-medium text-sm">Honor Score</span>
              </div>
              {!isOwnProfile && (
                <Button onClick={handleStartDirectMessage}>
                  <Mail className="mr-2 h-4 w-4" />
                  Direct Message
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
              <h2 className="text-2xl font-headline font-bold flex items-center mb-4">
                  <List className="mr-3 h-6 w-6 text-primary"/>
                  User's Reports
              </h2>
              <div className="space-y-4">
                  {updates.map((update) => (
                      <UpdateCard key={update.id} update={update} onReply={addReply} onDelete={deleteUpdate} onInteraction={handleInteraction}/>
                  ))}
                   {updates.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            <p>This user hasn't posted any updates yet.</p>
                        </div>
                    )}
              </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
