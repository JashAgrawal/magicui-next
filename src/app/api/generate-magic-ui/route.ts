import { magicGenerate } from "@/nLib/handler";
import { NextRequest } from "next/server";

// The GET method is optional, but useful for a health check.
export async function GET() {
    return new Response('Magic UI Generation API is running.', { status: 200 });
}

// The POST method is the core of the functionality.
// It handles AI provider configuration and API keys.
export async function POST(request: NextRequest) {
    const body = await request.json();

    let aiConfig = body.aiConfig;

    // If aiConfig is not provided in the body, try to build it from environment variables for a default provider (e.g., OpenAI)
    if (!aiConfig || !aiConfig.apiKey) {
        const defaultProvider = process.env.DEFAULT_AI_PROVIDER || "gemini"; // Default to openai
        const apiKeyFromEnv = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY; // Prioritize OPENAI_API_KEY

        if (!apiKeyFromEnv) {
            return new Response(JSON.stringify({ success: false, error: "API key for AI provider is not set in request or environment variables." }), { status: 500 });
        }

        aiConfig = {
            provider: body.aiConfig?.provider || defaultProvider,
            model: body.aiConfig?.model, // User can still specify model even if key is from env
            apiKey: apiKeyFromEnv,
            baseURL: body.aiConfig?.baseURL, // User can still specify baseURL
        };
    }

    // Ensure provider is set if only API key was from env
    if (!aiConfig.provider) {
        aiConfig.provider = process.env.DEFAULT_AI_PROVIDER || 'gemini';
    }

    // Remove aiConfig from the main body to avoid sending it down if it contains sensitive info not needed by all parts.
    // The handler `magicGenerate` will receive it separately.
    const requestPayload = { ...body };
    delete requestPayload.aiConfig;

    // Create a new request object with the modified body to pass to the handler.
    // The original request object's body is a stream and can only be read once.
    const newRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(requestPayload),
    });

    // Pass the original request (or the new one with modified body) and the resolved aiConfig to the handler.
    return magicGenerate(newRequest as NextRequest, { aiConfig });
}
