
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/dashboard/Header";
import { mockDisasterUpdates, DisasterUpdate, createNewMockUpdate, mockAnnouncements } from "@/lib/mock-data";
import { EmergencyContacts } from "@/components/dashboard/EmergencyContacts";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StatusSection } from "@/components/dashboard/StatusSection";
import type { DisasterUpdateReply } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { PlusCircle, Megaphone } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SubmitUpdateForm } from "@/components/dashboard/SubmitUpdateForm";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";


export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = useState<DisasterUpdate[]>(mockDisasterUpdates);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const [latestAnnouncement, setLatestAnnouncement] = useState(mockAnnouncements[0]);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const isAdmin = user?.email === 'vardaansaxena096@gmail.com';

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

  useEffect(() => {
    // Simulate checking if the announcement is "new"
    // In a real app, you'd check localStorage or a backend flag.
    const hasSeenAnnouncement = sessionStorage.getItem(`seen_announcement_${latestAnnouncement.id}`);
    if (hasSeenAnnouncement) {
        setIsAnnouncementVisible(false);
    }
  }, [latestAnnouncement.id]);
  
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
  
  const addUpdate = (newUpdateData: Omit<DisasterUpdate, 'id' | 'timestamp' | 'replies' | 'status' | 'authority'>) => {
    const newUpdate: DisasterUpdate = {
        ...newUpdateData,
        id: updates.length + 1,
        timestamp: new Date().toISOString(),
        replies: [],
        status: 'Under Investigation',
        authority: 'Local Police', // Default authority
    };
    setUpdates(prevUpdates => [newUpdate, ...prevUpdates]);
    setIsSheetOpen(false);
    toast({
        title: "Update Submitted",
        description: "Thank you for contributing to community safety.",
    });
  }

  const handleDismissAnnouncement = () => {
    setIsAnnouncementVisible(false);
    // Mark this announcement as "seen" for the current session
    sessionStorage.setItem(`seen_announcement_${latestAnnouncement.id}`, 'true');
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
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <Button asChild variant="outline">
                            <Link href="/dashboard/announcements">
                                <Megaphone className="mr-2 h-4 w-4" />
                                Make Announcement
                            </Link>
                        </Button>
                    )}
                     <Button asChild variant="outline">
                        <Link href="/dashboard/announcements">
                            <Megaphone className="mr-2 h-4 w-4" />
                            Announcements
                        </Link>
                    </Button>
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Update
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-lg">
                            <SheetHeader>
                                <SheetTitle>Submit a New Disaster Update</SheetTitle>
                                <SheetDescription>
                                    Help your community by providing real-time information. Your report will include an AI-generated image.
                                </SheetDescription>
                            </SheetHeader>
                            <SubmitUpdateForm onSubmit={addUpdate} />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            
            {latestAnnouncement && isAnnouncementVisible && (
              <Alert className="relative border-primary/50 bg-primary/10">
                <Megaphone className="h-4 w-4 text-primary" />
                <button 
                  onClick={handleDismissAnnouncement}
                  className="absolute top-2 right-2 p-1 rounded-md hover:bg-primary/20"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Dismiss announcement</span>
                </button>
                <AlertTitle className="font-bold text-primary">Announcement</AlertTitle>
                <AlertDescription className="pr-6">
                  <p className="text-foreground/90">{latestAnnouncement.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(latestAnnouncement.timestamp), "PPp")}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <EmergencyContacts />
            
            <StatusSection title="Verified Reports" status="Verified" updates={verifiedUpdates} onReply={addReply} />
            <StatusSection title="Under Investigation" status="Under Investigation" updates={investigationUpdates} onReply={addReply} />
            <StatusSection title="Potentially Fake Reports" status="Fake" updates={fakeUpdates} onReply={addReply} />

        </div>
      </main>
    </div>
  );
}
