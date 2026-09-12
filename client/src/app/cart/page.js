'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag, 
  X,
  Award,
  Truck,
  ArrowLeft
} from 'lucide-react';
import { 
  updateCartQty, 
  removeFromCart, 
  applyPromoCode, 
  removePromoCode 
} from '../../store/slices/cartSlice.js';
import api from '../../utils/api.js';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);
  const { cartItems, promoCode, itemsPrice, shippingPrice, discountPrice, totalPrice } = cart;

  const [promoInput, setPromoInput] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Shipping progress indicator (₦150,000 target)
  const shippingThreshold = 150000;
  const remainingForFreeShipping = Math.max(0, shippingThreshold - itemsPrice);

  const handleQtyChange = (item, newQty) => {
    dispatch(updateCartQty({
      product: item.product,
      size: item.size,
      color: item.color,
      qty: Math.max(1, Math.min(newQty, item.stock))
    }));
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({
      product: item.product,
      size: item.size,
      color: item.color
    }));
  };

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    try {
      setPromoError('');
      setPromoSuccess(false);
      
      const { data } = await api.post('/promos/validate', {
        code: promoInput.trim().toUpperCase()
      });

      if (data) {
        dispatch(applyPromoCode({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue
        }));
        setPromoSuccess(true);
        setPromoInput('');
      }
    } catch (err) {
      setPromoError(err.message || 'Invalid or expired promotional code.');
    }
  };

  const handleRemovePromo = () => {
    dispatch(removePromoCode());
    setPromoSuccess(false);
  };

  const handleCheckoutRedirect = () => {
    if (userInfo) {
      router.push('/checkout');
    } else {
      // Redirect to login with redirect parameters
      router.push('/login?redirect=checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-brand-gold mx-auto mb-6" />
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-brand-navy mb-4">
          Your Royal Cart is Empty
        </h2>
        <p className="text-sm text-brand-navy/60 max-w-sm mx-auto mb-8 leading-relaxed">
          Embark on your journey and fill your closet with our premium collection garments.
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
        Shopping Closet
      </h1>

      {/* Free shipping banner */}
      <div className="mb-8 bg-white border border-brand-gold/20 p-4 rounded-none flex items-center gap-3">
        <Truck className="h-5 w-5 text-brand-gold shrink-0" />
        <div className="text-sm text-brand-navy/80">
          {remainingForFreeShipping > 0 ? (
            <span>
              Add another <strong className="text-brand-gold font-bold">₦{remainingForFreeShipping.toLocaleString()}</strong> to qualify for <strong>Free Royal Courier Delivery</strong>!
            </span>
          ) : (
            <span className="text-green-700 font-semibold uppercase tracking-wider text-xs">
              🎉 Congratulations! Your order qualifies for Free Standard Shipping!
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart items list (2/3 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item, index) => (
            <div 
              key={`${item.product}-${item.size}-${item.color}`}
              className="bg-white p-6 border border-brand-gold/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm"
            >
              {/* Product Info details */}
              <div className="flex items-center gap-4">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-20 h-24 object-cover border border-brand-sand shadow-sm"
                />
                <div>
                  <h4 className="font-serif text-base font-bold text-brand-navy hover:text-brand-gold transition-colors">
                    <Link href={`/product/${item.product}`}>{item.name}</Link>
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-navy/60 mt-1.5 font-medium">
                    <span>Size: <strong className="text-brand-navy font-bold">{item.size}</strong></span>
                    <span>Color: <strong className="text-brand-navy font-bold">{item.color}</strong></span>
                  </div>
                  <span className="text-sm font-serif font-bold text-brand-navy block mt-2">
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Qty adjustments and removal */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-brand-sand">
                {/* Quantity */}
                <div className="inline-flex items-center border border-brand-navy/15 bg-brand-sand/10">
                  <button 
                    onClick={() => handleQtyChange(item, item.qty - 1)}
                    className="p-2 hover:text-brand-gold text-brand-navy font-bold"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-3 text-xs font-bold text-brand-navy">{item.qty}</span>
                  <button 
                    onClick={() => handleQtyChange(item, item.qty + 1)}
                    className="p-2 hover:text-brand-gold text-brand-navy font-bold"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Subtotal & trash */}
                <div className="flex items-center gap-4">
                  <span className="text-base font-bold font-serif text-brand-navy">
                    ₦{(item.price * item.qty).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleRemove(item)}
                    className="p-2 text-brand-navy/40 hover:text-red-500 transition-colors focus:outline-none"
                    title="Remove item"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}

          {/* Continue Shopping button */}
          <div>
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-navy hover:text-brand-gold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary sidebar (1/3 col) */}
        <aside className="bg-white p-6 border border-brand-gold/15 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold uppercase text-brand-navy tracking-wide pb-3 border-b border-brand-gold/10">
            Order Appraisals
          </h3>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between text-brand-navy/70">
              <span>Items Subtotal</span>
              <span className="font-serif font-semibold text-brand-navy">₦{itemsPrice.toLocaleString()}</span>
            </div>
            
            {/* Promo discounts */}
            {promoCode && (
              <div className="flex justify-between text-green-700 bg-green-50 p-2 border border-green-200">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Code: {promoCode.code}
                </span>
                <span className="font-serif font-bold">-₦{discountPrice.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-brand-navy/70">
              <span>Shipping cost</span>
              <span className="font-serif font-semibold text-brand-navy">
                {shippingPrice === 0 ? 'FREE' : `₦${shippingPrice.toLocaleString()}`}
              </span>
            </div>

            <hr className="border-brand-gold/10" />

            <div className="flex justify-between text-base font-bold text-brand-navy pt-2">
              <span>Grand Total</span>
              <span className="font-serif text-lg text-brand-gold">₦{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Loyalty computation banner */}
          <div className="bg-brand-navy/5 border border-brand-gold/10 p-3 flex items-start gap-2.5">
            <Award className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
            <div className="text-xs text-brand-navy/70 leading-relaxed">
              Upon checkout, this purchase will award <strong>{Math.round(totalPrice * 10)} Royal Loyalty Points</strong> to your account.
            </div>
          </div>

          {/* Coupon apply box */}
          <form onSubmit={handleApplyPromo} className="pt-4 border-t border-brand-gold/10">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-2">
              Apply Promo Code
            </label>
            
            {promoCode ? (
              <div className="flex items-center justify-between bg-brand-sand/30 border border-brand-gold/20 p-2.5 text-sm font-semibold">
                <span className="text-brand-navy">{promoCode.code} Applied</span>
                <button 
                  type="button" 
                  onClick={handleRemovePromo}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="KING20"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-grow bg-brand-sand/20 border border-brand-navy/15 px-3 py-2 text-sm focus:outline-none focus:border-brand-gold uppercase font-mono"
                />
                <button
                  type="submit"
                  className="btn-navy text-xs font-semibold py-2 px-4 uppercase"
                >
                  Apply
                </button>
              </div>
            )}

            {promoSuccess && (
              <p className="text-xs text-green-700 font-semibold mt-2.5">
                Promotion successfully validated and applied!
              </p>
            )}

            {promoError && (
              <p className="text-xs text-red-500 font-semibold mt-2.5">
                {promoError}
              </p>
            )}
          </form>

          {/* Checkout CTA */}
          <button
            onClick={handleCheckoutRedirect}
            className="w-full btn-gold text-xs py-4 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-widest"
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4" />
          </button>
        </aside>

      </div>

    </div>
  );
}
