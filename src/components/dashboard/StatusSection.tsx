
"use client";

import type { DisasterUpdate, DisasterUpdateReply, DisasterStatus } from "@/lib/mock-data";
import { UpdateCard } from "./UpdateCard";
import { CheckCircle, HelpCircle, XCircle, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface StatusSectionProps {
  title: string;
  status: DisasterStatus;
  updates: DisasterUpdate[];
  onReply: (updateId: number, reply: DisasterUpdateReply) => void;
}

const statusConfig: Record<DisasterStatus, { icon: React.ReactNode; color: string }> = {
  'Verified': { icon: <CheckCircle className="h-6 w-6" />, color: "text-green-500" },
  'Under Investigation': { icon: <HelpCircle className="h-6 w-6" />, color: "text-yellow-500" },
  'Fake': { icon: <XCircle className="h-6 w-6" />, color: "text-red-500" },
};

export function StatusSection({ title, status, updates, onReply }: StatusSectionProps) {
  const { icon, color } = statusConfig[status];

  if (updates.length === 0) {
    return null;
  }

  return (
    <section>
        <Collapsible defaultOpen={status !== 'Fake'}>
            <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3 w-full border-b pb-2 mb-4">
                    <span className={color}>{icon}</span>
                    <h2 className="text-2xl font-headline font-bold">{title}</h2>
                    <Badge variant="secondary" className="ml-2">{updates.length}</Badge>
                    <ChevronDown className="h-5 w-5 ml-auto transition-transform [&[data-state=open]]:rotate-180" />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="space-y-4">
                    {updates.map(update => (
                        <UpdateCard key={update.id} update={update} onReply={onReply} />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    </section>
  );
}
