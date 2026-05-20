import express from 'express';
import { createNotice, getNotices, deleteNotice } from '../controllers/noticeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { facultyOrAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, facultyOrAdmin, createNotice)
  .get(protect, getNotices);

router.route('/:id')
  .delete(protect, facultyOrAdmin, deleteNotice);

export default router;
