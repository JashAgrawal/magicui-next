import { sysAiConfig } from '@/types/magic-ui';
import OpenAI from 'openai';

export function getAiClient(config: sysAiConfig): OpenAI {
  if (!config.apiKey) {
    throw new Error(`API key for provider ${config.provider} is required.`);
  }
  const baseURL = config.baseUrl;

  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: baseURL,
  });
}
