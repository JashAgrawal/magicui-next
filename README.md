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

- 🤖 **Multi-Provider AI Support**: OpenAI, Gemini, Claude, Mistral, and Meta models
- ⚡️ **Server-Side Caching**: Fast, persistent UI generation with file-based caching
- 🎨 **Theme-Aware**: Integrates with your design system
- 🔄 **On-Demand Regeneration**: Easily refresh generated UIs
- 🎯 **TypeScript First**: Full type safety and autocompletion
- 📱 **Full Page Support**: Generate complete page layouts with `MagicUIPage`
- 🔧 **Advanced Props**: Pass custom functions and logic via `aiProps`

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

MagicUI supports a wide range of models across multiple providers:

```ts
// All supported models
export const allModels = [
  // Gemini Models
  "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite-preview-06-17", "gemini-2.0-flash",
  
  // OpenAI Models
  "gpt-4.1-2025-04-14", "gpt-4o-mini", "gpt-4-turbo", "gpt-4o-2024-08-06", "gpt-4", 
  "o4-mini-2025-04-16", "o3-2025-04-16", "gpt-3.5-turbo",
  
  // Claude Models
  "claude-opus-4-20250514", "claude-sonnet-4-20250514", "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022",
  
  // Mistral Models
  "devstral-small-latest", "mistral-medium-latest", "mistral-small-latest", 
  "magistral-medium-latest", "magistral-small-latest",
  
  // Meta/LLaMA Models
  "Llama-4-Maverick-17B-128E-Instruct-FP8", "Llama-4-Scout-17B-16E-Instruct-FP8", 
  "Llama-3.3-70B-Instruct", "Llama-3.3-8B-Instruct",
  "Cerebras-Llama-4-Maverick-17B-128E-Instruct", "Cerebras-Llama-4-Scout-17B-16E-Instruct", 
  "Groq-Llama-4-Maverick-17B-128E-Instruct"
] as const;
```

The system automatically detects the provider from the model name and uses the appropriate API endpoint.

---

## API Route Setup

Create the API route in your Next.js project:

```ts
// app/api/generate-magic-ui/route.ts
import { magicGenerate } from "magicui-next/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return magicGenerate(request);
}

export async function GET() {
  return new Response('Magic UI Generation API is running.', { status: 200 });
}
```

The API automatically handles:
- Environment variable fallbacks for API keys and models
- Provider detection from model names
- Request validation and error handling
- Server-side caching

---

## Provider Setup

Wrap your app with the provider in `app/layout.tsx`:

```tsx
import { MagicUIProvider } from 'magicui-next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = { 
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
    radius: '0.5rem',
    spacing: '1rem'
  };
  const projectPRD = 'A modern, responsive e-commerce site with clean design and intuitive navigation...';

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

## Basic Usage

### Component Generation

```tsx
'use client';
import { MagicUI } from 'magicui-next';

const productData = [
  { id: 1, name: "Wireless Headphones", price: 99.99, image: "/headphones.jpg" },
  { id: 2, name: "Smart Watch", price: 199.99, image: "/watch.jpg" }
];

export default function ProductPage() {
  return (
    <MagicUI
      id="product-grid"
      moduleName="Product Grid"
      description="A responsive grid of product cards with images, titles, prices, and add to cart buttons"
      data={productData}
      
      aiProps={{
        onAddToCart: (product) => {
          console.log('Adding to cart:', product);
          // Add to cart logic
        },
        formatPrice: (price: number) => `$${price.toFixed(2)}`,
        isInStock: (product) => product.stock > 0
      }}
    />
  );
}
```

### Full Page Generation

```tsx
'use client';
import { MagicUIPage } from 'magicui-next';

const dashboardData = {
  user: { name: "John Doe", email: "john@example.com" },
  stats: { orders: 150, revenue: 15000, customers: 89 },
  recentOrders: [
    { id: 1, product: "Laptop", amount: 1200, status: "Delivered" },
    { id: 2, product: "Mouse", amount: 25, status: "Shipped" }
  ]
};

export default function DashboardPage() {
  return (
    <MagicUIPage
      id="dashboard"
      moduleName="Admin Dashboard"
      description="A comprehensive admin dashboard with user info, statistics, recent orders, and navigation"
      data={dashboardData}
      aiProps={{
        onOrderClick: (order) => {
          console.log('Order clicked:', order);
          // Navigate to order details
        },
        formatCurrency: (amount: number) => `$${amount.toLocaleString()}`,
        getStatusColor: (status: string) => {
          switch (status) {
            case 'Delivered': return 'green';
            case 'Shipped': return 'blue';
            default: return 'gray';
          }
        }
      }}
    />
  );
}
```

---

## Advanced Features

### Custom Functions with aiProps

Pass custom functions and logic to your generated components:

```tsx
<MagicUI
  id="user-list"
  moduleName="User List"
  description="A list of users with custom click handlers and formatting"
  data={users}
  aiProps={{
    onUserClick: (user) => {
      console.log('User clicked:', user);
      router.push(`/users/${user.id}`);
    },
    formatPrice: (price: number) => `$${price.toFixed(2)}`,
    customRender: (item) => (
      <span style={{ color: item.isActive ? 'green' : 'red' }}>
        {item.name}
      </span>
    ),
    handleDelete: async (userId: string) => {
      await deleteUser(userId);
      // Refresh data
    }
  }}
