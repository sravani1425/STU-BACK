import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
export const markAttendance = async (req, res) => {
  const { studentId, date, status } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Normalize date to 00:00:00 to avoid multiple records on the same day due to time differences
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ student: studentId, date: targetDate });

    if (attendance) {
      attendance.status = status;
      await attendance.save();
    } else {
      attendance = new Attendance({
        student: studentId,
        date: targetDate,
        status,
      });
      await attendance.save();
    }

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance for a specific date
// @route   GET /api/attendance?date=YYYY-MM-DD
// @access  Private
export const getAttendanceByDate = async (req, res) => {
  const { date } = req.query;

  try {
    if (!date) {
      return res.status(400).json({ message: 'Please provide a date' });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({ date: targetDate }).populate('student', 'name rollNumber course');
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance history for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private
export const getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance stats for a student
// @route   GET /api/attendance/stats/:studentId
// @access  Private
export const getAttendanceStats = async (req, res) => {
  try {
    // req.params.studentId is actually the User ID
    const user = await User.findById(req.params.studentId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const student = await Student.findOne({ rollNumber: user.rollNumber });
    if (!student) return res.json({ totalDays: 0, presentDays: 0, percentage: 0 });

    const records = await Attendance.find({ student: student._id });
    
    if (!records || records.length === 0) {
      return res.json({ totalDays: 0, presentDays: 0, percentage: 0 });
    }

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === 'Present').length;
    const percentage = Math.round((presentDays / totalDays) * 100);

    res.json({ totalDays, presentDays, percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
