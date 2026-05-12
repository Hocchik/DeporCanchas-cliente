"use client";
import React from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { LoaderProvider } from './contexts/LoaderContext';
import { SessionProvider } from './contexts/SessionContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <LoaderProvider>
          {children}
        </LoaderProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
