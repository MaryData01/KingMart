'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star } from 'lucide-react';
import { toggleWishlist } from '../../store/slices/wishlistSlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);

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
  };

  const handleRemove = (product) => {
    dispatch(toggleWishlist(product));
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Heart className="h-16 w-16 text-brand-gold mx-auto mb-6" />
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-brand-navy mb-4">
          Your Royal Wishlist is Empty
        </h2>
        <p className="text-sm text-brand-navy/60 max-w-sm mx-auto mb-8 leading-relaxed">
          Mark the products you desire while browsing the boutique to save them here.
        </p>
        <Link href="/shop" className="btn-gold text-xs py-3.5 px-8">
          Explore the Boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-brand-navy mb-8 border-b border-brand-gold/15 pb-4">
        Royal Wishlist
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {wishlistItems.map((product) => (
          <div key={product._id} className="luxury-card group flex flex-col h-full bg-white relative">
            
            {/* Trash button */}
            <button 
              onClick={() => handleRemove(product)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/95 shadow-sm text-brand-navy hover:text-red-500 hover:scale-110 transition-all duration-300 focus:outline-none"
              title="Remove from Wishlist"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Image */}
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

              <div className="mt-auto flex items-baseline gap-2">
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
        ))}
      </div>

      <div className="mt-12">
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-navy hover:text-brand-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Browsing
        </Link>
      </div>

    </div>
  );
}
