import {
  UIGenerationRequest,
  UIGenerationResponse,
  AiProviderConfig,
  OpenAIConfig, // For specific provider features if needed
} from '@/types/magic-ui';
import { AiSdkAdapterService } from './AiSdkAdapterService';
import { CacheService, CacheEntry } from './CacheService';
import { GeminiService } from './GeminiService'; // Assuming GeminiService is created
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

// This system instruction will be used for OpenAI or other compatible models via AiSdkAdapterService
// For Gemini, a similar instruction set might be part of GeminiService or passed to it.
export const REACT_JSX_SYSTEM_INSTRUCTION = `
You are a highly specialized UI generation agent. Your task is to generate a single, self-contained, visually stunning React functional component as a JavaScript string, using JSX and only TailwindCSS utility classes. The component must be fully based on:

- The project PRD (Product Requirements Document) (if provided)
- The visual theme (design system, colors, fonts, layout guidelines) (if provided)
- The input description, data, and module name

Your UI output should match the level of quality and detail of tools like V0.dev, Locofy, or top-tier Figma-to-code systems.

---

🎨 OUTPUT RULES:

You must generate a single, production-grade **React functional component as a JavaScript string**, styled exclusively with TailwindCSS utility classes.
The component should be self-contained and not require any external imports beyond React itself (assume React and ReactDOM are globally available).

Your output must follow these standards:

* ✅ **React Functional Component**: The output MUST be a string containing a single React functional component. For example: \`({ data }) => { /* JSX and logic here */ }\`.
* ✅ **JSX Syntax**: All UI elements must be written in JSX.
* ✅ **TailwindCSS Only**: Never use inline styles (e.g., \`style={ { color: 'red' } }\`), classes from other libraries, or \`<style>\` tags. Assume TailwindCSS is globally available and configured.
* ✅ **Props for Data**: The component should accept a single prop, typically named \`data\`, to receive the JSON data for rendering.
* ✅ **Data Handling**:
    *   Access data properties from the \`data\` prop (e.g., \`data.propertyName\`, \`data.items.map(...)\`).
    *   Format data appropriately for display (e.g., dates, currency).
* ✅ **Array/List Rendering**: If the \`data\` prop (or a property of \`data\`) is an array, the component MUST use the \`.map()\` method to iterate over the array and render each item. Each item in the list should have a unique \`key\` prop (e.g., using \`item.id\` or the \`index\` from map).
* ✅ **Image Fallbacks (JSX)**: For all \`<img>\` tags, you MUST include an \`onError\` attribute for image fallbacks: \`onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/WIDTHxHEIGHT/EEE/AAA?text=Image+Not+Found'; }}\`. Infer sensible WIDTH and HEIGHT.
* ✅ **No Output Commentary or Markdown**: Only return the JavaScript string representing the React component. Do NOT wrap it in markdown fences (like \`\`\`jsx ... \`\`\`) or add any explanations.
* ✅ **Theme-Adherent**: Reflect the provided theme (colors, typography, spacing) through Tailwind classes.
* ✅ **PRD-Compliant**: Match the project's goals from the PRD.
* ✅ **Non-Generic**: Be creative; design with clarity and hierarchy.
* ✅ **Behavior-Aware**: Add interactivity (e.g. \`onClick\`) only if specified. Use simple inline functions or stubs (e.g., \`onClick={() => console.log('Button clicked')}\`).
* ✅ **Responsive**: Ensure responsiveness using Tailwind's prefixes (sm:, md:, lg:).
* ✅ **Comprehensive UI**: Ensure the UI is a complete, well-thought-out component/section.

---

🚫 NEVER INCLUDE:

* Markdown fences (e.g., \`\`\`jsx ... \`\`\`) around the component code.
* Explanations or comments outside the component code string itself.
* Incomplete or unstyled JSX.
* \`import React from 'react';\` or any other import statements.
* Anything other than the pure JavaScript string representing the React functional component.
---
`;


