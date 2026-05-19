import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, rollNumber } = req.body;

  try {
    if (role === 'student' && !rollNumber) {
      return res.status(400).json({ message: 'Roll number is required for students' });
    }
    if (role !== 'student' && !email) {
      return res.status(400).json({ message: 'Email is required for admin/faculty' });
    }

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'Email already exists' });
    }

    if (rollNumber) {
      const rollExists = await User.findOne({ rollNumber });
      if (rollExists) return res.status(400).json({ message: 'Roll number already exists' });
    }

    const user = await User.create({
      name,
      email: role !== 'student' ? email : `${rollNumber}@student.system`,
      password,
      role: role || 'student',
      rollNumber: role === 'student' ? rollNumber : undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or rollNumber

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { rollNumber: identifier }],
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
