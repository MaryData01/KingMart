import express from 'express';
import {
  getAdminStats,
  getOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getUsers,
  getPromos,
  createPromoCode,
  deletePromoCode
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Apply auth & admin middlewares to all admin routes
router.use(protect);
router.use(admin);

// Executive Dashboard statistics
router.get('/stats', getAdminStats);

// Order logistics management
router.route('/orders')
  .get(getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Product CRUD routes
router.post('/products', upload.array('images', 5), createProduct);
router.route('/products/:id')
  .put(upload.array('images', 5), updateProduct)
  .delete(deleteProduct);

// Customers list view
router.get('/users', getUsers);

// Promo coupons manager routes
router.route('/promos')
  .get(getPromos)
  .post(createPromoCode);
router.delete('/promos/:id', deletePromoCode);

export default router;
