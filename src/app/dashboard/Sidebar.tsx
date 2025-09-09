
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, Home, Map, LifeBuoy, BarChart3, Shield, Rss, Tv, MessageSquare, Info, Users, Bell, Megaphone, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const adminEmails = ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const navLinks = [
    { href: "/dashboard", labelKey: "liveFeed", icon: <Tv className="h-5 w-5" />, admin: false },
    { href: "/dashboard/chat", labelKey: "communityChat", icon: <MessageSquare className="h-5 w-5" />, admin: false },
    { href: "/dashboard/notifications", labelKey: "notifications", icon: <Bell className="h-5 w-5" />, admin: false },
    { href: "/dashboard/map", labelKey: "mapView", icon: <Map className="h-5 w-5" />, admin: false },
    { href: "/dashboard/reports", labelKey: "reports", icon: <BarChart3 className="h-5 w-5" />, admin: false },
    { href: "/dashboard/news", labelKey: "news", icon: <Rss className="h-5 w-5" />, admin: false },
    { href: "/dashboard/directory", labelKey: "directory", icon: <Shield className="h-5 w-5" />, admin: false },
    { href: "/dashboard/updates", labelKey: "userActivity", icon: <Users className="h-5 w-5" />, admin: true },
    { href: "/dashboard/broadcast", labelKey: "broadcast", icon: <Megaphone className="h-5 w-5" />, admin: true },
    { href: "/dashboard/resources", labelKey: "safetyResources", icon: <LifeBuoy className="h-5 w-5" />, admin: false },
    { href: "/dashboard/home", labelKey: "aboutUs", icon: <Info className="h-5 w-5" />, admin: false },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 pt-5 pb-1">
        <Link
            href="/dashboard/home"
            className="group flex items-center gap-2 rounded-lg text-foreground w-full"
        >
            <Image src="https://picsum.photos/seed/newlogo/40/40" alt="GroundTruth™ Logo" width={40} height={40} className="rounded-full transition-all group-hover:scale-110" data-ai-hint="logo" />
            <div className="flex flex-col">
                <span className="text-lg font-semibold md:text-base leading-tight">GroundTruth™</span>
                <span className="text-xs text-primary font-semibold">by TitanicX</span>
            </div>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
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
                <span>{t(link.labelKey as any)}</span>
            </Link>
            )
        })}
        </nav>
      </div>
    </div>
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
