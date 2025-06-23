import { NextRequest, NextResponse } from 'next/server';
import { UIGenerationRequest, AiProviderConfig } from '@/types/magic-ui'; // Added AiProviderConfig
import { generateUIComponent } from './magic-ui-service';

/**
 * Handles the UI generation request. This function is designed to be called
 * from a Next.js API route.
 * @param request The NextRequest object from the API route.
 * @param options An object containing the aiConfig.
 * @returns A NextResponse object with the result of the generation.
 */
export async function magicGenerate(request: NextRequest, options: { aiConfig: AiProviderConfig }): Promise<NextResponse> {
  try {
    // Only allow POST requests for generation
    if (request.method !== 'POST') {
      return NextResponse.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
    }

    if (!options.aiConfig || !options.aiConfig.apiKey) {
      return NextResponse.json({ success: false, error: 'AI configuration with API key must be provided to the magicGenerate function.' }, { status: 500 });
    }

    const generationRequestPayload = (await request.json()) as Omit<UIGenerationRequest, 'aiConfig'>;

    // Combine the payload from the request body with the aiConfig resolved by the API route
    const fullGenerationRequest: UIGenerationRequest = {
      ...generationRequestPayload,
      aiConfig: options.aiConfig, // Add the aiConfig passed from the route
    };

    // Pass the full request and the aiConfig to the service
    const result = await generateUIComponent(fullGenerationRequest, options.aiConfig);

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