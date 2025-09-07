import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import type { DisasterUpdate, DisasterUpdateReply } from "@/lib/mock-data";
import { Flame, Droplets, Zap, Wind, AlertTriangle, MessageSquare, ShieldCheck, Siren, CheckCircle, HelpCircle, XCircle, ThumbsUp, ThumbsDown, CornerDownRight } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { AdminDispatchDialog } from "./AdminDispatchDialog";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

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

const statusConfig = {
    'Verified': { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: "Verified", variant: "default" as const, className: "bg-green-500/10 text-green-500 border-green-500/20" },
    'Under Investigation': { icon: <HelpCircle className="h-4 w-4 text-yellow-500" />, text: "Under Investigation", variant: "secondary" as const, className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    'Fake': { icon: <XCircle className="h-4 w-4 text-red-500" />, text: "Fake", variant: "destructive" as const, className: "bg-red-500/10 text-red-500 border-red-500/20" },
}

const DefaultIcon = <AlertTriangle className="h-4 w-4 text-muted-foreground" />;

export function UpdateCard({ update, onReply }: UpdateCardProps) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  const [interaction, setInteraction] = useState<'like' | 'dislike' | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState("");

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
  
  const handleCommentSubmit = () => {
    if (commentText.trim() && user) {
        // In a real app, you would send this comment to a backend.
        // For this simulation, we'll just clear the input and close the comment box.
        console.log(`Comment by ${user.displayName}: ${commentText}`);
        setCommentText("");
        setShowComment(false);
    }
  };

  const icon = disasterIcons[update.disasterType] || DefaultIcon;
  const currentStatus = statusConfig[update.status];

  return (
    <>
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
        <Avatar>
          <AvatarImage src={update.user.avatarUrl} alt={update.user.name} />
          <AvatarFallback>{update.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1 flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{update.user.name}</p>
             <Badge variant={currentStatus.variant} className={cn("whitespace-nowrap", currentStatus.className)}>
                {currentStatus.icon}
                <span className="ml-1">{currentStatus.text}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center">
            <span>{new Date(update.timestamp).toLocaleDateString()}</span>
            <span className="mx-1.5">·</span>
            <span className="truncate">{update.location.name}</span>
          </p>
        </div>
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
        
        {showComment && (
            <div className="mt-4 space-y-2">
                <Textarea
                    placeholder={`Replying as ${user?.displayName || 'user'}...`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={2}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowComment(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleCommentSubmit} disabled={!commentText.trim()}>
                        <CornerDownRight className="mr-2 h-4 w-4"/>
                        Submit
                    </Button>
                </div>
            </div>
        )}

        {isAdmin && (
            <div className="mt-4 flex items-start gap-4">
                <div className="flex-1 space-y-2">
                    <Textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Add an official reply..."
                        rows={2}
                    />
                    <Button onClick={handleReplySubmit} size="sm" disabled={!replyText.trim()}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Reply & Verify
                    </Button>
                </div>
                 <Button variant="outline" size="sm" className="mt-auto" onClick={() => setIsDispatching(true)}>
                    <Siren className="mr-2 h-4 w-4" />
                    Dispatch Alert
                </Button>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/50 p-2 text-sm text-muted-foreground">
        <div className="flex items-center pl-2">
            {icon}
            <span className="ml-1.5">{update.disasterType}</span>
        </div>
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setInteraction(interaction === 'like' ? null : 'like')}>
                <ThumbsUp className={cn("mr-2 h-4 w-4", interaction === 'like' && "text-primary fill-primary/20")} />
                Like
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setInteraction(interaction === 'dislike' ? null : 'dislike')}>
                <ThumbsDown className={cn("mr-2 h-4 w-4", interaction === 'dislike' && "text-destructive fill-destructive/20")} />
                Dislike
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowComment(!showComment)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Comment
            </Button>
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
