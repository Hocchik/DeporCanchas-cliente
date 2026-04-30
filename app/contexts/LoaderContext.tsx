"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoaderContextProps {
  showLoader: (text?: string) => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextProps | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>();

  const showLoader = (text?: string) => {
    setLoadingText(text);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
    setLoadingText(undefined);
  };

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
          <div role="status" className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="size-16 animate-[spin_0.8s_linear_infinite] fill-[#386641]" viewBox="0 0 24 24"
              aria-hidden="true">
              <path
                d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"
                data-original="#000000" />
            </svg>
            <span className="sr-only">Cargando…</span>
          </div>
          {loadingText && (
            <p className="text-white font-bold text-xl mt-6 tracking-wide drop-shadow-md">{loadingText}</p>
          )}
        </div>
      )}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};
