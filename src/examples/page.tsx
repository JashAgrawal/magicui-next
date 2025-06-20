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
        id='dahh'
        moduleName="dashboard-page"
        description="create an awesome dashboard page to display this data"
        data={dashboardData}
      />
    </MagicUIProvider>
  );
};

export default MagicUIPageExample;