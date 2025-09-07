
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockAnnouncements } from '@/lib/mock-data';

export type Announcement = {
  id: number;
  message: string;
  timestamp: string;
};

interface AnnouncementsContextType {
  announcements: Announcement[];
  addAnnouncement: (message: string) => void;
}

const AnnouncementsContext = createContext<AnnouncementsContextType | undefined>(undefined);

export function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);

  const addAnnouncement = (message: string) => {
    const newAnnouncement: Announcement = {
      id: announcements.length + 1,
      message,
      timestamp: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  return (
    <AnnouncementsContext.Provider value={{ announcements, addAnnouncement }}>
      {children}
    </AnnouncementsContext.Provider>
  );
}

export function useAnnouncements() {
  const context = useContext(AnnouncementsContext);
  if (context === undefined) {
    throw new Error('useAnnouncements must be used within an AnnouncementsProvider');
  }
  return context;
}
