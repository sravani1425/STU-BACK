import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  course: {
    type: String,
    required: true,
  },
  cgpa: {
    type: Number,
    default: 0,
  },
  activeBacklogs: {
    type: Number,
    default: 0,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
