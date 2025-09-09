
"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Settings, Database, KeyRound, AlertTriangle, ExternalLink, Shield } from 'lucide-react';
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
    const storageRulesUrl = `https://console.firebase.google.com/project/${projectId}/storage/rules`;
  
    return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-6 w-6 text-primary" />
            Admin Configuration
          </CardTitle>
          <CardDescription>
            Manage your application's backend services and security rules. Incorrect rules are a common cause of errors.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Database className="mr-2 h-5 w-5 text-blue-500" />
                            Firestore Security Rules
                        </CardTitle>
                        <CardDescription>
                            Controls read/write access to your database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Action Required</AlertTitle>
                            <AlertDescription>
                                If your app shows "permission denied" or fails to load data, your Firestore rules are likely too restrictive.
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
                         <Button asChild variant="outline">
                            <Link href={firestoreRulesUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4"/>
                                Manage Firestore Rules
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Shield className="mr-2 h-5 w-5 text-green-500" />
                            Firebase Storage Rules
                        </CardTitle>
                        <CardDescription>
                            Controls who can upload and download files.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Action Required</AlertTitle>
                            <AlertDescription>
                                If file uploads get stuck loading forever, your Storage rules are likely too restrictive.
                            </AlertDescription>
                        </Alert>
                        <p className="text-sm text-muted-foreground mb-2">
                           Go to your Storage rules and replace the content with the following to allow image uploads for authenticated users:
                        </p>
                        <pre className="p-2 rounded-md bg-muted text-xs overflow-x-auto">
                            <code>
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read;
    }
    match /uploads/{userId}/{fileName} {
      allow write: if request.auth != null
                    && request.auth.uid == userId
                    && request.resource.size < 10 * 1024 * 1024
                    && request.resource.contentType.matches('image/.*');
    }
  }
}`}
                            </code>
                        </pre>
                    </CardContent>
                     <CardFooter>
                         <Button asChild variant="outline">
                            <Link href={storageRulesUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4"/>
                                Manage Storage Rules
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
