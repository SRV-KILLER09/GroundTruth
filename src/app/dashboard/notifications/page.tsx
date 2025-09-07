
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications, type Notification } from "@/contexts/NotificationsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bell, PlusCircle, Send, Trash2, Smile } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";


const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { notifications, addNotification, deleteNotification, addReaction } = useNotifications();
  const [newNotification, setNewNotification] = useState("");
  const adminEmails = ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const handlePostNotification = () => {
    if (newNotification.trim() && isAdmin) {
      addNotification(newNotification);
      setNewNotification("");
      toast({
        title: "Notification Posted",
        description: "Your notification is now live for all users.",
      });
    }
  };
  
  const handleDeleteNotification = (id: number) => {
    deleteNotification(id);
    toast({
        title: "Notification Deleted",
        description: "The notification has been successfully removed.",
    });
  }

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    return (
      <div className="bg-muted/50 p-4 rounded-lg border border-primary/20 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
            <div>
                <p className="text-foreground/90 mb-2">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                    {format(new Date(notification.timestamp), "PPp")}
                </p>
            </div>
            {isAdmin && (
            <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Notification</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the notification.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteNotification(notification.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(notification.reactions).map(([emoji, count]) => (
                count > 0 && (
                    <button 
                        key={emoji}
                        onClick={() => addReaction(notification.id, emoji)}
                        className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-full text-sm transition-colors hover:bg-primary/20"
                    >
                        <span>{emoji}</span>
                        <span className="font-semibold">{count}</span>
                    </button>
                )
            ))}
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                        <Smile className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="flex gap-1">
                        {availableReactions.map(emoji => (
                             <Button 
                                key={emoji}
                                variant="ghost" 
                                size="icon"
                                className="text-xl"
                                onClick={() => addReaction(notification.id, emoji)}
                            >
                                {emoji}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-6 w-6 text-primary" />
            Notifications
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
                   Post a New Notification
                </h3>
              <Textarea
                placeholder="Type your notification here..."
                value={newNotification}
                onChange={(e) => setNewNotification(e.target.value)}
                rows={4}
              />
              <Button onClick={handlePostNotification} disabled={!newNotification.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Post Notification
              </Button>
            </div>
          )}
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
             {notifications.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    <p>No notifications yet.</p>
                </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