/>
```

The AI-generated component can call these functions as props, enabling rich interactivity.

### Interactive Data Table Example

```tsx
<MagicUI
  id="data-table"
  moduleName="Interactive Data Table"
  description="A sortable and filterable data table with pagination and row actions"
  data={tableData}
  aiProps={{
    onSort: (column, direction) => {
      console.log(`Sorting by ${column} in ${direction} order`);
      // Handle sorting logic
    },
    onFilter: (filters) => {
      console.log('Applying filters:', filters);
      // Handle filtering logic
    },
    onRowAction: (action, row) => {
      switch (action) {
        case 'edit':
          router.push(`/edit/${row.id}`);
          break;
        case 'delete':
          if (confirm('Are you sure?')) {
            deleteRow(row.id);
          }
          break;
        case 'view':
          router.push(`/view/${row.id}`);
          break;
      }
    },
    formatDate: (date) => new Date(date).toLocaleDateString(),
    getStatusBadge: (status) => ({
      text: status,
      color: status === 'active' ? 'green' : 'red'
    })
  }}
/>
```

### Form Generation with Validation

```tsx
<MagicUI
  id="contact-form"
  moduleName="Contact Form"
  description="A contact form with validation, file upload, and submission handling"
  data={formConfig}

aiProps={{
    validateField: (field, value) => {
      const validations = {
        email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : 'Invalid email',
        phone: (phone) => /^\+?[\d\s-]{10,}$/.test(phone) ? null : 'Invalid phone number',
        required: (value) => value && value.trim() ? null : 'This field is required'
      };
      return validations[field] ? validations[field](value) : null;
    },
    onSubmit: async (formData) => {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          alert('Form submitted successfully!');
        } else {
          throw new Error('Submission failed');
        }
      } catch (error) {
        alert('Error submitting form: ' + error.message);
      }
    },
    onFileUpload: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      return response.json();
    }
  }}
/>
```

### Theme Integration

```tsx
const customTheme = {
  primary: '#8b5cf6',      // Purple
  secondary: '#64748b',    // Slate
  background: '#f8fafc',   // Light gray
  text: '#1e293b',         // Dark slate
  border: '#e2e8f0',       // Light gray border
  radius: '0.75rem',       // Rounded corners
  spacing: '1.5rem'        // Increased spacing
};

<MagicUIProvider theme={customTheme} projectPrd="A modern SaaS dashboard...">
  {/* Your app */}
</MagicUIProvider>
```

### Caching and Regeneration

Components are automatically cached for 24 hours. Force regeneration:

```tsx
// The regenerate button appears automatically
// Or programmatically:
const { regenerate } = useMagicUIActions();
regenerate('my-component', true); // forceRegenerate = true
```

---

## TypeScript Types

```tsx
import type { 
  MagicUIProps, 
  MagicUITheme, 
  userAiConfig, 
  AllModelType 
} from 'magicui-next';

// Component props
interface MagicUIProps {
  id: string;                    // Required unique identifier
  moduleName: string;            // Component name
  description: string;           // AI prompt
  data: any;                     // Your data
  versionNumber?: string;        // Version control
  className?: string;            // CSS classes
  locked?: boolean;              // Prevent regeneration
  aiConfig?: userAiConfig;       // AI configuration
  aiProps?: Record<string, any>; // Custom functions and props
}

// AI Configuration
interface userAiConfig {
  apiKey: string;
  model?: AllModelType;          // Union of all supported models
  temperature?: number;          // 0-2, default 1
  maxOutputTokens?: number;      // Max tokens in response
  topP?: number;                 // Nucleus sampling
  topK?: number;                 // Top-k sampling
}

// Theme configuration
interface MagicUITheme {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  border?: string;
  radius?: string;
  spacing?: string;
  [key: string]: unknown;
}
```

---

## API Reference

### MagicUI Component

Generates individual UI components.

**Props:**
- `id` (required): Unique identifier
- `moduleName` (required): Component name
- `description` (required): AI prompt describing the component
- `data` (required): Data to pass to the component
- `aiConfig` (optional): AI model configuration
- `aiProps` (optional): Custom functions and props
- `className` (optional): CSS classes
- `versionNumber` (optional): Version control

### MagicUIPage Component

Generates complete page layouts.

**Props:** Same as MagicUI, but generates full-page layouts.

### MagicUIProvider

Context provider for theme and project configuration.

**Props:**
- `theme` (required): Design system theme
- `projectPrd` (required): Project requirements document
- `children` (required): React children
- `apiRoute` (optional): Custom API endpoint

---

## Environment Variables

```env
# Required: Your AI provider API key
MAGIC_UI_API_KEY="your_api_key_here"

# Optional: Default model (will auto-detect provider)
MAGIC_UI_MODEL="gpt-4o-mini"
```

---

## Caching

MagicUI uses file-based caching with a 24-hour TTL. Cache files are stored in your project root as `cache.json`. The cache key includes:

- Module name and version
- Theme configuration
- Data structure
- AI provider and model
- Project PRD

This ensures unique caching for different configurations.

---

## Error Handling

MagicUI includes comprehensive error handling:

- **API Errors**: Network issues, rate limits, invalid responses
- **Generation Errors**: AI model failures, invalid code generation
- **Runtime Errors**: Component rendering issues
- **Validation Errors**: Missing required props, invalid configurations

All errors are displayed with retry options and detailed logging.

---

## Performance

- **Server-side caching**: 24-hour cache with automatic invalidation
- **Lazy loading**: Components generate on-demand
- **Error boundaries**: Graceful error handling
- **Optimized builds**: Tree-shaking and code splitting

---

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

---

## License

MIT License - see [LICENSE](LICENSE) for details. 