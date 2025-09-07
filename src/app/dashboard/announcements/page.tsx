
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnnouncements, type Announcement } from "@/contexts/AnnouncementsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, PlusCircle, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { announcements, addAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const adminEmails = ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const handlePostAnnouncement = () => {
    if (newAnnouncement.trim() && isAdmin) {
      addAnnouncement(newAnnouncement);
      setNewAnnouncement("");
      toast({
        title: "Announcement Posted",
        description: "Your announcement is now live for all users.",
      });
    }
  };
  
  const handleDeleteAnnouncement = (id: number) => {
    deleteAnnouncement(id);
    toast({
        title: "Announcement Deleted",
        description: "The announcement has been successfully removed.",
    });
  }

  const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => {
    return (
      <div className="bg-muted/50 p-4 rounded-lg border border-primary/20 flex justify-between items-start gap-4">
        <div>
            <p className="text-foreground/90 mb-2">{announcement.message}</p>
            <p className="text-xs text-muted-foreground">
                {format(new Date(announcement.timestamp), "PPp")}
            </p>
        </div>
        {isAdmin && (
           <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Announcement</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the announcement.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteAnnouncement(announcement.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Megaphone className="mr-2 h-6 w-6 text-primary" />
            Announcements
          </CardTitle>
          <CardDescription>
            Official communications and alerts from the administrative team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAdmin && (
            <div className="space-y-4 p-4 border rounded-lg bg-card">
               <h3 className="font-semibold text-lg flex items-center">
                   <PlusCircle className="mr-2 h-5 w-5" />
                   Make a New Announcement
                </h3>
              <Textarea
                placeholder="Type your announcement here..."
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                rows={4}
              />
              <Button onClick={handlePostAnnouncement} disabled={!newAnnouncement.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Post Announcement
              </Button>
            </div>
          )}
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
             {announcements.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    <p>No announcements yet.</p>
                </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
