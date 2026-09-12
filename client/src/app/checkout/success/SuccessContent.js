'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Crown, CheckCircle2, ShoppingBag, ArrowRight, Award, Mail, Truck } from 'lucide-react';
import api from '../../../utils/api.js';

export default function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'unknown';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (orderId === 'unknown' || orderId.startsWith('mock_')) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        if (data) {
          setOrder(data);
        }
      } catch (err) {
        console.error('Failed to fetch placed order details from API', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 w-full flex flex-col justify-center min-h-[70vh]">
      
      <div className="bg-white border border-brand-gold/25 p-8 sm:p-12 text-center shadow-md relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
        
        {/* Big Animated Success Checkmark */}
        <div className="inline-flex items-center justify-center p-3 bg-green-50 text-green-600 rounded-full border border-green-200 mb-6 motion-safe:animate-bounce">
          <CheckCircle2 className="h-14 w-14" />
        </div>

        <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block mb-2">
          Order Authenticated
        </span>
        <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-brand-navy mb-4">
          Dress Like Royalty
        </h1>
        <p className="text-sm text-brand-navy/60 leading-relaxed max-w-md mx-auto mb-8">
          Thank you for choosing Kings Mart. Your payment is complete, and our tailors are preparing your bespoke garments.
        </p>

        {/* Order Receipt Details */}
        <div className="bg-brand-sand/30 border border-brand-navy/5 p-6 text-left space-y-4 mb-8">
          <div className="flex justify-between items-baseline border-b border-brand-navy/5 pb-2 text-xs">
            <span className="text-brand-navy/40 font-bold uppercase tracking-wider">Order Reference ID</span>
            <span className="font-mono text-brand-navy font-bold truncate max-w-[200px] sm:max-w-xs">{orderId}</span>
          </div>

          {order ? (
            <>
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-brand-navy/60 font-semibold">Total Invoice Amount</span>
                <span className="font-serif font-bold text-brand-navy text-base">₦{order.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-brand-navy/60 font-semibold">Bespoke Pieces</span>
                <span className="font-bold text-brand-navy">{order.orderItems.reduce((acc, x) => acc + x.qty, 0)} items</span>
              </div>
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-brand-navy/60 font-semibold">Delivery Target</span>
                <span className="font-semibold text-brand-navy">Royal Courier Express (3-5 business days)</span>
              </div>
            </>
          ) : (
            <div className="text-xs text-brand-navy/50 italic text-center py-2">
              Bespoke metrics registered under local cache.
            </div>
          )}
        </div>

        {/* Loyalty Point Credit Notice */}
        <div className="bg-brand-navy border border-brand-gold/20 p-5 flex items-start gap-3.5 text-left text-white mb-8">
          <Award className="h-6 w-6 text-brand-gold shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wider mb-1">Loyalty Club Updated</h4>
            <p className="text-xs text-brand-sand/70 leading-relaxed">
              Based on your order, your account has been credited with **{order ? Math.round(order.totalPrice * 10) : 1200} Royal Loyalty Points**. Check your dashboard for active balances and unlock privileges.
            </p>
          </div>
        </div>

        {/* Mail Dispatch Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-brand-navy/50 font-semibold mb-10">
          <Mail className="h-4.5 w-4.5 text-brand-gold" />
          <span>A confirmation receipt has been dispatched to your registered email inbox.</span>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="btn-navy text-xs py-3.5 px-6 uppercase tracking-widest flex items-center justify-center gap-1.5">
            Track Order In Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/shop" className="border border-brand-navy/15 text-brand-navy hover:border-brand-gold hover:text-brand-gold px-6 py-3.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-colors">
            Continue Shopping
          </Link>
        </div>

      </div>

    </div>
  );
}
