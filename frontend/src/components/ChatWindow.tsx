import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Send,
  AttachFile,
  Image,
  VideoFile,
  Description,
  MoreVert,
  Reply,
  Edit,
  Delete,
  ThumbUp,
  EmojiEmotions,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';

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
  const { user, token } = useAuth();
  const {
    isConnected,
    typingUsers,
    joinChat,
    leaveChat,
    sendTyping,
    sendMessage,
    sendReadReceipt,
    sendReaction,
    onMessageReceived,
    onTyping,
    onStopTyping,
    onMessageReaction,
    onReadReceipt,
    onMessageStatusUpdate
  } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [messageMenuAnchor, setMessageMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [reactionMenuAnchor, setReactionMenuAnchor] = useState<null | HTMLElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatId = selectedUser?._id || selectedGroup?._id;
  const chatName = selectedUser?.username || selectedGroup?.name;
  const chatPicture = selectedUser?.profilePicture || selectedGroup?.groupPicture;

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join/leave chat room
  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
      loadMessages();
      return () => {
        leaveChat(chatId);
      };
    }
  }, [chatId, joinChat, leaveChat]);

  // Socket event listeners
  useEffect(() => {
    if (!isConnected) return;

    onMessageReceived((message: Message) => {
      setMessages(prev => [...prev, message]);
      // Send read receipt
      if (message.sender._id !== user?._id) {
        sendReadReceipt(message._id, chatId!);
      }
    });

    onTyping((data) => {
      // Handle typing indicator
    });

    onStopTyping((data) => {
      // Handle stop typing
    });

    onMessageReaction((data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, reactions: [...(msg.reactions || []), { user: { _id: data.userId, username: '' }, emoji: data.emoji, createdAt: data.timestamp }] }
          : msg
      ));
    });

    onReadReceipt((data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, status: 'read' as const }
          : msg
      ));
    });

    onMessageStatusUpdate((data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, status: data.status as 'sent' | 'delivered' | 'read' }
          : msg
      ));
    });
  }, [isConnected, user, chatId, sendReadReceipt]);

  const loadMessages = async () => {
    if (!chatId || !token) return;

    try {
      const endpoint = selectedUser 
        ? `http://localhost:5000/api/messages/${chatId}`
        : `http://localhost:5000/api/groups/${chatId}/messages`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(chatId!, true);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendTyping(chatId!, false);
    }, 1000);

    setTypingTimeout(timeout);
  };

  const sendTextMessage = async () => {
    if (!newMessage.trim() || !chatId || !token) return;

    try {
      const messageData = {
        content: newMessage,
        receiverId: selectedUser?._id,
        type: 'text' as const,
        replyTo: replyTo?._id
      };

      const endpoint = selectedUser 
        ? 'http://localhost:5000/api/messages'
        : `http://localhost:5000/api/groups/${chatId}/messages`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setReplyTo(null);
        sendMessage(message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const uploadFile = async (file: File, type: 'image' | 'document' | 'video') => {
    if (!chatId || !token) return;

    setUploading(true);
    const formData = new FormData();
    formData.append(type, file);
    formData.append('receiverId', selectedUser?._id || '');
    formData.append('content', '');
    if (replyTo) formData.append('replyTo', replyTo._id);

    try {
      const endpoint = selectedUser 
        ? `http://localhost:5000/api/messages/upload-${type}`
        : `http://localhost:5000/api/groups/${chatId}/upload-${type}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        sendMessage(message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const fileType = file.type.split('/')[0];
    
    if (fileType === 'image') {
      uploadFile(file, 'image');
    } else if (fileType === 'video') {
      uploadFile(file, 'video');
    } else {
      uploadFile(file, 'document');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });

      if (response.ok) {
        sendReaction(messageId, emoji, chatId!);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newContent })
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, content: newContent, edited: true, editedAt: new Date() }
            : msg
        ));
        setEditingMessage(null);
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.sender._id === user?._id;
    const isTyping = typingUsers.get(chatId!)?.has(message.sender._id);

    return (
      <Box
        key={message._id}
        sx={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          mb: 2,
          position: 'relative'
        }}
      >
        {!isOwnMessage && (
          <Avatar
            src={message.sender.profilePicture}
            sx={{ mr: 1, width: 32, height: 32 }}
          >
            {message.sender.username[0]}
          </Avatar>
        )}

        <Box sx={{ maxWidth: '70%' }}>
          {!isOwnMessage && (
            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
              {message.sender.username}
            </Typography>
          )}

          {replyTo && (
            <Paper
              sx={{
                p: 1,
                mb: 1,
                backgroundColor: 'grey.100',
                borderLeft: '3px solid #1976d2'
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Replying to {replyTo.sender.username}
              </Typography>
              <Typography variant="body2" noWrap>
                {replyTo.content}
              </Typography>
            </Paper>
          )}

          <Paper
            sx={{
              p: 2,
              backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
              color: isOwnMessage ? 'white' : 'text.primary',
              position: 'relative'
            }}
          >
            {editingMessage?._id === message._id ? (
              <TextField
                fullWidth
                multiline
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEditMessage(message._id, newMessage);
                  }
                }}
                autoFocus
              />
            ) : (
              <>
                <Typography variant="body1">
                  {message.content}
                  {message.edited && (
                    <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                      (edited)
                    </Typography>
                  )}
                </Typography>

                {message.type === 'image' && message.fileUrl && (
                  <img
                    src={message.fileUrl}
                    alt="Shared image"
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginTop: 8 }}
                  />
                )}

                {message.type === 'video' && message.fileUrl && (
                  <video
                    controls
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginTop: 8 }}
                  >
                    <source src={message.fileUrl} type="video/mp4" />
                  </video>
                )}

                {message.type === 'document' && message.fileUrl && (
                  <Box sx={{ mt: 1, p: 1, border: '1px solid', borderRadius: 1 }}>
                    <Typography variant="body2">
                      📎 {message.fileName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(message.fileSize! / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                )}

                {message.reactions && message.reactions.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {message.reactions.map((reaction, index) => (
                      <Chip
                        key={index}
                        label={reaction.emoji}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </Typography>

                  {isOwnMessage && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {message.status === 'sent' && <Typography variant="caption">✓</Typography>}
                      {message.status === 'delivered' && <Typography variant="caption">✓✓</Typography>}
                      {message.status === 'read' && <Typography variant="caption">✓✓</Typography>}
                    </Box>
                  )}
                </Box>
              </>
            )}

            <IconButton
              size="small"
              onClick={(e) => {
                setSelectedMessage(message);
                setReactionMenuAnchor(e.currentTarget);
              }}
              sx={{ position: 'absolute', top: 4, right: 4 }}
            >
              <EmojiEmotions fontSize="small" />
            </IconButton>

            {isOwnMessage && (
              <IconButton
                size="small"
                onClick={(e) => {
                  setSelectedMessage(message);
                  setMessageMenuAnchor(e.currentTarget);
                }}
                sx={{ position: 'absolute', top: 4, right: 32 }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            )}
          </Paper>
        </Box>
      </Box>
    );
  };

  if (!selectedUser && !selectedGroup) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.50'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a chat to start messaging
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Chat Header */}
      <Paper
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Avatar src={chatPicture} sx={{ width: 40, height: 40 }}>
          {chatName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">{chatName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedUser?.status === 'online' ? '🟢 Online' : '⚫ Offline'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Connection Status">
            <Badge
              color={isConnected ? 'success' : 'error'}
              variant="dot"
              sx={{ '& .MuiBadge-dot': { width: 8, height: 8 } }}
            />
          </Tooltip>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: 'grey.50'
        }}
      >
        {messages.map(renderMessage)}
        
        {/* Typing Indicator */}
        {typingUsers.get(chatId!)?.size! > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Someone is typing...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Reply Preview */}
      {replyTo && (
        <Paper
          sx={{
            p: 1,
            mx: 2,
            mb: 1,
            backgroundColor: 'primary.light',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2">
            Replying to: {replyTo.content.substring(0, 50)}...
          </Typography>
          <IconButton size="small" onClick={() => setReplyTo(null)}>
            <Typography variant="h6">×</Typography>
          </IconButton>
        </Paper>
      )}

      {/* Message Input */}
      <Paper
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1
        }}
      >
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <CircularProgress size={20} /> : <AttachFile />}
        </IconButton>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendTextMessage();
            }
          }}
          placeholder="Type a message..."
          disabled={uploading}
        />

        <IconButton
          onClick={sendTextMessage}
          disabled={!newMessage.trim() || uploading}
          color="primary"
        >
          <Send />
        </IconButton>
      </Paper>

      {/* Message Menu */}
      <Menu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={() => setMessageMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          setReplyTo(selectedMessage!);
          setMessageMenuAnchor(null);
        }}>
          <ListItemIcon>
            <Reply fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reply</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setEditingMessage(selectedMessage!);
          setNewMessage(selectedMessage!.content);
          setMessageMenuAnchor(null);
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteMessage(selectedMessage!._id);
          setMessageMenuAnchor(null);
        }}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Reaction Menu */}
      <Menu
        anchorEl={reactionMenuAnchor}
        open={Boolean(reactionMenuAnchor)}
        onClose={() => setReactionMenuAnchor(null)}
      >
        {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
          <MenuItem
            key={emoji}
            onClick={() => {
              handleReaction(selectedMessage!._id, emoji);
              setReactionMenuAnchor(null);
            }}
          >
            <Typography variant="h6">{emoji}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ChatWindow; 