'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  Award, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Check,
  AlertTriangle,
  ThumbsUp
} from 'lucide-react';
import api from '../../../utils/api.js';
import { addToCart } from '../../../store/slices/cartSlice.js';
import { toggleWishlist } from '../../../store/slices/wishlistSlice.js';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);

  // Loading States
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form selections
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Fetch product and reviews details
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.get(`/products/${id}`);
      if (data) {
        setProduct(data);
        setSelectedImage(data.images[0]);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      }

      // Fetch reviews
      const reviewsRes = await api.get(`/products/${id}/reviews`);
      if (reviewsRes.data) {
        setReviews(reviewsRes.data);
      }
    } catch (err) {
      console.error('API product details fetch failed. Triggering fallback data...', err.message);
      // Fallback details based on ID
      const fallbackProducts = [
        {
          _id: '1',
          name: 'Royal Navy Velvet Blazer',
          description: 'Command the room in this slim-fit, single-breasted blazer. Crafted from premium velvet, featuring double vents, silk satin lapels, and custom gold-embossed crest buttons. A true masterclass in luxury tailoring.',
          price: 280.00,
          rating: 4.8,
          numReviews: 2,
          stock: 12,
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          colors: ['Navy', 'Black'],
          brand: 'Kings Tailored',
          images: [
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80'
          ]
        },
        {
          _id: '2',
          name: 'Duchess Silk Wrap Gown',
          description: 'Flow with effortless elegance. Made from 100% pure mulberry silk, this dress drapes beautifully to the floor with an adjustable wrap waist, romantic flared sleeves, and a subtle thigh slit. Suitable for premium soirées.',
          price: 420.00,
          rating: 5.0,
          numReviews: 1,
          stock: 8,
          sizes: ['XS', 'S', 'M', 'L'],
          colors: ['Gold', 'Crimson', 'Emerald'],
          brand: 'Empress Attire',
          images: [
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
          ]
        },
        {
          _id: '3',
          name: 'Sovereign Gold-Plated Chronograph',
          description: 'Exquisite timekeeping for the modern aristocrat. Built with a Japanese quartz movement, 18k gold-plated stainless steel casing, mineral scratch-resistant crystal face, and a rich navy alligator-pattern leather strap.',
          price: 550.00,
          rating: 5.0,
          numReviews: 1,
          stock: 6,
          sizes: ['One Size'],
          colors: ['Gold', 'Silver'],
          brand: 'Monarch Watch Co.',
          images: [
            'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'
          ]
        }
      ];

      const found = fallbackProducts.find(x => x._id === id);
      if (found) {
        setProduct(found);
        setSelectedImage(found.images[0]);
        setSelectedSize(found.sizes[0]);
        setSelectedColor(found.colors[0]);
        setReviews([
          {
            _id: 'rev1',
            name: 'Prince Henry',
            rating: 5,
            comment: 'Absolutely superb. The materials used represent real luxury. Fits exactly as described.',
            isVerifiedPurchase: true,
            helpfulVotes: 3,
            createdAt: new Date().toISOString()
          }
        ]);
      } else {
        setError('Bespoke garment details could not be found.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    if (!selectedColor) {
      setColorError(true);
      return;
    }
    setSizeError(false);
    setColorError(false);

    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      qty,
      stock: product.stock
    }));

    router.push('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError('Please write an review statement before submitting.');
      return;
    }

    try {
      setReviewError('');
      const { data } = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });

      if (data) {
        setReviewSuccess(true);
        setReviewComment('');
        setReviewRating(5);
        // Refresh product details and reviews
        fetchProductDetails();
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit product review. Make sure you are logged in.');
    }
  };

  const handleUpvoteReview = async (reviewId) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      fetchProductDetails();
    } catch (err) {
      console.error('Review helpfulness upvote failed:', err.message);
    }
  };

  const isWishlisted = (productId) => wishlistItems.some((x) => x._id === productId);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
        <p className="mt-4 text-brand-navy/60 font-serif italic">Examining fabric detail...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h3 className="font-serif text-2xl font-bold text-red-500 mb-4">{error || 'Garment details missing'}</h3>
        <button onClick={() => router.push('/shop')} className="btn-gold text-xs py-3 px-6">
          Back to Boutique
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
        
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="relative h-[550px] w-full overflow-hidden bg-white border border-brand-gold/15 p-1.5 shadow-sm">
            <img 
              src={selectedImage} 
              alt={product.name} 
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="grid grid-cols-5 gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`h-24 w-full bg-white border overflow-hidden p-1 shadow-sm transition-all duration-300 ${
                  selectedImage === img ? 'border-brand-gold scale-102 bg-brand-gold/5' : 'border-brand-navy/15 hover:border-brand-gold'
                }`}
              >
                <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover object-center" />
              </button>
            ))}
          </div>
        </div>

        {/* Configurations Information */}
        <div className="bg-white p-8 border border-brand-gold/15 shadow-sm">
          <span className="text-xs text-brand-gold font-bold uppercase tracking-widest block mb-2">
            {product.brand}
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-navy mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-brand-gold/15">
            <div className="flex text-brand-gold">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-brand-gold' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-brand-navy/60">
              {product.rating.toFixed(1)} / 5.0 ({reviews.length} Customer Reviews)
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-6 font-serif">
            <span className="text-3xl font-bold text-brand-navy">
              ₦{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-lg line-through text-brand-navy/30">
                ₦{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-brand-navy/70 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Size Selectors */}
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                Select Size
              </label>
              {sizeError && <span className="text-xs text-red-500 font-medium">Please choose a size</span>}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => { setSelectedSize(sz); setSizeError(false); }}
                  className={`px-4 py-2 text-xs font-bold border transition-all ${
                    selectedSize === sz 
                      ? 'border-brand-gold bg-brand-gold text-brand-navy' 
                      : 'border-brand-navy/15 text-brand-navy hover:border-brand-gold'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selectors */}
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                Select Color
              </label>
              {colorError && <span className="text-xs text-red-500 font-medium">Please choose a color</span>}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((col) => (
                <button
                  key={col}
                  onClick={() => { setSelectedColor(col); setColorError(false); }}
                  className={`px-4 py-2 text-xs font-bold border transition-all ${
                    selectedColor === col 
                      ? 'border-brand-gold bg-brand-gold/15 text-brand-gold border-2' 
                      : 'border-brand-navy/15 text-brand-navy hover:border-brand-gold'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Qty & Stock Indicators */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 mb-8 pt-6 border-t border-brand-gold/15">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center border border-brand-navy/15 bg-brand-sand/20">
                <button 
                  disabled={qty === 1}
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 hover:text-brand-gold disabled:opacity-30 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-brand-navy">{qty}</span>
                <button 
                  disabled={qty >= product.stock}
                  onClick={() => setQty(prev => Math.min(product.stock, prev + 1))}
                  className="px-3 py-1.5 hover:text-brand-gold disabled:opacity-30 text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="sm:mt-6">
              {product.stock <= 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                  Out Of Stock
                </span>
              ) : product.stock < 5 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Low Stock: Only {product.stock} Left!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                  <Check className="h-3.5 w-3.5" />
                  In Stock: Ready for Tailoring
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
              className="flex-grow btn-gold text-xs py-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:hover:bg-brand-gold"
            >
              <ShoppingBag className="h-4 w-4" />
              Add To Royal Cart
            </button>

            <button
              onClick={() => dispatch(toggleWishlist(product))}
              className="px-4 border border-brand-navy/15 hover:border-brand-gold hover:text-brand-gold text-brand-navy flex items-center justify-center transition-colors focus:outline-none"
            >
              <Heart className={`h-5 w-5 ${isWishlisted(product._id) ? 'fill-red-500 text-red-500 border-none' : ''}`} />
            </button>
          </div>

          {/* Accordion Specs */}
          <div className="space-y-4 pt-6 border-t border-brand-gold/15 text-xs text-brand-navy/70">
            <div className="flex items-center gap-3">
              <Truck className="h-4.5 w-4.5 text-brand-gold shrink-0" />
              <span>Free VIP shipping for orders exceeding <strong>₦150,000</strong>. Delivered in presentation box.</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4.5 w-4.5 text-brand-gold shrink-0" />
              <span>30-day trial return period. Returns picked up by courier service.</span>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-4.5 w-4.5 text-brand-gold shrink-0" />
              <span>Purchase grants <strong>{product.price * 10} loyalty points</strong> toward your club account.</span>
            </div>
          </div>

        </div>
      </div>

      {/* Reviews section */}
      <section className="border-t border-brand-gold/20 pt-16">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-brand-navy mb-8">
          Customer Critiques ({reviews.length})
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Review List (2/3 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="bg-white border border-brand-gold/10 p-6 text-center italic text-brand-navy/50 text-sm">
                No reviews yet for this royal garment. Be the first to express your appraisal!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-6 border border-brand-gold/10 relative">
                  
                  {/* Verified Badge */}
                  {rev.isVerifiedPurchase && (
                    <span className="absolute top-4 right-4 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-green-200">
                      Verified Purchase
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-sm text-brand-navy">{rev.name}</span>
                    <span className="text-[10px] text-brand-navy/40">
                      {new Date(rev.createdAt || rev.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex text-brand-gold mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < rev.rating ? 'fill-brand-gold' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>

                  <p className="text-sm text-brand-navy/70 leading-relaxed mb-4">
                    {rev.comment}
                  </p>

                  {/* Upvote helpfulness */}
                  <button 
                    onClick={() => handleUpvoteReview(rev._id)}
                    className="flex items-center gap-1.5 text-xs text-brand-navy/50 hover:text-brand-gold transition-colors font-semibold focus:outline-none"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    Helpful ({rev.helpfulVotes || 0})
                  </button>

                </div>
              ))
            )}
          </div>

          {/* Add Review Form (1/3 columns) */}
          <div className="bg-brand-navy text-white p-6 border border-brand-gold/20">
            <h3 className="font-serif text-lg font-bold uppercase text-brand-gold tracking-wide mb-4">
              Write an Appraisal
            </h3>

            {reviewSuccess ? (
              <div className="bg-green-500/10 border border-green-500/30 p-4 text-green-300 text-xs leading-relaxed">
                Appraisal submitted successfully! Thank you for sharing your feedback with the Palace.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                
                {reviewError && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-300 text-xs">
                    {reviewError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-gold mb-1.5">
                    Rating
                  </label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full bg-brand-navy border border-brand-gold/30 text-sm py-2 px-3 focus:outline-none focus:border-brand-gold text-white"
                  >
                    <option value="5">5 Stars - Royal Standard</option>
                    <option value="4">4 Stars - Very Pleased</option>
                    <option value="3">3 Stars - Standard Garment</option>
                    <option value="2">2 Stars - Needs Improvement</option>
                    <option value="1">1 Star - Displeased</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-gold mb-1.5">
                    Comments
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Provide details about texture, size fit, button quality..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-brand-navy border border-brand-gold/30 text-sm py-2 px-3 focus:outline-none focus:border-brand-gold text-white placeholder-white/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-gold text-xs py-3"
                >
                  Submit Appraisal
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
