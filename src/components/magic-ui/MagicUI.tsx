'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useMagicUIContext } from '@/contexts/MagicUIContext';
import { useMagicUIActions, useModule } from '@/nLib/magic-ui-store';
// import { magicUIService } from '@/nLib/magic-ui-service'; // Removed
import { MagicUIErrorBoundary } from './MagicUIErrorBoundary';
import { RegenerateButton } from './RegenerateButton';
import { LoadingOverlay } from './LoadingSpinner';
import type { MagicUIProps, UIGenerationRequest, UIGenerationResponse } from '@/types/magic-ui';

export function MagicUI({
  id,
  moduleName,
  description,
  data,
  versionNumber,
  className,
  // apiKey, // Deprecated: API key is now part of aiConfig
  aiConfig // Added aiConfig from MagicUIProps
}: MagicUIProps) { // Removed & { apiKey?: string }
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('MagicUI: The "id" prop is required and must be a non-empty string.');
  }

  // All hooks must be called unconditionally at the top level
  const { theme, projectPrd, isInitialized } = useMagicUIContext();
  const {
    isGenerating,
    error: moduleError,
  } = useModule(moduleName);
  const actions = useMagicUIActions();
  
  const [generatedComponent, setGeneratedComponent] = useState<React.ComponentType<{ data: any; className?: string }> | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);
  
  // Track if we have all required data for client-side operations (theme, prd)
  // geminiClient is no longer directly used here for generation.
  const hasRequiredClientData = isInitialized;
  
  // Generate or load UI component
  const generateUI = React.useCallback(async (forceRegenerate = false) => {
    if (!isInitialized) { // Check for context initialization
      console.error('MagicUI context not properly initialized');
      return;
    }

    actions.updateModuleState(moduleName, {
      isGenerating: true,
      error: null,
      lastGenerated: new Date(),
    });
    setComponentError(null);

    const request: UIGenerationRequest & { apiKey?: string } = {
      id,
      moduleName,
      description,
      data, // Data is still passed for AI context during initial generation
      projectPrd: projectPrd || '',
      theme: theme || {},
      versionNumber: forceRegenerate ? undefined : versionNumber,
      forceRegenerate: forceRegenerate, // Pass the flag to the API
      // ...(apiKey ? { apiKey } : {}), // Deprecated apiKey logic
      aiConfig: aiConfig, // Pass the aiConfig object
    };

    let result: UIGenerationResponse & { source?: string };

    try {
      const apiResponse = await fetch('/api/generate-magic-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request), // forceRegenerate is part of the request object
      });

      if (!apiResponse.ok) {
        const errorResult = await apiResponse.json().catch(() => ({ error: `API request failed with status ${apiResponse.status}` }));
        throw new Error(errorResult.error || `API request failed with status ${apiResponse.status}`);
      }
      
      result = await apiResponse.json();

    } catch (e: any) {
      result = { success: false, error: e.message || 'API call failed', version: request.versionNumber || "1" };
    }

    if (result.success && result.code) {
      const component = createComponentFromCode(result.code, moduleName);
      setGeneratedComponent(() => component);
      actions.updateModuleState(moduleName, {
        isGenerating: false,
        currentVersion: result.version || '1.0.0',
        lastGenerated: new Date(),
      });
      actions.addLog(moduleName, {
        type: 'info',
        message: `Successfully fetched UI component (v${result.version || '1.0.0'}) from ${result.source || 'unknown'}`,
        data: JSON.stringify({ version: result.version, source: result.source }),
      });
    } else {
      const errorMessage = result.error || 'Failed to generate UI via API';
      setComponentError(errorMessage);
      actions.updateModuleState(moduleName, {
        isGenerating: false,
        error: errorMessage,
      });
      actions.addLog(moduleName, {
        type: 'error',
        message: 'Failed to fetch UI component via API',
        data: JSON.stringify({ error: errorMessage }),
      });
    }
  }, [
    id,
    isInitialized, // Still needed to gate the function
    moduleName,
    description,
    data, // data is part of the request for initial generation context
    projectPrd,
    theme,
    versionNumber,
    actions,
    // apiKey, // Deprecated
    aiConfig, // Added aiConfig to dependency array
    // geminiClient, // Removed as AI interaction is now via API
  ]);

  // Handle regeneration
  const handleRegenerate = React.useCallback(() => {
    generateUI(true);
  }, [generateUI]);

  // Initial generation
  useEffect(() => {
    if (hasRequiredClientData) { // Use the renamed variable
      generateUI(false);
    }
  }, [hasRequiredClientData, generateUI, id]);

  // Loading state
  if (!hasRequiredClientData) { // Use the renamed variable
    return (
      <div className={cn('p-4 border border-gray-200 rounded-lg bg-gray-50', className)}>
        <p className="text-gray-600 text-center">Initializing MagicUI...</p>
      </div>
    );
  }

  // Error state
  if (componentError || moduleError) {
    return (
      <div className={cn('relative', className)}>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-800 font-medium">Failed to generate UI component</p>
          <p className="text-red-600 text-sm mt-1">{componentError || moduleError}</p>
        </div>
        <RegenerateButton
          onRegenerate={handleRegenerate}
          isGenerating={isGenerating}
          positionStrategy='absolute-to-container'
        />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <MagicUIErrorBoundary>
        <LoadingOverlay isLoading={isGenerating}>
          {generatedComponent ? (
            React.createElement(generatedComponent, {
              data: data,
              className: 'magic-ui-generated-component'
            })
          ) : (
            <div className="p-8 border border-gray-200 rounded-lg bg-gray-50 text-center">
              <p className="text-gray-600">Generating UI component...</p>
            </div>
          )}
        </LoadingOverlay>
      </MagicUIErrorBoundary>

      <RegenerateButton
        onRegenerate={handleRegenerate}
        isGenerating={isGenerating}
        positionStrategy='absolute-to-container'
      />
    </div>
  );
}

