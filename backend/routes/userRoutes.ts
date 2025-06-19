import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Register user
router.post('/register', validateRegister, async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Login user
router.post('/login', validateLogin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user['comparePassword'](password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Get user profile
router.get('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Update user profile
router.put('/profile', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.bio = req.body.bio || user.bio;
      user.profilePicture = req.body.profilePicture || user.profilePicture;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Add friend
router.post('/friends/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id);
    const friend = await User.findById(req.params['id']);

    if (!friend) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user && typeof req.params['id'] === 'string' && user.friends.includes(req.params['id'])) {
      res.status(400).json({ message: 'Already friends' });
      return;
    }

    if (user && typeof req.params['id'] === 'string') {
      user.friends.push(req.params['id']);
      friend.friends.push(req.user._id);

      await user.save();
      await friend.save();
    }

    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Get friends list
router.get('/friends', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id).populate(
      'friends',
      'username profilePicture status lastSeen'
    );
    res.json(user?.friends);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Generate JWT
const generateToken = (id: string): string => {
  const jwtSecret = process.env['JWT_SECRET'] || 'fallback-secret-key-for-development';
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d'
  });
};

export default router; 