# MagicUI Next – AI-Driven React UI Generation for Next.js

## 🚀 Overview

MagicUI Next lets you generate React components on the fly using AI models like OpenAI, Gemini, Claude, Mistral, and Meta. Just describe your UI, provide your data, and MagicUI will generate, cache, and render the component for you.

---

## 🌐 Live Playground & Examples

- [Playground & Examples](https://magicui-next-zeta.vercel.app/)
- [Direct Playground Link](https://magicui-next-zeta.vercel.app/playground)
- [Full Page Example](https://magicui-next-zeta.vercel.app/magic-ui-demo/full-page)

---

## Features

- 🤖 **AI-Powered Generation**: Supports multiple providers and models.
- ⚡️ **Server-Side Caching**: Fast, persistent UI generation.
- 🎨 **Theme-Aware**: Integrates with your design system.
- 🔄 **On-Demand Regeneration**: Easily refresh generated UIs.
- 🎯 **TypeScript First**: Full type safety and autocompletion.

---

## Getting Started

### 1. Installation

```bash
npm install magicui-next
```

### 2. Environment Setup

Add your API key and default model to `.env.local`:

```env
MAGIC_UI_API_KEY="your_api_key_here"
MAGIC_UI_MODEL="gpt-4o-mini" # or any supported model below
```

### 3. Supported Models

MagicUI supports a wide range of models. Example:

```ts
export const allModels = [
  "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite-preview-06-17", "gemini-2.0-flash",
  "gpt-4.1-2025-04-14", "gpt-4o-mini", "gpt-4-turbo", "gpt-4o-2024-08-06", "gpt-4", "o4-mini-2025-04-16", "o3-2025-04-16", "gpt-3.5-turbo",
  "claude-opus-4-20250514", "claude-sonnet-4-20250514", "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022",
  "devstral-small-latest", "mistral-medium-latest", "mistral-small-latest", "magistral-medium-latest", "magistral-small-latest",
  "Llama-4-Maverick-17B-128E-Instruct-FP8", "Llama-4-Scout-17B-16E-Instruct-FP8", "Llama-3.3-70B-Instruct", "Llama-3.3-8B-Instruct",
  "Cerebras-Llama-4-Maverick-17B-128E-Instruct", "Cerebras-Llama-4-Scout-17B-16E-Instruct", "Groq-Llama-4-Maverick-17B-128E-Instruct"
] as const;
export type AllModelType = (typeof allModels)[number];
```

---

## API Route Example

```ts
// app/api/generate-magic-ui/route.ts
import { magicGenerate } from "magicui-next/server";
import { allModels, AllModelType, userAiConfig } from "@/types/magic-ui";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    let aiConfig: userAiConfig = body.aiConfig;

    // Fallback to env if not provided
    if (!aiConfig || !aiConfig.apiKey) {
        const apiKeyFromEnv = process.env.MAGIC_UI_API_KEY;
        const model = process.env.MAGIC_UI_MODEL;
        if (!apiKeyFromEnv) {
            return new Response(JSON.stringify({ success: false, error: "API key for AI provider is not set in request or environment variables." }), { status: 500 });
        }
        if (!model || !allModels.includes(model as AllModelType)) {
            return new Response(JSON.stringify({ success: false, error: "Model Not Defined | Supported" }), { status: 500 });
        }
        aiConfig = { model, apiKey: apiKeyFromEnv };
    }
    if (!aiConfig.model || !aiConfig.apiKey) {
        return new Response(JSON.stringify({ success: false, error: "API key / MODEL NAME for AI provider is not set in request or environment variables." }), { status: 500 });
    }
    // ...rest of handler...
}
```

---

## Provider & Model Selection

MagicUI will auto-detect the provider from the model name. You can use any model from the `allModels` list. The system will resolve the correct API endpoint and provider automatically.

---

## Using the MagicUI Component

```tsx
import { MagicUI } from 'magicui-next';

const productData = [{ id: 1, name: "Wireless Headphones", price: 99.99 }];

export default function ProductPage() {
  return (
    <MagicUI
      id="product-card"
      moduleName="Product Card"
      description="A responsive card showing product info."
      data={productData}
      aiConfig={{
        apiKey: "your_api_key", // Optional if set in env
        model: "gpt-4o-mini",   // Optional if set in env
        // temperature, topP, etc. are also supported
      }}
      aiProps={{
        // See below for advanced aiProps usage
      }}
    />
  );
}
```

---

## Advanced: aiProps Functions

You can pass functions in `aiProps` to provide custom logic or callbacks to the generated component. For example:

```tsx
<MagicUI
  id="user-list"
  moduleName="User List"
  description="A list of users with a custom click handler."
  data={users}
  aiConfig={{ model: "gpt-4o-mini" }}
  aiProps={{
    onUserClick: (user) => alert(`Clicked user: ${user.name}`),
    formatPrice: (price: number) => `$${price.toFixed(2)}`,
    customRender: (item) => <span style={{ color: 'red' }}>{item.label}</span>,
  }}
/>
```

The AI-generated component can call these functions as props, enabling rich interactivity and custom logic.

---

## TypeScript Types

- `userAiConfig`: What you pass in as `aiConfig` (apiKey, model, temperature, etc).
- `sysAiConfig`: Internal, includes provider and baseUrl.
- `AllModelType`: Union of all supported model names.

---

## Provider Setup

Wrap your app with the provider in `app/layout.tsx`:

```tsx
import { MagicUIProvider } from 'magicui-next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = { primary: '#3b82f6' /* ... your theme ... */ };
  const projectPRD = 'A modern, responsive e-commerce site...';

  return (
    <html lang="en">
      <body>
        <MagicUIProvider theme={theme} projectPrd={projectPRD}>
          {children}
        </MagicUIProvider>
      </body>
    </html>
  );
}
```

---

## License

MIT 