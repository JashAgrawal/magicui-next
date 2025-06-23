# magicui-next v1.0 is here! 🚀

Meet **magicui-next**, a new kind of UI library for Next.js. Instead of giving you pre-built components, `magicui-next` gives you the power to generate them on the fly using AI. Describe the component you need, provide your data, and watch as high-quality, responsive React components are created and cached for you instantly.

## Features

-   🤖 **AI-Powered Generation**: Uses Google's Gemini AI to create React components from a text description.
-   ⚡️ **Server-Side Caching**: Generated components are cached on your server's file system for incredible performance.
-   🎨 **Theme-Aware**: Respects your design system and theme configuration.
-   🔄 **On-Demand Regeneration**: Interactively regenerate components to get the perfect UI.
-   🎯 **TypeScript First**: Full TypeScript support out-of-the-box.

## Getting Started

Follow these steps to get `magicui-next` running in your Next.js project.

### 1. Installation

```bash
npm install magicui-next
```

### 2. Set Up Your Environment

First, get a Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

Next, create a file named `.env.local` in the root of your project and add your key:

```env
GEMINI_API_KEY="your_api_key_here"
```

### 3. Create the API Route

Create a new API route in your project at `app/api/generate-magic-ui/route.ts`. This route securely handles the UI generation on the server.

Paste the following code into the file:

```ts
// app/api/generate-magic-ui/route.ts
import { magicGenerate } from 'magicui-next/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'GEMINI_API_KEY is not set on the server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return magicGenerate(request, { apiKey });
}

export async function GET() {
  return new Response('Magic UI Generation API is running.', { status: 200 });
}
```

### 4. Set Up the Provider

In your root layout (`app/layout.tsx`), wrap your application with the `MagicUIProvider`.

```tsx
// app/layout.tsx
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

## Usage

Now you can use the `<MagicUI />` component in any `'use client'` component.

```tsx
// app/some-page/page.tsx
'use client';
import { MagicUI } from 'magicui-next';

const productData = [{ id: 1, name: "Wireless Headphones", price: 99.99 }];

export default function ProductPage() {
  return (
    <MagicUI
      id="product-card"
      moduleName="Product Card"
      description="A responsive card showing product info."
      data={productData}
    />
  );
}
```

## What's Next?

This is just the beginning! Future versions will explore:

-   More granular control over the generation process.
-   Support for other generation models.
-   Deeper integration with design systems.

We welcome your feedback and contributions!

## License

MIT
