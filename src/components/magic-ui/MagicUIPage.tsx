'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useMagicUIContext } from '@/contexts/MagicUIContext';
import { useModule } from '@/lib/store/magic-ui-store';
import { MagicUIErrorBoundary } from './MagicUIErrorBoundary';
import { RegenerateButton } from './RegenerateButton';
import { LoadingOverlay } from './LoadingSpinner';
import type { MagicUIProps, UIGenerationRequest, AiProviderConfig } from '@/types/magic-ui';
import DynamicRenderer from './dynamic-renderer';
import { useUIGeneration } from '@/hooks/useUIGeneration';

export function MagicUIPage({ 
  id,
  moduleName, 
  description, 
  data, 
  versionNumber,
  className,
  aiConfig, // Use aiConfig from MagicUIProps
  apiKey // Keep apiKey for now if it's passed explicitly, but prefer aiConfig
}: MagicUIProps & { apiKey?: string }) { // apiKey could be part of aiConfig
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('MagicUIPage: The "id" prop is required and must be a non-empty string.');
  }
  const { theme, projectPrd, isInitialized } = useMagicUIContext();
  const { isGenerating: isGeneratingFromStore, error: moduleErrorFromStore } = useModule(moduleName);
  
  const {
    generateUI: performGeneration,
    isLoading: isLoadingFromHook,
    error: hookError
  } = useUIGeneration({ moduleName });

  const [generatedComponent, setGeneratedComponent] = useState<React.ComponentType<{ data: unknown; className?: string }> | null>(null);
  // const [componentError, setComponentError] = useState<string | null>(null); // Removed this line

  const isActuallyGenerating = isGeneratingFromStore || isLoadingFromHook;
  const displayError = hookError || moduleErrorFromStore;

  const callGenerateUI = useCallback(async (forceRegenerate = false) => {
    if (!isInitialized) {
      console.error('MagicUIPage context not properly initialized');
      return;
    }

    // Prioritize aiConfig prop, but construct one if only apiKey is available (legacy)
    let effectiveAiConfig: AiProviderConfig | undefined = aiConfig;
    if (!effectiveAiConfig && apiKey) {
      console.warn("MagicUIPage: Using deprecated 'apiKey' prop. Please use 'aiConfig' instead.");
      effectiveAiConfig = { provider: 'gemini', apiKey: apiKey }; // Assuming gemini or allowing API to default
    }


    const request: UIGenerationRequest = {
      id,
      moduleName,
      description,
      data,
      projectPrd: projectPrd || '',
      theme: theme || {},
      versionNumber: forceRegenerate ? undefined : versionNumber,
      isFullPage: true,
      aiConfig: effectiveAiConfig,
      // forceRegenerate is handled by the hook's generateUI function's second param
    };

    const result = await performGeneration(request, forceRegenerate);

    if (result && result.success && result.code) {
      const component = createComponentFromCode(result.code);
      setGeneratedComponent(() => component);
      // Store updates are handled by the hook
    }
    // Error state is also handled by the hook
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
    apiKey, // include if still used as fallback
    performGeneration,
  ]);

  const handleRegenerate = useCallback(() => {
    callGenerateUI(true);
  }, [callGenerateUI]);

  useEffect(() => {
    if (isInitialized) {
      callGenerateUI(false);
    }
  }, [isInitialized, callGenerateUI, id]);

  if (!isInitialized) {
    return (
      <div className={cn('min-h-screen p-4 bg-gray-50', className)}>
        <p className="text-gray-600 text-center">Initializing MagicUIPage...</p>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className={cn('min-h-screen relative', className)}>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 m-4">
          <p className="text-red-800 font-medium">Failed to generate full page UI</p>
          <p className="text-red-600 text-sm mt-1">{displayError}</p>
        </div>
        <RegenerateButton 
          onRegenerate={handleRegenerate}
          isGenerating={isActuallyGenerating}
        />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen relative', className)}>
      <MagicUIErrorBoundary>
        <LoadingOverlay isLoading={isActuallyGenerating}>
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
        isGenerating={isActuallyGenerating}
      />
    </div>
  );
}

function createComponentFromCode(code: string): React.ComponentType<{ data: unknown; className?: string }> {
  return function GeneratedPageComponent({ data, className }: { data: unknown; className?: string }) {
    return (
      <div className={cn('w-full min-h-screen', className)}>
        <DynamicRenderer codeString={code} data={data} />
      </div>
    );
  };
}

export default MagicUIPage; 