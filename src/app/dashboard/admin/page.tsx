
"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Settings, Database, KeyRound, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function AdminPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const adminEmails = ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

    React.useEffect(() => {
        if (!loading && (!isAuthenticated || !isAdmin)) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, loading, router, isAdmin]);

    if (loading || !isAuthenticated || !isAdmin) {
        return <LoadingSpinner />;
    }

    const projectId = 'verdant-sentinel-8s9hn';
    const firestoreRulesUrl = `https://console.firebase.google.com/project/${projectId}/firestore/rules`;
  
    return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-6 w-6 text-primary" />
            Admin Panel
          </CardTitle>
          <CardDescription>
            Manage your application's backend services and configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <KeyRound className="mr-2 h-5 w-5" />
                            Firestore Security Rules
                        </CardTitle>
                        <CardDescription>
                            Control access to your Firestore database. Incorrect rules can cause permission errors.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Action Required</AlertTitle>
                            <AlertDescription>
                                Your current security rules are likely too restrictive, causing "permission denied" errors. Update them to allow access for development.
                            </AlertDescription>
                        </Alert>
                        <p className="text-sm text-muted-foreground mb-2">
                           Go to your Firestore rules and replace the content with the following to open up access for development:
                        </p>
                        <pre className="p-2 rounded-md bg-muted text-xs overflow-x-auto">
                            <code>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                            </code>
                        </pre>
                    </CardContent>
                    <CardFooter>
                         <Button asChild>
                            <Link href={firestoreRulesUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4"/>
                                Manage Rules
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Database className="mr-2 h-5 w-5" />
                            Project Configuration
                        </CardTitle>
                        <CardDescription>
                           Your Firebase project details for reference.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Project ID:</span>
                             <Badge variant="secondary">{projectId}</Badge>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Authentication:</span>
                            <Badge variant="outline" className="text-green-500 border-green-500/50">Enabled</Badge>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Database:</span>
                             <Badge variant="outline" className="text-green-500 border-green-500/50">Firestore</Badge>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline">
                            <Link href={`https://console.firebase.google.com/project/${projectId}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4"/>
                                Open Firebase Console
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
