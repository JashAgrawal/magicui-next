'use client';

import { useCallback, useRef } from 'react';
import { createGeminiClient, getGeminiConfig, handleGeminiError, validateMessageContent, sanitizeInput } from '@/nLib/gemini';

export function useGeminiAI() {
  const clientRef = useRef<ReturnType<typeof createGeminiClient> | null>(null);
  const chatRef = useRef<any>(null);

  const initializeClient = useCallback(() => {
    try {
      if (!clientRef.current) {
        const config = getGeminiConfig();
        clientRef.current = createGeminiClient(config);
      }
      return clientRef.current;
    } catch (error) {
      throw handleGeminiError(error);
    }
  }, []);

  const createChatSession = useCallback(() => {
    try {
      const client = initializeClient();

      if (!chatRef.current) {
        chatRef.current = client.chats.create({
          model: 'gemini-2.0-flash-exp',
          config: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            topP: 0.8,
            topK: 40,
            systemInstruction: 'You are a helpful assistant. Your every response should be valid JSON in the format: {"response": "your message here"}. Do not include any text outside the JSON structure.if image needed use this "https://placehold.co/600x400"',
          },
        });
      }

      return chatRef.current;
    } catch (error) {
      throw handleGeminiError(error);
    }
  }, [initializeClient]);

  // Helper function to parse and validate JSON response
  const parseJsonResponse = useCallback((rawResponse: string): string => {
    if (!rawResponse.trim()) {
      throw new Error('Empty response received');
    }

    // Try to extract JSON from the response
    let jsonStr = rawResponse.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(jsonStr);

      // Check if it has the expected structure
      if (parsed && typeof parsed === 'object' && typeof parsed.response === 'string') {
        return parsed.response;
      }

      // If it's a string, return it directly
      if (typeof parsed === 'string') {
        return parsed;
      }

      // If it's an object but doesn't have 'response' field, try to extract meaningful content
      if (typeof parsed === 'object') {
        // Look for common response fields
        const possibleFields = ['response', 'message', 'content', 'text', 'answer'];
        for (const field of possibleFields) {
          if (parsed[field] && typeof parsed[field] === 'string') {
            return parsed[field];
          }
        }

        // If no known fields, stringify the object
        return JSON.stringify(parsed);
      }

      throw new Error('Invalid response format');
    } catch (parseError) {
      // If JSON parsing fails, try to extract content between quotes
      const quotedMatch = jsonStr.match(/"([^"]+)"/);
      if (quotedMatch) {
        return quotedMatch[1];
      }

      // If all else fails, return the raw response but clean it up
      return jsonStr.replace(/^[^a-zA-Z0-9]*/, '').replace(/[^a-zA-Z0-9]*$/, '') || 'Sorry, I encountered an error processing the response.';
    }
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    try {
      // Validate and sanitize input
      const sanitizedMessage = sanitizeInput(message);
      const validation = validateMessageContent(sanitizedMessage);

      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const chat = createChatSession();

      // Use regular response (no streaming)
      const response = await chat.sendMessage({
        message: sanitizedMessage,
      });

      const rawResponse = response.text || '';
      // Parse and validate the JSON response
      const parsedResponse = parseJsonResponse(rawResponse);
      console.log('Parsed Response:', parsedResponse);

      return parsedResponse;
    } catch (error) {
      const apiError = handleGeminiError(error);
      throw apiError;
    }
  }, [createChatSession, parseJsonResponse]);

  const clearSession = useCallback(() => {
    chatRef.current = null;
  }, []);

  const getSessionHistory = useCallback(() => {
    try {
      if (!chatRef.current) {
        return [];
      }

      return chatRef.current.getHistory();
    } catch (error) {
      console.error('Error getting session history:', error);
      return [];
    }
  }, []);

  return {
    sendMessage,
    clearSession,
    getSessionHistory,
    initializeClient,
  };
}
