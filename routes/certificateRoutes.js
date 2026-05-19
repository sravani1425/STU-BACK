import express from 'express';
import {
  uploadCertificate,
  getMyCertificates,
  getCertificatesByStudent,
  getCertificatesByRoll
} from '../controllers/certificateController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { facultyOrAdmin } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.single('file'), uploadCertificate);

router.route('/my')
  .get(protect, getMyCertificates);

router.route('/student/:studentId')
  .get(protect, facultyOrAdmin, getCertificatesByStudent);

router.route('/roll/:rollNumber')
  .get(protect, facultyOrAdmin, getCertificatesByRoll);

export default router;
