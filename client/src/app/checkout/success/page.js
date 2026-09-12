import { Suspense } from 'react';
import SuccessContent from './SuccessContent.js';

export const metadata = {
  title: 'Kings Mart | Order Confirmation',
  description: 'Your order was successfully placed and registered. Tailoring begins immediately.'
};

function SuccessLoading() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-gold"></div>
      <p className="mt-4 text-brand-navy/60 font-serif italic">Compiling order records...</p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}
