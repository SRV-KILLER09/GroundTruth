
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser, Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { sendWelcomeEmail } from "@/ai/flows/send-welcome-email";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
             // This can happen if a user signs in with Google for the first time
             // or if their user document was somehow deleted.
             await setDoc(userDocRef, {
                displayName: firebaseUser.displayName,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                createdAt: new Date().toISOString(),
             });
          }

          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
      } catch (error: any) {
         if (error.code === 'permission-denied') {
            toast({
                variant: "destructive",
                title: "Database Permission Error",
                description: "Your app does not have permission to access Firestore. Please update your security rules in the Admin Panel.",
                duration: 10000,
            });
            console.error("Firestore Permission Denied:", error);
         } else {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "An unexpected error occurred during authentication.",
            });
            console.error("Auth State Change Error:", error);
         }
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const defaultAvatar = `https://picsum.photos/seed/${userCredential.user.uid}/40/40`;
      await updateProfile(userCredential.user, { 
          displayName: username,
          photoURL: defaultAvatar,
       });
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: username,
        email: email,
        photoURL: defaultAvatar,
        createdAt: new Date().toISOString(),
      });

      await sendWelcomeEmail({ email, username });

      const refreshedUser = auth.currentUser;
      if (refreshedUser) {
        setUser({
          uid: refreshedUser.uid,
          displayName: refreshedUser.displayName,
          email: refreshedUser.email,
          photoURL: refreshedUser.photoURL,
        });
      }
      router.push("/dashboard");
      toast({
          title: "Welcome to TitanicX",
          description: "Your account has been created successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
       toast({
          title: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists() && user.email && user.displayName) {
        await setDoc(userDocRef, {
            username: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
        });
        await sendWelcomeEmail({ email: user.email, username: user.displayName });
         toast({
            title: `Welcome, ${user.displayName}!`,
            description: "Your account has been created."
        });
      } else {
         toast({
            title: `Welcome back, ${user.displayName}!`,
        });
      }

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Error",
        description: error.message,
      });
    } finally {
        setLoading(false);
    }
  }

  const logout = async () => {
    setLoading(true);
    try {
        await signOut(auth);
        router.push("/login");
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Logout Error",
            description: error.message,
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, signup, signInWithGoogle, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
