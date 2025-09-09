
"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Settings, Database, AlertTriangle, ExternalLink, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

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
    
    // Helper function to check if the requesting user's email is in the admin list
    const isAdminByEmail = `request.auth.token.email in ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com']`;
  
    return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-6 w-6 text-primary" />
            Admin Configuration Guide
          </CardTitle>
          <CardDescription>
            Manage your application's backend services and security rules. Incorrect rules are the most common cause of submission errors or data not loading.
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
                                If users cannot log in, reports and likes get stuck loading forever, or chat does not work, your Firestore rules are likely too restrictive.
                            </AlertDescription>
                        </Alert>
                        <p className="text-sm text-muted-foreground mb-2">
                           Go to your Firestore rules and replace the content with the following to allow public reads while securing write operations:
                        </p>
                        <pre className="p-2 rounded-md bg-muted text-xs overflow-x-auto">
                            <code>
{`rules_version = '2';

function isAdmin() {
  return request.auth.token.email in ['vardaansaxena096@gmail.com', 'saranshwadhwa0102@gmail.com'];
}

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Default to denying all reads and writes for security
    match /{document=**} {
      allow read, write: if false;
    }

    // Rules for disaster_updates collection
    match /disaster_updates/{updateId} {
      // Anyone can read any report
      allow read: if true;

      // Only authenticated users can create a new report
      allow create: if request.auth != null;

      // Deletion is restricted to the original author OR an admin
      allow delete: if request.auth.uid == resource.data.user.uid || isAdmin();

      // Update permissions are more granular:
      // Any authenticated user can update the 'likedBy' and 'dislikedBy' fields.
      // An admin can update any field.
      // The original author can only update non-admin fields.
      allow update: if request.auth != null && 
                      (isAdmin() || 
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['likedBy', 'dislikedBy']) ||
                       (request.auth.uid == resource.data.user.uid &&
                        !request.resource.data.diff(resource.data).affectedKeys()
                          .hasAny(['status', 'authority']))
                      );
    }
    
    // Allow reading all user profiles.
    // A user can only create, update or delete their own profile. Admins can see all user data.
    match /users/{userId} {
      allow read: if true;
      allow list: if isAdmin();
      allow create, update, delete: if request.auth != null && request.auth.uid == userId;
    }

    // Rules for the chat_messages collection
    match /chat_messages/{messageId} {
      // Any authenticated user can read all messages.
      allow read: if request.auth != null;
      
      // Any authenticated user can create a message.
      allow create: if request.auth != null;

      // Admins can delete messages. Users cannot update or delete.
      allow update: if false;
      allow delete: if isAdmin();
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
                                If image uploads get stuck loading forever, your Storage rules are likely too restrictive.
                            </Description>
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
