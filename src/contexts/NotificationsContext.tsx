
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockAnnouncements } from '@/lib/mock-data';

export type Notification = {
  id: number;
  message: string;
  timestamp: string;
  reactions: { [emoji: string]: number };
};

interface NotificationsContextType {
  notifications: Notification[];
  addNotification: (message: string) => void;
  deleteNotification: (id: number) => void;
  addReaction: (id: number, emoji: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockAnnouncements.map(a => ({
      ...a,
      reactions: { '👍': 0, '❤️': 0, '😂': 0, '😮': 0, '😢': 0, '🙏': 0 }
  })));

  const addNotification = (message: string) => {
    const newNotification: Notification = {
      id: notifications.length > 0 ? Math.max(...notifications.map(a => a.id)) + 1 : 1,
      message,
      timestamp: new Date().toISOString(),
      reactions: { '👍': 0, '❤️': 0, '😂': 0, '😮': 0, '😢': 0, '🙏': 0 }
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const addReaction = (id: number, emoji: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? {
              ...notification,
              reactions: {
                ...notification.reactions,
                [emoji]: (notification.reactions[emoji] || 0) + 1,
              },
            }
          : notification
      )
    );
  };

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, deleteNotification, addReaction }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
