const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();         // Load .env variables
connectDB();             // Connect to MongoDB

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    connectedUsers.set(userData._id, socket.id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User joined room: ' + room);
  });

  socket.on('typing', (room) => {
    socket.in(room).emit('typing', room);
  });

  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing', room);
  });

  socket.on('new message', (newMessageReceived) => {
    let chat = newMessageReceived.chat;
    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach(user => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
