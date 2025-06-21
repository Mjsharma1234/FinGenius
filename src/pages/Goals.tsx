import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Target } from 'lucide-react';

const Goals: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Goals - FinGenius</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
          <p className="text-gray-600 mt-1">Set and track your financial goals with gamification</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Goal Tracking Coming Soon</h3>
              <p className="text-gray-600">Gamified goal tracking will be available soon.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Goals; 