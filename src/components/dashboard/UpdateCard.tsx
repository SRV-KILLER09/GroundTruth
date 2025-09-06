import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import type { DisasterUpdate, DisasterUpdateReply } from "@/lib/mock-data";
import { Flame, Droplets, Zap, Wind, AlertTriangle, MessageSquare, ShieldCheck, Siren } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { AdminDispatchDialog } from "./AdminDispatchDialog";

interface UpdateCardProps {
  update: DisasterUpdate;
  onReply: (updateId: number, reply: DisasterUpdateReply) => void;
}

const disasterIcons: Record<string, React.ReactNode> = {
    'Flood': <Droplets className="h-4 w-4 text-muted-foreground" />,
    'Earthquake': <Zap className="h-4 w-4 text-muted-foreground" />,
    'Fire': <Flame className="h-4 w-4 text-muted-foreground" />,
    'Hurricane': <Wind className="h-4 w-4 text-muted-foreground" />
};

const DefaultIcon = <AlertTriangle className="h-4 w-4 text-muted-foreground" />;

export function UpdateCard({ update, onReply }: UpdateCardProps) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);

  // Simple admin check for prototyping purposes
  const isAdmin = user?.email === 'admin@resqtech.com';

  const handleReplySubmit = () => {
    if (replyText.trim() && isAdmin) {
      const newReply: DisasterUpdateReply = {
        author: 'Admin',
        message: replyText,
        timestamp: new Date().toISOString()
      };
      onReply(update.id, newReply);
      setReplyText("");
    }
  };

  const icon = disasterIcons[update.disasterType] || DefaultIcon;
  return (
    <>
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
        <Avatar>
          <AvatarImage src={update.user.avatarUrl} alt={update.user.name} />
          <AvatarFallback>{update.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="font-semibold">{update.user.name}</p>
          <p className="text-sm text-muted-foreground flex items-center">
            <span>{new Date(update.timestamp).toLocaleDateString()}</span>
            <span className="mx-1.5">·</span>
            <span className="truncate">{update.location.name}</span>
          </p>
        </div>
        {isAdmin && (
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => setIsDispatching(true)}>
                <Siren className="mr-2 h-4 w-4" />
                Dispatch Alert
            </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-4 text-foreground/90">{update.message}</p>
        {update.mediaUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
            <Image 
                src={update.mediaUrl} 
                alt={`Update from ${update.user.name}`} 
                fill 
                className="object-cover" 
                data-ai-hint={`${update.disasterType} disaster`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        {update.replies.length > 0 && <Separator className="my-4" />}
        <div className="space-y-4">
          {update.replies.map((reply, index) => (
            <div key={index} className="flex gap-3">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarFallback>
                    <ShieldCheck className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg flex-1">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-sm text-primary">{reply.author}</p>
                  <p className="text-xs text-muted-foreground">{new Date(reply.timestamp).toLocaleTimeString()}</p>
                </div>
                <p className="text-sm text-foreground/80">{reply.message}</p>
              </div>
            </div>
          ))}
        </div>
        {isAdmin && (
            <div className="mt-4 space-y-2">
                <Textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add an official reply..."
                    rows={2}
                />
                <Button onClick={handleReplySubmit} size="sm" disabled={!replyText.trim()}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Reply as Admin
                </Button>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-start bg-muted/50 p-4 text-sm text-muted-foreground">
        <div className="flex items-center">
            {icon}
            <span className="ml-1.5">{update.disasterType}</span>
        </div>
      </CardFooter>
    </Card>
    <AdminDispatchDialog 
        update={update}
        isOpen={isDispatching}
        onOpenChange={setIsDispatching}
    />
    </>
  );
}
