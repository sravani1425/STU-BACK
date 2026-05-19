import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentByRollNumber,
  updateMyProfile
} from '../controllers/studentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { adminOnly, facultyOrAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.route('/').get(protect, facultyOrAdmin, getStudents).post(protect, facultyOrAdmin, createStudent);
router.route('/my-profile').put(protect, updateMyProfile);
router.route('/roll/:rollNumber').get(protect, getStudentByRollNumber);
router
  .route('/:id')
  .get(protect, facultyOrAdmin, getStudentById)
  .put(protect, facultyOrAdmin, updateStudent)
  .delete(protect, facultyOrAdmin, deleteStudent);

export default router;
