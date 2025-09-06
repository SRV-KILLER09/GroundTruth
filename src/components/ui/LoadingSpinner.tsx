"use client";

import React from 'react';
import { Mountain } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95">
      <style jsx>{`
        .spinner {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 4px solid transparent;
          border-top-color: hsl(var(--primary));
          animation: spin 1.5s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
        }
        
        .spinner-ring:nth-child(2) {
          animation-delay: -0.75s;
          border-top-color: hsl(var(--primary) / 0.5);
        }

        .icon-pulse {
          animation: pulse 1.5s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(0.9);
            opacity: 0.7;
          }
        }
      `}</style>
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
         <div className="absolute inset-0 flex items-center justify-center">
            <Mountain className="h-8 w-8 text-primary icon-pulse" />
        </div>
      </div>
       <p className="mt-4 text-lg font-headline text-primary-foreground animate-pulse">
        Loading TitanicX...
      </p>
    </div>
  );
};
