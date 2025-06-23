/**
 * @deprecated This service is deprecated for UI generation.
 * UI generation is now handled by the server-side API route `/api/generate-magic-ui`.
 * This file is kept for reference or potential future refactoring for other client-side utilities,
 * but should not be used for new UI generation logic.
 */
/*
import { v4 as uuidv4 } from "uuid";
import { Chat, GoogleGenAI } from "@google/genai";
import { DEFAULT_MAGIC_UI_CONFIG } from "@/types/magic-ui";
import type {
  UIGenerationRequest,
  UIGenerationResponse,
  MagicUITheme,
  MagicUIConfig,
  ModuleLogs,
} from "@/types/magic-ui";
import { ORIGINAL_SYSTEM_INSTRUCTION } from "./geminiUiCreator";

/**
 * Service responsible for generating UI components using AI
 * Handles caching, versioning, and interaction with the AI model
 * /
class MagicUIService {
  private geminiClient: GoogleGenAI | null = null;
  private chatInstance: Chat | null = null;
  private config: MagicUIConfig;
  private cache: Map<string, { code: string; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<UIGenerationResponse>> = new Map();
  private CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(config: Partial<MagicUIConfig> = {}) {
    this.config = { ...DEFAULT_MAGIC_UI_CONFIG, ...config };
  }

  /**
   * Initialize the service with required configurations
   * /
  async initialize(apiKey: string, config: Partial<MagicUIConfig> = {}): Promise<void> {
    if (!apiKey) {
      throw new Error("API key is required to initialize MagicUIService");
    }

    this.geminiClient = new GoogleGenAI({ apiKey });
    this.config = { ...this.config, ...config };
    
    // Initialize chat instance
    this.chatInstance = this.geminiClient.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: ORIGINAL_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2000,
      },
    });

    await this.loadCache();
  }

  /**
   * Generate a UI component based on the provided request
   * /
  async generateUI(
    request: UIGenerationRequest
  ): Promise<UIGenerationResponse> {
    if (!this.geminiClient || !this.chatInstance) {
      throw new Error(
        "MagicUIService not properly initialized. Call initialize() first."
      );
    }

    const cacheKey = this.generateCacheKey(request);
    const cached = this.getFromCache(cacheKey);
    
    // If forceRegenerate is NOT set, use cache if available and not expired
    if (!request.forceRegenerate && cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return {
        success: true,
        code: cached.code,
        version: 'cached-' + new Date(cached.timestamp).toISOString()
      };
    }

    // Check if there's already a pending request for this key
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      return pendingRequest;
    }

    try {
      const generationPromise = this.generateWithAI(request);
      this.pendingRequests.set(cacheKey, generationPromise);

      const result = await generationPromise;

      if (result.success && result.code) {
        this.saveToCache(cacheKey, result.code);
      }

      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Generate UI code using the Gemini AI model
   * /
  private async generateWithAI(
    request: UIGenerationRequest
  ): Promise<UIGenerationResponse> {
    try {
      if (!this.geminiClient) {
        throw new Error("Gemini client not initialized");
      }

      if (!this.chatInstance) {
        throw new Error("Chat instance not initialized");
      }

      // Generate the UI
      const result = await this.chatInstance.sendMessage({
        message: [
          {
            text: `
            Module Name: ${request.moduleName}
            Description: ${request.description}
            Data: ${JSON.stringify(request.data, null, 2)}`
          }
        ]
      });

     const text = result.text;
     console.log("Generated text:", text);

     if (!text) {
       throw new Error("Failed to generate UI code");
     }

      // Extract code block from markdown if present
      const codeMatch = text.match(/```(?:tsx|ts|jsx|html|js)?\n([\s\S]*?)\n```/);
      const code = codeMatch ? codeMatch[1] : text;

      // Update cache
      this.setCache(this.generateCacheKey(request), code);

      return {
        success: true,
        code,
        version: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating UI with AI:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate UI",
        version: request.versionNumber || "1.0.0",
      };
    }
  }

  /**
   * Build the prompt for the AI model
   * /
  private buildGenerationPrompt(request: UIGenerationRequest): string {
    const { moduleName, description, data, projectPrd, theme, isFullPage } = request;

    const basePrompt = `
      You are an expert React/Next.js developer. 
      Create a ${isFullPage ? 'full-page layout' : 'reusable component'} based on the following requirements:
      
      Module: ${moduleName}
      Description: ${description}
      Project PRD: ${projectPrd}
      Theme: ${
        typeof theme === "string" ? theme : JSON.stringify(theme, null, 2)
      }
      Data: ${JSON.stringify(data, null, 2)}
      
      Requirements:
      1. Use TypeScript with React hooks
      2. Follow the provided theme and styling guidelines
      3. Make it fully responsive
      4. Include proper accessibility attributes
      5. Use Tailwind CSS for styling
      ${isFullPage ? `
      6. Create a full-page layout that takes up the entire viewport
      7. Include proper page structure with header, main content, and footer if needed
      8. Ensure proper spacing and layout for full-page display
      9. Handle responsive design for all screen sizes
      ` : `
      6. Ensure the component is self-contained and reusable
      7. Include TypeScript interfaces for all props
      `}
      
      Return ONLY the component code in a single TSX file with no additional explanations or markdown formatting.
    `;

    return basePrompt;
  }

  /**
   * Generate a unique cache key for the request
   * /
  private generateCacheKey(request: UIGenerationRequest): string {
    if (request.id && typeof request.id === 'string' && request.id.trim() !== '') {
      // Optionally, could include theme or other structural elements if they can vary per ID.
      // For now, ID is the primary key for the structure.
      return `magicui-id:${request.id}`;
    }
    // Fallback to existing detailed cache key if no ID is provided
    const { moduleName, versionNumber, theme, data, projectPrd } = request;
    const themeString = typeof theme === 'string' ? theme : JSON.stringify(theme);
    // IMPORTANT: For structural caching by ID, the 'data' part of this fallback key
    // should ideally represent the 'shape' or 'initial data' used for that first generation.
    // However, the user request implies 'id' defines the structure, and 'data' is for filling it.
    // So, if ID is not present, the old behavior (data influencing cache key) is fine.
    const dataString = JSON.stringify(data);
    return `${moduleName}:${versionNumber || 'latest'}:${themeString}:${dataString}:${projectPrd}`;
  }

  private getFromCache(key: string): { code: string; timestamp: number } | undefined {
    return this.cache.get(key);
  }

  private setCache(key: string, code: string): void {
    this.cache.set(key, {
      code,
      timestamp: Date.now()
    });
    this.saveCache();
  }

  private saveCache(): void {
    try {
      if (typeof window !== 'undefined') {
        const cacheData = Array.from(this.cache.entries())
          .filter(([_, value]) => (Date.now() - value.timestamp) < this.CACHE_TTL);
        localStorage.setItem('magic-ui-cache', JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  private async loadCache(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('magic-ui-cache');
        if (cached) {
          const parsed = JSON.parse(cached) as [string, { code: string; timestamp: number }][];
          // Filter out expired entries
          const validEntries = parsed.filter(([_, value]) => 
            (Date.now() - value.timestamp) < this.CACHE_TTL
          );
          this.cache = new Map(validEntries);
        }
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
      this.cache = new Map();
    }
  }

  /**
   * Save a response to the cache
   * /
  private saveToCache(key: string, code: string): void {
    this.setCache(key, code);
  }

  /**
   * Clear all cached responses
   * /
  clearCache(): void {
    this.cache.clear();
    // Clear any persistent cache if implemented
  }
}

// Export a singleton instance
export const magicUIService = new MagicUIService();

export default magicUIService;
*/

