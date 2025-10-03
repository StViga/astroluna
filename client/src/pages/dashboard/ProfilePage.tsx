import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white border-opacity-30 mx-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Your Profile</h1>
        <p className="text-lg text-gray-600 mb-8">Manage your account settings and preferences</p>
        <div className="text-6xl mb-4">👤</div>
        <p className="text-gray-500">Profile page coming soon...</p>
      </div>
    </div>
  );
};

export default ProfilePage;