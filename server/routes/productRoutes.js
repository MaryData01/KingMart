import express from 'express';
import {
  getProducts,
  getProductById
} from '../controllers/productController.js';
import {
  addProductReview,
  getProductReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Catalog routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Reviews routes (scoped to products)
router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, addProductReview);

export default router;
