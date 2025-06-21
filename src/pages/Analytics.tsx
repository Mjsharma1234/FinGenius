import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BarChart3 } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Analytics - FinGenius</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Advanced financial analytics and insights</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">Advanced analytics with D3.js visualizations will be available soon.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics; 