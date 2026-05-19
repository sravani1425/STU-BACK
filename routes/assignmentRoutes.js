import express from 'express';
import {
  createAssignment,
  getAssignments,
  submitAssignment,
  getSubmissions
} from '../controllers/assignmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { facultyOrAdmin } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAssignments)
  .post(protect, facultyOrAdmin, upload.single('file'), createAssignment);

router.route('/:id/submit')
  .post(protect, upload.single('file'), submitAssignment);

router.route('/:id/submissions')
  .get(protect, facultyOrAdmin, getSubmissions);

export default router;
