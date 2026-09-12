import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  toggleWishlist
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Authentication and session management
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Profile (Protected routes)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Shipping Addresses (Protected routes)
router.post('/profile/address', protect, addUserAddress);
router.route('/profile/address/:addressId')
  .put(protect, updateUserAddress)
  .delete(protect, deleteUserAddress);

// Wishlist toggle (Protected routes)
router.post('/wishlist/:productId', protect, toggleWishlist);

export default router;
