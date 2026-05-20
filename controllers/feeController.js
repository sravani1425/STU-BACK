import Fee from '../models/Fee.js';
import Student from '../models/Student.js';

// @desc    Get logged-in student's fee status
// @route   GET /api/fees/my
// @access  Private (Student)
export const getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.user.rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found for this user.' });
    }

    const fees = await Fee.find({ student: student._id }).sort({ semester: 1, feeType: 1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a specific student's fee status
// @route   GET /api/fees/student/:studentId
// @access  Private (Faculty/Admin)
export const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const fees = await Fee.find({ student: studentId }).sort({ semester: 1, feeType: 1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record/Update a fee payment
// @route   PUT /api/fees/:id
// @access  Private (Faculty/Admin)
export const updateFeeStatus = async (req, res) => {
  const { paidAmount, totalAmount, dueDate, feeType } = req.body;
  const { id } = req.params;

  try {
    const fee = await Fee.findById(id).populate('student');
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found.' });
    }

    if (totalAmount !== undefined) fee.totalAmount = totalAmount;
    if (paidAmount !== undefined) fee.paidAmount = paidAmount;
    if (dueDate !== undefined) fee.dueDate = dueDate;
    if (feeType !== undefined) fee.feeType = feeType;

    const updatedFee = await fee.save();
    res.json(updatedFee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new fee record manually
// @route   POST /api/fees
// @access  Private (Faculty/Admin)
export const createFeeRecord = async (req, res) => {
  const { studentId, semester, feeType, totalAmount, paidAmount, dueDate } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const fee = new Fee({
      student: studentId,
      semester,
      feeType,
      totalAmount,
      paidAmount: paidAmount || 0,
      dueDate,
    });

    const createdFee = await fee.save();
    res.status(201).json(createdFee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
