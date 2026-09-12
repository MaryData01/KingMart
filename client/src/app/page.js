'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowRight, 
  Crown, 
  Award, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart, 
  ShoppingBag,
  Star,
  Copy,
  Check
} from 'lucide-react';
import api from '../utils/api.js';
import { addToCart } from '../store/slices/cartSlice.js';
import { toggleWishlist } from '../store/slices/wishlistSlice.js';

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const { data } = await api.get('/products?limit=4&sort=-createdAt');
        if (data && data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching featured products from API:', error.message);
        // Fallback mock items in case of connection failure
        setProducts([
          {
            _id: '1',
            name: 'Royal Navy Velvet Blazer',
            price: 280.00,
            rating: 4.8,
            numReviews: 2,
            images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'],
            stock: 12,
            sizes: ['S', 'M', 'L'],
            colors: ['Navy'],
            brand: 'Kings Tailored'
          },
          {
            _id: '2',
            name: 'Duchess Silk Wrap Gown',
            price: 420.00,
            rating: 5.0,
            numReviews: 1,
            images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80'],
            stock: 8,
            sizes: ['XS', 'S', 'M'],
            colors: ['Gold'],
            brand: 'Empress Attire'
          },
          {
            _id: '3',
            name: 'Sovereign Gold-Plated Chronograph',
            price: 550.00,
            rating: 5.0,
            numReviews: 1,
            images: ['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80'],
            stock: 6,
            sizes: ['One Size'],
            colors: ['Gold'],
            brand: 'Monarch Watch Co.'
          },
          {
            _id: '4',
            name: 'Monarch Double-Breasted Trenchcoat',
            price: 350.00,
            originalPrice: 450.00,
            rating: 0,
            numReviews: 0,
            images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'],
            stock: 10,
            sizes: ['M', 'L'],
            colors: ['Beige'],
            brand: 'Kings Tailored'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedProducts();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('KING20');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: product.sizes[0],
      color: product.colors[0],
      qty: 1,
      stock: product.stock
    }));
    // Flash a redirect to cart or show confirmation
  };

  const isWishlisted = (productId) => wishlistItems.some((x) => x._id === productId);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Cinematic Hero Section */}
      <section className="relative h-[85vh] bg-brand-navy flex items-center justify-center overflow-hidden">
        {/* Background Image overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transform motion-safe:animate-[pulse_10s_infinite]" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80')` }}
        />
        {/* Navy gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/80 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left z-10 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/30 mb-6 rounded-none">
              <Crown className="h-4 w-4 text-brand-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">The Royal Collection</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white uppercase tracking-wider leading-tight mb-6">
              Dress Like <span className="text-brand-gold">Royalty</span>
            </h1>
            
            <p className="text-brand-sand/80 text-lg leading-relaxed mb-10 max-w-xl">
              Immerse yourself in hand-selected fabrics, impeccable bespoke tailoring, and luxury collections designed for the discerning aristocrat.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Link href="/shop?category=Men" className="btn-gold text-sm py-4 px-8 tracking-widest">
                Shop Men's Wear
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/shop?category=Women" className="btn-navy border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy text-sm py-4 px-8 tracking-widest">
                Shop Women's Wear
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Divider */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
      </section>

      {/* Brand Value Propositions */}
      <section className="bg-white py-12 border-b border-brand-navy/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center p-4">
              <div className="p-3 bg-brand-sand text-brand-gold rounded-full mb-3">
                <Crown className="h-6 w-6" />
              </div>
              <h5 className="font-bold text-xs uppercase tracking-widest text-brand-navy mb-1">Royal Heritage</h5>
              <p className="text-xs text-brand-navy/60">Tailored with bespoke precision</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="p-3 bg-brand-sand text-brand-gold rounded-full mb-3">
                <Truck className="h-6 w-6" />
              </div>
              <h5 className="font-bold text-xs uppercase tracking-widest text-brand-navy mb-1">Imperial Express</h5>
              <p className="text-xs text-brand-navy/60">Free shipping on orders above ₦150,000</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="p-3 bg-brand-sand text-brand-gold rounded-full mb-3">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h5 className="font-bold text-xs uppercase tracking-widest text-brand-navy mb-1">Easy Returns</h5>
              <p className="text-xs text-brand-navy/60">30-day royal exchange guarantee</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="p-3 bg-brand-sand text-brand-gold rounded-full mb-3">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h5 className="font-bold text-xs uppercase tracking-widest text-brand-navy mb-1">Secure Checkout</h5>
              <p className="text-xs text-brand-navy/60">Stripe encrypted payments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Showcase */}
      <section className="py-20 bg-brand-sand/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-wider text-brand-navy mb-2">
              Curated Collections
            </h2>
            <div className="h-0.5 w-16 bg-brand-gold mx-auto mb-4" />
            <p className="text-sm text-brand-navy/60 max-w-md mx-auto">
              Select your royal standard from our dedicated catalogs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Men */}
            <div className="group relative h-[450px] overflow-hidden shadow-md">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent opacity-85" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="font-serif text-2xl font-bold text-white mb-2 uppercase tracking-wide">The Sovereign Gentleman</h3>
                <p className="text-xs text-brand-sand/80 mb-6">Velvet blazers, silk ties, Italian leather loafers</p>
                <Link href="/shop?category=Men" className="text-brand-gold text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:translate-x-1.5 transition-transform duration-300">
                  Shop Men's Wear <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Women */}
            <div className="group relative h-[450px] overflow-hidden shadow-md">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent opacity-85" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="font-serif text-2xl font-bold text-white mb-2 uppercase tracking-wide">The Royal Lady</h3>
                <p className="text-xs text-brand-sand/80 mb-6">Mulberry silk evening gowns, clutches, fine gold hoops</p>
                <Link href="/shop?category=Women" className="text-brand-gold text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:translate-x-1.5 transition-transform duration-300">
                  Shop Women's Wear <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Accessories */}
            <div className="group relative h-[450px] overflow-hidden shadow-md">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent opacity-85" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="font-serif text-2xl font-bold text-white mb-2 uppercase tracking-wide">Palace Accessories</h3>
                <p className="text-xs text-brand-sand/80 mb-6">Gold-plated timepieces, wool fedoras, silk scarves</p>
                <Link href="/shop?category=Accessories" className="text-brand-gold text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 hover:translate-x-1.5 transition-transform duration-300">
                  Shop Accessories <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Products Collection */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 border-b border-brand-gold/15 pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wider text-brand-navy">
                Bespoke New Arrivals
              </h2>
              <p className="text-sm text-brand-navy/50">Our latest seasonal drops, tailored for majesty.</p>
            </div>
            <Link href="/shop" className="group text-brand-navy hover:text-brand-gold text-sm font-semibold tracking-wider uppercase flex items-center gap-1.5 mt-4 sm:mt-0 transition-colors">
              View Entire Boutique
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="shimmer h-[320px] w-full mb-4" />
                  <div className="shimmer h-4 w-2/3 mb-2" />
                  <div className="shimmer h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            /* Product Card Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product._id} className="luxury-card group flex flex-col h-full bg-white relative">
                  
                  {/* Heart / Wishlist Toggle */}
                  <button 
                    onClick={() => dispatch(toggleWishlist(product))}
                    className={`absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/95 shadow-sm text-brand-navy hover:text-red-500 hover:scale-110 transition-all duration-300 focus:outline-none`}
                  >
                    <Heart 
                      className={`h-4.5 w-4.5 ${isWishlisted(product._id) ? 'fill-red-500 text-red-500' : 'text-brand-navy/80'}`} 
                    />
                  </button>

                  {/* Image container */}
                  <div className="relative h-[340px] w-full overflow-hidden bg-brand-sand/10 border-b border-brand-sand">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      onClick={() => router.push(`/product/${product._id}`)}
                      className="w-full h-full object-cover object-center cursor-pointer transition-transform duration-750 group-hover:scale-105"
                    />
                    
                    {/* Add to Cart Hover Overlay */}
                    {product.stock > 0 && (
                      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-brand-navy/80 to-transparent">
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="w-full btn-gold text-xs py-3 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add To Royal Cart
                        </button>
                      </div>
                    )}

                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-brand-jet/60 flex items-center justify-center">
                        <span className="text-white text-xs uppercase tracking-widest border border-white/40 px-3 py-1 bg-brand-jet/40">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mb-1.5">
                      {product.brand}
                    </span>
                    <h4 
                      onClick={() => router.push(`/product/${product._id}`)}
                      className="font-serif text-base font-bold text-brand-navy mb-2 cursor-pointer hover:text-brand-gold transition-colors line-clamp-1"
                    >
                      {product.name}
                    </h4>

                    {/* Ratings */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex text-brand-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < Math.round(product.rating) ? 'fill-brand-gold' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-brand-navy/40">({product.numReviews})</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-brand-navy font-serif">
                          ₦{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs line-through text-brand-navy/30">
                            ₦{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Promotional Coupon & Discount Segment */}
      <section className="bg-brand-navy py-16 border-t border-b border-brand-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          
          <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full border border-brand-gold/10 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full border border-brand-gold/10 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="font-serif text-brand-gold text-sm font-bold uppercase tracking-widest mb-3">
              Imperial Grand Launch Offer
            </h3>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white uppercase tracking-wider mb-6">
              Claim 20% Off Your First Royal Attire
            </h2>
            <p className="text-brand-sand/75 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
              Apply the discount coupon code at checkout to enjoy a twenty percent markdown on any luxury apparel items site-wide.
            </p>

            {/* Code copying module */}
            <div className="inline-flex flex-col sm:flex-row items-stretch justify-center bg-brand-navy border border-brand-gold/40 p-1.5 w-full max-w-md">
              <span className="font-mono text-white text-lg tracking-widest font-bold bg-brand-navy/80 py-3 px-6 flex items-center justify-center gap-2">
                KING20
              </span>
              <button 
                onClick={handleCopyCode}
                className="btn-gold text-xs px-6 py-3 tracking-widest mt-2 sm:mt-0 uppercase flex items-center justify-center gap-1.5 transition-all duration-300"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Coupon Code
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Royal Loyalty Club Invitation */}
      <section className="py-20 bg-brand-sand/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-brand-gold/25 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center gap-10">
            
            <div className="bg-brand-navy text-brand-gold p-6 rounded-none shrink-0 border border-brand-gold/30">
              <Award className="h-16 w-16" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold uppercase tracking-widest mb-2">
                <Crown className="h-3.5 w-3.5" />
                Royal Member Club
              </div>
              <h3 className="font-serif text-2xl font-bold text-brand-navy mb-4 uppercase tracking-wider">
                Earn As You Dress Like Royalty
              </h3>
              <p className="text-sm text-brand-navy/70 leading-relaxed mb-6">
                Receive <strong>10 points for every ₦1</strong> spent on all bespoke garments and fine accessories. Redemptions translate to credit offsets directly at checkout, giving you premier savings as a return patron.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <Link href="/login" className="btn-navy text-xs tracking-wider font-semibold py-3.5 px-6">
                  Join Loyalty Club Free
                </Link>
                <span className="text-xs text-brand-navy/40 font-medium">
                  Points computed instantly post-payment confirmation.
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
