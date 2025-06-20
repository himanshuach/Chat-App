import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserModel } from '../types/index.js';

const userSchema = new Schema<IUserModel>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['online', 'offline', 'away', 'busy'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isTyping: {
    type: Boolean,
    default: false
  },
  typingTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    soundEnabled: {
      type: Boolean,
      default: true
    },
    privacy: {
      lastSeen: {
        type: String,
        enum: ['everyone', 'friends', 'nobody'],
        default: 'everyone'
      },
      profilePicture: {
        type: String,
        enum: ['everyone', 'friends', 'nobody'],
        default: 'everyone'
      }
    }
  },
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  socketId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ status: 1, lastSeen: -1 });
userSchema.index({ friends: 1 });
userSchema.index({ blockedUsers: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this['password']);
};

// Method to update online status
userSchema.methods['updateStatus'] = async function(status: 'online' | 'offline' | 'away' | 'busy'): Promise<void> {
  this['status'] = status;
  this['lastSeen'] = new Date();
  await this['save']();
};

// Method to update typing status
userSchema.methods['setTyping'] = async function(isTyping: boolean, typingTo?: string): Promise<void> {
  this['isTyping'] = isTyping;
  this['typingTo'] = typingTo || null;
  await this['save']();
};

const User = mongoose.model<IUserModel>('User', userSchema);

export default User; 