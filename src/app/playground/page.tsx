"use client"
import React, { useState } from 'react';
import { MagicUIProvider, MagicUI, MagicUIPage } from '@/components/magic-ui';
import { Button } from '@/components/ui/button';

const themes = [
  { name: 'Default', value: { primary: '#6366f1', background: '#f9fafb', text: '#111827' } },
  { name: 'Dark', value: { primary: '#111827', background: '#18181b', text: '#f9fafb' } },
  { name: 'Blue', value: { primary: '#3b82f6', background: '#e0f2fe', text: '#0f172a' } },
  { name: 'Emerald', value: { primary: '#10b981', background: '#ecfdf5', text: '#065f46' } },
];

const prefilled = {
  prd: 'A product card UI for an e-commerce app. Show product name, price, image, and rating. Use a fallback image if the main image fails.',
  description: 'Show a product card with name ({{name}}), price (${{price}}), image ({{image}}), and rating ({{rating}}). The image should have a fallback to https://placehold.co/300x200 if it fails to load.',
  data: JSON.stringify({
    name: 'Magic Mug',
    price: 19.99,
    image: 'https://example.com/nonexistent-mug.jpg',
    rating: 4.7
  }, null, 2),
  mode: 'component',
};

function getCode({ mode, description, data }: { mode: string, description: string, data: string }) {
  let parsed;
  try { parsed = JSON.parse(data); } catch { parsed = {}; }
  const dataString = JSON.stringify(parsed, null, 2);
  if (mode === 'component') {
    return `<MagicUI\n  id="playground-demo"\n  moduleName="playground-demo"\n  description={` + JSON.stringify(description) + `}\n  data={` + dataString + `}\n/>`;
  } else {
    return `<MagicUIPage\n  id="playground-demo-page"\n  moduleName="playground-demo-page"\n  description={` + JSON.stringify(description) + `}\n  data={` + dataString + `}\n/>`;
  }
}

function PreviewTabs({ code, children }: { code: string, children: React.ReactNode }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="flex space-x-2 mb-2">
        <Button size="sm" variant={tab === 'preview' ? 'default' : 'outline'} onClick={() => setTab('preview')}>Preview</Button>
        <Button size="sm" variant={tab === 'code' ? 'default' : 'outline'} onClick={() => setTab('code')}>Code</Button>
      </div>
      <div className="rounded-lg border bg-white p-4 min-h-[220px] relative">
        {tab === 'preview' ? children : (
          <div>
            <button
              className="absolute top-2 right-2 text-xs bg-gray-100 border px-2 py-1 rounded hover:bg-gray-200"
              onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
            >{copied ? 'Copied!' : 'Copy'}</button>
            <pre className="text-xs font-mono whitespace-pre-wrap text-gray-800 mt-2">{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility to deeply sanitize data for MagicUI (convert objects/arrays to strings except for arrays of primitives)
function sanitizeForMagicUI(value: any): any {
  if (value == null) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    // If all elements are primitives, return as is
    if (value.every(v => v == null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
      return value;
    }
    // Otherwise, stringify the array
    return JSON.stringify(value);
  }
  if (typeof value === 'object') {
    // If it's a Date, convert to ISO string
    if (value instanceof Date) return value.toISOString();
    // Otherwise, stringify the object
    return JSON.stringify(value);
  }
  return String(value);
}

// Add a custom fetcher to inject apiKey into the request body for MagicUI and MagicUIPage
function MagicUIWithApiKey(props: any) {
  return <MagicUI {...props} apiKey={props.apiKey} />;
}
function MagicUIPageWithApiKey(props: any) {
  return <MagicUIPage {...props} apiKey={props.apiKey} />;
}

export default function PlaygroundPage() {
  const [prd, setPrd] = useState(prefilled.prd);
  const [apiKey, setApiKey] = useState('');
  const [theme, setTheme] = useState(themes[0].value);
  const [mode, setMode] = useState<'component' | 'page'>(prefilled.mode as 'component' | 'page');
  const [description, setDescription] = useState(prefilled.description);
  const [data, setData] = useState(prefilled.data);

  let parsedData: any = {};
  try {
    parsedData = JSON.parse(data);
  } catch {
    parsedData = {};
  }

  // Sanitize parsedData before passing to MagicUI
  const sanitizedData = sanitizeForMagicUI(parsedData);

  const code = getCode({ mode, description, data });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Config */}
      <aside className="w-full md:w-1/3 border-r bg-white p-6 flex flex-col gap-6 min-h-screen">
        <div>
          <h1 className="text-2xl font-bold mb-2">Playground</h1>
          <p className="text-gray-600 mb-4 text-sm">Configure your UI and see the code and preview instantly.</p>
        </div>
        <div>
          <label className="block font-medium mb-1">PRD</label>
          <textarea value={prd} onChange={e => setPrd(e.target.value)} rows={3} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">API Key</label>
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} type="password" className="w-full border rounded p-2" placeholder="sk-..." />
        </div>
        <div>
          <label className="block font-medium mb-1">Theme</label>
          <select value={themes.findIndex(t => t.value === theme)} onChange={e => setTheme(themes[parseInt(e.target.value)].value)} className="w-full border rounded p-2">
            {themes.map((t, i) => (
              <option value={i} key={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Mode</label>
          <select value={mode} onChange={e => setMode(e.target.value as 'component' | 'page')} className="w-full border rounded p-2">
            <option value="component">MagicUI Component</option>
            <option value="page">MagicUI Page</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Data (JSON)</label>
          <textarea value={data} onChange={e => setData(e.target.value)} rows={4} className="w-full border rounded font-mono p-2" />
          {(() => { try { JSON.parse(data); return null; } catch { return <div className="text-red-600 text-sm mt-1">Invalid JSON</div>; } })()}
        </div>
      </aside>
      {/* Preview Area */}
      <main className="flex-1 p-8 flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full">
          <MagicUIProvider theme={theme} projectPrd={prd}>
            <PreviewTabs code={code}>
              {mode === 'component' ? (
                <MagicUIWithApiKey
                  id="playground-demo"
                  moduleName="playground-demo"
                  description={description}
                  data={sanitizedData}
                  className="w-full"
                  apiKey={apiKey}
                />
              ) : (
                <MagicUIPageWithApiKey
                  id="playground-demo-page"
                  moduleName="playground-demo-page"
                  description={description}
                  data={sanitizedData}
                  className="w-full"
                  apiKey={apiKey}
                />
              )}
            </PreviewTabs>
          </MagicUIProvider>
        </div>
      </main>
    </div>
  );
} 