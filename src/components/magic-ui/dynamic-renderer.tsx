'use client';

import React, { useEffect, useState } from 'react';
import * as Babel from '@babel/standalone';
import IsolatedRenderer from './iframeRenderer';

interface DynamicRendererProps {
  codeString: string;
  data: any;
  isFullPage?: boolean;
  aiProps?: Record<string, any>; // Additional props for AI (function descriptors, etc)
}

const DynamicRenderer: React.FC<DynamicRendererProps> = ({ codeString, data, isFullPage = false, aiProps = {} }) => {
  const [Component, setComponent] = useState<React.FC<{ data: any; [key: string]: any }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localData, setLocalData] = useState<any>(data);

  // Prepare props to inject: for each aiProp, pass both the function and the descriptor
  const injectedProps: Record<string, any> = {};
  Object.entries(aiProps).forEach(([key, value]) => {
    if (value && typeof value === 'object' && 'func' in value) {
      injectedProps[key] = value.func;
      injectedProps[`${key}Descriptor`] = { ...value, func: undefined };
    } else {
      injectedProps[key] = value;
    }
  });
  // Also provide setData so AI can update state if it wants
  injectedProps.setData = setLocalData;

  useEffect(() => {
    try {
      const wrappedCode = `(${codeString})`;

      const compiled = Babel.transform(wrappedCode, {
        presets: ['react'],
        filename: 'component.js',
      }).code;

      if (!compiled) throw new Error('Code could not be compiled.');

      // This safely evaluates the compiled function and returns it
      const componentFunc = new Function('React', `
        "use strict";
        const Component = ${compiled};
        return Component;
      `)(React);

      if (typeof componentFunc !== 'function') {
        throw new Error('Evaluated code is not a React component.');
      }

      setComponent(() => componentFunc);
    } catch (err: any) {
      console.error('DynamicRenderer error:', err);
      setError(err.message || 'Unknown error');
    }
  }, [codeString]);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!Component) return <div className="p-4">Loading...</div>;

  return (
    <IsolatedRenderer className={isFullPage ? "h-screen" : ""}>
      {/* Pass localData as data, plus all injectedProps (functions, descriptors, setData) */}
      <Component data={localData} {...injectedProps} />
    </IsolatedRenderer>
  );
  // return <Component data={data}/>
};

export default DynamicRenderer;
