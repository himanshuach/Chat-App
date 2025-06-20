import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import User from './models/User.js';
import { AuthRequest } from './types/index.js';

dotenv.config(); // Load .env variables
connectDB(); // Connect to MongoDB

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env['CLIENT_URL'] || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Security and Logging Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
}));

// Basic Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

// Socket.io connection handling
const connectedUsers = new Map<string, string>();
const typingUsers = new Map<string, Set<string>>();

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  // Authenticate user and setup
  socket.on('setup', async (userData: { _id: string }) => {
    try {
      const user = await User.findById(userData._id);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Update user status to online
      await user['updateStatus']('online');
      user.socketId = socket.id;
      await user.save();

      socket.join(userData._id);
      connectedUsers.set(userData._id, socket.id);

      // Notify friends that user is online
      const friends = await User.findById(userData._id).populate('friends');
      if (friends?.friends) {
        friends.friends.forEach((friend: any) => {
          if (connectedUsers.has(friend._id.toString())) {
            io.to(connectedUsers.get(friend._id.toString())!).emit('friend_online', {
              userId: userData._id,
              status: 'online'
            });
          }
        });
      }

      socket.emit('connected');
      console.log('User setup complete:', userData._id);
    } catch (error) {
      console.error('Setup error:', error);
      socket.emit('error', { message: 'Setup failed' });
    }
  });

  // Join chat room
  socket.on('join chat', (room: string) => {
    socket.join(room);
    console.log('User joined room:', room);
  });

  // Leave chat room
  socket.on('leave chat', (room: string) => {
    socket.leave(room);
    console.log('User left room:', room);
  });

  // Typing indicator
  socket.on('typing', async (data: { room: string; userId: string; isTyping: boolean }) => {
    try {
      const user = await User.findById(data.userId);
      if (user) {
        await user['setTyping'](data.isTyping, data.room);
        
        if (data.isTyping) {
          if (!typingUsers.has(data.room)) {
            typingUsers.set(data.room, new Set());
          }
          typingUsers.get(data.room)!.add(data.userId);
        } else {
          typingUsers.get(data.room)?.delete(data.userId);
          if (typingUsers.get(data.room)?.size === 0) {
            typingUsers.delete(data.room);
          }
        }

        socket.to(data.room).emit('typing', {
          room: data.room,
          userId: data.userId,
          isTyping: data.isTyping,
          username: user.username
        });
      }
    } catch (error) {
      console.error('Typing error:', error);
    }
  });

  // Stop typing
  socket.on('stop typing', async (data: { room: string; userId: string }) => {
    try {
      const user = await User.findById(data.userId);
      if (user) {
        await user['setTyping'](false);
        
        typingUsers.get(data.room)?.delete(data.userId);
        if (typingUsers.get(data.room)?.size === 0) {
          typingUsers.delete(data.room);
        }

        socket.to(data.room).emit('stop typing', {
          room: data.room,
          userId: data.userId,
          username: user.username
        });
      }
    } catch (error) {
      console.error('Stop typing error:', error);
    }
  });

  // New message
  socket.on('new message', async (newMessageReceived: any) => {
    try {
      const chat = newMessageReceived.chat;
      if (!chat.users) return console.log('chat.users not defined');

      // Update message status to delivered for all recipients
      chat.users.forEach(async (user: { _id: string }) => {
        if (user._id === newMessageReceived.sender._id) return;
        
        // Emit to specific user's room
        socket.in(user._id).emit('message received', newMessageReceived);
        
        // Update message status to delivered
        // This would typically be done via API call, but for demo we'll emit
        socket.in(user._id).emit('message status update', {
          messageId: newMessageReceived._id,
          status: 'delivered'
        });
      });
    } catch (error) {
      console.error('New message error:', error);
    }
  });

  // Message read receipt
  socket.on('message read', async (data: { messageId: string; userId: string; room: string }) => {
    try {
      // Emit read receipt to sender
      socket.to(data.room).emit('message read receipt', {
        messageId: data.messageId,
        readBy: data.userId,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Message read error:', error);
    }
  });

  // Message reaction
  socket.on('message reaction', async (data: { messageId: string; userId: string; emoji: string; room: string }) => {
    try {
      socket.to(data.room).emit('message reaction', {
        messageId: data.messageId,
        userId: data.userId,
        emoji: data.emoji,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Message reaction error:', error);
    }
  });

  // User status change
  socket.on('status change', async (data: { userId: string; status: 'online' | 'offline' | 'away' | 'busy' }) => {
    try {
      const user = await User.findById(data.userId);
      if (user) {
        await user['updateStatus'](data.status);
        
        // Notify friends of status change
        const friends = await User.findById(data.userId).populate('friends');
        if (friends?.friends) {
          friends.friends.forEach((friend: any) => {
            if (connectedUsers.has(friend._id.toString())) {
              io.to(connectedUsers.get(friend._id.toString())!).emit('friend_status_change', {
                userId: data.userId,
                status: data.status,
                lastSeen: user.lastSeen
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Status change error:', error);
    }
  });

  // Disconnect handling
  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id);
    
    // Find user by socket ID and update status
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        try {
          const user = await User.findById(userId);
          if (user) {
            await user['updateStatus']('offline');
            user.socketId = '';
            await user.save();

            // Notify friends that user is offline
            const friends = await User.findById(userId).populate('friends');
            if (friends?.friends) {
              friends.friends.forEach((friend: any) => {
                if (connectedUsers.has(friend._id.toString())) {
                  io.to(connectedUsers.get(friend._id.toString())!).emit('friend_offline', {
                    userId: userId,
                    status: 'offline',
                    lastSeen: user.lastSeen
                  });
                }
              });
            }
          }
        } catch (error) {
          console.error('Disconnect error:', error);
        }
        
        connectedUsers.delete(userId);
        break;
      }
    }

    // Remove from typing users
    for (const [room, users] of typingUsers.entries()) {
      for (const userId of users) {
        if (connectedUsers.get(userId) === socket.id) {
          users.delete(userId);
          if (users.size === 0) {
            typingUsers.delete(room);
          }
          break;
        }
      }
    }
  });
});

const PORT = process.env['PORT'] || 5000;

// 404 handler - must be after all routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler - must be last
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack })
  });
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 