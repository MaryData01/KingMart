import { Suspense } from 'react';
import LoginContent from './LoginContent.js';

export const metadata = {
  title: 'Kings Mart | Royal Authentication',
  description: 'Access your Royal Account, view your loyalty point metrics, review purchases history, and config bespoke shipping details.'
};

function AuthLoading() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-gold"></div>
      <p className="mt-4 text-brand-navy/60 font-serif italic">Validating royal credentials...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginContent />
    </Suspense>
  );
}
