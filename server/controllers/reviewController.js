import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Create a new product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const addProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed by this user');
    }

    // Check if verified purchase (paid order containing this product)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      isPaid: true,
      'orderItems.product': productId
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: !!hasPurchased
    });

    // Recalculate average rating & reviews count
    const reviews = await Review.find({ product: productId });
    product.numReviews = reviews.length;
    product.rating = 
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle helpful vote on a review
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const toggleReviewHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    const userId = req.user._id;
    const hasVoted = review.helpfulUsers.includes(userId);

    if (hasVoted) {
      // Remove upvote (Toggle off)
      review.helpfulUsers = review.helpfulUsers.filter(id => id.toString() !== userId.toString());
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      // Add upvote
      review.helpfulUsers.push(userId);
      review.helpfulVotes += 1;
    }

    await review.save();
    res.json({
      helpfulVotes: review.helpfulVotes,
      hasVoted: !hasVoted
    });
  } catch (error) {
    next(error);
  }
};
