import Promo from '../models/Promo.js';

// @desc    Validate a promo code
// @route   POST /api/promos/validate
// @access  Public (Optional auth for checking single-use)
export const validatePromoCode = async (req, res, next) => {
  const { code, userId } = req.body;

  try {
    if (!code) {
      res.status(400);
      throw new Error('Promo code is required');
    }

    const promo = await Promo.findOne({ code: code.toUpperCase() });

    if (!promo) {
      res.status(404);
      throw new Error('Invalid promo code');
    }

    // Check validity
    if (!promo.isActive) {
      res.status(400);
      throw new Error('Promo code is no longer active');
    }

    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      res.status(400);
      throw new Error('Promo code has expired');
    }

    if (promo.singleUse && userId) {
      const alreadyUsed = promo.usedBy.some(id => id.toString() === userId.toString());
      if (alreadyUsed) {
        res.status(400);
        throw new Error('Promo code has already been used by this account');
      }
    }

    res.json({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue
    });
  } catch (error) {
    next(error);
  }
};
