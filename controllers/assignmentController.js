import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

// @desc    Create an assignment (Faculty/Admin)
// @route   POST /api/assignments
// @access  Private (Faculty/Admin)
export const createAssignment = async (req, res) => {
  const { title, description, dueDate } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const assignment = new Assignment({
      title,
      description,
      dueDate,
      createdBy: req.user._id,
      fileUrl,
    });

    const createdAssignment = await assignment.save();
    res.status(201).json(createdAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('createdBy', 'name');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit an assignment (Student)
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const assignmentId = req.params.id;
  const studentId = req.user._id;

  try {
    let submission = await Submission.findOne({ assignment: assignmentId, student: studentId });

    if (submission) {
      submission.fileUrl = fileUrl;
      submission.submittedAt = Date.now();
      await submission.save();
    } else {
      submission = new Submission({
        assignment: assignmentId,
        student: studentId,
        fileUrl,
      });
      await submission.save();
    }

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (Faculty/Admin)
export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name rollNumber email');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
