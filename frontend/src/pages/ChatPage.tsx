import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import ProfileModal from '../components/Modals/ProfileModal';

interface ChatPageProps {
  // Add props as needed
}

const ChatPage: React.FC<ChatPageProps> = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleProfileModalToggle = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex justify-center items-center">
      <div className="h-screen w-full max-w-7xl bg-white flex shadow-lg rounded-lg overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-white">
          <ChatWindow />
        </div>
      </div>
      {isProfileModalOpen && (
        <ProfileModal />
      )}
    </div>
  );
};

export default ChatPage;
