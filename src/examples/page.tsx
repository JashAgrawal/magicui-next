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
    { name: 'Wireless Headphones', sales: 45 },
    { name: 'Smart Watch', sales: 32 },
    { name: 'Coffee Maker', sales: 28 },
  ],
};

const MagicUIPageExample = () => {
  return (
    <MagicUIProvider theme={exampleTheme} projectPrd={examplePRD} apiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY}>
      <MagicUIPage
        moduleName="dashboard-page"
        description="Show a dashboard page with total sales and a list of top products."
        data={dashboardData}
        
      />
    </MagicUIProvider>
  );
};

export default MagicUIPageExample;