import { NextRequest, NextResponse } from 'next/server';
import { MagicUIService } from '@/lib/services/MagicUIService';
import { AiSdkAdapterService } from '@/lib/services/AiSdkAdapterService';
import { CacheService } from '@/lib/services/CacheService';
import { GeminiService } from '@/lib/services/GeminiService';
import { UIGenerationRequest, AiProviderConfig, GeminiConfig } from '@/types/magic-ui';

// Initialize services
const aiSdkAdapterService = new AiSdkAdapterService();
const cacheService = new CacheService();
// Note: For GeminiService, API key needs to be sourced, typically from env vars.
// This is a simplified initialization; in a real app, key management would be more robust.
let geminiService: GeminiService | undefined;
if (process.env.GEMINI_API_KEY) {
  geminiService = new GeminiService(process.env.GEMINI_API_KEY);
}

const magicUIService = new MagicUIService(aiSdkAdapterService, cacheService, geminiService);

export async function GET() {
  return NextResponse.json({ message: 'Magic UI Generation API is running.' }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // The body should be the UIGenerationRequest, which includes aiConfig
    const generationRequest = body as UIGenerationRequest;

    // Resolve aiConfig:
    // 1. Use aiConfig from request body if present and has API key.
    // 2. If not, try to use environment variables for default provider.
    let resolvedAiConfig: AiProviderConfig;
    const requestAiConfig = generationRequest.aiConfig;

    // Determine the provider string
    let providerStr = requestAiConfig?.provider || process.env.DEFAULT_AI_PROVIDER || "gemini";
    if (providerStr !== "openai" && providerStr !== "gemini") {
      providerStr = "gemini"; // Fallback to a valid default
    }
    const provider = providerStr as "openai" | "gemini";

    // Determine API Key
    let apiKey = requestAiConfig?.apiKey;
    if (!apiKey) {
      if (provider === "gemini" && process.env.GEMINI_API_KEY) {
        apiKey = process.env.GEMINI_API_KEY;
      } else if (provider === "openai" && process.env.OPENAI_API_KEY) {
        apiKey = process.env.OPENAI_API_KEY;
      } else {
        apiKey = process.env.AI_API_KEY; // A generic fallback
      }
    }

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key for AI provider is not set in request or environment variables." }, { status: 500 });
    }

    // Construct resolvedAiConfig ensuring provider is correctly typed
    if (provider === 'openai') {
      resolvedAiConfig = {
        provider: 'openai',
        apiKey: apiKey,
        model: requestAiConfig?.model,
        baseURL: requestAiConfig?.baseURL,
        temperature: requestAiConfig?.temperature,
        topP: requestAiConfig?.topP,
        maxOutputTokens: requestAiConfig?.maxOutputTokens,
      };
    } else { // provider === 'gemini'
      resolvedAiConfig = {
        provider: 'gemini',
        apiKey: apiKey,
        model: requestAiConfig?.model,
        baseURL: requestAiConfig?.baseURL,
        temperature: requestAiConfig?.temperature,
        topP: requestAiConfig?.topP,
        // Access topK only if requestAiConfig could be GeminiConfig
        topK: (requestAiConfig as Partial<GeminiConfig>)?.topK,
        maxOutputTokens: requestAiConfig?.maxOutputTokens,
      };
    }

    // Update the generationRequest with the resolved aiConfig
    const fullGenerationRequest: UIGenerationRequest = {
      ...generationRequest,
      aiConfig: resolvedAiConfig,
    };

    const result = await magicUIService.generateUIComponent(fullGenerationRequest);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      // Log the error for server-side inspection
      console.error("Magic UI Generation Error:", result.error);
      return NextResponse.json(result, { status: result.error?.includes("API key") ? 401 : 500 });
    }
  } catch (error: unknown) {
    console.error('Error in API route (POST /api/generate-magic-ui):', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message, version: 'unknown' }, { status: 500 });
  }
}
