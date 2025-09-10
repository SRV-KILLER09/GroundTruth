
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import type { DisasterUpdate, DisasterUpdateReply, DisasterStatus } from "@/lib/mock-data";
import { Flame, Droplets, Zap, Wind, AlertTriangle, MessageSquare, ShieldCheck, Siren, CheckCircle, HelpCircle, XCircle, ThumbsUp, ThumbsDown, CornerDownRight, Flag, History, Clock, Trash2, Award, Ban, Video, AudioLines } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { AdminDispatchDialog } from "./AdminDispatchDialog";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";


interface UpdateCardProps {
  update: DisasterUpdate;
  onReply: (updateId: string, reply: DisasterUpdateReply) => void;
  onDelete: (updateId: string) => void;
  onInteraction: (updateId: string, interactionType: 'like' | 'dislike') => void;
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

export function UpdateCard({ update, onReply, onDelete, onInteraction }: UpdateCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replyText, setReplyText] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  
  const [likeCount, setLikeCount] = useState(update.likedBy?.length || 0);
  const [dislikeCount, setDislikeCount] = useState(update.dislikedBy?.length || 0);
  const [currentUserVote, setCurrentUserVote] = useState<'like' | 'dislike' | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (user) {
      if (update.likedBy?.includes(user.uid)) {
        setCurrentUserVote('like');
      } else if (update.dislikedBy?.includes(user.uid)) {
        setCurrentUserVote('dislike');
      } else {
        setCurrentUserVote(null);
      }
    }
    setLikeCount(update.likedBy?.length || 0);
    setDislikeCount(update.dislikedBy?.length || 0);
  }, [update.likedBy, update.dislikedBy, user]);

  const adminEmails = ['vardaansaxena096@gmail.com'];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;
  const isAuthor = user?.uid === update.user.uid;
  const honorScore = 100; // Placeholder

  const handleReplySubmit = () => {
    if (replyText.trim() && isAdmin && update.id) {
      const newReply: DisasterUpdateReply = {
        author: 'Admin',
        message: replyText,
        timestamp: new Date().toISOString()
      };
      onReply(update.id, newReply);
      setReplyText("");
    }
  };

  const handleFlagStatus = async (status: DisasterStatus) => {
    if (!isAdmin || !update.id) return;
    try {
        const updateRef = doc(db, "disaster_updates", update.id);
        await updateDoc(updateRef, { status: status });
        toast({
            title: `Report status updated to "${status}"`,
            description: "The change is now live for all users.",
        });
    } catch (error) {
        console.error("Error updating status:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update the report status.",
        });
    }
  }

  const handleInteractionClick = (interactionType: 'like' | 'dislike') => {
    if (!update.id || !user) return;
    
    // Optimistic UI update
    const originalVote = currentUserVote;
    const originalLikeCount = likeCount;
    const originalDislikeCount = dislikeCount;

    let newVote: 'like' | 'dislike' | null = null;
    let newLikeCount = likeCount;
    let newDislikeCount = dislikeCount;

    if (interactionType === 'like') {
      if (originalVote === 'like') { // Unliking
        newVote = null;
        newLikeCount--;
      } else { // Liking
        newVote = 'like';
        newLikeCount++;
        if (originalVote === 'dislike') newDislikeCount--;
      }
    } else { // Dislike interaction
      if (originalVote === 'dislike') { // Undisliking
        newVote = null;
        newDislikeCount--;
      } else { // Disliking
        newVote = 'dislike';
        newDislikeCount++;
        if (originalVote === 'like') newLikeCount--;
      }
    }
    
    setCurrentUserVote(newVote);
    setLikeCount(newLikeCount);
    setDislikeCount(newDislikeCount);

    try {
        onInteraction(update.id, interactionType);
    } catch (error) {
        // Revert UI on error
        setCurrentUserVote(originalVote);
        setLikeCount(originalLikeCount);
        setDislikeCount(originalDislikeCount);
        toast({ title: "Error", description: "Could not process your vote.", variant: "destructive"});
    }
  };

  
  const handleReportUser = () => {
    toast({
        title: "User Reported",
        description: `${update.user.name}'s Honor Score has been reduced.`,
    });
  };

  const handleDeletePost = () => {
    if(update.id) {
        onDelete(update.id);
        toast({
            title: "Post Deleted",
            description: "The post has been successfully removed.",
        });
    }
  };

  const icon = disasterIcons[update.disasterType] || DefaultIcon;
  const currentStatus = statusConfig[update.status];
  const profileUrl = `/dashboard/profile/${update.user.username}`;
  const timeAgo = formatDistanceToNow(new Date(update.timestamp), { addSuffix: true });

  const MediaDisplay = () => {
    if (!update.mediaUrl) return null;

    switch (update.mediaType) {
        case 'video':
            return (
                <video ref={videoRef} className="w-full aspect-video rounded-lg mb-4 bg-black" controls>
                    <source src={update.mediaUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            );
        case 'audio':
            return (
                 <div className="my-4">
                    <div className="flex items-center gap-3 bg-muted p-3 rounded-lg">
                         <AudioLines className="h-8 w-8 text-primary flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold">Voice Note</p>
                            <audio ref={audioRef} controls className="w-full h-10">
                                <source src={update.mediaUrl} type="audio/mp3" />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    </div>
                </div>
            );
        case 'image':
        default:
             return (
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
             )
    }
  }

  return (
    <>
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
        <Link href={profileUrl}>
            <Avatar>
            <AvatarImage src={update.user.avatarUrl} alt={update.user.name} />
            <AvatarFallback>{update.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
        </Link>
        <div className="grid gap-1 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Link href={profileUrl} className="font-semibold hover:underline">
                    {update.user.name}
                </Link>
                <div className="flex items-center gap-1 text-yellow-500 text-xs font-semibold" title="Honor Score">
                    <Award className="h-3 w-3" />
                    <span>{honorScore}</span>
                </div>
                {isAdmin && !isAuthor && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                                <Flag className="h-4 w-4" />
                                <span className="sr-only">Report User</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Report User?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to report {update.user.name}? This action will reduce their Honor Score and cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReportUser} className="bg-destructive hover:bg-destructive/90">
                                    Confirm Report
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
             <div className="flex items-center gap-2">
                <Badge variant={currentStatus.variant} className={cn("whitespace-nowrap w-fit", currentStatus.className)}>
                    {currentStatus.icon}
                    <span className="ml-1">{currentStatus.text}</span>
                </Badge>
                {(isAdmin || isAuthor) && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Post</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete this Post?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the post from the feed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeletePost} className="bg-destructive hover:bg-destructive/90">
                                    Delete Post
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
             </div>
          </div>
          <p className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-2">
            <span>{timeAgo}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="flex items-center gap-1">{icon} {update.disasterType}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="truncate">{update.location.name} ({update.location.latitude.toFixed(2)}, {update.location.longitude.toFixed(2)})</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-4 text-foreground/90">{update.message}</p>
        <MediaDisplay />
        {update.history && update.history.length > 1 && (
          <Collapsible className="mb-4">
            <CollapsibleTrigger asChild>
              <Button variant="link" size="sm" className="p-0 h-auto text-muted-foreground">
                <History className="mr-2 h-4 w-4" />
                View update history
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2 text-sm text-muted-foreground border-l-2 border-primary/20 pl-4 ml-2">
                {update.history.slice(1).map((item, index) => (
                  <p key={index} className="italic">"{item}"</p>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
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
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}</p>
                </div>
                <p className="text-sm text-foreground/80">{reply.message}</p>
              </div>
            </div>
          ))}
        </div>

        {isAdmin && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-start gap-4">
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
              <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleFlagStatus('Fake')}>
                    <Ban className="mr-2 h-4 w-4" />
                    Flag as Fake
                  </Button>
                   <Button variant="outline" size="sm" onClick={() => handleFlagStatus('Verified')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Verified
                  </Button>
              </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end items-center bg-muted/50 p-2">
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleInteractionClick('like')}>
                <ThumbsUp className={cn("mr-2 h-4 w-4", currentUserVote === 'like' && "text-primary fill-primary/20")} />
                {likeCount}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleInteractionClick('dislike')}>
                <ThumbsDown className={cn("mr-2 h-4 w-4", currentUserVote === 'dislike' && "text-destructive fill-destructive/20")} />
                {dislikeCount}
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
