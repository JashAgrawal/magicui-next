'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useMagicUIContext } from '@/contexts/MagicUIContext';
import { useMagicUIActions, useModule } from '@/nLib/magic-ui-store';
import { magicUIService } from '@/nLib/magic-ui-service';
import { MagicUIErrorBoundary } from './MagicUIErrorBoundary';
import { RegenerateButton } from './RegenerateButton';
import { LoadingOverlay } from './LoadingSpinner';
import type { MagicUIProps, UIGenerationRequest } from '@/types/magic-ui';

export function MagicUI({
  id,
  moduleName,
  description,
  data,
  versionNumber,
  className
}: MagicUIProps) {
  // All hooks must be called unconditionally at the top level
  const { theme, projectPrd, isInitialized, geminiClient } = useMagicUIContext();
  const {
    isGenerating,
    error: moduleError,
    currentVersion: moduleVersion
  } = useModule(moduleName);
  const actions = useMagicUIActions();
  
  const [generatedComponent, setGeneratedComponent] = useState<React.ComponentType<{ data: any; className?: string }> | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);
  
  // Track if we have all required data
  const hasRequiredData = isInitialized && geminiClient;
  
  // Generate or load UI component
  const generateUI = React.useCallback(async (forceRegenerate = false) => {
    if (!isInitialized || !geminiClient) {
      console.error('MagicUI not properly initialized');
      return;
    }

    try {
      // Update module state to indicate generation is in progress
      actions.updateModuleState(moduleName, {
        isGenerating: true,
        error: null,
        lastGenerated: new Date()
      });

      setComponentError(null);

      const request: UIGenerationRequest = {
        id,
        moduleName,
        description,
        data, // Data is still passed for AI context during initial generation
        projectPrd: projectPrd || '',
        theme: theme || {},
        versionNumber: forceRegenerate ? undefined : versionNumber,
        forceRegenerate: forceRegenerate ? true : false,
      };

      const result = await magicUIService.generateUI(request);

      if (result.success && result.code) {
        // Create the component from generated code
        const component = createComponentFromCode(result.code, moduleName);
        setGeneratedComponent(() => component);
        
        // Update module state with success
        actions.updateModuleState(moduleName, { 
          isGenerating: false,
          currentVersion: result.version || '1.0.0',
          lastGenerated: new Date()
        });
        
        // Add log entry
        actions.addLog(moduleName, {
          type: 'info',
          message: `Successfully generated UI component (v${result.version || '1.0.0'})`,
          data: JSON.stringify({ version: result.version })
        });
      } else {
        throw new Error(result.error || 'Failed to generate UI');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setComponentError(errorMessage);
      
      // Update module state with error
      actions.updateModuleState(moduleName, { 
        isGenerating: false,
        error: errorMessage
      });
      
      // Add error log
      actions.addLog(moduleName, {
        type: 'error',
        message: 'Failed to generate UI component',
        data: JSON.stringify({ error: errorMessage })
      });
    }
  }, [
    id,
    isInitialized,
    moduleName,
    description,
    // data, // Removed data from dependency array
    projectPrd,
    theme,
    versionNumber,
    actions,
    geminiClient
  ]);

  // Handle regeneration
  const handleRegenerate = React.useCallback(() => {
    generateUI(true);
  }, [generateUI]);

  // Initial generation
  useEffect(() => {
    if (hasRequiredData) {
      generateUI(false);
    }
  }, [hasRequiredData, generateUI, id]);

  // Loading state
  if (!isInitialized || !hasRequiredData) {
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
      />
    </div>
  );
}

/**
 * Create a React component from generated code string
 */
function createComponentFromCode(templateCode: string, moduleName: string): React.ComponentType<any> {
  try {
    // Create a component that renders the generated UI in an iframe
    return function GeneratedComponent({ data: instanceData, className }: any) {
      let instanceSpecificHtml = templateCode;
      if (instanceData && typeof instanceData === 'object') {
        for (const key in instanceData) {
          if (Object.prototype.hasOwnProperty.call(instanceData, key)) {
            const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            // Ensure data[key] is a string or can be converted to one.
            const value = String(instanceData[key] !== null && instanceData[key] !== undefined ? instanceData[key] : '');
            instanceSpecificHtml = instanceSpecificHtml.replace(placeholder, value);
          }
        }
      }
      // Any placeholders not in instanceData will remain. Consider replacing them with empty strings.
      instanceSpecificHtml = instanceSpecificHtml.replace(/{{\s*[^}]+\s*}}/g, ''); // Optional: remove unreplaced placeholders

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
                padding: 1rem;
              }
            </style>
          </head>
          <body class="bg-white">
            ${instanceSpecificHtml}
          </body>
        </html>
      `;

      return (
        <div className={cn('w-full h-full', className)}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">{moduleName}</h3>
          </div>
          <div className="relative border rounded-lg overflow-hidden bg-white shadow-sm">
            <iframe
              srcDoc={iframeContent}
              title={`Generated UI: ${moduleName}`}
              className="w-full min-h-[300px] border-0"
              sandbox="allow-same-origin allow-scripts"
              loading="lazy"
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p>Preview of generated UI component</p>
          </div>
        </div>
      );
    };
  } catch (error) {
    console.error('Failed to create component from code:', error);
    
    // Fallback component
    return function ErrorComponent({ data }: any) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-800 font-medium">Failed to render generated component</p>
          <p className="text-red-600 text-sm mt-1">Module: {moduleName}</p>
        </div>
      );
    };
  }
}

export default MagicUI;
