import mongoose, { Schema } from 'mongoose';
import { IGroup } from '../types/index.js';

const groupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  groupPicture: {
    type: String,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Group = mongoose.model<IGroup>('Group', groupSchema);

export default Group; 