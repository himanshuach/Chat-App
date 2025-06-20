import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import ProfileModal from '../components/Modals/ProfileModal';
import './ChatPage.css';

interface ChatPageProps {
  // Add props as needed
}

const ChatPage: React.FC<ChatPageProps> = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
  };

  const handleProfileModalToggle = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <Sidebar />
        <div className="chat-content">
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
