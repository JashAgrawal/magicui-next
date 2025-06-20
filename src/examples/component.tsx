import React from 'react';
import { MagicUIProvider, MagicUI } from '@/components/magic-ui';

const exampleTheme = {
  primary: '#3b82f6',
  background: '#ffffff',
  text: '#1f2937',
};

const examplePRD = `\n# Product Card\nDisplay a product with image, name, and price.`;

const productData = {
  id: 1,
  name: 'Wireless Headphones',
  price: 99.99,
  image: 'https://placehold.co/300x200',
};

const MagicUIComponent = () => {
  return (
    <MagicUIProvider theme={exampleTheme} projectPrd={examplePRD} apiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY}>
      <div className="max-w-md mx-auto mt-8">
        <MagicUI
          moduleName="product-card"
          description="Show a product card with image, name, and price."
          data={productData}
        />
      </div>
    </MagicUIProvider>
  );
};

export default MagicUIComponent;