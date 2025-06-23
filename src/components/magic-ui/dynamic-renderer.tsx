'use client';

import React, { useEffect, useState } from 'react';
import * as Babel from '@babel/standalone';

interface DynamicRendererProps {
  codeString: string;
  data: any;
}

const DynamicRenderer: React.FC<DynamicRendererProps> = ({ codeString, data }) => {
  const [Component, setComponent] = useState<React.FC<{ data: any }> | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!Component) return <div className="p-4">Loading...</div>;

  return <Component data={data} />;
};

export default DynamicRenderer;
