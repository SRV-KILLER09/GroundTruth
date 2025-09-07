
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Mountain, Home, Map, LifeBuoy, BarChart3 } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { href: "/dashboard/map", label: "Map View", icon: <Map className="h-4 w-4" /> },
    { href: "/dashboard/reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/dashboard/resources", label: "Safety Resources", icon: <LifeBuoy className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shadow-sm">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Mountain className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold font-headline tracking-tighter text-foreground">
          TitanicX
        </span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-2">
        {navLinks.map((link) => (
          <Button key={link.href} variant={pathname === link.href ? 'secondary' : 'ghost'} asChild>
            <Link href={link.href}>
              {link.icon}
              <span className="ml-2">{link.label}</span>
            </Link>
          </Button>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <Button variant="outline" asChild className="hidden md:flex">
          <Link href="/">
            <Home className="h-4 w-4" />
            <span className="ml-2">Home</span>
          </Link>
        </Button>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://picsum.photos/seed/${user.email}/40/40`} alt={user.displayName || ''} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal md:hidden">
                 <div className="flex flex-col space-y-2">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={cn("flex items-center gap-2 rounded-md p-2", pathname === link.href ? 'bg-secondary' : '')}>
                             {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    ))}
                 </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="md:hidden"/>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
