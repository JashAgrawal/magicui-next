import { ApiError, GeminiConfig } from '@/types/magic-ui';
// import { GoogleGenAI } from '@google/genai'; // No longer used directly in this file after createGeminiClient was commented out.

// Default configuration for Gemini AI (Potentially Obsolete for main flow)
/*
const DEFAULT_CONFIG: Partial<GeminiConfig> = {
  model: 'gemini-2.0-flash-exp',
  temperature: 0.7,
  maxOutputTokens: 4096,
  topP: 0.8,
  topK: 40,
};
*/

// Initialize Gemini AI client (Potentially Obsolete for main flow, kept if geminiUiCreatorService or direct Gemini use is intended elsewhere)
/*
export function createGeminiClient(config: GeminiConfig) {
  if (!config.apiKey) {
    throw new Error('Gemini API key is required');
  }

  return new GoogleGenAI({
    apiKey: config.apiKey,
  });
}
*/

// Get Gemini configuration from environment variables
// This is still used by geminiUiCreatorService.ts
// The API route also has logic for GEMINI_API_KEY as a fallback.
export function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  return {
    apiKey,
    // ...DEFAULT_CONFIG, // DEFAULT_CONFIG was commented out; service using this seems to set its own defaults.
  };
}

// Error handling utility
export function handleGeminiError(error: unknown): ApiError {
  console.error('Gemini AI Error:', error);

  if (error instanceof Error) {
    // Handle specific Gemini API errors
    if (error.message.includes('API_KEY_INVALID')) {
      return {
        message: 'Invalid API key. Please check your Gemini API key.',
        code: 'INVALID_API_KEY',
        status: 401,
      };
    }

    if (error.message.includes('QUOTA_EXCEEDED')) {
      return {
        message: 'API quota exceeded. Please try again later.',
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

    if (error.message.includes('SAFETY')) {
      return {
        message: 'Content was blocked due to safety concerns. Please try rephrasing your message.',
        code: 'SAFETY_BLOCK',
        status: 400,
      };
    }

    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      status: 500,
    };
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    status: 500,
  };
}

// Validate message content
export function validateMessageContent(content: string): { isValid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (content.length > 10000) {
    return { isValid: false, error: 'Message is too long (max 10,000 characters)' };
  }

  return { isValid: true };
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}