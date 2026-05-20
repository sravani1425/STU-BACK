import express from 'express';
import {
  getNotifications,
  readAllNotifications,
  createNotification
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { facultyOrAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .post(protect, facultyOrAdmin, createNotification);

router.route('/read-all')
  .put(protect, readAllNotifications);

export default router;