import { GoogleGenAI } from "@google/genai";
import {
  readCache,
  writeCache,
  CacheEntry,
} from "./cache-file-utils";
import {
  UIGenerationRequest,
  UIGenerationResponse,
} from "@/types/magic-ui";
import { ORIGINAL_SYSTEM_INSTRUCTION } from "./geminiUiCreator";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function generateCacheKey(request: UIGenerationRequest): string {
  if (request.id && typeof request.id === "string" && request.id.trim() !== "") {
    return `magicui-id:${request.id}`;
  }
  const { moduleName, versionNumber, theme, data, projectPrd } = request;
  const themeString = typeof theme === "string" ? theme : JSON.stringify(theme);
  const dataString = JSON.stringify(data);
  return `${moduleName}:${versionNumber || "latest"}:${themeString}:${dataString}:${projectPrd}`;
}

async function generateWithAI(
  request: UIGenerationRequest,
  apiKey: string,
): Promise<Omit<UIGenerationResponse, "success">> {
  if (!apiKey) {
    return {
      error: "AI service is not configured (API key missing).",
      version: request.versionNumber || "1.0.0",
    };
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const chatInstance = genAI.chats.create({
      model: "gemini-2.5-flash-lite-preview-06-17",
      config: {
        systemInstruction: ORIGINAL_SYSTEM_INSTRUCTION,
        temperature: 2,
      },
    });

    const prompt = `
      Module Name: ${request.moduleName}
      Description: ${request.description}
      Data: ${JSON.stringify(request.data, null, 2)}
      ID: ${request.id || "N/A"}
      ${request.projectPrd ? `Project PRD: ${request.projectPrd}` : ""}
      ${request.theme ? `Theme: ${typeof request.theme === "string" ? request.theme : JSON.stringify(request.theme, null, 2)}` : ""}
      ${request.isFullPage ? "Type: Full Page UI" : "Type: UI Component"}

      Please generate the HTML/Tailwind code based on these details and the system instructions.
      Remember to use {{placeholder}} syntax for dynamic data points as previously instructed.
      For images, ensure they have onerror fallbacks to https://placehold.co/.
    `;

    const result = await chatInstance.sendMessage({ message: [{ text: prompt }] });
    const text = result.text;

    if (!text) {
      throw new Error("AI returned an empty response.");
    }

    const codeMatch = text.match(/```(?:html|tsx|jsx|js)?\s*([\s\S]*?)\s*```/);
    const code = codeMatch ? codeMatch[1].trim() : text.trim();

    return {
      code,
      version: new Date().toISOString(),
    };
  } catch (error: unknown) {
    console.error("Error generating UI with AI:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to generate UI with AI.",
      version: request.versionNumber || "1.0.0",
    };
  }
}

