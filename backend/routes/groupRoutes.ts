import express, { Request, Response } from 'express';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { validateGroup } from '../middleware/validate.js';
import { imageUpload } from '../middleware/upload.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Create group
router.post('/', protect, validateGroup, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, members, isPrivate } = req.body;

    const group = await Group.create({
      name,
      description,
      admin: req.user!._id,
      members: [...members, req.user!._id],
      isPrivate
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'username profilePicture')
      .populate('members', 'username profilePicture');

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Get user's groups
router.get('/my-groups', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const groups = await Group.find({ members: req.user!._id })
      .populate('admin', 'username profilePicture')
      .populate('members', 'username profilePicture');
    res.json(groups);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Get group details
router.get('/:groupId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params['groupId'])
      .populate('admin', 'username profilePicture')
      .populate('members', 'username profilePicture');

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if user is a member
    if (!group.members.some(member => (typeof member === 'object' && '_id' in member ? (member as any)._id.toString() : member.toString()) === req.user!._id.toString())) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    res.json(group);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Update group
router.put('/:groupId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params['groupId']);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Only admin can update group
    if (group.admin.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const { name, description, isPrivate } = req.body;
    group.name = name || group.name;
    group.description = description || group.description;
    group.isPrivate = isPrivate !== undefined ? isPrivate : group.isPrivate;

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Add member to group
router.post('/:groupId/members', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params['groupId']);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Only admin can add members
    if (group.admin.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (group.members.includes(userId)) {
      res.status(400).json({ message: 'User is already a member' });
      return;
    }

    group.members.push(userId);
    await group.save();

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Remove member from group
router.delete('/:groupId/members/:userId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params['groupId']);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Only admin can remove members
    if (group.admin.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Cannot remove admin
    if (req.params['userId'] === group.admin.toString()) {
      res.status(400).json({ message: 'Cannot remove admin' });
      return;
    }

    group.members = group.members.filter(
      member => member.toString() !== req.params['userId']
    );

    await group.save();
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Get group messages with pagination
router.get('/:groupId/messages', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params['groupId']);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if user is a member
    if (!group.members.includes(req.user!._id)) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ 
      group: req.params['groupId'],
      isDeleted: { $ne: true }
    })
      .populate('sender', 'username profilePicture')
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

// Get group members
router.get('/:groupId/members', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params['groupId'])
      .populate('admin', 'username profilePicture')
      .populate('members', 'username profilePicture status lastSeen');

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if user is a member
    if (!group.members.some(member => (typeof member === 'object' && '_id' in member ? (member as any)._id.toString() : member.toString()) === req.user!._id.toString())) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    res.json({
      admin: group.admin,
      members: group.members
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Leave group
router.post('/:groupId/leave', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params['groupId']);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if user is a member
    if (!group.members.includes(req.user!._id)) {
      res.status(403).json({ message: 'Not a member of this group' });
      return;
    }

    // Admin cannot leave group
    if (group.admin.toString() === req.user!._id.toString()) {
      res.status(400).json({ message: 'Admin cannot leave group. Transfer admin role first.' });
      return;
    }

    group.members = group.members.filter(
      member => member.toString() !== req.user!._id.toString()
    );

    await group.save();
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Transfer admin role
router.put('/:groupId/transfer-admin/:userId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params['groupId']);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Only current admin can transfer admin role
    if (group.admin.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Check if new admin is a member
    const userId = req.params['userId'];
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    
    if (!group.members.includes(userId)) {
      res.status(400).json({ message: 'User is not a member of this group' });
      return;
    }

    group.admin = userId;
    await group.save();

    res.json({ message: 'Admin role transferred successfully' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Get group info
router.get('/:groupId/info', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params['groupId'])
      .populate('admin', 'username profilePicture')
      .populate('members', 'username profilePicture status lastSeen');

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if user is a member
    if (!group.members.some(member => (typeof member === 'object' && '_id' in member ? (member as any)._id.toString() : member.toString()) === req.user!._id.toString())) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Get message count
    const messageCount = await Message.countDocuments({ 
      group: req.params['groupId'],
      isDeleted: { $ne: true }
    });

    res.json({
      ...group.toObject(),
      messageCount
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Send group message
router.post('/:groupId/messages', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, type = 'text', replyTo } = req.body;
    const group = await Group.findById(req.params['groupId']);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    // Check if user is a member
    if (!group.members.includes(req.user!._id)) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const newMessage = await Message.create({
      sender: req.user!._id,
      receiver: null,
      content,
      type,
      isGroupMessage: true,
      group: req.params['groupId'],
      replyTo
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username profilePicture')
      .populate('replyTo', 'content sender username profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Upload group image
router.post('/:groupId/upload-image', protect, imageUpload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content = '', replyTo } = req.body;
    const group = await Group.findById(req.params['groupId']);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    if (!group.members.includes(req.user!._id)) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }

    const newMessage = await Message.create({
      sender: req.user!._id,
      receiver: null,
      content,
      type: 'image',
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      thumbnailUrl: req.file.path,
      isGroupMessage: true,
      group: req.params['groupId'],
      replyTo
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username profilePicture')
      .populate('replyTo', 'content sender username profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router; 