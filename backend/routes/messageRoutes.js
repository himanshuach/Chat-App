const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// Send message
router.post('/', protect, async (req, res) => {
  try {
    const { content, receiverId, type = 'text' } = req.body;

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      type
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get messages between two users
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update message status
router.put('/:messageId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only receiver can update message status
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.status = status;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete message
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 