
"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDisasterUpdates, DisasterUpdate, mockUserActivity } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Mail, List } from "lucide-react";
import { UpdateCard } from "@/components/dashboard/UpdateCard";
import { useState } from "react";
import type { DisasterUpdateReply } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";

export default function UserProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const username = params.username as string;
  
  const adminEmails = ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
  const isAdmin = currentUser?.email ? adminEmails.includes(currentUser.email) : false;

  // A simple way to find the user's data from the mock updates.
  // In a real app, you would fetch this from a user service.
  const userUpdates = mockDisasterUpdates.filter(
    (update) => update.user.username.toLowerCase() === username.toLowerCase()
  );
  
  const [updates, setUpdates] = useState<DisasterUpdate[]>(userUpdates);

  const addReply = (updateId: number, reply: DisasterUpdateReply) => {
    setUpdates(currentUpdates => 
      currentUpdates.map(update => {
        if (update.id === updateId) {
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


  if (updates.length === 0) {
    // This could be a loading state or a "user not found" state.
    // For now, we'll assume if there are no updates, we're still "loading" or the user is invalid.
    return (
       <div className="w-full max-w-4xl mx-auto text-center">
             <Card>
                <CardHeader>
                    <CardTitle>User Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The user profile you are looking for does not exist or has not posted any updates.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  const user = updates[0].user;
  const honorScore = 100; // Hardcoded as per previous requirements.
  const userProfileData = mockUserActivity.find(u => u.username.toLowerCase() === username.toLowerCase());


  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col items-center text-center space-y-4 p-6 bg-muted/50">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl font-bold font-headline">{user.name}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
             {isAdmin && userProfileData && (
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{userProfileData.email}</span>
                </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
            <Award className="h-5 w-5" />
            <span className="font-bold text-lg">{honorScore}</span>
            <span className="font-medium text-sm">Honor Score</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
             <h2 className="text-2xl font-headline font-bold flex items-center mb-4">
                <List className="mr-3 h-6 w-6 text-primary"/>
                User's Reports
            </h2>
            <div className="space-y-4">
                {updates.map((update) => (
                    <UpdateCard key={update.id} update={update} onReply={addReply} />
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
