import express from 'express';
import { toggleReviewHelpful } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Toggle helpfulness voting on an individual review card
router.post('/:id/helpful', protect, toggleReviewHelpful);

export default router;
