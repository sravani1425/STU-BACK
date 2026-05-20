import express from 'express';
import {
  createTimetableSlot,
  getTimetable,
  updateTimetableSlot,
  deleteTimetableSlot
} from '../controllers/timetableController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { facultyOrAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, facultyOrAdmin, createTimetableSlot)
  .get(protect, getTimetable);

router.route('/:id')
  .put(protect, facultyOrAdmin, updateTimetableSlot)
  .delete(protect, facultyOrAdmin, deleteTimetableSlot);

export default router;
