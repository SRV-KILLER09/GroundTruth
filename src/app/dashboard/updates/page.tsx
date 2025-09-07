
"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockUserActivity, UserActivity } from "@/lib/mock-data";
import { Users, Mail, MapPin, User, Clock, Award, LogIn, UserPlus } from "lucide-react";
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function UpdatesPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const isAdmin = user?.email === 'vardaansaxena096@gmail.com';

    React.useEffect(() => {
        if (!loading && (!isAuthenticated || !isAdmin)) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, loading, router, isAdmin]);

    if (loading || !isAuthenticated || !isAdmin) {
        return <LoadingSpinner />;
    }
  
    return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="w-full max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-6 w-6 text-primary" />
                User Activity Updates
              </CardTitle>
              <CardDescription>
                A log of user registrations and login activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><User className="inline-block mr-2 h-4 w-4" />Username</TableHead>
                      <TableHead><Mail className="inline-block mr-2 h-4 w-4" />Email</TableHead>
                      <TableHead><MapPin className="inline-block mr-2 h-4 w-4" />Location</TableHead>
                      <TableHead><Clock className="inline-block mr-2 h-4 w-4" />Creation Time</TableHead>
                      <TableHead><Award className="inline-block mr-2 h-4 w-4" />Honor Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUserActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.username}</TableCell>
                        <TableCell>{activity.email}</TableCell>
                        <TableCell>{activity.location}</TableCell>
                        <TableCell>{format(new Date(activity.creationTime), "PPp")}</TableCell>
                        <TableCell className="font-semibold text-center">{activity.honorScore}</TableCell>
                        <TableCell>
                          <Badge variant={activity.status === 'Registered' ? 'secondary' : 'default'} className={activity.status === 'Registered' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}>
                            {activity.status === 'Registered' ? <UserPlus className="mr-2 h-3 w-3"/> : <LogIn className="mr-2 h-3 w-3" />}
                            {activity.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
