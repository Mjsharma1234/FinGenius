import React from 'react';
import { Helmet } from 'react-helmet-async';
import { User } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Profile - FinGenius</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management Coming Soon</h3>
              <p className="text-gray-600">Profile settings and preferences will be available soon.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile; 