'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
  SlidersHorizontal, 
  Heart, 
  ShoppingBag, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Search
} from 'lucide-react';
import api from '../../utils/api.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { toggleWishlist } from '../../store/slices/wishlistSlice.js';

export default function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);

  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [priceMax, setPriceMax] = useState(500000);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read URL queries on mount/change
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    setSearch(urlSearch);
    setCategory(urlCategory);
    setCurrentPage(1);
  }, [searchParams]);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let queryPath = `/products?page=${currentPage}&limit=6&sort=${sortBy}&priceMax=${priceMax}`;
      
      if (search) {
        queryPath += `&search=${encodeURIComponent(search)}`;
      }
      
      if (category) {
        if (category === 'Sale') {
          queryPath += `&sale=true`;
        } else {
          const apiCategory = category
            .replace("'s Boutique", "")
            .replace("' Boutique", "")
            .replace(" Boutique", "");
          queryPath += `&category=${encodeURIComponent(apiCategory)}`;
        }
      }
      
      if (selectedSize) {
        queryPath += `&sizes=${encodeURIComponent(selectedSize)}`;
      }
      
      if (selectedColor) {
        queryPath += `&colors=${encodeURIComponent(selectedColor)}`;
      }

      const { data } = await api.get(queryPath);
      
      if (data) {
        setProducts(data.products || []);
        setTotalPages(data.pages || 1);
        setTotalProducts(data.totalProducts || 0);
      }
    } catch (error) {
      console.error('Error fetching boutique products:', error.message);
      // Fail-safe mock products
      let mockList = [
        { _id: '1', name: 'Royal Navy Velvet Blazer', price: 280.00, rating: 4.8, numReviews: 2, images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'], stock: 12, sizes: ['S', 'M', 'L'], colors: ['Navy'], categories: ['Men'], brand: 'Kings Tailored' },
        { _id: '2', name: 'Duchess Silk Wrap Gown', price: 420.00, rating: 5.0, numReviews: 1, images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80'], stock: 8, sizes: ['XS', 'S', 'M'], colors: ['Gold'], categories: ['Women'], brand: 'Empress Attire' },
        { _id: '3', name: 'Sovereign Gold-Plated Chronograph', price: 550.00, rating: 5.0, numReviews: 1, images: ['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80'], stock: 6, sizes: ['One Size'], colors: ['Gold'], categories: ['Accessories'], brand: 'Monarch Watch Co.' },
        { _id: '4', name: 'Monarch Double-Breasted Trenchcoat', price: 350.00, originalPrice: 450.00, rating: 4.5, numReviews: 4, images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'], stock: 10, sizes: ['M', 'L', 'XL'], colors: ['Beige'], categories: ['Men', 'Sale'], brand: 'Kings Tailored' },
        { _id: '5', name: 'Empress Cashmere Turtleneck', price: 180.00, originalPrice: 240.00, rating: 4.9, numReviews: 12, images: ['https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&w=800&q=80'], stock: 15, sizes: ['S', 'M', 'L'], colors: ['Off-White'], categories: ['Women', 'Sale'], brand: 'Empress Attire' },
        { _id: '6', name: 'Noble Wool Fedora Hat', price: 85.00, originalPrice: 110.00, rating: 4.2, numReviews: 1, images: ['https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=800&q=80'], stock: 4, sizes: ['M', 'L'], colors: ['Black'], categories: ['Accessories', 'Sale'], brand: 'Kings Tailored' },
        { _id: '7', name: 'King\'s Crest Leather Loafers', price: 190.00, rating: 4.7, numReviews: 3, images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80'], stock: 14, sizes: ['M', 'L', 'XL'], colors: ['Brown'], categories: ['Men'], brand: 'Kings Tailored' },
        { _id: '8', name: 'Imperial Gold Silk Tie', price: 65.00, rating: 4.6, numReviews: 8, images: ['https://images.unsplash.com/photo-1589756823855-edd13437435e?auto=format&fit=crop&w=800&q=80'], stock: 22, sizes: ['One Size'], colors: ['Gold'], categories: ['Men'], brand: 'Kings Tailored' },
        { _id: '9', name: 'Royal Gold Hoop Earrings', price: 110.00, rating: 5.0, numReviews: 2, images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'], stock: 7, sizes: ['One Size'], colors: ['Gold'], categories: ['Women'], brand: 'Empress Attire' }
      ];

      // Client filtering for mock fallback
      if (search) {
        mockList = mockList.filter(x => x.name.toLowerCase().includes(search.toLowerCase()) || x.description?.toLowerCase().includes(search.toLowerCase()));
      }
      if (category) {
        if (category === 'Sale') {
          mockList = mockList.filter(x => x.originalPrice);
        } else {
          mockList = mockList.filter(x => x.categories.includes(category));
        }
      }
      if (selectedSize) {
        mockList = mockList.filter(x => x.sizes.includes(selectedSize));
      }
      if (selectedColor) {
        mockList = mockList.filter(x => x.colors.includes(selectedColor));
      }
      mockList = mockList.filter(x => x.price <= priceMax);

      // Sorting for mock fallback
      if (sortBy === 'price') {
        mockList.sort((a, b) => a.price - b.price);
      } else if (sortBy === '-price') {
        mockList.sort((a, b) => b.price - a.price);
      } else if (sortBy === '-rating') {
        mockList.sort((a, b) => b.rating - a.rating);
      }

      setProducts(mockList);
      setTotalProducts(mockList.length);
      setTotalPages(Math.ceil(mockList.length / 6) || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, category, search, priceMax, selectedSize, selectedColor, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setPriceMax(1000);
    setSelectedSize('');
    setSelectedColor('');
    setSortBy('-createdAt');
    setCurrentPage(1);
    router.push('/shop');
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
  };

  const isWishlisted = (productId) => wishlistItems.some((x) => x._id === productId);

  const categoriesList = ['Men', 'Women', 'Accessories', 'Sale'];
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
  const colorsList = ['Black', 'Navy', 'Gold', 'Silver', 'Off-White', 'Beige', 'Brown', 'Red', 'Blue'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="mb-10 text-center sm:text-left border-b border-brand-gold/15 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-wider text-brand-navy">
          Royal Fashion Boutique
        </h1>
        <p className="text-sm text-brand-navy/60">
          Browse our seasonal drops, filter components, and claim your monarch garments.
        </p>
      </div>

      {/* Category Tab Strip */}
      <div className="mb-8 flex flex-wrap gap-2.5 justify-center sm:justify-start">
        <button
          onClick={() => setCategory('')}
          className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 border rounded-full cursor-pointer ${
            category === '' 
              ? 'bg-brand-gold text-brand-navy border-brand-gold' 
              : 'bg-transparent text-brand-navy/70 border-brand-navy/15 hover:border-brand-gold hover:text-brand-gold'
          }`}
        >
          All
        </button>
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 border rounded-full cursor-pointer ${
              category === cat 
                ? 'bg-brand-gold text-brand-navy border-brand-gold' 
                : 'bg-transparent text-brand-navy/70 border-brand-navy/15 hover:border-brand-gold hover:text-brand-gold'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8 items-start">
        
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden lg:block space-y-8 bg-white p-6 border border-brand-gold/15">
          <div className="flex items-center justify-between border-b border-brand-gold/15 pb-4">
            <h3 className="font-serif text-lg font-bold uppercase text-brand-navy tracking-wide flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-brand-gold" />
              Filters
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-xs font-semibold text-brand-gold/80 hover:text-brand-gold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset All
            </button>
          </div>

          {/* Search bar inside filters */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-2.5">
              Keyword Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Suit, dress, clutch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-brand-sand/30 border border-brand-navy/15 rounded-none py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-brand-gold text-brand-navy"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-navy/40" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-2.5">
              Category
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left text-sm py-1.5 px-2 border transition-colors ${
                  category === '' ? 'border-brand-gold bg-brand-gold/5 text-brand-gold font-bold' : 'border-transparent text-brand-navy/70 hover:text-brand-gold'
                }`}
              >
                All Collections
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left text-sm py-1.5 px-2 border transition-colors ${
                    category === cat ? 'border-brand-gold bg-brand-gold/5 text-brand-gold font-bold' : 'border-transparent text-brand-navy/70 hover:text-brand-gold'
                  }`}
                >
                  {cat === 'Sale' ? '👑 Exclusive Royal Sale' : cat === 'Accessories' ? "Accessories' Boutique" : `${cat}'s Boutique`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-brand-navy mb-2.5">
              <span>Max Price</span>
              <span className="text-brand-gold">₦{priceMax.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="5000"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-brand-gold"
            />
            <div className="flex justify-between text-[10px] text-brand-navy/40 mt-1">
              <span>₦0</span>
              <span>₦500,000</span>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-2.5">
              Select Size
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSize('')}
                className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                  selectedSize === '' ? 'border-brand-gold bg-brand-gold text-brand-navy' : 'border-brand-navy/15 text-brand-navy hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                All
              </button>
              {sizesList.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                    selectedSize === sz ? 'border-brand-gold bg-brand-gold text-brand-navy' : 'border-brand-navy/15 text-brand-navy hover:border-brand-gold hover:text-brand-gold'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-2.5">
              Select Color
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedColor('')}
                className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                  selectedColor === '' ? 'border-brand-gold bg-brand-gold text-brand-navy' : 'border-brand-navy/15 text-brand-navy hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                All
              </button>
              {colorsList.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                    selectedColor === col ? 'border-brand-gold bg-brand-gold text-brand-navy' : 'border-brand-navy/15 text-brand-navy hover:border-brand-gold hover:text-brand-gold'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MOBILE FILTERS TOGGLE BUTTON */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-white p-4 border border-brand-gold/15">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="btn-navy py-2 px-4 text-xs font-bold flex items-center gap-1.5 tracking-wider uppercase"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter / Search ({totalProducts})
          </button>

          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-brand-gold/80 hover:text-brand-gold uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>

        {/* MOBILE ACCORDION FILTERS */}
        {mobileFiltersOpen && (
          <aside className="lg:hidden bg-white p-6 border border-brand-gold/15 mb-6 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Search</label>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-brand-sand/30 border border-brand-navy/15 py-2 px-3 text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-brand-sand/30 border border-brand-navy/15 py-2 px-3 text-sm focus:outline-none focus:border-brand-gold"
              >
                <option value="">All Collections</option>
                {categoriesList.map(c => (
                  <option key={c} value={c}>
                    {c === 'Sale' ? '👑 Exclusive Royal Sale' : c === 'Accessories' ? "Accessories' Boutique" : `${c}'s Boutique`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                <span>Max Price</span>
                <span className="text-brand-gold">₦{priceMax.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="5000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Size</label>
              <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-brand-sand/30 border border-brand-navy/15 py-2 px-3 text-sm focus:outline-none"
              >
                <option value="">All Sizes</option>
                {sizesList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Color</label>
              <select 
                value={selectedColor} 
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-brand-sand/30 border border-brand-navy/15 py-2 px-3 text-sm focus:outline-none"
              >
                <option value="">All Colors</option>
                {colorsList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button 
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full btn-gold text-xs py-3"
            >
              Apply Filter Settings
            </button>
          </aside>
        )}

        {/* PRODUCTS GRID (Right Side) */}
        <section className="lg:col-span-3">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 border border-brand-gold/15">
            <div className="text-sm text-brand-navy/70">
              Showing <strong className="text-brand-navy font-bold">{totalProducts}</strong> luxury items
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-navy shrink-0">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-brand-sand/40 border border-brand-navy/10 text-sm py-1.5 px-3 focus:outline-none focus:border-brand-gold text-brand-navy font-semibold"
              >
                <option value="-createdAt">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="shimmer h-[340px] w-full mb-4" />
                  <div className="shimmer h-4 w-2/3 mb-2" />
                  <div className="shimmer h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* No Results fallback */
            <div className="text-center py-20 bg-white border border-brand-gold/10 p-8 shadow-sm">
              <SlidersHorizontal className="h-16 w-16 text-brand-gold mx-auto mb-4" />
              <h3 className="font-serif text-xl font-bold text-brand-navy mb-2 uppercase">No Monarch Apparel Found</h3>
              <p className="text-sm text-brand-navy/60 max-w-sm mx-auto mb-8">
                We couldn't find any products matching your active filter criteria. Modify your sliders or reset selections.
              </p>
              <button onClick={handleResetFilters} className="btn-gold text-xs py-3 px-6">
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Products display */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div key={product._id} className="luxury-card group flex flex-col h-full bg-white relative">
                    
                    {/* Heart / Wishlist Toggle */}
                    <button 
                      onClick={() => dispatch(toggleWishlist(product))}
                      className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/95 shadow-sm text-brand-navy hover:text-red-500 hover:scale-110 transition-all duration-300 focus:outline-none"
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
                      
                      {/* Add to Cart Overlay */}
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
                        <div className="flex items-baseline gap-2 font-serif">
                          <span className="text-lg font-bold text-brand-navy">
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

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12 bg-white border border-brand-gold/15 py-3.5 px-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 border border-brand-navy/10 text-brand-navy hover:border-brand-gold hover:text-brand-gold disabled:opacity-30 disabled:hover:text-brand-navy disabled:hover:border-brand-navy/10 cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <span className="text-sm font-semibold text-brand-navy">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 border border-brand-navy/10 text-brand-navy hover:border-brand-gold hover:text-brand-gold disabled:opacity-30 disabled:hover:text-brand-navy disabled:hover:border-brand-navy/10 cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}

        </section>

      </div>
    </div>
  );
}
