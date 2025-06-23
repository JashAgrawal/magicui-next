'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useMagicUIContext } from '@/contexts/MagicUIContext';
import { useMagicUIActions, useModule } from '@/nLib/magic-ui-store';
import { MagicUIErrorBoundary } from './MagicUIErrorBoundary';
import { RegenerateButton } from './RegenerateButton';
import { LoadingOverlay } from './LoadingSpinner';
import type { MagicUIProps, UIGenerationRequest, UIGenerationResponse } from '@/types/magic-ui';
import DynamicRenderer from './dynamic-renderer';

export function MagicUI({
  id,
  moduleName,
  description,
  data,
  versionNumber,
  className,
  aiConfig
}: MagicUIProps) {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('MagicUI: The "id" prop is required and must be a non-empty string.');
  }

  const { theme, projectPrd, isInitialized } = useMagicUIContext();
  const {
    isGenerating,
    error: moduleError,
  } = useModule(moduleName);
  const actions = useMagicUIActions();

  const [generatedComponent, setGeneratedComponent] = useState<React.ComponentType<{ data: any; className?: string }> | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);

  const hasRequiredClientData = isInitialized;

  const generateUI = React.useCallback(async (forceRegenerate = false) => {
    if (!isInitialized) {
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
      data,
      projectPrd: projectPrd || '',
      theme: theme || {},
      versionNumber: forceRegenerate ? undefined : versionNumber,
      forceRegenerate: forceRegenerate,
      aiConfig: aiConfig,
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
    isInitialized,
    moduleName,
    description,
    data,
    projectPrd,
    theme,
    versionNumber,
    actions,
    aiConfig,
  ]);

  const handleRegenerate = React.useCallback(() => {
    generateUI(true);
  }, [generateUI]);

  useEffect(() => {
    if (hasRequiredClientData) {
      generateUI(false);
    }
  }, [hasRequiredClientData, generateUI, id]);

  if (!hasRequiredClientData) {
    return (
      <div className={cn('p-4 border border-gray-200 rounded-lg bg-gray-50', className)}>
        <p className="text-gray-600 text-center">Initializing MagicUI...</p>
      </div>
    );
  }

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
  return function GeneratedComponentWrapper({ data: instanceData, className }: any) {
    return (
      <div className={cn('w-full h-full', className)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">{moduleName}</h3>
          <span className="text-xs text-gray-400">JSX Preview</span>
        </div>
        <div className="relative border rounded-lg overflow-hidden bg-white shadow-sm">
          <DynamicRenderer codeString={jsxCodeString} data={instanceData} />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <p>Preview of AI-generated React (JSX) component.</p>
        </div>
      </div>
    );
  };
}

export default MagicUI;
