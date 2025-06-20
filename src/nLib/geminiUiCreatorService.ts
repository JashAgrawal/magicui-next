import { GoogleGenAI } from "@google/genai";
import { getGeminiConfig, handleGeminiError } from "./gemini";
import {
  ORIGINAL_SYSTEM_INSTRUCTION,
  ORIGINAL_CONFIG,
} from "./geminiUiCreatorPrompts";

// Types for UI Creator Service
export interface UiCreatorConfig {
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
  systemInstruction?: string;
}

export interface UiGenerationResult {
  success: boolean;
  uiContent?: string;
  error?: string;
  originalResponse: string;
}

export interface UiCreatorOptions {
  enableUiGeneration?: boolean;
  fallbackToOriginal?: boolean;
  timeout?: number;
}

// Default configuration for UI Creator
const DEFAULT_UI_CONFIG: UiCreatorConfig = {
  temperature: ORIGINAL_CONFIG.temperature,
  // maxOutputTokens: 4096,
  model: "gemini-2.5-flash-preview-04-17", // Use the current model
  systemInstruction: ORIGINAL_SYSTEM_INSTRUCTION,
};

/**
 * Gemini UI Creator Service
 * Processes chat responses and generates dynamic UI components when appropriate
 */
export class GeminiUiCreatorService {
  private client: GoogleGenAI | null = null;
  private config: UiCreatorConfig;

  constructor(config?: Partial<UiCreatorConfig>) {
    this.config = { ...DEFAULT_UI_CONFIG, ...config };
  }

  /**
   * Initialize the Gemini client for UI generation
   */
  private async initializeClient(): Promise<GoogleGenAI> {
    if (!this.client) {
      try {
        const geminiConfig = getGeminiConfig();
        this.client = new GoogleGenAI({
          apiKey: geminiConfig.apiKey,
        });
      } catch (error) {
        throw handleGeminiError(error);
      }
    }
    return this.client;
  }

