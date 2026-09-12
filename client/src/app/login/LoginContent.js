'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Crown, Key, Mail, User, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { loginRequest, loginSuccess, loginFail, clearError } from '../../store/slices/authSlice.js';
import api from '../../utils/api.js';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password reset message
  const [resetMessage, setResetMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  // Redirect parameter
  const redirect = searchParams.get('redirect') || 'dashboard';
  const expired = searchParams.get('expired');

  useEffect(() => {
    // If user is already logged in, redirect immediately
    if (userInfo) {
      router.push(redirect === 'dashboard' ? '/dashboard' : `/${redirect}`);
    }
    dispatch(clearError());
  }, [userInfo, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setResetMessage('');
    dispatch(clearError());

    // 1. Forgot password submission
    if (mode === 'forgot') {
      if (!email.trim()) {
        setValidationError('Please input your registered email address.');
        return;
      }
      try {
        await api.post('/auth/forgot-password', { email });
        setResetMessage('A reset link has been dispatched to your email (via Ethereal console fallback).');
        setEmail('');
      } catch (err) {
        setValidationError(err.message || 'Email lookup failed.');
      }
      return;
    }

    // 2. Register submission
    if (mode === 'register') {
      if (!name.trim() || !email.trim() || !password || !confirmPassword) {
        setValidationError('All form fields must be completed.');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Password entry and verification do not match.');
        return;
      }
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters in length.');
        return;
      }

      dispatch(loginRequest());
      try {
        const { data } = await api.post('/auth/register', { name, email, password });
        dispatch(loginSuccess(data));
      } catch (err) {
        dispatch(loginFail(err.message));
      }
      return;
    }

    // 3. Login submission
    if (mode === 'login') {
      if (!email.trim() || !password) {
        setValidationError('Please complete both email and password inputs.');
        return;
      }

      dispatch(loginRequest());
      try {
        const { data } = await api.post('/auth/login', { email, password });
        dispatch(loginSuccess(data));
      } catch (err) {
        dispatch(loginFail(err.message));
      }
    }
  };

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setValidationError('');
    setResetMessage('');
    dispatch(clearError());
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 w-full flex flex-col justify-center min-h-[70vh]">
      
      {/* Session Expired Notice */}
      {expired && (
        <div className="mb-6 bg-orange-50 border border-orange-200 p-4 text-orange-700 text-xs font-semibold flex items-start gap-2.5">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>Your login session has expired for security. Please sign in again.</span>
        </div>
      )}

      {/* Main card box */}
      <div className="bg-white border border-brand-gold/20 shadow-md p-8">
        
        {/* Logo and Greeting */}
        <div className="text-center mb-8">
          <Crown className="h-10 w-10 text-brand-gold mx-auto mb-2" />
          <h2 className="font-serif text-2xl font-bold uppercase tracking-widest text-brand-navy">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Register Account' : 'Recover Access'}
          </h2>
          <p className="text-xs text-brand-navy/50 mt-1">
            {mode === 'login' ? 'Sign in to access your royal closet & loyalty points' : mode === 'register' ? 'Join the Royal Loyalty Club and start earning points' : 'Input your email to reset credentials'}
          </p>
        </div>

        {/* Tab Headers */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-brand-gold/15 mb-6 text-sm">
            <button
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 text-center py-2.5 font-bold uppercase tracking-wider transition-colors focus:outline-none cursor-pointer ${
                mode === 'login' ? 'border-b-2 border-brand-gold text-brand-gold' : 'text-brand-navy/40 hover:text-brand-navy'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabSwitch('register')}
              className={`flex-1 text-center py-2.5 font-bold uppercase tracking-wider transition-colors focus:outline-none cursor-pointer ${
                mode === 'register' ? 'border-b-2 border-brand-gold text-brand-gold' : 'text-brand-navy/40 hover:text-brand-navy'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Errors list */}
        {(validationError || error) && (
          <div className="mb-5 bg-red-50 border border-red-200 p-3.5 text-red-600 text-xs font-semibold leading-relaxed">
            {validationError || error}
          </div>
        )}

        {/* Reset Success Message */}
        {resetMessage && (
          <div className="mb-5 bg-green-50 border border-green-200 p-3.5 text-green-700 text-xs font-semibold leading-relaxed">
            {resetMessage}
          </div>
        )}

        {/* Forms body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Register Mode Only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Royal Highness"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-sand/20 border border-brand-navy/15 py-2.5 pl-9 pr-3 text-sm text-brand-navy focus:outline-none focus:border-brand-gold"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-navy/40" />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@palace.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-sand/20 border border-brand-navy/15 py-2.5 pl-9 pr-3 text-sm text-brand-navy focus:outline-none focus:border-brand-gold"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-navy/40" />
            </div>
          </div>

          {/* Password Fields (Login & Register Modes) */}
          {mode !== 'forgot' && (
            <>
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('forgot')}
                      className="text-[10px] font-semibold text-brand-gold hover:underline focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-sand/20 border border-brand-navy/15 py-2.5 pl-9 pr-3 text-sm text-brand-navy focus:outline-none focus:border-brand-gold"
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-navy/40" />
                </div>
              </div>

              {/* Confirm Password (Register Mode Only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-1.5">
                    Verify Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-brand-sand/20 border border-brand-navy/15 py-2.5 pl-9 pr-3 text-sm text-brand-navy focus:outline-none focus:border-brand-gold"
                    />
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-navy/40" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold text-xs py-3.5 uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Validating credentials...</span>
            ) : mode === 'login' ? (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            ) : mode === 'register' ? (
              <>
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          {/* Recover Password Back to Login */}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className="w-full text-center text-xs font-bold uppercase tracking-widest text-brand-navy/60 hover:text-brand-navy mt-4 block focus:outline-none"
            >
              Back to Login
            </button>
          )}
        </form>

        {/* Demo Credentials Box */}
        {mode === 'login' && (
          <div className="mt-6 bg-brand-navy border border-brand-gold/20 p-3 text-center text-xs text-brand-gold">
            <span className="font-semibold uppercase tracking-wider block mb-1 text-brand-gold">Demo Credentials</span>
            <span className="text-[11px] font-mono text-brand-sand/80">customer@kingsmart.com / Customer123</span>
          </div>
        )}

        {/* Loyalty Program Perks Banner (Register Mode) */}
        {mode === 'register' && (
          <div className="mt-8 bg-brand-navy/5 border border-brand-gold/10 p-4 text-xs text-brand-navy/70 flex items-start gap-2.5">
            <Award className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <strong>Royal Loyalty Club perks:</strong> Earn points on purchases instantly, check custom status upgrades, and get early notifications on sales.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
