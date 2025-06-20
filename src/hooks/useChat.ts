'use client';

import { useState, useCallback, useRef } from 'react';
import { useGeminiAI } from './useGeminiAI';
import { geminiUiCreator } from '@/nLib/geminiUiCreatorService';
import type { ChatMessage, ChatState, UiGenerationOptions } from '@/types/chat';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const { sendMessage: sendGeminiMessage, clearSession } = useGeminiAI();
  const lastUserMessageRef = useRef<string>('');

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  // Add a message to the chat
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    return newMessage;
  }, [generateMessageId]);

  // Update a specific message
  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    }));
  }, []);

  // Process response with UI generation
  const processResponseWithUi = useCallback(async (response: string): Promise<Omit<ChatMessage, 'id' | 'timestamp' | 'role'>> => {
    const uiOptions: UiGenerationOptions = {
      enableUiGeneration: true,
      fallbackToOriginal: true,
      timeout: 30000,
    };

    try {
      const uiResult = await geminiUiCreator.generateUi(response, uiOptions);

      if (uiResult.success && uiResult.uiContent) {
        return {
          content: response,
          hasUiContent: true,
          uiContent: uiResult.uiContent,
        };
      } else {
        return {
          content: response,
          hasUiContent: false,
          uiGenerationError: uiResult.error,
        };
      }
    } catch (error) {
      console.warn('UI generation failed:', error);
      return {
        content: response,
        hasUiContent: false,
        uiGenerationError: error instanceof Error ? error.message : 'UI generation failed',
      };
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return;

    lastUserMessageRef.current = content;

    // Add user message
    addMessage({
      content: content.trim(),
      role: 'user',
    });

    // Set loading state
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // Send message to Gemini and get response
      const response = await sendGeminiMessage(content);

      // Process response with UI generation
      const processedMessage = await processResponseWithUi(response);

      // Add assistant message with processed response
      addMessage({
        ...processedMessage,
        role: 'assistant',
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';

      // Add assistant message with error
      addMessage({
        content: '',
        role: 'assistant',
        error: errorMessage,
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [state.isLoading, addMessage, sendGeminiMessage, updateMessage, processResponseWithUi]);

  // Retry last message
  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current || state.isLoading) return;

    // Remove the last assistant message if it has an error
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg =>
        !(msg.role === 'assistant' && msg.error)
      ),
    }));

    await sendMessage(lastUserMessageRef.current);
  }, [state.isLoading, sendMessage]);

  // Clear chat
  const clearChat = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });

    clearSession();
    lastUserMessageRef.current = '';
  }, [clearSession]);

  // Copy message to clipboard
  const copyMessage = useCallback(async (messageId: string) => {
    const message = state.messages.find(msg => msg.id === messageId);
    if (!message) return;

    try {
      await navigator.clipboard.writeText(message.content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  }, [state.messages]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    // This will be handled by the parent component
  }, []);

  return {
    ...state,
    sendMessage,
    retryLastMessage,
    clearChat,
    copyMessage,
    scrollToBottom,
  };
}
