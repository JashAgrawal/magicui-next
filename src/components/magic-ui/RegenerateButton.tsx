'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';
import type { RegenerateButtonProps } from '@/types/magic-ui';

export function RegenerateButton({
  onRegenerate,
  isGenerating,
  className,
  positionStrategy = 'fixed-to-viewport',
}: RegenerateButtonProps) {
  const positionClasses = positionStrategy === 'fixed-to-viewport'
    ? 'fixed bottom-4 right-4'
    : 'absolute bottom-2 right-2';

  return (
    <Button
      onClick={onRegenerate}
      disabled={isGenerating}
      size="sm"
      variant="outline"
      className={cn(
        'z-50 shadow-lg hover:shadow-xl transition-all duration-200',
        positionClasses,
        'bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white',
        'text-gray-700 hover:text-gray-900',
        isGenerating && 'cursor-not-allowed opacity-75',
        className
      )}
      aria-label={isGenerating ? 'Regenerating UI...' : 'Regenerate UI'}
    >
      {isGenerating ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Regenerating...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate
        </>
      )}
    </Button>
  );
}

// Alternative inline regenerate button
export function InlineRegenerateButton({ 
  onRegenerate, 
  isGenerating, 
  className 
}: RegenerateButtonProps) {
  return (
    <Button
      onClick={onRegenerate}
      disabled={isGenerating}
      size="sm"
      variant="ghost"
      className={cn(
        'text-xs text-gray-500 hover:text-gray-700 h-6 px-2',
        isGenerating && 'cursor-not-allowed opacity-75',
        className
      )}
      aria-label={isGenerating ? 'Regenerating UI...' : 'Regenerate UI'}
    >
      {isGenerating ? (
        <>
          <LoadingSpinner size="sm" className="mr-1" />
          <span className="text-xs">Regenerating...</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3 h-3 mr-1" />
          <span className="text-xs">Regenerate</span>
        </>
      )}
    </Button>
  );
}
