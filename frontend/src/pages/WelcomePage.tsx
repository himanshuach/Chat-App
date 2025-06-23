import React from 'react';
import { Button } from '../components/common';
import { MessageSquare, Users, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-sky-400 to-indigo-600 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 text-center shadow-lg">
        <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
                <MessageSquare size={60} className="text-blue-600" />
            </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to Chitchat
        </h1>
        
        <p className="mx-auto mt-4 text-lg text-gray-600">
          Messaging redefined — A Pulse of Connection with those who matter most, Connect with friends and family.
        </p>
        
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center gap-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <h3 className="font-semibold text-gray-700">Real-time Chat</h3>
            <p className="text-sm text-gray-500">Instant one-on-one and group messaging.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h3 className="font-semibold text-gray-700">Group Management</h3>
            <p className="text-sm text-gray-500">Create, join, and manage chat groups.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Lock className="h-8 w-8 text-blue-600" />
            <h3 className="font-semibold text-gray-700">Secure & Private</h3>
            <p className="text-sm text-gray-500">Your conversations are important to us.</p>
          </div>
        </div>
        
        <Button
          variant="primary"
          size="large"
          onClick={handleGetStarted}
          className="mt-12 w-full max-w-xs"
        >
          Let's dive!
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;
