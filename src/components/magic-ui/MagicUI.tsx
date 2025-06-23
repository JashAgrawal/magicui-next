'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useMagicUIContext } from '@/contexts/MagicUIContext';
import { useModule } from '@/lib/store/magic-ui-store';
import { MagicUIErrorBoundary } from './MagicUIErrorBoundary';
import { RegenerateButton } from './RegenerateButton';
import { LoadingOverlay } from './LoadingSpinner';
import type { MagicUIProps, UIGenerationRequest } from '@/types/magic-ui';
import DynamicRenderer from './dynamic-renderer';
import { useUIGeneration } from '@/hooks/useUIGeneration';

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
  const { isGenerating: isGeneratingFromStore, error: moduleError } = useModule(moduleName);

  const {
    generateUI: performGeneration,
    isLoading: isLoadingFromHook,
    error: hookError
  } = useUIGeneration({ moduleName });

  const [generatedComponent, setGeneratedComponent] = useState<React.ComponentType<{ data: any; className?: string }> | null>(null);

  const isActuallyGenerating = isGeneratingFromStore || isLoadingFromHook;
  const displayError = hookError || moduleError;

  const callGenerateUI = useCallback(async (forceRegenerate = false) => {
    if (!isInitialized) {
      console.error('MagicUI context not properly initialized');
      return;
    }

    const request: UIGenerationRequest = {
      id,
      moduleName,
      description,
      data,
      projectPrd: projectPrd || '',
      theme: theme || {},
      versionNumber: forceRegenerate ? undefined : versionNumber,
      aiConfig: aiConfig,
      // forceRegenerate is handled by the hook's generateUI function's second param
    };

    const result = await performGeneration(request, forceRegenerate);

    if (result && result.success && result.code) {
      const component = createComponentFromCode(result.code, moduleName);
      setGeneratedComponent(() => component);
      // Store updates are handled by the hook
    }
    // Error state is also handled by the hook and reflected in displayError
  }, [
    id,
    isInitialized,
    moduleName,
    description,
    data,
    projectPrd,
    theme,
    versionNumber,
    aiConfig,
    performGeneration,
  ]);

  const handleRegenerate = useCallback(() => {
    callGenerateUI(true);
  }, [callGenerateUI]);

  useEffect(() => {
    if (isInitialized) {
      callGenerateUI(false);
    }
  }, [isInitialized, callGenerateUI, id]); // id is included as it's part of the request key usually

  if (!isInitialized) {
    return (
      <div className={cn('p-4 border border-gray-200 rounded-lg bg-gray-50', className)}>
        <p className="text-gray-600 text-center">Initializing MagicUI...</p>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className={cn('relative', className)}>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-800 font-medium">Failed to generate UI component</p>
          <p className="text-red-600 text-sm mt-1">{displayError}</p>
        </div>
        <RegenerateButton
          onRegenerate={handleRegenerate}
          isGenerating={isActuallyGenerating}
          positionStrategy='absolute-to-container'
        />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <MagicUIErrorBoundary>
        <LoadingOverlay isLoading={isActuallyGenerating}>
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
        isGenerating={isActuallyGenerating}
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