export async function generateUIComponent(
  generationRequest: UIGenerationRequest,
  options: { apiKey: string },
): Promise<UIGenerationResponse> {
  if (
    !generationRequest ||
    !generationRequest.moduleName ||
    !generationRequest.description
  ) {
    return {
      success: false,
      error: "Invalid request payload",
      version: generationRequest.versionNumber || "1.0.0",
    };
  }

  if (!options.apiKey) {
    console.error("Attempted to generate UI without API key.");
    return {
      success: false,
      error: "AI service is not configured.",
      version: generationRequest.versionNumber || "1.0.0",
    };
  }

  const cache = await readCache();
  const key = generateCacheKey(generationRequest);
  const cachedEntry = cache.get(key);

  if (
    !generationRequest.forceRegenerate &&
    cachedEntry &&
    Date.now() - cachedEntry.timestamp < CACHE_TTL
  ) {
    return {
      success: true,
      code: cachedEntry.code,
      version: new Date(cachedEntry.timestamp).toISOString(),
    };
  }

  const aiResult = await generateWithAI(generationRequest, options.apiKey);

  if (aiResult.code) {
    const newEntry: CacheEntry = {
      code: aiResult.code,
      timestamp: Date.now(),
    };
    cache.set(key, newEntry);
    await writeCache(cache);
    return {
      success: true,
      code: aiResult.code,
      version: aiResult.version,
    };
  } else {
    return {
      success: false,
      error: aiResult.error || "AI generation failed.",
      version: aiResult.version,
    };
  }
}
