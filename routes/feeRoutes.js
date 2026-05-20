import express from 'express';
import {
  getMyFees,
  getStudentFees,
  updateFeeStatus,
  createFeeRecord
} from '../controllers/feeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { facultyOrAdmin, adminOnly } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, createFeeRecord);

router.route('/my')
  .get(protect, getMyFees);

router.route('/student/:studentId')
  .get(protect, facultyOrAdmin, getStudentFees);

router.route('/:id')
  .put(protect, adminOnly, updateFeeStatus);

export default router;
