import mongoose from 'mongoose';

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  singleUse: {
    type: Boolean,
    default: false
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Check if coupon is valid
promoSchema.methods.isValid = function (userId = null) {
  if (!this.isActive) return false;
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) return false;
  if (this.singleUse && userId && this.usedBy.includes(userId)) return false;
  return true;
};

const Promo = mongoose.model('Promo', promoSchema);
export default Promo;
