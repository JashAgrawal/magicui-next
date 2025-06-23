import OpenAI from 'openai';
import { AiProviderConfig, ProviderType } from '@/types/magic-ui';

// Predefined map of providers to their base URLs and default models
const providerDetails: Record<ProviderType, { defaultModel: string; baseURL?: string }> = {
  openai: {
    defaultModel: 'gpt-3.5-turbo',
    baseURL: 'https://api.openai.com/v1',
  },
  gemini: {
    defaultModel: 'gemini-pro',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/', // Placeholder, actual Gemini API is different
  }
  // Future providers can be added here
};

export class AiSdkAdapterService {
  public getAiClient(config: AiProviderConfig): OpenAI {
    if (!config.apiKey) {
      throw new Error(`API key for provider ${config.provider} is required.`);
    }

    const details = providerDetails[config.provider];
    if (!details) {
      throw new Error(`Unsupported AI provider: ${config.provider}`);
    }

    const baseURL = config.baseURL || details.baseURL;

    // Note: The OpenAI SDK is used here as a generic client.
    // For Gemini, a different SDK (@google/generative-ai) is typically used.
    // This adapter might need to return different client types or a wrapped interface
    // if direct SDK features beyond simple chat completions are needed for each provider.
    if (config.provider === 'gemini') {
      // This is a conceptual adjustment. The actual Gemini SDK integration
      // would replace this or be handled by a different method/service if OpenAI SDK isn't compatible.
      // For now, we stick to OpenAI SDK for simplicity as per original code,
      // but acknowledge this is a point of divergence for true multi-provider support.
      console.warn("Using OpenAI SDK for Gemini provider. Ensure compatibility or use a dedicated Gemini client.");
    }

    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: baseURL,
    });
  }

  public getProviderDetails(provider: ProviderType) {
    return providerDetails[provider];
  }
}
