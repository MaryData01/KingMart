'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  Search, 
  Crown,
  LogOut,
  ChevronDown,
  Settings
} from 'lucide-react';
import { logout } from '../store/slices/authSlice.js';

function HeaderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = wishlistItems.length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
    setDropdownOpen(false);
  };

  const navLinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Men', href: '/shop?category=Men' },
    { label: 'Women', href: '/shop?category=Women' },
    { label: 'Accessories', href: '/shop?category=Accessories' },
    { label: 'Sale', href: '/shop?category=Sale' }
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <Crown className="h-6 w-6 text-brand-gold group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-serif text-2xl font-bold tracking-widest text-brand-gold uppercase">
                Kings Mart
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              let isActive = false;
              if (link.label === 'Shop') {
                isActive = pathname === '/shop' && !currentCategory;
              } else {
                const linkCategory = link.href.split('category=')[1];
                isActive = pathname === '/shop' && currentCategory === linkCategory;
              }
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wider uppercase transition-colors hover:text-brand-gold ${
                    isActive ? 'text-brand-gold border-b border-brand-gold pb-1' : 'text-brand-sand/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Search bar & Action Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-brand-navy/50 border border-brand-gold/30 text-white rounded-none py-1.5 pl-3 pr-10 text-sm focus:outline-none focus:border-brand-gold w-48 xl:w-60 placeholder-white/40"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gold/70 hover:text-brand-gold">
                <Search className="h-4 w-4" />
              </button>
            </form>

            <Link href="/wishlist" className="relative text-white hover:text-brand-gold transition-colors">
              <Heart className="h-5.5 w-5.5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-jet font-bold text-xs h-5 w-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative text-white hover:text-brand-gold transition-colors">
              <ShoppingBag className="h-5.5 w-5.5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-jet font-bold text-xs h-5 w-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {mounted && userInfo ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 text-sm font-semibold tracking-wider uppercase hover:text-brand-gold focus:outline-none"
                >
                  <UserIcon className="h-5 w-5 text-brand-gold" />
                  <span className="max-w-[100px] truncate">{userInfo.name.split(' ')[0]}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-185' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-brand-navy border border-brand-gold/30 rounded-none shadow-xl py-2 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-brand-sand/90 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-brand-gold" />
                      Dashboard
                    </Link>
                    {userInfo.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-brand-sand/90 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors"
                      >
                        <Settings className="h-4 w-4 text-brand-gold" />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="border-brand-gold/20 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm font-semibold tracking-wider uppercase border border-brand-gold/30 hover:border-brand-gold px-3.5 py-1.5 transition-colors text-brand-gold"
              >
                <UserIcon className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>

          {/* Medium and small screens items (Cart/Wishlist/Hamburger) */}
          <div className="flex items-center space-x-4 lg:hidden">
            <Link href="/wishlist" className="relative text-white hover:text-brand-gold transition-colors">
              <Heart className="h-5.5 w-5.5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-jet font-bold text-xs h-4.5 w-4.5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative text-white hover:text-brand-gold transition-colors">
              <ShoppingBag className="h-5.5 w-5.5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-jet font-bold text-xs h-4.5 w-4.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-brand-gold focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-gold/20 bg-brand-navy">
          <div className="px-4 pt-3 pb-6 space-y-4">
            
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-brand-navy/50 border border-brand-gold/30 text-white rounded-none py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-brand-gold w-full placeholder-white/40"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gold">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Navigation links */}
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                let isActive = false;
                if (link.label === 'Shop') {
                  isActive = pathname === '/shop' && !currentCategory;
                } else {
                  const linkCategory = link.href.split('category=')[1];
                  isActive = pathname === '/shop' && currentCategory === linkCategory;
                }
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-semibold tracking-wider uppercase py-1 border-b border-white/5 hover:text-brand-gold ${
                      isActive ? 'text-brand-gold' : 'text-brand-sand/80'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Profile options */}
              {mounted && userInfo ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold tracking-wider uppercase py-1 border-b border-white/5 text-brand-sand/80 hover:text-brand-gold"
                  >
                    My Dashboard
                  </Link>
                  {userInfo.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-semibold tracking-wider uppercase py-1 border-b border-white/5 text-brand-gold hover:text-brand-sand"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-sm font-semibold tracking-wider uppercase py-2 text-red-400 hover:text-red-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold tracking-wider uppercase py-2 text-brand-gold border border-brand-gold/30 text-center hover:bg-brand-gold/10"
                >
                  Login / Register
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<header className="sticky top-0 z-50 h-20 bg-brand-navy border-b border-brand-gold/20"></header>}>
      <HeaderContent />
    </Suspense>
  );
}
