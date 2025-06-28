import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import ProfileModal from '../components/Modals/ProfileModal';
import { LogOut, User, Settings, ArrowLeft } from 'lucide-react';

interface ChatPageProps {
  // Add props as needed
}

const ChatPage: React.FC<ChatPageProps> = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleProfileModalToggle = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Chitchat</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Welcome, {user?.username || 'User'}
          </span>
          
          <button
            onClick={handleProfileModalToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Profile"
          >
            <User className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        <div className="w-full max-w-7xl mx-auto bg-white flex shadow-lg rounded-lg overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col bg-white">
            <ChatWindow />
          </div>
        </div>
      </div>
      
      {isProfileModalOpen && (
        <ProfileModal onClose={handleProfileModalToggle} />
      )}
    </div>
  );
};

export default ChatPage;
