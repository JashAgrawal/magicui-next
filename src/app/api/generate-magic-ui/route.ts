import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { readCache, writeCache, CacheEntry, CacheData } from '@/nLib/cache-file-utils'; // Adjust path if needed
import { UIGenerationRequest, UIGenerationResponse } from '@/types/magic-ui'; // Adjust path if needed
import { ORIGINAL_SYSTEM_INSTRUCTION } from '@/nLib/geminiUiCreator'; // Adjust path if needed

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Ensure GEMINI_API_KEY is available in your environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('GEMINI_API_KEY environment variable is not set.');
  // Potentially throw an error or handle this state appropriately for your app's startup
}
const genAI = new GoogleGenAI(geminiApiKey || ''); // genAI must be initialized, even if key is missing initially to avoid runtime error on new

function generateCacheKey(request: UIGenerationRequest): string {
  // Simplified cache key generation, similar to previous logic
  // ID is primary if present
  if (request.id && typeof request.id === 'string' && request.id.trim() !== '') {
    return `magicui-id:${request.id}`;
  }
  // Fallback if no ID (though ID is expected for caching generated structures)
  const { moduleName, versionNumber, theme, data, projectPrd } = request;
  const themeString = typeof theme === 'string' ? theme : JSON.stringify(theme);
  const dataString = JSON.stringify(data); // Data used for initial generation/prompting
  return `${moduleName}:${versionNumber || 'latest'}:${themeString}:${dataString}:${projectPrd}`;
}

// Main generation logic (adapted from parts of old magicUIService.generateWithAI)
async function generateWithAI(request: UIGenerationRequest): Promise<Omit<UIGenerationResponse, 'success'>> {
  if (!geminiApiKey) {
    return { error: 'AI service is not configured (API key missing).', version: request.versionNumber || '1.0.0' };
  }

  try {
    // TODO: Consider if a new chat instance should be created per request or if one can be reused.
    // For safety and to ensure system instruction is fresh, creating per request might be better.
    const chatInstance = genAI.chats.create({
        model: 'gemini-1.5-flash', // Using gemini-1.5-flash as per consideration
        config: {
            systemInstruction: ORIGINAL_SYSTEM_INSTRUCTION,
            temperature: 0.7, // Example: Adjust as needed
            // maxOutputTokens: 2048, // Example: Adjust as needed
        },
    });

    const prompt = `
      Module Name: ${request.moduleName}
      Description: ${request.description}
      Data: ${JSON.stringify(request.data, null, 2)}
      ID: ${request.id || 'N/A'}
      ${request.projectPrd ? `Project PRD: ${request.projectPrd}` : ''}
      ${request.theme ? `Theme: ${typeof request.theme === 'string' ? request.theme : JSON.stringify(request.theme, null, 2)}` : ''}
      ${request.isFullPage ? 'Type: Full Page UI' : 'Type: UI Component'}

      Please generate the HTML/Tailwind code based on these details and the system instructions.
      Remember to use {{placeholder}} syntax for dynamic data points as previously instructed.
      For images, ensure they have onerror fallbacks to https://placehold.co/.
    `;

    const result = await chatInstance.sendMessage({ message: [{text: prompt}] });
    const text = result.text;

    if (!text) {
      throw new Error('AI returned an empty response.');
    }

    // Extract code block from markdown if present, otherwise assume raw code
    // This regex attempts to find common code block syntaxes
    const codeMatch = text.match(/```(?:html|tsx|jsx|js)?\s*([\s\S]*?)\s*```/);
    const code = codeMatch ? codeMatch[1].trim() : text.trim();

    return {
      code,
      version: new Date().toISOString(), // Versioning by timestamp of generation
    };
  } catch (error: any) {
    console.error('Error generating UI with AI:', error);
    return {
      error: error.message || 'Failed to generate UI with AI.',
      version: request.versionNumber || '1.0.0',
    };
  }
}


export async function POST(request: NextRequest) {
  try {
    const generationRequest = (await request.json()) as UIGenerationRequest;

    if (!generationRequest || !generationRequest.moduleName || !generationRequest.description) {
      return NextResponse.json({ success: false, error: 'Invalid request payload' }, { status: 400 });
    }

    if (!geminiApiKey) {
        console.error('Attempted to generate UI without API key.');
        return NextResponse.json({ success: false, error: 'AI service is not configured on the server.' }, { status: 500 });
    }

    const cache = await readCache();
    const key = generateCacheKey(generationRequest);
    const cachedEntry = cache.get(key);

    if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
      // console.log(`Cache hit for key: ${key}`);
      return NextResponse.json({ success: true, code: cachedEntry.code, version: new Date(cachedEntry.timestamp).toISOString(), source: 'cache' });
    }

    // console.log(`Cache miss for key: ${key}. Generating with AI.`);
    const aiResult = await generateWithAI(generationRequest);

    if (aiResult.code) {
      const newEntry: CacheEntry = {
        code: aiResult.code,
        timestamp: Date.now(),
      };
      cache.set(key, newEntry);
      await writeCache(cache);
      // console.log(`Saved to cache for key: ${key}`);
      return NextResponse.json({ success: true, code: aiResult.code, version: aiResult.version, source: 'ai' });
    } else {
      return NextResponse.json({ success: false, error: aiResult.error || 'AI generation failed.', version: aiResult.version }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in /api/generate-magic-ui:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Optional: GET handler for health check or testing (not strictly necessary for the core logic)
export async function GET() {
  return NextResponse.json({ message: 'Magic UI Generation API is running.' });
}
