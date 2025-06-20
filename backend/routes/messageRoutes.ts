import express, { Request, Response } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validateMessage } from '../middleware/validate.js';
import { imageUpload, documentUpload, videoUpload } from '../middleware/upload.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Send text message
router.post('/', protect, validateMessage, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, receiverId, type = 'text', replyTo } = req.body;

    const newMessage = await Message.create({
      sender: req.user!._id,
      receiver: receiverId,
      content,
      type,
      replyTo
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .populate('replyTo', 'content sender');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Upload image message
router.post('/upload-image', protect, imageUpload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, content = '', replyTo } = req.body;

    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }

    const newMessage = await Message.create({
      sender: req.user!._id,
      receiver: receiverId,
      content,
      type: 'image',
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      thumbnailUrl: req.file.path,
      replyTo
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .populate('replyTo', 'content sender');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Upload document message
router.post('/upload-document', protect, documentUpload.single('document'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, content = '', replyTo } = req.body;

    if (!req.file) {
      res.status(400).json({ message: 'No document file provided' });
      return;
    }

    const newMessage = await Message.create({
      sender: req.user!._id,
      receiver: receiverId,
      content,
      type: 'document',
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      replyTo
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .populate('replyTo', 'content sender');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Upload video message
router.post('/upload-video', protect, videoUpload.single('video'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, content = '', replyTo } = req.body;

    if (!req.file) {
      res.status(400).json({ message: 'No video file provided' });
      return;
    }

    const newMessage = await Message.create({
      sender: req.user!._id,
      receiver: receiverId,
      content,
      type: 'video',
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      replyTo
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .populate('replyTo', 'content sender');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Get messages between two users
router.get('/:userId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.user!._id, receiver: req.params['userId'] },
        { sender: req.params['userId'], receiver: req.user!._id }
      ],
      isDeleted: { $ne: true }
    })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .populate('replyTo', 'content sender username profilePicture')
      .populate('reactions.user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse());
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
    if (!message.receiver || message.receiver.toString() !== req.user!._id.toString()) {
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

// Add reaction to message
router.post('/:messageId/reactions', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params['messageId']);

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions?.filter(
      reaction => reaction.user.toString() !== req.user!._id.toString()
    ) || [];

    // Add new reaction
    message.reactions?.push({
      user: req.user!._id,
      emoji,
      createdAt: new Date()
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('reactions.user', 'username profilePicture');

    res.json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Edit message
router.put('/:messageId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params['messageId']);

    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    // Only sender can edit message
    if (message.sender.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Delete message (soft delete)
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

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router; 