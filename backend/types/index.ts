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
  status: 'online' | 'offline';
  lastSeen: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// User Methods interface
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
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
  status: 'online' | 'offline';
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface IMessage extends Document {
  _id: string;
  sender: string | IUser;
  receiver: string | IUser;
  content: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  isGroupMessage: boolean;
  group?: string | IGroup;
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