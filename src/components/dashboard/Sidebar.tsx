"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mountain, Home, Map, LifeBuoy, BarChart3, Shield, Rss } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/dashboard/map", label: "Map View", icon: <Map className="h-5 w-5" /> },
    { href: "/dashboard/reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/dashboard/news", label: "News", icon: <Rss className="h-5 w-5" /> },
    { href: "/dashboard/directory", label: "Directory", icon: <Shield className="h-5 w-5" /> },
    { href: "/dashboard/resources", label: "Safety Resources", icon: <LifeBuoy className="h-5 w-5" /> },
];

export default function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  const NavContent = () => (
    <nav className={cn("flex flex-col items-center gap-4 px-2", isMobile ? "sm:py-5" : "py-5")}>
      <Link
        href="/dashboard"
        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
      >
        <Mountain className="h-4 w-4 transition-all group-hover:scale-110" />
        <span className="sr-only">TitanicX</span>
      </Link>
      
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        if (isMobile) {
            return (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "flex items-center gap-4 px-2.5",
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {link.icon}
                    {link.label}
                </Link>
            )
        }
        return (
          <TooltipProvider key={link.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.icon}
                  <span className="sr-only">{link.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{link.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </nav>
  );

  if (isMobile) {
    return <NavContent />;
  }
  
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <NavContent />
    </aside>
  );
}
