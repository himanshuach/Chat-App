# MERN Chat Application

A real-time chat application built using the MERN stack (MongoDB, Express.js, React, Node.js) with TypeScript.

![image](https://github.com/user-attachments/assets/b63609b4-2a63-4ef6-981f-61ff9a446c74)

## Project Structure

```
mern-chat-app/
├── backend/                 # Backend server code
│   ├── config/             # Configuration files
│   │   ├── cloudinary.ts   # Cloudinary setup for image uploads
│   │   └── db.ts          # MongoDB connection setup
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   │   ├── auth.ts        # Authentication middleware
│   │   ├── upload.ts      # File upload middleware
│   │   └── validate.ts    # Request validation
│   ├── models/            # MongoDB models
│   │   ├── Group.ts       # Group chat model
│   │   ├── Message.ts     # Message model
│   │   └── User.ts        # User model
│   ├── routes/            # API routes
│   │   ├── groupRoutes.ts # Group-related endpoints
│   │   ├── messageRoutes.ts # Message-related endpoints
│   │   └── userRoutes.ts  # User-related endpoints
│   ├── types/            # TypeScript type definitions
│   └── server.ts         # Main server file
├── frontend/             # Frontend React application
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       │   ├── ChatWindow.tsx    # Main chat interface
│       │   ├── ProfileModal.tsx  # User profile modal
│       │   ├── Sidebar.tsx      # Navigation sidebar
│       │   └── UserList.tsx     # Online users list
│       ├── context/     # React context providers
│       ├── hooks/       # Custom React hooks
│       └── utils/       # Utility functions
```

## Features

- Real-time messaging using Socket.IO
- User authentication and authorization
- Group chat functionality
- Private messaging between users
- User profile management
- File and image sharing
- Message history
- Online user status
- Responsive design

## Technology Stack

### Backend
- Node.js with Express
- TypeScript for type safety
- MongoDB for data storage
- Socket.IO for real-time communication
- JWT for authentication
- Cloudinary for file uploads
- Express-validator for request validation

### Frontend
- React with TypeScript
- Context API for state management
- Socket.IO client
- Axios for HTTP requests
- React Router for navigation
- Modern CSS for styling

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mern-chat-app
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Create .env files:

   Backend (.env):
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

   Frontend (.env):
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

5. Start the development servers:

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm start
   ```

## API Endpoints

### User Routes
- POST /api/users/register - Register new user
- POST /api/users/login - User login
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile
- GET /api/users - Get all users

### Message Routes
- POST /api/messages - Send message
- GET /api/messages/:chatId - Get chat messages
- DELETE /api/messages/:messageId - Delete message

### Group Routes
- POST /api/groups - Create group
- GET /api/groups - Get user's groups
- PUT /api/groups/:groupId - Update group
- DELETE /api/groups/:groupId - Delete group
- POST /api/groups/:groupId/members - Add group member
- DELETE /api/groups/:groupId/members/:userId - Remove group member

## Database Schema

### User
```typescript
{
  username: string;
  email: string;
  password: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: Date;
}
```

### Message
```typescript
{
  sender: ObjectId;
  content: string;
  chat: ObjectId;
  attachments: string[];
  readBy: ObjectId[];
  timestamp: Date;
}
```

### Group
```typescript
{
  name: string;
  creator: ObjectId;
  members: ObjectId[];
  avatar: string;
  description: string;
  createdAt: Date;
}
```

## Security Measures

- Password hashing using bcrypt
- JWT-based authentication
- Request validation and sanitization
- Protected API routes
- CORS configuration
- Rate limiting
- XSS protection
- File upload validation

## Error Handling

The application implements a centralized error handling mechanism with custom error classes and middleware for:
- Validation errors
- Authentication errors
- Database errors
- File upload errors
- Network errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 
