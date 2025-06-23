import { magicGenerate } from "@/nLib/handler";
import { NextRequest } from "next/server";

// The GET method is optional, but useful for a health check.
export async function GET() {
    return new Response('Magic UI Generation API is running.', { status: 200 });
}

// The POST method is the core of the functionality.
// It reads the API key from the server environment and passes it to the handler.
export async function POST(request: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ success: false, error: "GEMINI_API_KEY is not set on the server." }), { status: 500 });
    }
    return magicGenerate(request, { apiKey });
}
