const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
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

const Group = mongoose.model('Group', groupSchema);

module.exports = Group; 