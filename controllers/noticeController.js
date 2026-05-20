import Notice from '../models/Notice.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private (Faculty or Admin)
export const createNotice = async (req, res) => {
  const { title, content, category } = req.body;

  try {
    const notice = new Notice({
      title,
      content,
      category: category || 'General',
      postedBy: req.user._id,
    });

    const createdNotice = await notice.save();

    // Create notifications for all users
    const allUsers = await User.find({});
    const notifications = allUsers.map(user => ({
      user: user._id,
      message: `New announcement: "${title}"`,
      type: 'Notice',
    }));
    await Notification.insertMany(notifications);

    res.status(201).json(createdNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Faculty or Admin)
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (notice) {
      await Notice.deleteOne({ _id: notice._id });
      res.json({ message: 'Notice removed' });
    } else {
      res.status(404).json({ message: 'Notice not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
