'use client';

import React, { createContext, useContext, useEffect, ReactNode, useMemo } from 'react';
import { useMagicUIStore } from '@/lib/store/magic-ui-store';
import type { MagicUIContextType, MagicUITheme } from '@/types/magic-ui';

const MagicUIContext = createContext<MagicUIContextType | undefined>(undefined);

interface MagicUIProviderProps {
  theme: MagicUITheme | undefined | null;
  projectPrd: string;
  children: ReactNode;
  apiRoute?: string;
}

export function MagicUIProvider({ theme, projectPrd, apiRoute, children }: MagicUIProviderProps) {
  const setTheme = useMagicUIStore((state) => state.setTheme);
  const setProjectPrd = useMagicUIStore((state) => state.setProjectPrd);
  const setApiRoute = useMagicUIStore((state) => state.setApiRoute);

  useEffect(() => {
    if (theme) setTheme(theme);
  }, [theme, setTheme]);

  useEffect(() => {
    setProjectPrd(projectPrd);
  }, [projectPrd, setProjectPrd]);

  useEffect(() => {
    if (apiRoute) setApiRoute(apiRoute);
  }, [apiRoute, setApiRoute]);

  const contextValue = useMemo(() => ({
    theme: theme || null,
    projectPrd,
    apiRoute: apiRoute || '/api/generate-magic-ui',
    isInitialized: !!theme && !!projectPrd,
  }), [theme, projectPrd, apiRoute]);

  return (
    <MagicUIContext.Provider value={contextValue}>
      {children}
    </MagicUIContext.Provider>
  );
}

export const useMagicUIContext = (): MagicUIContextType => {
  const context = useContext(MagicUIContext);
  if (context === undefined) {
    throw new Error('useMagicUIContext must be used within a MagicUIProvider');
  }
  return context;
};

// Hook to check if MagicUI is properly initialized
export const useMagicUIInitialized = () => useMagicUIContext().isInitialized;

// Hook to get theme with fallback
export const useMagicUITheme = () => useMagicUIContext().theme;

// Hook to get project PRD with fallback
export const useMagicUIProjectPrd = () => useMagicUIContext().projectPrd;
