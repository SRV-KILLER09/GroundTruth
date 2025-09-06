import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import type { DisasterUpdate } from "@/lib/mock-data";
import { Flame, Droplets, Zap, Wind, AlertTriangle } from 'lucide-react';

interface UpdateCardProps {
  update: DisasterUpdate;
}

const disasterIcons: Record<string, React.ReactNode> = {
    'Flood': <Droplets className="h-4 w-4 text-muted-foreground" />,
    'Earthquake': <Zap className="h-4 w-4 text-muted-foreground" />,
    'Fire': <Flame className="h-4 w-4 text-muted-foreground" />,
    'Hurricane': <Wind className="h-4 w-4 text-muted-foreground" />
};

const DefaultIcon = <AlertTriangle className="h-4 w-4 text-muted-foreground" />;

export function UpdateCard({ update }: UpdateCardProps) {
  const icon = disasterIcons[update.disasterType] || DefaultIcon;
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
        <Avatar>
          <AvatarImage src={update.user.avatarUrl} alt={update.user.name} />
          <AvatarFallback>{update.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="font-semibold">{update.user.name}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(update.timestamp).toLocaleDateString()}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="mb-4 text-foreground/90">{update.message}</p>
        {update.mediaUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
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
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/50 p-4 text-sm text-muted-foreground">
        <div className="flex items-center">
            {icon}
            <span className="ml-1.5">{update.disasterType}</span>
        </div>
        <div className="truncate">
            {update.location.name}
        </div>
      </CardFooter>
    </Card>
  );
}
