import React from 'react';
import { MagicUIProvider, MagicUI } from '@/components/magic-ui';
import { MagicUIPage } from '@/components/magic-ui/MagicUIPage';

const exampleTheme = {
  primary: '#3b82f6',
  background: '#ffffff',
  text: '#1f2937',
};

const examplePRD = `\n# Dashboard Page\nCreate a dashboard page showing total sales and a list of top products.`;

const dashboardData = {
  totalSales: 12000,
  topProducts: [
    { name: 'Wireless Headphones', sales: 45, imageUrl: "https://example.com/nonexistent-headphones.jpg" }, // Added failing imageUrl
    { name: 'Smart Watch', sales: 32, imageUrl: "https://placehold.co/80x80" }, // Valid placeholder
    { name: 'Coffee Maker', sales: 28, imageUrl: "/images/nonexistent-coffee.png" }, // Added failing imageUrl
  ],
  // Example of a main hero image for the page, which might also need a fallback
  heroImage: "https://example.com/nonexistent-dashboard-hero.jpg"
};

const MagicUIPageExample = () => {
  return (
    <MagicUIProvider theme={exampleTheme} projectPrd={examplePRD} apiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY}>
      <MagicUIPage
        moduleName="dashboard-page"
        description="Show a dashboard page with total sales ({{totalSales}}) and a list of top products. Each product in the list ({{topProducts}}) might have a name ({{name}}), sales ({{sales}}), and an image ({{imageUrl}}). All images, including any main page images like {{heroImage}}, must include fallbacks to https://placehold.co/ (e.g., 600x400 for main, 80x80 for product list items) if the original image fails to load."
        data={dashboardData}

      />
    </MagicUIProvider>
  );
};

export default MagicUIPageExample;