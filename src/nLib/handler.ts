import { NextRequest, NextResponse } from 'next/server';
import { UIGenerationRequest } from '@/types/magic-ui';
import { generateUIComponent } from './magic-ui-service';

/**
 * Handles the UI generation request. This function is designed to be called
 * from a Next.js API route.
 * @param request The NextRequest object from the API route.
 * @param options An object containing the apiKey.
 * @returns A NextResponse object with the result of the generation.
 */
export async function magicGenerate(request: NextRequest, options: { apiKey: string }): Promise<NextResponse> {
  try {
    // Only allow POST requests for generation
    if (request.method !== 'POST') {
      return NextResponse.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
    }

    if (!options.apiKey) {
      return NextResponse.json({ success: false, error: 'API key must be provided to the magicGenerate function.' }, { status: 500 });
    }

    const generationRequest = (await request.json()) as UIGenerationRequest;

    const result = await generateUIComponent(generationRequest, { apiKey: options.apiKey });

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