import express from 'express';
import {
  markAttendance,
  getAttendanceByDate,
  getStudentAttendance,
  getAttendanceStats
} from '../controllers/attendanceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { facultyOrAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.route('/').post(protect, facultyOrAdmin, markAttendance).get(protect, facultyOrAdmin, getAttendanceByDate);
router.route('/student/:studentId').get(protect, getStudentAttendance);
router.route('/stats/:studentId').get(protect, getAttendanceStats);

export default router;
