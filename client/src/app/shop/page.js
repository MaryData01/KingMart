import { Suspense } from 'react';
import ShopContent from './ShopContent.js';

export const metadata = {
  title: 'Kings Mart Boutique | Shop All Products',
  description: 'Explore the full range of premium bespoke tailored blazers, silk wrap gowns, watches, and custom fashion accessories.'
};

function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      <p className="mt-4 text-brand-navy/60 font-serif italic">Opening the Royal Closet...</p>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  );
}
