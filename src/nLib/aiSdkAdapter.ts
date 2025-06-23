import OpenAI from 'openai';
// OpenAIConfig is part of AiProviderConfig union, not directly used here for casting.
import { AiProviderConfig, ProviderType } from '@/types/magic-ui';

// Predefined map of providers to their base URLs and default models
const providerDetails: Record<ProviderType, { defaultModel: string; baseURL?: string }> = {
  openai: {
    defaultModel: 'gpt-3.5-turbo', // This default model is used by magic-ui-service if not specified in aiConfig
    baseURL: 'https://api.openai.com/v1', // Default OpenAI base URL
  },
  gemini: { // Added placeholder for Gemini to satisfy ProviderType
    defaultModel: 'gemini-pro', // Example default model for Gemini
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/', // Example base URL
  }
  // Future providers can be added here
};

export function getAiClient(config: AiProviderConfig): OpenAI {
  if (!config.apiKey) {
    throw new Error(`API key for provider ${config.provider} is required.`);
  }

  const details = providerDetails[config.provider];
  if (!details) {
    throw new Error(`Unsupported AI provider: ${config.provider}`);
  }

  // const model = config.model || details.defaultModel; // Model is determined/used at the point of API call, not client instantiation
  const baseURL = config.baseURL || details.baseURL;

  console.log(config,baseURL);

  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: baseURL,
  });
}

// Example usage (for illustration, will be used in magic-ui-service.ts)
// async function example() {
//   try {
//     const openAIConfig: OpenAIConfig = {
//       provider: 'openai',
//       apiKey: 'YOUR_OPENAI_API_KEY', // Should come from secure source
//       model: 'gpt-4', // Optional, defaults to gpt-3.5-turbo
//     };
//     const openaiClient = getAiClient(openAIConfig);
//     // Use openaiClient to make API calls
//   } catch (error) {
//     console.error("Error initializing AI client:", error);
//   }
// }
