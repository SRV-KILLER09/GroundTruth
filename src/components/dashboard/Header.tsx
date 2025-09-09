
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
import { LogOut, Award, Menu, Edit, Loader2, Globe } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import { useToast } from "@/hooks/use-toast";
import { auth, updateUserAvatarInFirestore } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { useState } from "react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";


export default function Header() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { setLanguage } = useLanguage();
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);
  const honorScore = 100; // Hardcoded score as per request

  const handleChangeProfilePicture = async () => {
    if (!auth.currentUser || !user) return;

    setIsUpdatingPicture(true);
    // Simulate file upload by generating a new random image URL
    const newAvatarUrl = `https://picsum.photos/seed/${user.uid}/${Date.now()}/40/40`;

    try {
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, { photoURL: newAvatarUrl });

        // Update user's avatar in all their disaster_updates documents
        await updateUserAvatarInFirestore(user.uid, newAvatarUrl);
        
        toast({
            title: "Profile Picture Updated",
            description: "Your new profile picture is now live. It might take a moment to reflect everywhere.",
        });
        // You might need to force a re-render or state update in AuthContext to see the change immediately in the header
    } catch (error) {
        console.error("Error updating profile picture:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update your profile picture.",
        });
    } finally {
        setIsUpdatingPicture(false);
    }
  };

  const handleLanguageChange = (lang: Language, langName: string) => {
    setLanguage(lang);
    toast({
      title: "Language Switched",
      description: `Language has been set to ${langName}.`,
    });
  };


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
           <Sidebar isMobile={true}/>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
                <Globe className="h-5 w-5"/>
                <span className="sr-only">Change language</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleLanguageChange("en", "English")}>English</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleLanguageChange("hi", "Hindi")}>हिंदी (Hindi)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleLanguageChange("bn", "Bengali")}>বাংলা (Bengali)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.email}/40/40`} alt={user.displayName || ''} key={user.photoURL} />
                <AvatarFallback>
                  {user.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem disabled className="cursor-default">
               <Award className="mr-2 h-4 w-4 text-yellow-500" />
               <div className="flex justify-between w-full">
                  <span>Honor Score</span>
                  <span className="font-semibold">{honorScore}</span>
               </div>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={handleChangeProfilePicture} disabled={isUpdatingPicture}>
                {isUpdatingPicture ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Edit className="mr-2 h-4 w-4" />
                )}
              <span>Change Picture</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
