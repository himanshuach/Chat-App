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

io.on('connection', (socket: Socket) => {
  console.log('A user connected');

  socket.on('setup', (userData: { _id: string }) => {
    socket.join(userData._id);
    connectedUsers.set(userData._id, socket.id);
    socket.emit('connected');
  });

  socket.on('join chat', (room: string) => {
    socket.join(room);
    console.log('User joined room: ' + room);
  });

  socket.on('typing', (room: string) => {
    socket.in(room).emit('typing', room);
  });

  socket.on('stop typing', (room: string) => {
    socket.in(room).emit('stop typing', room);
  });

  socket.on('new message', (newMessageReceived: any) => {
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user: { _id: string }) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
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