import Notification from '../models/Notification.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const readAllNotifications = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create/Send a notification (Admin/Faculty)
// @route   POST /api/notifications
// @access  Private (Faculty/Admin)
export const createNotification = async (req, res) => {
  const { studentId, message, type } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Notification message is required' });
  }

  try {
    let targetUsers = [];

    if (studentId === 'all') {
      // Find all students
      const students = await Student.find({});
      const emails = students.map(s => s.email).filter(Boolean);
      const rollNumbers = students.map(s => s.rollNumber).filter(Boolean);
      
      // Find all users corresponding to these students
      const users = await User.find({
        $or: [
          { email: { $in: emails } },
          { rollNumber: { $in: rollNumbers } }
        ]
      });
      targetUsers = users;
    } else {
      // Find specific student
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student record not found' });
      }

      // Find user corresponding to student
      const user = await User.findOne({
        $or: [
          { email: student.email },
          { rollNumber: student.rollNumber }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: 'Associated student user account not found' });
      }
      targetUsers = [user];
    }

    if (targetUsers.length === 0) {
      return res.status(400).json({ message: 'No student users found to receive notification' });
    }

    // Create notifications for each target user
    const notificationsData = targetUsers.map(user => ({
      user: user._id,
      message,
      type: type || 'System'
    }));

    await Notification.insertMany(notificationsData);

    res.status(201).json({
      message: `Notification successfully sent to ${targetUsers.length} student(s).`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
