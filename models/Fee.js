import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  feeType: {
    type: String,
    enum: ['Tuition Fee', 'Bus Fee', 'Management Fee', 'Hostel Fee', 'Exam Fee'],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  pendingAmount: {
    type: Number,
    required: true,
    default: function() {
      return this.totalAmount - this.paidAmount;
    }
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Partial'],
    required: true,
    default: 'Unpaid',
  }
}, { timestamps: true });

// Pre-save middleware to automatically calculate pendingAmount and status
feeSchema.pre('save', function() {
  this.pendingAmount = this.totalAmount - this.paidAmount;
  
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0) {
    this.status = 'Partial';
  } else {
    this.status = 'Unpaid';
  }
});

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
