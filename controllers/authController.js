import User from '../models/User.js';
import Student from '../models/Student.js';
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
      // If student role, check if Student record exists, otherwise create it
      if (role === 'student') {
        const studentExists = await Student.findOne({ rollNumber });
        if (!studentExists) {
          await Student.create({
            name: user.name,
            email: user.email,
            rollNumber: user.rollNumber,
            course: 'Not Assigned',
          });
        }
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        profileImage: user.profileImage,
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
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email/roll number or password' });
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
        profileImage: user.profileImage,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      
      if (user.role !== 'student' && email) {
        user.email = email;
      }
      
      if (password) {
        user.password = password;
      }

      const updatedUser = await user.save();

      // Synchronize name to Student model if user is a student
      if (user.role === 'student') {
        const student = await Student.findOne({ rollNumber: user.rollNumber });
        if (student) {
          student.name = updatedUser.name;
          await student.save();
        }
      }

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        rollNumber: updatedUser.rollNumber,
        profileImage: updatedUser.profileImage,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/profile/image
// @access  Private
export const uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
