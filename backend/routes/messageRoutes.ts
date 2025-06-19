import express, { Request, Response } from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { validateMessage } from '../middleware/validate.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Send message
router.post('/', protect, validateMessage, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, receiverId, type = 'text' } = req.body;

    const newMessage = await Message.create({
      sender: req.user!._id,
      receiver: receiverId,
      content,
      type
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Get messages between two users
router.get('/:userId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user!._id, receiver: req.params['userId'] },
        { sender: req.params['userId'], receiver: req.user!._id }
      ]
    })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Update message status
router.put('/:messageId/status', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const message = await Message.findById(req.params['messageId']);

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    // Only receiver can update message status
    if (message.receiver.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    message.status = status;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Delete message
router.delete('/:messageId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const message = await Message.findById(req.params['messageId']);

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    // Only sender can delete message
    if (message.sender.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router; 