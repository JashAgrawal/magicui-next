'use client'
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useMagicUIContext } from '@/contexts/MagicUIContext';
import { useMagicUIActions, useModule } from '@/nLib/magic-ui-store';
// import { magicUIService } from '@/nLib/magic-ui-service'; // Removed
import { MagicUIErrorBoundary } from './MagicUIErrorBoundary';
import { RegenerateButton } from './RegenerateButton';
import { LoadingOverlay } from './LoadingSpinner';
import type { MagicUIProps, UIGenerationRequest, UIGenerationResponse } from '@/types/magic-ui';

export function MagicUIPage({ 
  id,
  moduleName, 
  description, 
  data, 
  versionNumber,
  className
}: MagicUIProps) {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('MagicUIPage: The "id" prop is required and must be a non-empty string.');
  }
  const { theme, projectPrd, isInitialized } = useMagicUIContext(); // Removed geminiClient
  const {
    isGenerating,
    error: moduleError,
    // currentVersion: moduleVersion // Remove unused
  } = useModule(moduleName);
  const actions = useMagicUIActions();
  
  const [generatedComponent, setGeneratedComponent] = useState<React.ComponentType<{ data: unknown; className?: string }> | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);
  
  // geminiClient is no longer directly used here for generation.
  const hasRequiredClientData = isInitialized;
  
  const generateUI = React.useCallback(async (forceRegenerate = false) => {
    if (!isInitialized) { // Check for context initialization
      console.error('MagicUIPage context not properly initialized');
      return;
    }

    actions.updateModuleState(moduleName, {
      isGenerating: true,
      error: null,
      lastGenerated: new Date()
    });
    setComponentError(null);

    const request: UIGenerationRequest = {
      id, // Pass id, even if moduleName is primary for pages, for consistency
      moduleName,
      description,
      data,
      projectPrd: projectPrd || '',
      theme: theme || {},
      versionNumber: forceRegenerate ? undefined : versionNumber,
      isFullPage: true,
      forceRegenerate: forceRegenerate,
    };

    let result: UIGenerationResponse & { source?: string };

    try {
      const apiResponse = await fetch('/api/generate-magic-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
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
        lastGenerated: new Date()
      });
      actions.addLog(moduleName, {
        type: 'info',
        message: `Successfully fetched full page UI (v${result.version || '1.0.0'}) from ${result.source || 'unknown'}`,
        data: JSON.stringify({ version: result.version, source: result.source })
      });
    } else {
      const errorMessage = result.error || 'Failed to generate full page UI via API';
      setComponentError(errorMessage);
      actions.updateModuleState(moduleName, { 
        isGenerating: false,
        error: errorMessage
      });
      actions.addLog(moduleName, {
        type: 'error',
        message: 'Failed to fetch full page UI via API',
        data: JSON.stringify({ error: errorMessage })
      });
    }
  }, [
    id,
    isInitialized, 
    moduleName, 
    description, 
    data,
    projectPrd, 
    theme, 
    versionNumber,
    actions,
    // geminiClient // Removed
  ]);

  const handleRegenerate = React.useCallback(() => {
    generateUI(true);
  }, [generateUI]);

  useEffect(() => {
    if (hasRequiredClientData) {
      generateUI(false);
    }
  }, [hasRequiredClientData, generateUI, id]); // Added id to useEffect dependencies like in MagicUI

  if (!hasRequiredClientData) {
    return (
      <div className={cn('min-h-screen p-4 bg-gray-50', className)}>
        <p className="text-gray-600 text-center">Initializing MagicUIPage...</p>
      </div>
    );
  }

  if (componentError || moduleError) {
    return (
      <div className={cn('min-h-screen relative', className)}>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 m-4">
          <p className="text-red-800 font-medium">Failed to generate full page UI</p>
          <p className="text-red-600 text-sm mt-1">{componentError || moduleError}</p>
        </div>
        <RegenerateButton 
          onRegenerate={handleRegenerate}
          isGenerating={isGenerating}
        />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen relative', className)}>
      <MagicUIErrorBoundary>
        <LoadingOverlay isLoading={isGenerating}>
          {generatedComponent ? (
            React.createElement(generatedComponent, {
              data: data,
              className: 'magic-ui-generated-page'
            })
          ) : (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <p className="text-gray-600">Generating full page UI...</p>
            </div>
          )}
        </LoadingOverlay>
      </MagicUIErrorBoundary>
      
      <RegenerateButton
         
        onRegenerate={handleRegenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}

function createComponentFromCode(code: string, moduleName: string): React.ComponentType<{ data: unknown; className?: string }> {
  try {
    return function GeneratedPageComponent({ data, className }: { data: unknown; className?: string }) {
      let instanceSpecificHtml = code;
      if (Array.isArray(data)) {
        let aggregatedHtml = '';
        for (const item of data) {
          let itemHtml = code;
          if (item && typeof item === 'object') {
            for (const key in item) {
              if (Object.prototype.hasOwnProperty.call(item, key)) {
                const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                const value = String(item[key] !== null && item[key] !== undefined ? item[key] : '');
                itemHtml = itemHtml.replace(placeholder, value);
              }
            }
          }
          aggregatedHtml += itemHtml;
        }
        instanceSpecificHtml = aggregatedHtml;
      } else if (data && typeof data === 'object') {
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            const value = String((data as Record<string, unknown>)[key] !== null && (data as Record<string, unknown>)[key] !== undefined ? (data as Record<string, unknown>)[key] : '');
            instanceSpecificHtml = instanceSpecificHtml.replace(placeholder, value);
          }
        }
      }
      // Remove unreplaced placeholders
      instanceSpecificHtml = instanceSpecificHtml.replace(/{{\s*[^}]+\s*}}/g, '');
      const iframeContent = `
        <!doctype html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                margin: 0;
                padding: 0;
                min-height: 100vh;
              }
            </style>
          </head>
          <body class="bg-white">
            ${instanceSpecificHtml}
          </body>
        </html>
      `;
      return (
        <div className={cn('w-full min-h-screen', className)}>
          <iframe
            srcDoc={iframeContent}
            title={`Generated Page: ${moduleName}`}
            className="w-full h-screen border-0"
            sandbox="allow-same-origin allow-scripts"
            loading="lazy"
          />
        </div>
      );
    };
  } catch (e) {
    console.log(e);
    return function ErrorComponent() {
      return <div>Error rendering generated page component</div>;
    };
  }
}

export default MagicUIPage; 