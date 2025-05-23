const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 