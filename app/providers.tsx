"use client";
import React from 'react';
import { ToastProvider } from './contexts/ToastContext';
import { LoaderProvider } from './contexts/LoaderContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <LoaderProvider>
        {children}
      </LoaderProvider>
    </ToastProvider>
  );
}