/**
 * Create a React component wrapper that renders AI-generated JSX string in an iframe.
 */
function createComponentFromCode(jsxCodeString: string, moduleName: string): React.ComponentType<any> {
  try {
    // This is the component that will be rendered by MagicUI.
    // It receives the actual runtime data.
    return function GeneratedComponentWrapper({ data: instanceData, className }: any) {
      // Sanitize/prepare instanceData for injection into the iframe script.
      // Dates, functions, or complex objects might need special handling.
      // For now, we rely on JSON.stringify which handles common cases but loses functions/Dates (converts to ISO string).
      // The AI-generated component should be prepared to handle data in this serialized format (e.g., parse date strings).
      const serializableInstanceData = JSON.stringify(instanceData);

      const iframeContent = `
        <!doctype html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
            <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
            <script src="https://unpkg.com/@babel/standalone@7/babel.min.js" crossorigin></script>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                margin: 0; /* Reset margin */
                padding: 0; /* Reset padding */
                height: 100%;
                background-color: #fff; /* Default background */
              }
              #root {
                padding: 1rem; /* Add padding to the root inside iframe for content spacing */
                box-sizing: border-box;
                width: 100%;
                height: 100%;
              }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              try {
                // The AI generates a component string like: "({ data }) => { return <div>{data.name}</div>; }"
                // We need to make this string into an actual function.
                // Using 'new Function' is generally safer than 'eval' for this.
                // The arguments to new Function are the parameter names, then the function body.
                const AiGeneratedComponent = new Function('React', \`return ${jsxCodeString}\`)(React);

                // Data passed from the parent component, already serialized
                const runtimeData = JSON.parse(${serializableInstanceData});

                ReactDOM.render(
                  React.createElement(AiGeneratedComponent, { data: runtimeData }),
                  document.getElementById('root')
                );
              } catch (e) {
                console.error('Error rendering AI component in iframe:', e);
                const rootDiv = document.getElementById('root');
                if (rootDiv) {
                  rootDiv.innerHTML = '<div style="color: red; padding: 10px;">Error rendering component: ' + e.message + '</div>';
                }
              }
            </script>
          </body>
        </html>
      `;

      return (
        <div className={cn('w-full h-full', className)}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">{moduleName}</h3>
            {/* Optional: Add a small label indicating this is a JSX preview */}
            <span className="text-xs text-gray-400">JSX Preview</span>
          </div>
          <div className="relative border rounded-lg overflow-hidden bg-white shadow-sm">
            <iframe
              srcDoc={iframeContent}
              title={`Generated JSX UI: ${moduleName}`}
              className="w-full min-h-[300px] border-0" // Ensure iframe takes space
              sandbox="allow-same-origin allow-scripts" // Keep sandboxing
              loading="lazy"
              // Consider adding a mechanism to resize iframe based on content height if needed
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p>Preview of AI-generated React (JSX) component. Styling by TailwindCSS.</p>
          </div>
        </div>
      );
    };
  } catch (error) {
    console.error('Failed to create component wrapper from JSX code:', error);
    
    // Fallback component if the wrapper creation itself fails
    return function ErrorComponent() {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-800 font-medium">Failed to prepare generated component</p>
          <p className="text-red-600 text-sm mt-1">Module: {moduleName}</p>
          {error instanceof Error && <p className="text-red-500 text-xs mt-1">Details: {error.message}</p>}
        </div>
      );
    };
  }
}

export default MagicUI;
