import CacheFileService, { CacheEntry } from "./cache-file-utils";
import {
  UIGenerationRequest,
  UIGenerationResponse,
  OpenAIConfig,
  sysAiConfig,
} from "@/types/magic-ui";
import { ORIGINAL_SYSTEM_INSTRUCTION } from "./prompt"; // This will be updated later for JSX
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources.mjs";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const cacheService = new CacheFileService();

function generateCacheKey(request: UIGenerationRequest): string {
  // Cache key should now include AI provider and model for uniqueness
  const model = request.aiConfig?.model;
  const provider = request.aiConfig?.provider;

  if (request.id && typeof request.id === "string" && request.id.trim() !== "") {
    // Include provider and model in ID-based cache key
    return `magicui-id:${request.id}-provider:${provider}-model:${model}`;
  }

  const { moduleName, versionNumber, theme, data, projectPrd } = request;
  const themeString = typeof theme === "string" ? theme : JSON.stringify(theme);
  const dataString = JSON.stringify(data); // Consider if data structure changes affect cache significantly

  return `${moduleName}:${versionNumber || "latest"}:${themeString}:${dataString}:${projectPrd}-provider:${provider}-model:${model}`;
}

export function getAiClient(config: sysAiConfig): OpenAI {
  if (!config.apiKey) {
    throw new Error(`API key for provider ${config.provider} is required.`);
  }
  const baseURL = config.baseUrl;

  console.log(config);

  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: baseURL,
  });
}

async function generateWithAI(
  request: UIGenerationRequest,
  aiConfig: sysAiConfig, // Use the new AiProviderConfig
): Promise<Omit<UIGenerationResponse, "success">> {
  if (!aiConfig || !aiConfig.apiKey) {
    return {
      error: "AI service is not configured (API key missing in aiConfig).",
      version: request.versionNumber || "1.0.0",
    };
  }

  try {
    const aiClient = getAiClient(aiConfig); // Get client using the adapter

    // Construct the user prompt (this will evolve for JSX)
    const userPrompt = `
      Module Name: ${request.moduleName}
      Description: ${request.description}
      Data: ${JSON.stringify(request.data, null, 2)}
      ${request.aiProps ? `AI Props (event/function descriptors): ${JSON.stringify(request.aiProps, null, 2)}` : ''}
      ID: ${request.id || "N/A"}
      ${request.projectPrd ? `Project PRD: ${request.projectPrd}` : ""}
      ${request.theme ? `Theme: ${typeof request.theme === "string" ? request.theme : JSON.stringify(request.theme, null, 2)}` : ""}
      ${request.isFullPage ? "Type: Full Page UI" : "Type: UI Component"}

      Please generate the React JSX component code as a JavaScript string, based on these details and the system instructions.
      The component should expect a 'data' prop and any additional event/function descriptor props.
      If the data is an array, use .map() to render items, ensuring unique keys.
      For images, use the JSX onError attribute for fallbacks as specified in the system instructions.
      The output should be ONLY the component code string itself.
    `;

    // Specific logic for OpenAI
    const openaiParams: ChatCompletionCreateParamsNonStreaming = { // Use 'any' for flexibility or define a more specific type
      model: aiConfig.model || 'gemini-2.5-flash', // Default model from adapter can be overridden
      // instructions:ORIGINAL_SYSTEM_INSTRUCTION,
      messages: [
        { role: "system", content: ORIGINAL_SYSTEM_INSTRUCTION }, // System prompt
        { role: "user", content: userPrompt }, // User prompt
      ],
      temperature: aiConfig.temperature ?? 1, // Use provided or default
      // max_tokens: aiConfig.maxOutputTokens ?? 4000, // Use provided or default
    };
    if ((aiConfig as OpenAIConfig).topP) {
      openaiParams.top_p = (aiConfig as OpenAIConfig).topP;
    }

    const response = await aiClient.chat.completions.create(openaiParams);
    const generatedText = response.choices[0].message.content;
    
    if (!generatedText) {
      throw new Error("AI returned an empty response.");
    }
    let code = '';
    // Code extraction logic (will need adjustment if AI directly returns code without markdown)
    if(generatedText.startsWith("`")){
      const rb = generatedText.indexOf("(");
      const lb = generatedText.lastIndexOf("}");
      code = generatedText.substring(rb,lb+1) 
    }

    return {
      code,
      version: new Date().toISOString(), // Or a version from AI if available
    };
  } catch (error: unknown) {
    console.error("Error generating UI with AI:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate UI with AI.";
    // Check for specific OpenAI errors if needed, e.g., error.response.data
    return {
      error: errorMessage,
      version: request.versionNumber || "1.0.0",
    };
  }
}

export async function generateUIComponent(
  generationRequest: UIGenerationRequest,
  aiConfig: sysAiConfig, // Expect AiProviderConfig
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

  if (!aiConfig || !aiConfig.apiKey) {
    console.error("Attempted to generate UI without API key in aiConfig.");
    return {
      success: false,
      error: "AI service is not configured (API key missing in aiConfig).",
      version: generationRequest.versionNumber || "1.0.0",
    };
  }
  if (!generationRequest.aiConfig) {
    generationRequest.aiConfig = aiConfig;
  }

  const cache = await cacheService.readCache();
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

  const aiResult = await generateWithAI(generationRequest, aiConfig);

  if (aiResult.code) {
    const newEntry: CacheEntry = {
      code: aiResult.code,
      timestamp: Date.now(),
    };
    cache.set(key, newEntry);
    await cacheService.writeCache(cache);
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
