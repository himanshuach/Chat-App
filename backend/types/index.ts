import { Request } from 'express';
import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  friends: string[];
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  isTyping?: boolean;
  typingTo?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    soundEnabled: boolean;
    privacy: {
      lastSeen: 'everyone' | 'friends' | 'nobody';
      profilePicture: 'everyone' | 'friends' | 'nobody';
    };
  };
  blockedUsers?: string[];
  socketId?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateStatus(status: 'online' | 'offline' | 'away' | 'busy'): Promise<void>;
  setTyping(isTyping: boolean, typingTo?: string): Promise<void>;
  createdAt: Date;
  updatedAt: Date;
}

// User Methods interface
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateStatus(status: 'online' | 'offline' | 'away' | 'busy'): Promise<void>;
  setTyping(isTyping: boolean, typingTo?: string): Promise<void>;
}

// User Model interface
export interface IUserModel extends Document, IUserMethods {
  _id: string;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  friends: string[];
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  isTyping?: boolean;
  typingTo?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    soundEnabled: boolean;
    privacy: {
      lastSeen: 'everyone' | 'friends' | 'nobody';
      profilePicture: 'everyone' | 'friends' | 'nobody';
    };
  };
  blockedUsers?: string[];
  socketId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface IMessage extends Document {
  _id: string;
  sender: string | IUser;
  receiver?: string | IUser;
  content: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  status: 'sent' | 'delivered' | 'read';
  isGroupMessage: boolean;
  group?: string | IGroup;
  reactions?: Array<{
    user: string | IUser;
    emoji: string;
    createdAt: Date;
  }>;
  replyTo?: string | IMessage;
  edited?: boolean;
  editedAt?: Date;
  deletedAt?: Date;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Group Types
export interface IGroup extends Document {
  _id: string;
  name: string;
  description?: string;
  admin: string | IUser;
  members: (string | IUser)[];
  groupPicture?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface AuthRequest extends Request {
  user?: IUser;
}

// Socket Types
export interface SocketUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Environment Variables
export interface EnvVars {
  NODE_ENV: string;
  PORT: string;
  MONGO_URI: string;
  JWT_SECRET: string;
  CLIENT_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
} 