  /**
   * Determines if a response should be processed for UI generation
   * Based on content analysis and patterns
   */
  public async shouldGenerateUi(response: string): Promise<boolean> {
    if (!response || response.trim().length === 0) {
      return false;
    }

    // Check for JSON-like content
    // const hasJsonPattern = /[\[\{].*[\]\}]/.test(response);

    // Check for structured data patterns
    const hasStructuredData =
      /("id":|"name":|"price":|"description":|"items":|"products":|"data":)/i.test(
        response
      );

    // Check for list-like content
    const hasListPattern =
      /^\s*[-*•]\s+/m.test(response) || /\d+\.\s+/m.test(response);

    // Check for table-like content
    const hasTablePattern = /\|.*\|/m.test(response);

    // Check for specific keywords that suggest UI-worthy content
    const hasUiKeywords =
      /(product|item|card|list|table|chart|graph|dashboard|form|button)/i.test(
        response
      );

    const client = await this.initializeClient();

    const responsee = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents:
        "Should this response be processed for UI generation ?" + response,
      config: {
        systemInstruction:
          "You are an expert at determining if a response should be processed for UI generation. You should only respond with '1' for Yes or '0' for No. nothing more nothing less ",
      },
    });

    const aiOpinion = (responsee.text || "1").trim() === "1";

    return (
      aiOpinion ||
      hasStructuredData ||
      hasListPattern ||
      hasTablePattern ||
      hasUiKeywords
    );
  }

  /**
   * Extracts and cleans JSON content from a response
   */
  private extractJsonContent(response: string): string | null {
    try {
      // Try to find JSON blocks
      const jsonMatches = response.match(/```json\s*([\s\S]*?)\s*```/g);
      if (jsonMatches && jsonMatches.length > 0) {
        return jsonMatches[0].replace(/```json\s*|\s*```/g, "").trim();
      }

      // Try to find JSON-like content without code blocks
      const jsonPattern = /[\[\{][\s\S]*[\]\}]/;
      const match = response.match(jsonPattern);
      if (match) {
        return match[0].trim();
      }

      // If no JSON found, return the original response for processing
      return response;
    } catch (error) {
      console.warn("Error extracting JSON content:", error);
      return response;
    }
  }

  /**
   * Sanitizes HTML content to prevent XSS attacks
   */
  private sanitizeHtml(html: string): string {
    // Remove script tags and event handlers
    let sanitized = html.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
    sanitized = sanitized.replace(/javascript:/gi, "");

    return sanitized;
  }

  /**
   * Extracts HTML content from the UI generation response
   */
  private extractHtmlContent(response: string): string | null {
    try {
      // Look for HTML code blocks
      const htmlMatches = response.match(/```html\s*([\s\S]*?)\s*```/g);
      if (htmlMatches && htmlMatches.length > 0) {
        const htmlContent = htmlMatches[0]
          .replace(/```html\s*|\s*```/g, "")
          .trim();
        return this.sanitizeHtml(htmlContent);
      }

      // Look for div with response-ui-div-id
      const divMatch = response.match(
        /<div[^>]*id="response-ui-div-id"[^>]*>[\s\S]*?<\/div>/i
      );
      if (divMatch) {
        return this.sanitizeHtml(divMatch[0]);
      }

      return null;
    } catch (error) {
      console.warn("Error extracting HTML content:", error);
      return null;
    }
  }

  /**
   * Generates UI content using Gemini AI
   */
  public async generateUi(
    originalResponse: string,
    options: UiCreatorOptions = {}
  ): Promise<UiGenerationResult> {
    const {
      enableUiGeneration = true,
      fallbackToOriginal = true,
      timeout = 30000,
    } = options;

    // Return original if UI generation is disabled
    if (!enableUiGeneration) {
      return {
        success: false,
        originalResponse,
        error: "UI generation is disabled",
      };
    }

    // Check if response should be processed
    if (!this.shouldGenerateUi(originalResponse)) {
      return {
        success: false,
        originalResponse,
        error: "Response does not contain UI-worthy content",
      };
    }

    try {
      const client = await this.initializeClient();

      // Extract content for UI generation
      const contentToProcess =
        this.extractJsonContent(originalResponse) || originalResponse;

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("UI generation timeout")), timeout);
      });

      // Generate UI with timeout
      const generationPromise = this.performUiGeneration(
        client,
        contentToProcess
      );

      const uiResponse = await Promise.race([
        generationPromise,
        timeoutPromise,
      ]);
      console.log("UI Response:", uiResponse);

      // Extract HTML content
      const uiContent = this.extractHtmlContent(uiResponse);

      if (uiContent) {
        return {
          success: true,
          uiContent,
          originalResponse,
        };
      } else {
        return {
          success: false,
          originalResponse,
          error: "Failed to extract valid HTML from UI generation response",
        };
      }
    } catch (error) {
      console.error("UI generation error:", error);

      if (fallbackToOriginal) {
        return {
          success: false,
          originalResponse,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error during UI generation",
        };
      } else {
        throw handleGeminiError(error);
      }
    }
  }

  /**
   * Performs the actual UI generation using Gemini
   */
  private async performUiGeneration(
    client: GoogleGenAI,
    content: string
  ): Promise<string> {
    const chat = client.chats.create({
      model: this.config.model!,
      config: {
        temperature: this.config.temperature,
        // maxOutputTokens: this.config.maxOutputTokens,
        systemInstruction: this.config.systemInstruction,
      },
    });

    const response = await chat.sendMessage({
      message: content,
    });

    return response.text || "";
  }

  /**
   * Updates the configuration for the UI Creator
   */
  public updateConfig(newConfig: Partial<UiCreatorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets the current configuration
   */
  public getConfig(): UiCreatorConfig {
    return { ...this.config };
  }

  /**
   * Clears the client instance (useful for testing or resetting)
   */
  public clearClient(): void {
    this.client = null;
  }
}

// Export a default instance
export const geminiUiCreator = new GeminiUiCreatorService();

// Export utility functions
export const uiCreatorUtils = {
  shouldGenerateUi: (response: string) =>
    geminiUiCreator.shouldGenerateUi(response),
  generateUi: (response: string, options?: UiCreatorOptions) =>
    geminiUiCreator.generateUi(response, options),
};