const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export class MagicUIService {
  private aiSdkAdapterService: AiSdkAdapterService;
  private cacheService: CacheService;
  private geminiService?: GeminiService; // Optional, if Gemini is a configured provider

  constructor(
    aiSdkAdapterService: AiSdkAdapterService,
    cacheService: CacheService,
    geminiService?: GeminiService
  ) {
    this.aiSdkAdapterService = aiSdkAdapterService;
    this.cacheService = cacheService;
    this.geminiService = geminiService;
  }

  private generateCacheKey(request: UIGenerationRequest): string {
    const provider = request.aiConfig?.provider || 'default_provider';
    const model = request.aiConfig?.model || 'default_model';

    // Using a simpler cache key based on ID if available, plus provider/model
    if (request.id && typeof request.id === "string" && request.id.trim() !== "") {
      return `magicui-id:${request.id}-provider:${provider}-model:${model}`;
    }

    // Fallback to a more detailed key if ID is not present
    const { moduleName, versionNumber, theme, data, projectPrd } = request;
    const themeString = typeof theme === "string" ? theme : JSON.stringify(theme);
    const dataString = JSON.stringify(data); // Consider hashing for very large data

    return `${moduleName || 'unknown_module'}:${versionNumber || "latest"}:${themeString}:${dataString}:${projectPrd || 'no_prd'}-provider:${provider}-model:${model}`;
  }

  private extractJSXCode(generatedText: string): string {
    // Attempt to remove markdown fences if present
    const noMarkdown = generatedText.replace(/^```(?:jsx|javascript|typescript)?\s*|\s*```$/g, '');
    // Trim whitespace and return
    return noMarkdown.trim();
  }

  private async generateWithAiProvider(
    request: UIGenerationRequest,
    aiConfig: AiProviderConfig
  ): Promise<Omit<UIGenerationResponse, "success">> {
    if (!aiConfig.apiKey) {
      return { error: "AI API key is missing in aiConfig.", version: request.versionNumber || "unknown" };
    }

    const userPrompt = `
      Module Name: ${request.moduleName}
      Description: ${request.description}
      Data: ${JSON.stringify(request.data, null, 2)}
      ID: ${request.id || "N/A"}
      ${request.projectPrd ? `Project PRD: ${request.projectPrd}` : ""}
      ${request.theme ? `Theme: ${typeof request.theme === "string" ? request.theme : JSON.stringify(request.theme, null, 2)}` : ""}
      ${request.isFullPage ? "Type: Full Page UI" : "Type: UI Component"}

      Please generate the React JSX component code as a JavaScript string, based on these details and the system instructions.
      The component should expect a 'data' prop.
      If the data is an array, use .map() to render items, ensuring unique keys.
      For images, use the JSX onError attribute for fallbacks as specified in the system instructions.
      The output should be ONLY the component code string itself, without any markdown fences or explanations.
    `;

    try {
      if (aiConfig.provider === 'gemini' && this.geminiService) {
        // Use GeminiService for Gemini provider
        const geminiSystemInstruction = REACT_JSX_SYSTEM_INSTRUCTION; // Or a Gemini-specific one
        const chat = this.geminiService.startChat({
          history: [{ role: "user", parts: [{text: geminiSystemInstruction}] }, {role: "model", parts: [{text: "Understood. I will generate React JSX components as JavaScript strings."}]}],
          // generationConfig can be set here from aiConfig
        });
        const result = await chat.sendMessage(userPrompt);
        // const result = await this.geminiService.generateContent({
        //   contents: [
        //     { role: "user", parts: [{ text: geminiSystemInstruction }] }, // System-like prompt
        //     { role: "model", parts: [{ text: "Understood. I will generate React JSX components as JavaScript strings." }] }, // Priming response
        //     { role: "user", parts: [{ text: userPrompt }] }
        //   ],
        //   // generationConfig from aiConfig can be applied here
        // });
        const generatedText = result.response.text();
        if (!generatedText) throw new Error("Gemini AI returned an empty response.");
        return { code: this.extractJSXCode(generatedText), version: new Date().toISOString() };

      } else {
        // Use generic AiSdkAdapterService for OpenAI or other compatible providers
        const aiClient = this.aiSdkAdapterService.getAiClient(aiConfig);
        const providerDetails = this.aiSdkAdapterService.getProviderDetails(aiConfig.provider);

        const params: ChatCompletionCreateParamsNonStreaming = {
          model: aiConfig.model || providerDetails.defaultModel,
          messages: [
            { role: "system", content: REACT_JSX_SYSTEM_INSTRUCTION },
            { role: "user", content: userPrompt },
          ],
          temperature: aiConfig.temperature ?? 0.7, // Default temperature
        };
        if ((aiConfig as OpenAIConfig).topP) params.top_p = (aiConfig as OpenAIConfig).topP;
        // max_tokens can be added if needed: params.max_tokens = (aiConfig as OpenAIConfig).maxOutputTokens;

        const response = await aiClient.chat.completions.create(params);
        const generatedText = response.choices[0]?.message?.content;

        if (!generatedText) throw new Error("AI returned an empty response.");
        return { code: this.extractJSXCode(generatedText), version: new Date().toISOString() };
      }
    } catch (error: unknown) {
      console.error(`Error generating UI with ${aiConfig.provider}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to generate UI with ${aiConfig.provider}.`;
      return { error: errorMessage, version: request.versionNumber || "unknown" };
    }
  }

  public async generateUIComponent(
    request: UIGenerationRequest,
    // aiConfig is passed directly to the API route and then here
    // This aiConfig will be used for the generation
  ): Promise<UIGenerationResponse> {
    if (!request || !request.moduleName || !request.description || !request.aiConfig) {
      return {
        success: false,
        error: "Invalid request payload: moduleName, description, and aiConfig are required.",
        version: request?.versionNumber || "unknown",
      };
    }

    const { aiConfig } = request;

    if (!aiConfig.apiKey) {
        return {
            success: false,
            error: "AI API key is missing in aiConfig.",
            version: request.versionNumber || "unknown",
        };
    }

    // Ensure request.aiConfig is set for cache key generation if not already.
    // It should be set by the caller (API route).
    // if (!request.aiConfig) {
    //   request.aiConfig = aiConfig;
    // }

    const cache = await this.cacheService.readCache();
    const cacheKey = this.generateCacheKey(request);
    const cachedEntry = cache.get(cacheKey);

    if (
      !request.forceRegenerate &&
      cachedEntry &&
      Date.now() - cachedEntry.timestamp < CACHE_TTL
    ) {
      return {
        success: true,
        code: cachedEntry.code,
        version: `cached-${new Date(cachedEntry.timestamp).toISOString()}`,
      };
    }

    const aiResult = await this.generateWithAiProvider(request, aiConfig);

    if (aiResult.code) {
      const newEntry: CacheEntry = {
        code: aiResult.code,
        timestamp: Date.now(),
      };
      cache.set(cacheKey, newEntry);
      await this.cacheService.writeCache(cache);
      return {
        success: true,
        code: aiResult.code,
        version: aiResult.version || new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        error: aiResult.error || "AI generation failed or returned empty code.",
        version: aiResult.version || request.versionNumber || "unknown",
      };
    }
  }
}
