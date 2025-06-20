'use client';

import React from 'react';
import { MagicUIProvider, MagicUI } from '@/components/magic-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Sample theme configuration
const sampleTheme = {
  primary: '#3b82f6',
  secondary: '#64748b',
  background: '#ffffff',
  text: '#1f2937',
  border: '#e5e7eb',
  radius: '0.5rem',
  spacing: '1rem',
};

// Sample PRD
const samplePRD = `
# Product Requirements Document - E-commerce Dashboard

## Overview
Create modern, responsive UI components for an e-commerce dashboard that displays products, user information, and analytics data.

## Design Guidelines
- Use clean, minimal design with plenty of white space
- Implement responsive design that works on mobile and desktop
- Use consistent spacing and typography
- Include hover effects and smooth transitions
- Ensure accessibility with proper ARIA labels

## Component Requirements
- Product cards should display image, name, price, and rating
- User profiles should show avatar, name, role, and status
- Data tables should be sortable and filterable
- Charts should be interactive and responsive
- Forms should have proper validation and error states

## Brand Guidelines
- Primary color: Blue (#3b82f6)
- Secondary color: Gray (#64748b)
- Use rounded corners (0.5rem)
- Consistent spacing using 1rem base unit
`;

// Sample data for different components
const productData = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    image: "https://example.com/nonexistent-headphones.jpg", // Failing URL
    rating: 4.5,
    reviews: 128,
    inStock: true,
    category: "Electronics"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 249.99,
    image: "https://placehold.co/300x200", // This one can be a valid placeholder
    rating: 4.8,
    reviews: 89,
    inStock: true,
    category: "Electronics"
  },
  {
    id: 3,
    name: "Coffee Maker",
    price: 79.99,
    image: "/images/nonexistent-coffeemaker.png", // Failing URL
    rating: 4.2,
    reviews: 156,
    inStock: false,
    category: "Home & Kitchen"
  }
];

const userData = {
  id: 1,
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  role: "Product Manager",
  avatar: "https://example.com/nonexistent-avatar.png", // Failing URL
  status: "online",
  joinDate: "2023-01-15",
  department: "Product",
  location: "San Francisco, CA"
};

const analyticsData = {
  totalSales: 125000,
  totalOrders: 1250,
  averageOrderValue: 100,
  conversionRate: 3.2,
  topProducts: [
    { name: "Wireless Headphones", sales: 45 },
    { name: "Smart Watch", sales: 32 },
    { name: "Coffee Maker", sales: 28 }
  ],
  salesByMonth: [
    { month: "Jan", sales: 12000 },
    { month: "Feb", sales: 15000 },
    { month: "Mar", sales: 18000 },
    { month: "Apr", sales: 22000 },
    { month: "May", sales: 25000 },
    { month: "Jun", sales: 28000 }
  ]
};

export default function MagicUIDemoPage() {
  return (
    <MagicUIProvider theme={sampleTheme} projectPrd={samplePRD}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">MagicUI Demo</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the power of AI-generated UI components. Each component below is 
              dynamically generated based on the provided data and requirements.
            </p>
          </div>

          {/* Demo Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Product Cards Component */}
            <Card>
              <CardHeader>
                <CardTitle>Product Cards</CardTitle>
                <p className="text-sm text-gray-600">
                  AI-generated product display component
                </p>
              </CardHeader>
              <CardContent>
                <MagicUI
                  moduleName="product-cards"
                  description="Create a responsive grid of product cards showing product information with {{name}}, {{price}}, {{rating}}, and {{category}}. Images at {{image}} should have fallbacks to https://placehold.co/300x200 if they fail to load."
                  data={productData}
                  className="min-h-[300px]"
                />
              </CardContent>
            </Card>

            {/* User Profile Component */}
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <p className="text-sm text-gray-600">
                  AI-generated user profile component
                </p>
              </CardHeader>
              <CardContent>
                <MagicUI
                  moduleName="user-profile"
                  description="Create a user profile card displaying user information: {{name}}, {{role}}, {{status}}. The avatar image at {{avatar}} should include a fallback to https://placehold.co/100x100."
                  data={userData}
                  className="min-h-[300px]"
                />
              </CardContent>
            </Card>

            {/* Analytics Dashboard Component */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <p className="text-sm text-gray-600">
                  AI-generated analytics dashboard with metrics and charts
                </p>
              </CardHeader>
              <CardContent>
                <MagicUI
                  moduleName="analytics-dashboard"
                  description="Create an analytics dashboard showing key metrics, sales data (e.g. {{totalSales}}), and top products with visual charts and statistics. If any images are used (e.g. for product icons), they should have fallbacks to https://placehold.co/50x50."
                  data={analyticsData}
                  className="min-h-[400px]"
                />
              </CardContent>
            </Card>

            {/* Simple Data Table Component */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Product Table</CardTitle>
                <p className="text-sm text-gray-600">
                  AI-generated data table component
                </p>
              </CardHeader>
              <CardContent>
                <MagicUI
                  moduleName="product-table"
                  description="Create a responsive data table for products (showing {{name}}, {{price}}, {{category}}). If product images are included in rows from {{image}}, they must have fallbacks to https://placehold.co/80x80."
                  data={productData}
                  className="min-h-[300px]"
                />
              </CardContent>
            </Card>

          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">How to Use MagicUI</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 space-y-2">
              <p>1. <strong>Wrap your app</strong> with MagicUIProvider and provide theme + PRD</p>
              <p>2. <strong>Use MagicUI components</strong> with moduleName, description, and data</p>
              <p>3. <strong>Click "Regenerate"</strong> to create new versions of any component</p>
              <p>4. <strong>Version history</strong> is automatically saved in localStorage</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </MagicUIProvider>
  );
}
