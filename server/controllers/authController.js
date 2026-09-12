import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { sendEmail } from '../config/nodemailer.js';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Password strength check (simplified, client checks too)
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to DB
      user.refreshTokens.push(refreshToken);
      await user.save();

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        loyaltyPoints: user.loyaltyPoints,
        accessToken,
        refreshToken
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to user
      user.refreshTokens.push(refreshToken);
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        loyaltyPoints: user.loyaltyPoints,
        addresses: user.addresses,
        wishlist: user.wishlist,
        accessToken,
        refreshToken
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear refresh token
// @route   POST /api/auth/logout
// @access  Public (Requires sending the refresh token to invalidate)
export const logoutUser = async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const user = await User.findOne({ refreshTokens: refreshToken });
    
    if (user) {
      // Filter out the logged out refresh token
      user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
      await user.save();
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshAccessToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      res.status(401);
      throw new Error('Refresh token is required');
    }

    const user = await User.findOne({ refreshTokens: refreshToken });

    if (!user) {
      res.status(403);
      throw new Error('Invalid or expired refresh token');
    }

    // Verify token
    jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'kingsmart_super_secret_refresh_token_456!', 
      (err, decoded) => {
        if (err || user._id.toString() !== decoded.id) {
          res.status(403);
          throw new Error('Token verification failed');
        }

        const newAccessToken = generateAccessToken(user._id);
        res.json({ accessToken: newAccessToken });
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // We return 200/success anyway to avoid email enumeration attacks
      return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    // Generate a short-lived reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'kingsmart_super_secret_access_token_123!',
      { expiresIn: '15m' }
    );

    // Front-end link
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; background-color: #F5F0E8;">
        <h2 style="color: #0A1628; border-bottom: 2px solid #C9A84C; padding-bottom: 10px;">Kings Mart - Reset Password</h2>
        <p>You requested to reset your password. Please click the button below to establish a new password. This link is valid for 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0A1628; color: #C9A84C; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #C9A84C;">Reset Password</a>
        </div>
        <p>If you did not request this email, you can safely ignore it.</p>
        <hr style="border: 0; border-top: 1px solid #C9A84C; margin-top: 30px;">
        <p style="font-size: 11px; color: #666; text-align: center;">Kings Mart © 2026. Dress Like Royalty.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Kings Mart - Password Reset Link',
      html: htmlContent,
      text: `Reset your password at: ${resetUrl}`
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      res.status(400);
      throw new Error('Token and new password are required');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'kingsmart_super_secret_access_token_123!');
    } catch (err) {
      res.status(400);
      throw new Error('Reset link is invalid or has expired');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Assign new password (hash handled by pre-save hook)
    user.password = newPassword;
    // Clear out refresh tokens to force re-login on all devices
    user.refreshTokens = [];
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('wishlist');
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      if (req.body.profilePhoto !== undefined) {
        user.profilePhoto = req.body.profilePhoto;
      }

      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        loyaltyPoints: updatedUser.loyaltyPoints,
        profilePhoto: updatedUser.profilePhoto,
        addresses: updatedUser.addresses,
        wishlist: updatedUser.wishlist
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/profile/address
// @access  Private
export const addUserAddress = async (req, res, next) => {
  const { name, street, city, state, zipCode, country, phone, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // If setting as default, clear any other default address
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      name,
      street,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault: isDefault || user.addresses.length === 0 // Default if it is the first address
    });

    const updatedUser = await user.save();
    res.status(201).json(updatedUser.addresses);
  } catch (error) {
    next(error);
  }
};

// @desc    Update shipping address
// @route   PUT /api/auth/profile/address/:addressId
// @access  Private
export const updateUserAddress = async (req, res, next) => {
  const addressId = req.params.addressId;
  const { name, street, city, state, zipCode, country, phone, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    // Update fields
    address.name = name || address.name;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.country = country || address.country;
    address.phone = phone || address.phone;

    // Handle default address setting toggle
    if (isDefault && !address.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === addressId ? true : false;
      });
    } else if (isDefault === false && address.isDefault) {
      address.isDefault = false;
    }

    const updatedUser = await user.save();
    res.json(updatedUser.addresses);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/profile/address/:addressId
// @access  Private
export const deleteUserAddress = async (req, res, next) => {
  const addressId = req.params.addressId;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const addressToDelete = user.addresses.id(addressId);
    if (!addressToDelete) {
      res.status(404);
      throw new Error('Address not found');
    }

    const wasDefault = addressToDelete.isDefault;

    // Remove the address
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

    // If we deleted the default address and have others, make the first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item in wishlist
// @route   POST /api/auth/wishlist/:productId
// @access  Private
export const toggleWishlist = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const user = await User.findById(req.user._id);
    const product = await Product.findById(productId);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const index = user.wishlist.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      isAdded = true;
    }

    await user.save();
    res.json({ wishlist: user.wishlist, isAdded });
  } catch (error) {
    next(error);
  }
};

