import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PiggyBank } from 'lucide-react';

const Budget: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Budget - FinGenius</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-600 mt-1">Create and manage your budgets with AI insights</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <PiggyBank className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Budget Planning Coming Soon</h3>
              <p className="text-gray-600">AI-powered budget planning will be available soon.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Budget; 