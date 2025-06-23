import { GoogleGenerativeAI, GenerativeModel, ChatSession, StartChatParams, GenerateContentRequest, Part as GeminiPart } from "@google/generative-ai"; // Part is used
import { ApiError, GeminiConfig } from '@/types/magic-ui';

// Default configuration for Gemini AI
const DEFAULT_GEMINI_MODEL = 'gemini-pro'; // Example, adjust as needed

export class GeminiService {
  private client: GoogleGenerativeAI;
  private config: GeminiConfig;

  constructor(apiKey: string, config?: Partial<Omit<GeminiConfig, 'apiKey'>>) {
    if (!apiKey) {
      throw new Error('Gemini API key is required for GeminiService.');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.config = {
      apiKey,
      model: config?.model || DEFAULT_GEMINI_MODEL,
      temperature: config?.temperature,
      maxOutputTokens: config?.maxOutputTokens,
      topP: config?.topP,
      topK: config?.topK,
    };
  }

  public getModel(): GenerativeModel {
    return this.client.getGenerativeModel({
      model: this.config.model || DEFAULT_GEMINI_MODEL,
      // generationConfig and safetySettings can be added here if needed
    });
  }

  public startChat(params?: StartChatParams): ChatSession {
    // Model is set when getModel() is called, params for startChat don't include model override.
    return this.getModel().startChat(params);
  }

  public async generateContent(request: string | (string | GeminiPart)[] | GenerateContentRequest): Promise<string> {
    const model = this.getModel();
    try {
      const result = await model.generateContent(request);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw GeminiService.handleGeminiError(error);
    }
  }

  public static handleGeminiError(error: unknown): ApiError {
    console.error('Gemini AI Error:', error);

    if (error instanceof Error) {
      // Basic error mapping, can be expanded based on specific Gemini error types/codes
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('PERMISSION_DENIED')) {
        return {
          message: 'Invalid API key or insufficient permissions. Please check your Gemini API key and its configuration.',
          code: 'INVALID_API_KEY',
          status: 401,
        };
      }
      if (error.message.includes('QUOTA_EXCEEDED')) {
        return {
          message: 'API quota exceeded. Please try again later or check your quota limits.',
          code: 'QUOTA_EXCEEDED',
          status: 429,
        };
      }
      if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
        return {
          message: 'Rate limit exceeded. Please wait a moment before trying again.',
          code: 'RATE_LIMIT_EXCEEDED',
          status: 429,
        };
      }
      if (error.message.includes('SAFETY') || error.message.includes('blocked')) {
        return {
          message: 'Content was blocked due to safety concerns. Please try rephrasing your prompt or adjusting safety settings.',
          code: 'SAFETY_BLOCK',
          status: 400,
        };
      }
      return {
        message: error.message,
        code: 'GEMINI_UNKNOWN_ERROR',
        status: 500,
      };
    }
    return {
      message: 'An unexpected error occurred with the Gemini service.',
      code: 'UNKNOWN_ERROR',
      status: 500,
    };
  }

  public static validateMessageContent(content: string): { isValid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }
    if (content.length > 30000) { // Typical context window limit, adjust as per model
      return { isValid: false, error: 'Message is too long (max 30,000 characters for prompt)' };
    }
    return { isValid: true };
  }

  public static sanitizeInput(input: string): string {
    // Basic trim and space normalization. More advanced sanitization can be added if needed.
    return input.trim().replace(/\s+/g, ' ');
  }

  public updateConfig(newConfig: Partial<Omit<GeminiConfig, 'apiKey'>>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): Readonly<GeminiConfig> {
    return this.config;
  }
}
