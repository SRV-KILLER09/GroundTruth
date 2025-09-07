
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, Home, Map, LifeBuoy, BarChart3, Shield, Rss, Tv, MessageSquare, Info, Users, Bell, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export default function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const adminEmails = ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const navLinks = [
    { href: "/dashboard", label: "Live Feed", icon: <Tv className="h-5 w-5" />, admin: false },
    { href: "/dashboard/map", label: "Map View", icon: <Map className="h-5 w-5" />, admin: false },
    { href: "/dashboard/reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" />, admin: false },
    { href: "/dashboard/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" />, admin: false },
    { href: "/dashboard/news", label: "News", icon: <Rss className="h-5 w-5" />, admin: false },
    { href: "/dashboard/directory", label: "Directory", icon: <Shield className="h-5 w-5" />, admin: false },
    { href: "/dashboard/chat", label: "Community Chat", icon: <MessageSquare className="h-5 w-5" />, admin: false },
    { href: "/dashboard/updates", label: "User Activity", icon: <Users className="h-5 w-5" />, admin: true },
    { href: "/dashboard/broadcast", label: "Broadcast", icon: <Megaphone className="h-5 w-5" />, admin: true },
    { href: "/dashboard/resources", label: "Safety Resources", icon: <LifeBuoy className="h-5 w-5" />, admin: false },
    { href: "/dashboard/home", label: "About Us", icon: <Info className="h-5 w-5" />, admin: false },
  ];

  const NavContent = () => (
    <>
      <div className="flex items-center px-4 pt-5 pb-1">
        <Link
            href="/dashboard/home"
            className="group flex items-center gap-2 rounded-lg text-foreground w-full"
        >
            <Image src="https://picsum.photos/seed/logo/40/40" alt="GroundTruth™ Logo" width={40} height={40} className="rounded-full transition-all group-hover:scale-110" data-ai-hint="logo" />
            <div className="flex flex-col">
                <span className="text-lg font-semibold md:text-base leading-tight">GroundTruth™</span>
                <span className="text-xs text-primary font-semibold">by TitanicX</span>
            </div>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className={cn("flex flex-col items-stretch gap-4 px-2 py-4")}>
        {navLinks.map((link) => {
            if (link.admin && !isAdmin) {
            return null;
            }
            const isActive = pathname === link.href || (link.href === "/dashboard" && pathname.startsWith("/dashboard/profile"));
            return (
            <Link
                key={link.href}
                href={link.href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
            >
                {link.icon}
                <span>{link.label}</span>
            </Link>
            )
        })}
        </nav>
      </ScrollArea>
    </>
  );

  if (isMobile) {
    return <NavContent />;
  }
  
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <NavContent />
    </aside>
  );
}
