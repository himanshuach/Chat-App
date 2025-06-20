import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  receiver: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  status: 'sent' | 'delivered' | 'read';
  isGroupMessage: boolean;
  group?: string;
  reactions?: Array<{
    user: {
      _id: string;
      username: string;
      profilePicture?: string;
    };
    emoji: string;
    createdAt: Date;
  }>;
  replyTo?: {
    _id: string;
    content: string;
    sender: {
      _id: string;
      username: string;
      profilePicture?: string;
    };
  };
  edited?: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TypingData {
  room: string;
  userId: string;
  isTyping: boolean;
  username: string;
}

interface StatusData {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
}

interface ReactionData {
  messageId: string;
  userId: string;
  emoji: string;
  timestamp: Date;
}

interface ReadReceiptData {
  messageId: string;
  readBy: string;
  readAt: Date;
}

export const useSocket = () => {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) return;

    const socket = io('http://localhost:5000', {
      auth: {
        token
      }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Setup user
      socket.emit('setup', { _id: user._id });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connected', () => {
      console.log('User setup complete');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  // Join chat room
  const joinChat = useCallback((room: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join chat', room);
    }
  }, []);

  // Leave chat room
  const leaveChat = useCallback((room: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave chat', room);
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((room: string, isTyping: boolean) => {
    if (socketRef.current && user) {
      socketRef.current.emit('typing', {
        room,
        userId: user._id,
        isTyping
      });
    }
  }, [user]);

  // Send message
  const sendMessage = useCallback((message: Message) => {
    if (socketRef.current) {
      socketRef.current.emit('new message', message);
    }
  }, []);

  // Send message read receipt
  const sendReadReceipt = useCallback((messageId: string, room: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('message read', {
        messageId,
        userId: user._id,
        room
      });
    }
  }, [user]);

  // Send message reaction
  const sendReaction = useCallback((messageId: string, emoji: string, room: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('message reaction', {
        messageId,
        userId: user._id,
        emoji,
        room
      });
    }
  }, [user]);

  // Update user status
  const updateStatus = useCallback((status: 'online' | 'offline' | 'away' | 'busy') => {
    if (socketRef.current && user) {
      socketRef.current.emit('status change', {
        userId: user._id,
        status
      });
    }
  }, [user]);

  // Listen for new messages
  const onMessageReceived = useCallback((callback: (message: Message) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message received', callback);
    }
  }, []);

  // Listen for typing indicators
  const onTyping = useCallback((callback: (data: TypingData) => void) => {
    if (socketRef.current) {
      socketRef.current.on('typing', (data: TypingData) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (data.isTyping) {
            if (!newMap.has(data.room)) {
              newMap.set(data.room, new Set());
            }
            newMap.get(data.room)!.add(data.userId);
          } else {
            newMap.get(data.room)?.delete(data.userId);
            if (newMap.get(data.room)?.size === 0) {
              newMap.delete(data.room);
            }
          }
          return newMap;
        });
        callback(data);
      });
    }
  }, []);

  // Listen for stop typing
  const onStopTyping = useCallback((callback: (data: Omit<TypingData, 'isTyping'>) => void) => {
    if (socketRef.current) {
      socketRef.current.on('stop typing', (data) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.get(data.room)?.delete(data.userId);
          if (newMap.get(data.room)?.size === 0) {
            newMap.delete(data.room);
          }
          return newMap;
        });
        callback(data);
      });
    }
  }, []);

  // Listen for friend online/offline
  const onFriendStatusChange = useCallback((callback: (data: StatusData) => void) => {
    if (socketRef.current) {
      socketRef.current.on('friend_online', (data: StatusData) => {
        setOnlineUsers(prev => new Set(prev).add(data.userId));
        callback(data);
      });

      socketRef.current.on('friend_offline', (data: StatusData) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
        callback(data);
      });

      socketRef.current.on('friend_status_change', callback);
    }
  }, []);

  // Listen for message reactions
  const onMessageReaction = useCallback((callback: (data: ReactionData) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message reaction', callback);
    }
  }, []);

  // Listen for read receipts
  const onReadReceipt = useCallback((callback: (data: ReadReceiptData) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message read receipt', callback);
    }
  }, []);

  // Listen for message status updates
  const onMessageStatusUpdate = useCallback((callback: (data: { messageId: string; status: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message status update', callback);
    }
  }, []);

  // Cleanup listeners
  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('message received');
      socketRef.current.off('typing');
      socketRef.current.off('stop typing');
      socketRef.current.off('friend_online');
      socketRef.current.off('friend_offline');
      socketRef.current.off('friend_status_change');
      socketRef.current.off('message reaction');
      socketRef.current.off('message read receipt');
      socketRef.current.off('message status update');
    }
  }, []);

  return {
    isConnected,
    typingUsers,
    onlineUsers,
    joinChat,
    leaveChat,
    sendTyping,
    sendMessage,
    sendReadReceipt,
    sendReaction,
    updateStatus,
    onMessageReceived,
    onTyping,
    onStopTyping,
    onFriendStatusChange,
    onMessageReaction,
    onReadReceipt,
    onMessageStatusUpdate,
    cleanup
  };
}; 