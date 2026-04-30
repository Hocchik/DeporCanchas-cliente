"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toasts Container */}
      <div className="fixed bottom-5 right-5 z-[10000] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          let styleClass = "bg-gray-100/90 border-gray-500 text-gray-800";
          let Icon = InformationCircleIcon;
          
          if (toast.type === 'success') {
            styleClass = "bg-[#eef7ea]/90 border-[#386641] text-[#386641]";
            Icon = CheckCircleIcon;
          } else if (toast.type === 'error') {
            styleClass = "bg-red-50/90 border-red-500 text-red-700";
            Icon = XCircleIcon;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-md shadow-md border backdrop-blur-sm pointer-events-auto transition-all animate-in slide-in-from-right-5 fade-in duration-300 ${styleClass}`}
              style={{ minWidth: '280px' }}
            >
              <Icon className="w-6 h-6" />
              <p className="text-sm font-bold">{toast.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
