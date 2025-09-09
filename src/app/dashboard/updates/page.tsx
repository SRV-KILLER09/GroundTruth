
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Mail, MapPin, Clock, Award, LogIn, UserPlus } from "lucide-react";
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface UserData {
    id: string;
    email: string;
    username: string;
    createdAt: string;
    photoURL: string;
}

export default function UpdatesPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const adminEmails = ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !isAdmin)) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, authLoading, router, isAdmin]);

    useEffect(() => {
        if (isAdmin) {
            const fetchUsers = async () => {
                try {
                    const usersCollection = collection(db, 'users');
                    const q = query(usersCollection, orderBy('createdAt', 'desc'));
                    const usersSnapshot = await getDocs(q);
                    const usersList = usersSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as UserData));
                    setUsers(usersList);
                } catch (error: any) {
                    console.error("Error fetching users:", error);
                    toast({
                        variant: 'destructive',
                        title: 'Failed to fetch users',
                        description: 'Could not retrieve user data. Please check Firestore rules and permissions.',
                    });
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [isAdmin, toast]);

    if (authLoading || loading || !isAuthenticated || !isAdmin) {
        return <LoadingSpinner />;
    }
  
    return (
    <div className="w-full max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-6 w-6 text-primary" />
            Registered User Log
          </CardTitle>
          <CardDescription>
            A live log of all registered users in the database, ordered by registration date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><User className="inline-block mr-2 h-4 w-4" />Username</TableHead>
                  <TableHead><Mail className="inline-block mr-2 h-4 w-4" />Email</TableHead>
                  <TableHead><Clock className="inline-block mr-2 h-4 w-4" />Registration Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{format(new Date(u.createdAt), "PPp")}</TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                            No registered users found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
