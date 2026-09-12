import express from 'express';
import { validatePromoCode } from '../controllers/promoController.js';

const router = express.Router();

// Real-time coupon validity checker
router.post('/validate', validatePromoCode);

export default router;
