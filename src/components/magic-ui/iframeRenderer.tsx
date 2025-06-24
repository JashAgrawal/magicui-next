import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface SimpleIsolatedRendererProps {
  children: React.ReactNode;
  className?:string
}

const SimpleIsolatedRenderer: React.FC<SimpleIsolatedRendererProps> = ({ children,className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;    
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Create new iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.minHeight = "400px"
    iframe.style.border = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.setAttribute('title', 'Dynamic Component Renderer');

    container.appendChild(iframe);

    // Setup iframe content
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Wait for Tailwind to load and then render
    setTimeout(() => {
      const rootElement = iframeDoc.getElementById('root');
      if (rootElement) {
        const root = createRoot(rootElement);
        root.render(children);
      }
    }, 200);

    // Cleanup function
    return () => {
      container.innerHTML = '';
    };
  }, [children]);

  return <div ref={containerRef} className={className} />;
};

export default SimpleIsolatedRenderer;