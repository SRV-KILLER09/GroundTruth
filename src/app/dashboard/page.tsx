
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/dashboard/Header";
import { mockDisasterUpdates, DisasterUpdate, createNewMockUpdate } from "@/lib/mock-data";
import { EmergencyContacts } from "@/components/dashboard/EmergencyContacts";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StatusSection } from "@/components/dashboard/StatusSection";
import type { DisasterUpdateReply } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SubmitUpdateForm } from "@/components/dashboard/SubmitUpdateForm";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = useState<DisasterUpdate[]>(mockDisasterUpdates);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

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
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
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

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <AlertTriangle className="mr-3 h-6 w-6 text-primary" />
                  Real-Time Alert Escalation System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Auto-trigger alerts to local authorities when multiple similar reports are received in the same area.</li>
                  <li>Priority levels: info, caution, critical.</li>
                </ul>
                <div className="flex items-center text-sm text-foreground/80 pt-2">
                  <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                  <p>
                    <span className="font-semibold">Adds actionability to your dashboard</span> — turning insight into real-time response.
                  </p>
                </div>
              </CardContent>
            </Card>

            <EmergencyContacts />
            
            <StatusSection title="Verified Reports" status="Verified" updates={verifiedUpdates} onReply={addReply} />
            <StatusSection title="Under Investigation" status="Under Investigation" updates={investigationUpdates} onReply={addReply} />
            <StatusSection title="Potentially Fake Reports" status="Fake" updates={fakeUpdates} onReply={addReply} />

        </div>
      </main>
    </div>
  );
}
