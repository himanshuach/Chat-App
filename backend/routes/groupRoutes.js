const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// Create group
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, members, isPrivate } = req.body;

    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [...members, req.user._id],
      isPrivate
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'username profilePicture')
      .populate('members', 'username profilePicture');

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's groups
router.get('/my-groups', protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('admin', 'username profilePicture')
      .populate('members', 'username profilePicture');
    res.json(groups);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get group details
router.get('/:groupId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('admin', 'username profilePicture')
      .populate('members', 'username profilePicture');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update group
router.put('/:groupId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only admin can update group
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, isPrivate } = req.body;
    group.name = name || group.name;
    group.description = description || group.description;
    group.isPrivate = isPrivate !== undefined ? isPrivate : group.isPrivate;

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add member to group
router.post('/:groupId/members', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only admin can add members
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    group.members.push(userId);
    await group.save();

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove member from group
router.delete('/:groupId/members/:userId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only admin can remove members
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Cannot remove admin
    if (req.params.userId === group.admin.toString()) {
      return res.status(400).json({ message: 'Cannot remove admin' });
    }

    group.members = group.members.filter(
      member => member.toString() !== req.params.userId
    );

    await group.save();
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get group messages
router.get('/:groupId/messages', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ group: req.params.groupId })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 