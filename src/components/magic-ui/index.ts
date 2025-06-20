// Main components
export { default as MagicUIProvider } from './MagicUIProvider';
export { default as MagicUI } from './MagicUI';
export { default as MagicUIPage } from './MagicUIPage';

// Supporting components
export { RegenerateButton, InlineRegenerateButton } from './RegenerateButton';
export { LoadingSpinner, LoadingOverlay } from './LoadingSpinner';
export { MagicUIErrorBoundary, DefaultErrorFallback } from './MagicUIErrorBoundary';

// Hooks
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

// Types
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
  DEFAULT_MAGIC_UI_CONFIG,
} from '@/types/magic-ui';
