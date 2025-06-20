'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { GoogleGenAI } from '@google/genai';
import { getGeminiConfig, handleGeminiError } from '@/nLib/gemini';
import type { MagicUIContextType, MagicUITheme } from '@/types/magic-ui';
import { useMagicUIStore } from '@/nLib/magic-ui-store';
import { magicUIService } from '@/nLib/magic-ui-service';

const MagicUIContext = createContext<MagicUIContextType | undefined>(undefined);

interface MagicUIProviderProps {
  theme: MagicUITheme | undefined | null;
  projectPrd: string;
  children: ReactNode;
  apiKey?: string; // Optional API key for Gemini
}

export function MagicUIProvider({ theme, projectPrd, apiKey, children }: MagicUIProviderProps) {
  const { setTheme, setProjectPrd } = useMagicUIStore();
  const [geminiClient, setGeminiClient] = React.useState<GoogleGenAI | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize Gemini client and store values
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        // Set theme and PRD in store
        setTheme(theme ? theme : {});
        setProjectPrd(projectPrd);

        // Use apiKey from props if provided, otherwise fallback to config
        let key = apiKey;
        if (!key) {
          const config = getGeminiConfig();
          key = config.apiKey;
        }
        if (!key) {
          throw new Error('MagicUIProvider: apiKey is required for Gemini initialization');
        }
        const client = new GoogleGenAI({
          apiKey: key,
        });

        // Initialize the MagicUI service with the API key
        magicUIService.initialize(key);

        setGeminiClient(client);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize MagicUI Provider:', error);
        const apiError = handleGeminiError(error);
        throw apiError;
      }
    };

    initializeProvider();
  }, [theme, projectPrd, setTheme, setProjectPrd, apiKey]);

  // Update store when props change
  useEffect(() => {
    if (isInitialized) {
      setTheme(theme || {});
    }
  }, [theme, setTheme, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      setProjectPrd(projectPrd);
    }
  }, [projectPrd, setProjectPrd, isInitialized]);

  const contextValue: MagicUIContextType = {
    theme,
    projectPrd,
    geminiClient,
    isInitialized,
  };

  return (
    <MagicUIContext.Provider value={contextValue}>
      {children}
    </MagicUIContext.Provider>
  );
}

export function useMagicUIContext() {
  const context = useContext(MagicUIContext);
  
  if (context === undefined) {
    throw new Error('useMagicUIContext must be used within a MagicUIProvider');
  }
  
  return context;
}

// Hook to check if MagicUI is properly initialized
export function useMagicUIInitialized() {
  const context = useContext(MagicUIContext);
  return context?.isInitialized ?? false;
}

// Hook to get theme with fallback
export function useMagicUITheme(): MagicUITheme | string {
  const context = useContext(MagicUIContext);
  const storeTheme = useMagicUIStore((state) => state.theme);
  
  return context?.theme ?? storeTheme ?? {};
}

// Hook to get project PRD with fallback
export function useMagicUIProjectPrd(): string {
  const context = useContext(MagicUIContext);
  const storePrd = useMagicUIStore((state) => state.projectPrd);
  
  return context?.projectPrd ?? storePrd ?? '';
}
