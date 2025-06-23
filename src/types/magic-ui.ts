export interface MagicUITheme {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  border?: string;
  radius?: string;
  spacing?: string;
  [key: string]: unknown;
}

export interface MagicUIProviderProps {
  theme: MagicUITheme | null | undefined;
  projectPrd: string;
  children: React.ReactNode;
  apiRoute?: string;
}

export interface MagicUIProps {
  id: string;
  moduleName: string;
  description: string;
  data: any;
  versionNumber?: string;
  className?: string;
  locked?: boolean;
}

export interface MagicUIContextType {
  theme: MagicUITheme | null | undefined;
  projectPrd: string;
  apiRoute: string;
  isInitialized: boolean;
}

export interface MagicUIStore {
  theme: MagicUITheme | string;
  projectPrd: string;
  modules: Record<string, ModuleState>;
  setTheme: (theme: MagicUITheme | string) => void;
  setProjectPrd: (prd: string) => void;
  updateModule: (moduleName: string, state: Partial<ModuleState>) => void;
  getModule: (moduleName: string) => ModuleState;
}

export interface ModuleState {
  currentVersion: string;
  isGenerating: boolean;
  lastGenerated: Date | null;
  error: string | null;
  logs: ModuleLogs;
}

export interface ModuleLogs {
  [version: string]: string;
}

export interface UIGenerationRequest {
  moduleName: string;
  description: string;
  data: any;
  projectPrd: string;
  theme: MagicUITheme | string;
  versionNumber?: string;
  id?: string;
  isFullPage?: boolean;
  forceRegenerate?: boolean;
}

export interface UIGenerationResponse {
  success: boolean;
  code?: string;
  version: string;
  error?: string;
}

export interface MagicUIFileSystem {
  readLogs: (moduleName: string) => Promise<ModuleLogs>;
  writeLogs: (moduleName: string, logs: ModuleLogs) => Promise<void>;
  ensureLogsDirectory: () => Promise<void>;
  getNextVersion: (logs: ModuleLogs) => string;
}

export interface RegenerateButtonProps {
  onRegenerate: () => void;
  isGenerating: boolean;
  className?: string;
  positionStrategy?: 'fixed-to-viewport' | 'absolute-to-container';
}

export interface MagicUIErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export interface MagicUIErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface MagicUIConfig {
  logsDirectory: string;
  maxVersions: number;
  generationTimeout: number;
  enableAutoSave: boolean;
}

export const DEFAULT_MAGIC_UI_CONFIG: MagicUIConfig = {
  logsDirectory: './magic-ui-logs',
  maxVersions: 50,
  generationTimeout: 30000,
  enableAutoSave: true,
};

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// AI Provider Configuration Types
export type ProviderType = 'openai' | 'gemini'; // Add more as supported

export interface BaseAiConfig {
  provider: ProviderType;
  apiKey: string;
  model?: string;
  baseURL?: string; // For self-hosted or alternative endpoints
  temperature?: number;
  maxOutputTokens?: number;
  // Add other common parameters here
}

export interface OpenAIConfig extends BaseAiConfig {
  provider: 'openai';
  topP?: number;
  // Add other OpenAI specific parameters here
}

export interface GeminiAiConfig extends BaseAiConfig { // Renamed to avoid conflict with existing GeminiConfig
  provider: 'gemini';
  topK?: number;
  topP?: number; // Gemini also supports topP
  // Add other Gemini specific parameters here
}

export type AiProviderConfig = OpenAIConfig | GeminiAiConfig; // Union of all supported configs

// Update UIGenerationRequest and MagicUIProps
export interface UIGenerationRequest {
  moduleName: string;
  description: string;
  data: any;
  projectPrd: string;
  theme: MagicUITheme | string;
  versionNumber?: string;
  id?: string;
  isFullPage?: boolean;
  forceRegenerate?: boolean;
  aiConfig?: AiProviderConfig; // Added aiConfig
}

export interface MagicUIProps {
  id: string;
  moduleName: string;
  description: string;
  data: any;
  versionNumber?: string;
  className?: string;
  locked?: boolean;
  aiConfig?: AiProviderConfig; // Added aiConfig
}