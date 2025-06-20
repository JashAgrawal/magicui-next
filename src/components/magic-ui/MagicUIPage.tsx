'use client'
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useMagicUIContext } from '@/contexts/MagicUIContext';
import { useMagicUIActions, useModule } from '@/nLib/magic-ui-store';
import { magicUIService } from '@/nLib/magic-ui-service';
import { MagicUIErrorBoundary } from './MagicUIErrorBoundary';
import { RegenerateButton } from './RegenerateButton';
import { LoadingOverlay } from './LoadingSpinner';
import type { MagicUIProps, UIGenerationRequest } from '@/types/magic-ui';

export function MagicUIPage({ 
  moduleName, 
  description, 
  data, 
  versionNumber,
  className 
}: MagicUIProps) {
  const { theme, projectPrd, isInitialized, geminiClient } = useMagicUIContext();
  const {
    isGenerating,
    error: moduleError,
    currentVersion: moduleVersion
  } = useModule(moduleName);
  const actions = useMagicUIActions();
  
  const [generatedComponent, setGeneratedComponent] = useState<React.ComponentType<{ data: any; className?: string }> | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);
  
  const hasRequiredData = isInitialized && geminiClient;
  
  const generateUI = React.useCallback(async (forceRegenerate = false) => {
    if (!isInitialized || !geminiClient) {
      console.error('MagicUIPage not properly initialized');
      return;
    }

    try {
      actions.updateModuleState(moduleName, { 
        isGenerating: true,
        error: null,
        lastGenerated: new Date()
      });
      
      setComponentError(null);

      const request: UIGenerationRequest = {
        moduleName,
        description,
        data,
        projectPrd: projectPrd || '',
        theme: theme || {},
        versionNumber: forceRegenerate ? undefined : versionNumber,
        isFullPage: true,
        forceRegenerate: forceRegenerate ? true : false,
      };

      const result = await magicUIService.generateUI(request);

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
          message: `Successfully generated full page UI (v${result.version || '1.0.0'})`,
          data: JSON.stringify({ version: result.version })
        });
      } else {
        throw new Error(result.error || 'Failed to generate full page UI');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setComponentError(errorMessage);
      
      actions.updateModuleState(moduleName, { 
        isGenerating: false,
        error: errorMessage
      });
      
      actions.addLog(moduleName, {
        type: 'error',
        message: 'Failed to generate full page UI',
        data: JSON.stringify({ error: errorMessage })
      });
    }
  }, [
    isInitialized, 
    moduleName, 
    description, 
    data, 
    projectPrd, 
    theme, 
    versionNumber,
    actions,
    geminiClient
  ]);

  const handleRegenerate = React.useCallback(() => {
    generateUI(true);
  }, [generateUI]);

  useEffect(() => {
    if (hasRequiredData) {
      generateUI(false);
    }
  }, [hasRequiredData, generateUI]);

  if (!isInitialized || !hasRequiredData) {
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

function createComponentFromCode(code: string, moduleName: string): React.ComponentType<any> {
  try {
    return function GeneratedPageComponent({ data, className }: any) {
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
            ${code}
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
  } catch (error) {
    console.error('Failed to create page component from code:', error);
    
    return function ErrorComponent({ data }: any) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="p-4 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Failed to render generated page</p>
            <p className="text-red-600 text-sm mt-1">Module: {moduleName}</p>
          </div>
        </div>
      );
    };
  }
}

export default MagicUIPage; 