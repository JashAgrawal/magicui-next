'use client';

import React from 'react';
import { MagicUIProvider as MagicUIContextProvider } from '@/contexts/MagicUIContext';
import type { MagicUIProviderProps } from '@/types/magic-ui';

/**
 * MagicUIProvider - Main provider component for the MagicUI library
 * 
 * This component initializes the MagicUI system with theme and project requirements.
 * It should wrap your entire application or the part where you want to use MagicUI components.
 * 
 * @param theme - Theme configuration (object or string)
 * @param projectPrd - Product Requirements Document string
 * @param children - Child components
 */
export function MagicUIProvider({ theme, projectPrd, children }: MagicUIProviderProps) {
  // Validate required props
  if (!projectPrd || projectPrd.trim().length === 0) {
    console.warn('MagicUIProvider: projectPrd is required and should not be empty');
  }

  if (!theme) {
    console.warn('MagicUIProvider: theme is required');
  }

  return (
    <MagicUIContextProvider theme={theme} projectPrd={projectPrd}>
      {children}
    </MagicUIContextProvider>
  );
}

// Re-export the MagicUI component for convenience
export { MagicUI } from './MagicUI';

// Re-export other useful components
export { RegenerateButton, InlineRegenerateButton } from './RegenerateButton';
export { LoadingSpinner, LoadingOverlay } from './LoadingSpinner';
export { MagicUIErrorBoundary, DefaultErrorFallback } from './MagicUIErrorBoundary';

// Re-export hooks
export { 
  useMagicUIContext, 
  useMagicUIInitialized, 
  useMagicUITheme, 
  useMagicUIProjectPrd 
} from '@/contexts/MagicUIContext';

export { 
  useMagicUIStore, 
  useTheme, 
  useProjectPrd, 
  useModule, 
  useMagicUIActions 
} from '@/nLib/magic-ui-store';

// Re-export types
export type {
  MagicUITheme,
  MagicUIProps,
  MagicUIProviderProps,
  MagicUIContextType,
  ModuleState,
  ModuleLogs,
  UIGenerationRequest,
  UIGenerationResponse,
  RegenerateButtonProps,
  LoadingSpinnerProps,
  MagicUIErrorBoundaryProps,
  MagicUIConfig,
} from '@/types/magic-ui';

export default MagicUIProvider;