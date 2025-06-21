import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CreditCard, Plus } from 'lucide-react';

const Transactions: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Transactions - FinGenius</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">Manage and track your financial transactions</p>
          </div>
          <button className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </button>
        </div>

        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Transactions Coming Soon</h3>
              <p className="text-gray-600">This feature is under development and will be available soon.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Transactions; 