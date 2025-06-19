import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types/index.js';

const messageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  isGroupMessage: {
    type: Boolean,
    default: false
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }
}, {
  timestamps: true
});

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message; 