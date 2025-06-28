import React from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface ChatWindowProps {
  selectedUser?: {
    _id: string;
    username: string;
    profilePicture?: string;
    status: 'online' | 'offline' | 'away' | 'busy';
  };
  selectedGroup?: {
    _id: string;
    name: string;
    groupPicture?: string;
    members: Array<{
      _id: string;
      username: string;
      profilePicture?: string;
    }>;
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, selectedGroup }) => {
  const chatName = selectedUser?.username || selectedGroup?.name || 'Select a chat';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {chatName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{chatName}</h3>
            <p className="text-sm text-gray-500">
              {selectedUser ? 'Click to start chatting' : 'Group chat'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Welcome to {chatName}
          </h3>
          <p className="text-gray-500 max-w-md">
            This is where your messages will appear. Start a conversation by typing a message below.
          </p>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled
          />
          <button
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 