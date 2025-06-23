import { useState, useCallback } from 'react';
import { useMagicUIActions } from '@/lib/store/magic-ui-store';
import { UIGenerationRequest, UIGenerationResponse } from '@/types/magic-ui';

interface UseUIGenerationOptions {
  moduleName: string;
}

interface UseUIGenerationResult {
  generateUI: (request: UIGenerationRequest, forceRegenerate?: boolean) => Promise<UIGenerationResponse | null>;
  isLoading: boolean;
  error: string | null;
}

export function useUIGeneration({ moduleName }: UseUIGenerationOptions): UseUIGenerationResult {
  const actions = useMagicUIActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateUI = useCallback(async (
    requestData: UIGenerationRequest,
    forceRegenerate: boolean = false
  ): Promise<UIGenerationResponse | null> => {
    actions.updateModuleState(moduleName, {
      isGenerating: true,
      error: null,
      lastGenerated: !forceRegenerate ? new Date() : undefined, // Only update lastGenerated if not forcing, to keep original gen time
    });
    setIsLoading(true);
    setError(null);

    const requestPayload: UIGenerationRequest = {
      ...requestData,
      forceRegenerate,
    };

    try {
      const apiResponse = await fetch('/api/generate-magic-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!apiResponse.ok) {
        const errorResult = await apiResponse.json().catch(() => ({ error: `API request failed with status ${apiResponse.status}` }));
        throw new Error(errorResult.error || `API request failed with status ${apiResponse.status}`);
      }

      const result = await apiResponse.json() as UIGenerationResponse;

      if (result.success && result.code) {
        actions.updateModuleState(moduleName, {
          isGenerating: false,
          currentVersion: result.version || '1.0.0',
          lastGenerated: new Date(), // Update with actual generation time
        });
        actions.addLog(moduleName, {
          type: 'info',
          message: `Successfully fetched UI component (v${result.version || '1.0.0'})`,
          data: JSON.stringify({ version: result.version }),
        });
        setIsLoading(false);
        return result;
      } else {
        const errorMessage = result.error || 'Failed to generate UI via API (unknown error)';
        setError(errorMessage);
        actions.updateModuleState(moduleName, {
          isGenerating: false,
          error: errorMessage,
        });
        actions.addLog(moduleName, {
          type: 'error',
          message: 'Failed to fetch UI component via API',
          data: JSON.stringify({ error: errorMessage }),
        });
        setIsLoading(false);
        return result; // Return the error response
      }
    } catch (e: any) {
      const catchErrorMsg = e.message || 'API call failed unexpectedly';
      setError(catchErrorMsg);
      actions.updateModuleState(moduleName, {
        isGenerating: false,
        error: catchErrorMsg,
      });
      actions.addLog(moduleName, {
        type: 'error',
        message: 'API call threw an exception',
        data: JSON.stringify({ error: catchErrorMsg }),
      });
      setIsLoading(false);
      return { success: false, error: catchErrorMsg, version: requestData.versionNumber || "1" };
    }
  }, [actions, moduleName]);

  return { generateUI, isLoading, error };
}
