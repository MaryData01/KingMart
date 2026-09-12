import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  checkoutStripe,
  verifyPayment
} from '../controllers/orderController.js';
import { protect, parseUser } from '../middleware/auth.js';

const router = express.Router();

// Order creation and tracking
router.post('/', parseUser, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', parseUser, getOrderById);

// Stripe Checkout and payment verification endpoints
router.post('/:id/pay/stripe', parseUser, checkoutStripe);
router.post('/:id/verify-payment', parseUser, verifyPayment);

export default router;
