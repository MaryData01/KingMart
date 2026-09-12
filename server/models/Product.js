import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 }, // For showing strikethroughs on sale items
  sizes: [{ type: String, default: ['S', 'M', 'L', 'XL'] }],
  colors: [{ type: String, default: ['Black', 'White', 'Navy', 'Gold'] }],
  category: { type: String, required: true }, // e.g. 'Men', 'Women', 'Accessories'
  categories: [{ type: String }], // e.g. ['Men', 'Women', 'Accessories', 'New Arrivals', 'Sale']
  brand: { type: String, default: 'Kings Mart' },
  stock: { type: Number, required: true, default: 10, min: 0 },
  images: [{ type: String, required: true }], // Array of image URLs (Cloudinary or fallbacks)
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

// Create indices for search and filtering optimization
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ categories: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
