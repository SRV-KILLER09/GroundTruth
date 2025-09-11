
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Shield } from 'lucide-react';

export default function DMPage() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-6 w-6 text-primary" />
            Direct Messages
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
             <Shield className="h-4 w-4 text-green-500" />
             Your conversations are end-to-end encrypted.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                    <h3 className="text-lg font-semibold">Select a conversation</h3>
                    <p>Your direct messages will appear here.</p>
                    <p className="text-sm mt-4">(Feature coming soon)</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
