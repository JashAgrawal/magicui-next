# magicui-next

A Next.js-ready UI automation toolkit. Easily generate, manage, and use AI-powered UI components in your Next.js apps.

## Installation

```bash
npm install magicui-next
```

or

```bash
yarn add magicui-next
```

## Usage

### 1. Wrap your app with `MagicUIProvider`

```tsx
import { MagicUIProvider } from 'magicui-next';

export default function App({ children }) {
  return (
    <MagicUIProvider theme={/* your theme */} projectPrd={/* your PRD */} apiKey={/* gemini api key */}>
      {children}
    </MagicUIProvider>
  );
}
```

### 2. Use `MagicUI` to generate a component

```tsx
import { MagicUI } from 'magicui-next';

export default function MyComponent() {
  return (
    <MagicUI
      id="user-card-1"
      moduleName="UserProfile"
      description="A user profile card with avatar, name, and bio."
      data={{ name: 'Jane Doe', bio: 'AI enthusiast' }}
    />
  );
}
```

### 3. Use `MagicUIPage` to generate a full page (with dynamic data)

```tsx
import { MagicUIPage } from 'magicui-next';

export default function MyPage() {
  return (
    <MagicUIPage
      id="landing-123"
      moduleName="LandingPage"
      description="A landing page for a SaaS product. Use {{product}} and list features: {{features}}."
      data={{ product: 'MagicUI', features: ['AI', 'Next.js', 'Automation'] }}
    />
  );
}
```

**Note:**
- Any `{{key}}` placeholders in the generated code will be replaced with the corresponding value from the `data` prop.
- Unused placeholders will be removed from the output.

## License

MIT
