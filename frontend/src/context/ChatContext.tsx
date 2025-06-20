import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
  selectedUser: any | null;
  setSelectedUser: (user: any | null) => void;
  selectedGroup: any | null;
  setSelectedGroup: (group: any | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  const value = {
    selectedChat,
    setSelectedChat,
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
