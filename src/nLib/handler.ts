import { NextRequest, NextResponse } from 'next/server';
import { UIGenerationRequest, allModels, AllModelType, userAiConfig, getSysConfig } from '@/types/magic-ui';
import { generateUIComponent } from './magic-ui-service';

/**
 * Handles the UI generation request. This function is designed to be called
 * from a Next.js API route.
 * @param request The NextRequest object from the API route.
 * @returns A NextResponse object with the result of the generation.
 */
export async function magicGenerate(request: NextRequest): Promise<NextResponse> {
  try {
    // Only allow POST requests for generation
    if (request.method !== 'POST') {
      return NextResponse.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
    }

    const generationRequestPayload = (await request.json()) as Omit<UIGenerationRequest, 'aiConfig'> & { aiConfig?: userAiConfig };
    let aiConfig: userAiConfig | undefined = generationRequestPayload.aiConfig;

    // Fallback to env if not provided
    if (!aiConfig || !aiConfig.apiKey) {
      const apiKeyFromEnv = process.env.MAGIC_UI_API_KEY;
      const model = process.env.MAGIC_UI_MODEL;
      if (!apiKeyFromEnv) {
        return NextResponse.json({ success: false, error: 'API key for AI provider is not set in request or environment variables.' }, { status: 500 });
      }
      if (!model || !allModels.includes(model as AllModelType)) {
        return NextResponse.json({ success: false, error: 'Model Not Defined | Supported' }, { status: 500 });
      }
      aiConfig = { model: model as AllModelType, apiKey: apiKeyFromEnv };
    }

    // Type guard: aiConfig is now always defined and has model/apiKey
    if (!aiConfig || !aiConfig.model || !aiConfig.apiKey) {
      return NextResponse.json({ success: false, error: 'API key / MODEL NAME for AI provider is not set in request or environment variables.' }, { status: 500 });
    }

    const sysAiConfig = getSysConfig(aiConfig);

    // Remove aiConfig from the main body to avoid sending it down if it contains sensitive info not needed by all parts.
    const { aiConfig: removedAiConfig, ...requestPayload } = generationRequestPayload;
    console.log(removedAiConfig)

    // Combine the payload from the request body with the aiConfig resolved here
    const fullGenerationRequest: UIGenerationRequest = {
      ...requestPayload,
      aiConfig: sysAiConfig, // Add the aiConfig resolved here
    };

    // Pass the full request and the aiConfig to the service
    const result = await generateUIComponent(fullGenerationRequest, sysAiConfig);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      // Provide a generic 500 status for failures. The specific error
      // is already in the result object.
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: unknown) {
    console.error('Error in magicGenerate handler:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error', version: 'unknown' }, { status: 500 });
  }
} 