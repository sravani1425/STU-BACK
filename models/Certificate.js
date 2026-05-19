import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
  duration: {
    type: String,
  },
  category: {
    type: String,
    enum: ['internship', 'other'],
    default: 'other',
  },
  fileUrl: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
