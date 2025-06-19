import express, { Request, Response } from 'express';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { validateGroup } from '../middleware/validate.js';
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

// Get group messages
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

    const messages = await Message.find({ group: req.params['groupId'] })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router; 