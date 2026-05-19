import Certificate from '../models/Certificate.js';
import User from '../models/User.js';

// @desc    Upload a certificate
// @route   POST /api/certificates
// @access  Private
export const uploadCertificate = async (req, res) => {
  const { companyName, role, duration, category } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  try {
    const certificate = new Certificate({
      student: req.user._id,
      companyName,
      role,
      duration,
      category: category || 'other',
      fileUrl,
    });

    const createdCert = await certificate.save();
    res.status(201).json(createdCert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my certificates
// @route   GET /api/certificates/my
// @access  Private
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get certificates by student ID (Admin/Faculty)
// @route   GET /api/certificates/student/:studentId
// @access  Private (Faculty/Admin)
export const getCertificatesByStudent = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.params.studentId });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get certificates by student roll number (Admin/Faculty)
// @route   GET /api/certificates/roll/:rollNumber
// @access  Private (Faculty/Admin)
export const getCertificatesByRoll = async (req, res) => {
  try {
    const user = await User.findOne({ rollNumber: req.params.rollNumber });
    if (!user) {
      return res.status(200).json([]); // Return empty list if student user account doesn't exist yet
    }
    const certificates = await Certificate.find({ student: user._id });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
