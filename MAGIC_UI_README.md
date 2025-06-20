# MagicUI - AI-Powered React TypeScript UI Library

MagicUI is a revolutionary React TypeScript library that generates dynamic UI components using Google's Gemini AI. Simply provide your data, description, and requirements, and watch as beautiful, responsive components are created automatically.

## Features

- 🤖 **AI-Powered Generation**: Uses Gemini AI to create React TypeScript components
- 🎨 **Theme-Aware**: Respects your design system and theme configuration
- 📝 **PRD-Driven**: Uses Product Requirements Documents to guide component generation
- 🔄 **Version Control**: Automatic versioning with regeneration capabilities
- 💾 **Persistent Storage**: Saves generated components locally for reuse
- 🎯 **TypeScript First**: Full TypeScript support with proper type definitions
- 📱 **Responsive**: Generated components are mobile-first and responsive
- ♿ **Accessible**: AI generates components with proper ARIA labels and semantic HTML

## Installation

```bash
npm install zustand @google/genai
```

## Quick Start

### 1. Setup MagicUIProvider

Wrap your application with the MagicUIProvider:

```tsx
import { MagicUIProvider } from '@/components/magic-ui';

const theme = {
  primary: '#3b82f6',
  secondary: '#64748b',
  background: '#ffffff',
  text: '#1f2937',
  border: '#e5e7eb',
  radius: '0.5rem',
  spacing: '1rem',
};

const projectPRD = `
# My Project Requirements
Create modern, responsive UI components with clean design...
`;

function App() {
  return (
    <MagicUIProvider theme={theme} projectPrd={projectPRD}>
      {/* Your app content */}
    </MagicUIProvider>
  );
}
```

### 2. Use MagicUI Components

```tsx
import { MagicUI } from '@/components/magic-ui';

const productData = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    rating: 4.5,
    inStock: true
  }
];

function ProductDisplay() {
  return (
    <MagicUI
      id="prod-cards"
      moduleName="product-cards"
      description="Create responsive product cards with images, prices, and ratings"
      data={productData}
    />
  );
}
```

## API Reference

### MagicUIProvider

The main provider component that initializes the MagicUI system.

```tsx
interface MagicUIProviderProps {
  theme: MagicUITheme | string;
  projectPrd: string;
  children: React.ReactNode;
}
```

**Props:**
- `theme`: Theme configuration object or string
- `projectPrd`: Product Requirements Document describing your project
- `children`: Child components

### MagicUI

The main component that generates and renders AI-created UI.

```tsx
interface MagicUIProps {
  moduleName: string;
  description: string;
  data: any;
  versionNumber?: string;
  className?: string;
}
```

**Props:**
- `moduleName`: Unique identifier for the component module
- `description`: Description of what the component should do
- `data`: Data to be rendered by the component
- `versionNumber`: Optional specific version to load
- `className`: Additional CSS classes

## Theme Configuration

```tsx
interface MagicUITheme {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  border?: string;
  radius?: string;
  spacing?: string;
  [key: string]: any;
}
```

## Version Management

MagicUI automatically manages component versions:

- **Auto-increment**: New versions are created automatically
- **Regeneration**: Click the regenerate button to create new versions
- **Persistence**: All versions are saved in localStorage
- **Specific Loading**: Load specific versions using `versionNumber` prop

## File Structure

```
src/
├── components/magic-ui/
│   ├── MagicUIProvider.tsx     # Main provider component
│   ├── MagicUI.tsx             # Core UI generation component
│   ├── RegenerateButton.tsx    # Regeneration controls
│   ├── LoadingSpinner.tsx      # Loading states
│   ├── MagicUIErrorBoundary.tsx # Error handling
│   └── index.ts                # Exports
├── contexts/
│   └── MagicUIContext.tsx      # React context
├── lib/
│   ├── magic-ui-store.ts       # Zustand store
│   ├── magic-ui-service.ts     # Core AI service
│   └── magic-ui-fs.ts          # File system utilities
└── types/
    └── magic-ui.ts             # TypeScript definitions
```

## Advanced Usage

### Custom Error Handling

```tsx
import { MagicUIErrorBoundary, DefaultErrorFallback } from '@/components/magic-ui';

function CustomErrorFallback({ error, retry }) {
  return (
    <div className="error-container">
      <h3>Oops! Something went wrong</h3>
      <p>{error.message}</p>
      <button onClick={retry}>Try Again</button>
    </div>
  );
}

function MyComponent() {
  return (
    <MagicUIErrorBoundary fallback={CustomErrorFallback}>
      <MagicUI {...props} />
    </MagicUIErrorBoundary>
  );
}
```

### Using Hooks

```tsx
import { useMagicUIActions, useModule } from '@/components/magic-ui';

function ComponentManager() {
  const actions = useMagicUIActions();
  const moduleState = useModule('my-module');

  const handleRegenerate = () => {
    const nextVersion = actions.getNextVersion('my-module');
    // Custom regeneration logic
  };

  return (
    <div>
      <p>Current Version: {moduleState.currentVersion}</p>
      <p>Is Generating: {moduleState.isGenerating}</p>
      <button onClick={handleRegenerate}>Regenerate</button>
    </div>
  );
}
```

## Environment Setup

Make sure you have the Gemini API key configured:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
# or
GEMINI_API_KEY=your_api_key_here
```

## Demo

Visit `/magic-ui-demo` to see MagicUI in action with various component examples.

## Best Practices

1. **Descriptive Module Names**: Use clear, descriptive names for your modules
2. **Detailed Descriptions**: Provide comprehensive descriptions for better AI generation
3. **Structured Data**: Organize your data in a clear, logical structure
4. **Theme Consistency**: Define a comprehensive theme for consistent styling
5. **Error Handling**: Always wrap MagicUI components in error boundaries
6. **Performance**: Use React.memo for components that don't change frequently

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Ensure GEMINI_API_KEY is set in your environment
2. **Generation Fails**: Check your internet connection and API quota
3. **Component Not Rendering**: Verify your data structure and description
4. **Storage Full**: Clear localStorage if you hit storage limits

### Debug Mode

Enable debug logging:

```tsx
// In development
localStorage.setItem('magic-ui-debug', 'true');
```

## Contributing

MagicUI is part of the UniChat project. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is part of UniChat and follows the same licensing terms.
