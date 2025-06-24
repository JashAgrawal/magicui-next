import { magicGenerate } from "@/server";
import { NextRequest } from "next/server";

export async function GET() {
  return new Response('Magic UI Generation API is running.', { status: 200 });
}

export async function POST(request: NextRequest) {
  return magicGenerate(request);
}