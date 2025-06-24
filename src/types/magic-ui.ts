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
  aiConfig?: sysAiConfig;
  aiProps?: Record<string, any>;
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

export type AiProviderConfig = userAiConfig // Union of all supported configs

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
  aiConfig?: sysAiConfig;
  aiProps?: Record<string, any>;
}

export interface MagicUIProps {
  id: string;
  moduleName: string;
  description: string;
  data: any;
  versionNumber?: string;
  className?: string;
  locked?: boolean;
  aiConfig?: AiProviderConfig;
}

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}



export const modelToProviderMap = {
  gemini: [
    "gemini-2.5-pro",    // SOTA coding performance :contentReference[oaicite:1]{index=1}
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite-preview-06-17",
    "gemini-2.0-flash",
  ],

  openai: [
    "gpt-4.1-2025-04-14",          // Latest code-focused model, excels on SWE‑bench :contentReference[oaicite:2]{index=2}
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4o-2024-08-06",
    "gpt-4",
    "o4-mini-2025-04-16",
    "o3-2025-04-16",
    "gpt-3.5-turbo"
  ],

  claude: [
    "claude-opus-4-20250514",    // Top coding performer, 72.5% SWE‑bench :contentReference[oaicite:3]{index=3}
    "claude-sonnet-4-20250514",
    "claude-3-7-sonnet-20250219",
    "claude-3-5-sonnet-20241022"
  ],

  mistral: [
    "devstral-small-latest",         // Released May 2025, designed specifically for code :contentReference[oaicite:4]{index=4}
    "mistral-medium-latest",
    "mistral-small-latest",
    "magistral-medium-latest",
    "magistral-small-latest"
  ],

  meta: [
    "Llama-4-Maverick-17B-128E-Instruct-FP8", // One of the strongest LLaMA 3 code models :contentReference[oaicite:5]{index=5}
    "Llama-4-Scout-17B-16E-Instruct-FP8",
    "Llama-3.3-70B-Instruct",
    "Llama-3.3-8B-Instruct",
    "Cerebras-Llama-4-Maverick-17B-128E-Instruct", "Cerebras-Llama-4-Scout-17B-16E-Instruct", "Groq-Llama-4-Maverick-17B-128E-Instruct",
  ],
}

export const allModels = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite-preview-06-17",
  "gemini-2.0-flash",
  "gpt-4.1-2025-04-14",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4o-2024-08-06",
  "gpt-4",
  "o4-mini-2025-04-16",
  "o3-2025-04-16",
  "gpt-3.5-turbo",
  "claude-opus-4-20250514",
  "claude-sonnet-4-20250514",
  "claude-3-7-sonnet-20250219",
  "claude-3-5-sonnet-20241022",
  "devstral-small-latest",
  "mistral-medium-latest",
  "mistral-small-latest",
  "magistral-medium-latest",
  "magistral-small-latest",
  "Llama-4-Maverick-17B-128E-Instruct-FP8",
  "Llama-4-Scout-17B-16E-Instruct-FP8",
  "Llama-3.3-70B-Instruct",
  "Llama-3.3-8B-Instruct",
  "Cerebras-Llama-4-Maverick-17B-128E-Instruct",
  "Cerebras-Llama-4-Scout-17B-16E-Instruct",
  "Groq-Llama-4-Maverick-17B-128E-Instruct"
] as const;

export type AllModelType = (typeof allModels)[number];
type modelsType = AllModelType;

export const providerToBaseUrlMap = {
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai/",
  openai: "https://api.openai.com/v1/",
  claude: "https://api.anthropic.com/v1/",
  mistral: "https://api.mistral.ai/v1/",
  meta: "https://api.llama.com/v1/",
}

export interface userAiConfig {
  apiKey: string;
  model?: modelsType;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface sysAiConfig extends userAiConfig {
  baseUrl:string;
  provider:string;
}

export const getSysConfig = (config: userAiConfig): sysAiConfig => {
  // Determine provider from model name (simple heuristics)
  const provider = getProviderFromModel(config.model);
  const baseUrl = providerToBaseUrlMap[provider];
  return {
    ...config,
    baseUrl,provider
  };
}

export const getProviderFromModel = (modell:AllModelType | undefined)=>{
  let provider: keyof typeof providerToBaseUrlMap = "openai"; // default
  if (modell) {
    const model = modell.toLowerCase();
    if (model.includes("gemini")) provider = "gemini";
    else if (model.includes("gpt") || model.includes("o4") || model.includes("o3")) provider = "openai";
    else if (model.includes("claude")) provider = "claude";
    else if (model.includes("mistral") || model.includes("magistral")) provider = "mistral";
    else if (model.includes("llama") || model.includes("cerebras") || model.includes("groq")) provider = "meta";
  }
  return provider
}

export interface UIGenerationRequestClient {
  moduleName: string;
  description: string;
  data: any;
  projectPrd: string;
  theme: MagicUITheme | string;
  versionNumber?: string;
  id?: string;
  isFullPage?: boolean;
  forceRegenerate?: boolean;
  aiConfig?: userAiConfig;
  aiProps?: Record<string, any>;
}