'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  Crown, 
  TrendingUp, 
  ShoppingBag, 
  Truck, 
  Users, 
  Tag, 
  Trash2, 
  Edit, 
  Plus, 
  X,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  Calendar
} from 'lucide-react';
import api from '../../utils/api.js';

export default function AdminPage() {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);

  // Active Tab: 'overview' | 'products' | 'orders' | 'users' | 'promos'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products CRUD States
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Product Form Inputs
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodBrand, setProdBrand] = useState('Kings Tailored');
  const [prodStock, setProdStock] = useState('10');
  const [prodSizes, setProdSizes] = useState('S, M, L, XL');
  const [prodColors, setProdColors] = useState('Black, Navy, Gold');
  const [prodCategories, setProdCategories] = useState('Men');
  const [prodImages, setProdImages] = useState('');
  const [productError, setProductError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Promos State
  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  
  // Promo Form Inputs
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoType, setPromoType] = useState('Percentage');
  const [promoValue, setPromoValue] = useState('');
  const [promoExpiry, setPromoExpiry] = useState('');
  const [promoSingleUse, setPromoSingleUse] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [savingPromo, setSavingPromo] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!userInfo) {
      router.push('/login?redirect=admin');
      return;
    }
    if (!userInfo.isAdmin) {
      router.push('/dashboard');
    }
  }, [userInfo]);

  // Load Active Tab Content
  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      if (activeTab === 'overview') loadOverviewStats();
      if (activeTab === 'products') loadProducts();
      if (activeTab === 'orders') loadOrders();
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'promos') loadPromos();
    }
  }, [activeTab, userInfo]);

  // --- API CALLS ---

  const loadOverviewStats = async () => {
    try {
      setLoadingStats(true);
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Stats loading failed. Using mock dashboard stats.', err.message);
      setStats({
        totalSales: 8520.00,
        totalOrdersCount: 24,
        pendingOrdersCount: 2,
        lowStockProductsCount: 1,
        lowStockProducts: [{ name: 'Noble Wool Fedora Hat', stock: 4, price: 85.00 }],
        totalProductsCount: 12,
        totalCustomersCount: 18,
        recentOrders: [
          { _id: 'order_1', user: { name: 'Prince Henry' }, totalPrice: 280.00, isPaid: true, status: 'Processing', createdAt: new Date().toISOString() }
        ]
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data } = await api.get('/products?limit=50');
      if (data && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products list from API', err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const { data } = await api.get('/admin/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders list from API', err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to load customers directory from API', err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadPromos = async () => {
    try {
      setLoadingPromos(true);
      const { data } = await api.get('/admin/promos');
      setPromos(data);
    } catch (err) {
      console.error('Failed to load coupons list from API', err.message);
    } finally {
      setLoadingPromos(false);
    }
  };

  // --- ACTIONS ---

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
    } catch (err) {
      console.error('Failed to update status', err.message);
      // Simulate local update
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const handleOpenProductModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setProdName(product.name);
      setProdDesc(product.description);
      setProdPrice(product.price.toString());
      setProdOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
      setProdBrand(product.brand);
      setProdStock(product.stock.toString());
      setProdSizes(product.sizes.join(', '));
      setProdColors(product.colors.join(', '));
      setProdCategories(product.categories.join(', '));
      setProdImages(product.images.join(', '));
    } else {
      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdOriginalPrice('');
      setProdBrand('Kings Tailored');
      setProdStock('10');
      setProdSizes('S, M, L, XL');
      setProdColors('Black, Navy, Gold');
      setProdCategories('Men');
      setProdImages('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80');
    }
    setProductError('');
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodName.trim() || !prodDesc.trim() || !prodPrice.trim() || !prodStock.trim()) {
      setProductError('All base product fields are required.');
      return;
    }

    setSavingProduct(true);
    setProductError('');

    const formattedPayload = {
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
      brand: prodBrand,
      stock: Number(prodStock),
      sizes: prodSizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: prodColors.split(',').map(c => c.trim()).filter(Boolean),
      categories: prodCategories.split(',').map(cat => cat.trim()).filter(Boolean),
      images: prodImages.split(',').map(img => img.trim()).filter(Boolean)
    };

    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, formattedPayload);
      } else {
        await api.post('/admin/products', formattedPayload);
      }
      setShowProductModal(false);
      loadProducts();
    } catch (err) {
      setProductError(err.message || 'Product operation failed.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you certain you wish to delete this royal product?')) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      loadProducts();
    } catch (err) {
      alert(err.message || 'Failed to remove product.');
    }
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    if (!promoCodeInput.trim() || !promoValue.trim() || !promoExpiry) {
      setPromoError('Complete all fields before coupon generation.');
      return;
    }

    setSavingPromo(true);
    setPromoError('');

    try {
      await api.post('/admin/promos', {
        code: promoCodeInput.trim().toUpperCase(),
        discountType: promoType,
        discountValue: Number(promoValue),
        expiryDate: promoExpiry,
        singleUse: promoSingleUse
      });
      setShowPromoModal(false);
      setPromoCodeInput('');
      setPromoValue('');
      setPromoExpiry('');
      loadPromos();
    } catch (err) {
      setPromoError(err.message || 'Coupon generation failed.');
    } finally {
      setSavingPromo(false);
    }
  };

  const handleDeletePromo = async (promoId) => {
    if (!confirm('Remove this promotional code?')) return;
    try {
      await api.delete(`/admin/promos/${promoId}`);
      loadPromos();
    } catch (err) {
      alert(err.message || 'Failed to delete promo code.');
    }
  };

  if (!userInfo || !userInfo.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Banner */}
      <div className="bg-brand-navy border border-brand-gold/30 p-6 flex items-center justify-between gap-6 mb-10 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-gold text-brand-navy rounded-none border border-brand-gold/10">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold uppercase tracking-wider text-white">
              Royal Admin Console
            </h1>
            <p className="text-[10px] text-brand-sand/70 tracking-wide font-medium">
              SYSTEM LEAD: Executive Operations Panel
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Admin Navigation */}
        <aside className="bg-white border border-brand-gold/15 shadow-sm text-sm">
          <div className="p-4 border-b border-brand-gold/15">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-navy">Control Operations</h3>
          </div>
          <nav className="flex flex-col">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left py-3.5 px-5 font-bold uppercase tracking-wider transition-all flex items-center gap-3 focus:outline-none cursor-pointer ${
                activeTab === 'overview' ? 'bg-brand-gold/5 text-brand-gold border-r-4 border-brand-gold' : 'text-brand-navy/70 hover:bg-brand-sand/20'
              }`}
            >
              <TrendingUp className="h-4.5 w-4.5" />
              Executive Metrics
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left py-3.5 px-5 font-bold uppercase tracking-wider transition-all flex items-center gap-3 focus:outline-none cursor-pointer ${
                activeTab === 'products' ? 'bg-brand-gold/5 text-brand-gold border-r-4 border-brand-gold' : 'text-brand-navy/70 hover:bg-brand-sand/20'
              }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              Inventory CRUD
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left py-3.5 px-5 font-bold uppercase tracking-wider transition-all flex items-center gap-3 focus:outline-none cursor-pointer ${
                activeTab === 'orders' ? 'bg-brand-gold/5 text-brand-gold border-r-4 border-brand-gold' : 'text-brand-navy/70 hover:bg-brand-sand/20'
              }`}
            >
              <Truck className="h-4.5 w-4.5" />
              Logistics Orders
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left py-3.5 px-5 font-bold uppercase tracking-wider transition-all flex items-center gap-3 focus:outline-none cursor-pointer ${
                activeTab === 'users' ? 'bg-brand-gold/5 text-brand-gold border-r-4 border-brand-gold' : 'text-brand-navy/70 hover:bg-brand-sand/20'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              Royal Customers
            </button>
            <button
              onClick={() => setActiveTab('promos')}
              className={`w-full text-left py-3.5 px-5 font-bold uppercase tracking-wider transition-all flex items-center gap-3 focus:outline-none cursor-pointer ${
                activeTab === 'promos' ? 'bg-brand-gold/5 text-brand-gold border-r-4 border-brand-gold' : 'text-brand-navy/70 hover:bg-brand-sand/20'
              }`}
            >
              <Tag className="h-4.5 w-4.5" />
              Promo Coupons
            </button>
          </nav>
        </aside>

        {/* Tab Display Area */}
        <section className="lg:col-span-4 space-y-8">
          
          {/* TAB 1: EXECUTIVE METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {loadingStats || !stats ? (
                <div className="text-center py-10 bg-white border border-brand-gold/15 p-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-gold"></div>
                  <p className="mt-2 text-xs italic text-brand-navy/60">Reading system statistics...</p>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-brand-navy">
                    <div className="bg-white border border-brand-gold/15 p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-brand-navy/40 font-bold uppercase tracking-wider">Gross Sales</span>
                        <DollarSign className="h-4 w-4 text-brand-gold" />
                      </div>
                      <strong className="text-lg font-serif font-bold text-brand-navy">${stats.totalSales.toFixed(2)}</strong>
                    </div>

                    <div className="bg-white border border-brand-gold/15 p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-brand-navy/40 font-bold uppercase tracking-wider">Orders logged</span>
                        <Package className="h-4 w-4 text-brand-gold" />
                      </div>
                      <strong className="text-lg font-serif font-bold text-brand-navy">{stats.totalOrdersCount}</strong>
                    </div>

                    <div className="bg-white border border-brand-gold/15 p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-brand-navy/40 font-bold uppercase tracking-wider">Bespoke catalog</span>
                        <ShoppingBag className="h-4 w-4 text-brand-gold" />
                      </div>
                      <strong className="text-lg font-serif font-bold text-brand-navy">{stats.totalProductsCount} items</strong>
                    </div>

                    <div className="bg-white border border-brand-gold/15 p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-brand-navy/40 font-bold uppercase tracking-wider">Members registered</span>
                        <Users className="h-4 w-4 text-brand-gold" />
                      </div>
                      <strong className="text-lg font-serif font-bold text-brand-navy">{stats.totalCustomersCount} profiles</strong>
                    </div>
                  </div>

                  {/* Low Stock Alerts */}
                  {stats.lowStockProductsCount > 0 && (
                    <div className="bg-orange-50 border border-orange-200 p-5 text-orange-800 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0 animate-pulse" />
                        Logistics Alert: Low Stock Warning ({stats.lowStockProductsCount} items)
                      </h4>
                      <ul className="text-xs space-y-1 list-disc pl-4 leading-relaxed font-semibold">
                        {stats.lowStockProducts.map((p, i) => (
                          <li key={i}>{p.name} - Only <strong className="text-red-600">{p.stock} units</strong> remaining in inventory vaults.</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recent orders */}
                  <div className="bg-white p-6 border border-brand-gold/15 shadow-sm">
                    <h3 className="font-serif text-base font-bold uppercase tracking-wider text-brand-navy mb-4 pb-2 border-b border-brand-gold/10">
                      Recent Activity Ledger
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-brand-navy/10 text-brand-navy/40 font-bold uppercase tracking-wider">
                            <th className="py-2">Order ID</th>
                            <th className="py-2">User</th>
                            <th className="py-2">Amount</th>
                            <th className="py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders.map((o) => (
                            <tr key={o._id} className="border-b border-brand-navy/5 text-brand-navy/70">
                              <td className="py-2 font-mono">{o._id.substring(0, 10)}...</td>
                              <td className="py-2">{o.user?.name || 'Guest'}</td>
                              <td className="py-2 font-serif font-bold">${o.totalPrice.toFixed(2)}</td>
                              <td className="py-2">
                                <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                  o.status === 'Delivered' ? 'text-green-700 bg-green-50' : 'text-orange-700 bg-orange-50 animate-pulse'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

          {/* TAB 2: INVENTORY CRUD */}
          {activeTab === 'products' && (
            <div className="bg-white p-6 border border-brand-gold/15 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-brand-gold/10">
                <h3 className="font-serif text-lg font-bold uppercase text-brand-navy tracking-wide">
                  Garment Catalog Manager
                </h3>
                <button
                  onClick={() => handleOpenProductModal()}
                  className="btn-gold text-[10px] py-2 px-4 uppercase tracking-wider font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Apparel Piece
                </button>
              </div>

              {loadingProducts ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-gold"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-navy/15 text-brand-navy/40 font-bold uppercase tracking-wider">
                        <th className="py-2">Apparel Name</th>
                        <th className="py-2">Price</th>
                        <th className="py-2">Vault Stock</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id} className="border-b border-brand-navy/5 text-brand-navy/70">
                          <td className="py-3 font-bold text-brand-navy">{p.name}</td>
                          <td className="py-3 font-serif font-bold text-sm">${p.price.toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`font-bold ${p.stock < 5 ? 'text-red-500 font-extrabold' : 'text-brand-navy/75'}`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <button
                              onClick={() => handleOpenProductModal(p)}
                              className="p-1.5 border border-brand-navy/10 text-brand-navy hover:border-brand-gold hover:text-brand-gold transition-colors focus:outline-none"
                              title="Edit piece"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="p-1.5 border border-brand-navy/10 text-brand-navy hover:border-red-500 hover:text-red-500 transition-colors focus:outline-none"
                              title="Delete piece"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: LOGISTICS ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 border border-brand-gold/15 shadow-sm space-y-6">
              
              <div className="pb-3 border-b border-brand-gold/10">
                <h3 className="font-serif text-lg font-bold uppercase text-brand-navy tracking-wide">
                  Fulfillment & Shipping Logistics Ledger
                </h3>
              </div>

              {loadingOrders ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-gold"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-navy/15 text-brand-navy/40 font-bold uppercase tracking-wider">
                        <th className="py-2">Order ID</th>
                        <th className="py-2">Buyer</th>
                        <th className="py-2">Receipt Amount</th>
                        <th className="py-2">Logistics status</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o._id} className="border-b border-brand-navy/5 text-brand-navy/70">
                          <td className="py-3 font-mono font-bold text-brand-navy">{o._id.substring(0, 10)}...</td>
                          <td className="py-3">{o.user?.name || 'Guest Checkout'}</td>
                          <td className="py-3 font-serif font-bold">${o.totalPrice.toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase border ${
                              o.status === 'Delivered' 
                                ? 'bg-green-50 border-green-200 text-green-700' 
                                : o.status === 'Cancelled'
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                                className="bg-brand-sand/40 border border-brand-navy/10 text-[10px] py-1.5 px-2 focus:outline-none focus:border-brand-gold text-brand-navy font-semibold uppercase"
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Mark Shipped</option>
                                <option value="Delivered">Mark Delivered</option>
                                <option value="Cancelled">Cancel Order</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: ROYAL CUSTOMERS */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 border border-brand-gold/15 shadow-sm space-y-6">
              
              <div className="pb-3 border-b border-brand-gold/10">
                <h3 className="font-serif text-lg font-bold uppercase text-brand-navy tracking-wide">
                  Royal Member Directory
                </h3>
              </div>

              {loadingUsers ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-gold"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-navy/15 text-brand-navy/40 font-bold uppercase tracking-wider">
                        <th className="py-2">Name</th>
                        <th className="py-2">Email</th>
                        <th className="py-2">Loyalty Points</th>
                        <th className="py-2 text-right">Invoice Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-brand-navy/5 text-brand-navy/70">
                          <td className="py-3 font-bold text-brand-navy">{u.name}</td>
                          <td className="py-3 font-mono">{u.email}</td>
                          <td className="py-3 font-bold text-brand-gold">{u.loyaltyPoints} pts</td>
                          <td className="py-3 text-right font-serif font-bold">${u.totalSpent.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: PROMO COUPONS */}
          {activeTab === 'promos' && (
            <div className="bg-white p-6 border border-brand-gold/15 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-brand-gold/10">
                <h3 className="font-serif text-lg font-bold uppercase text-brand-navy tracking-wide">
                  Apparel Promo Discount Coupons
                </h3>
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="btn-gold text-[10px] py-2 px-4 uppercase tracking-wider font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Generate Coupon
                </button>
              </div>

              {loadingPromos ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-gold"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-navy/15 text-brand-navy/40 font-bold uppercase tracking-wider">
                        <th className="py-2">Coupon Code</th>
                        <th className="py-2">Discount Type</th>
                        <th className="py-2">Discount Value</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promos.map((pr) => (
                        <tr key={pr._id} className="border-b border-brand-navy/5 text-brand-navy/70">
                          <td className="py-3 font-mono font-bold text-brand-navy">{pr.code}</td>
                          <td className="py-3 uppercase tracking-wider font-semibold">{pr.discountType}</td>
                          <td className="py-3 font-bold text-brand-gold">
                            {pr.discountType === 'Percentage' ? `${pr.discountValue}%` : `$${pr.discountValue}`}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDeletePromo(pr._id)}
                              className="p-1.5 border border-brand-navy/10 text-brand-navy hover:border-red-500 hover:text-red-500 transition-colors focus:outline-none"
                              title="Delete coupon"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

        </section>

      </div>

      {/* PRODUCT CREATION/EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-brand-gold/30 p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl relative">
            <button 
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 p-1.5 text-brand-navy/50 hover:bg-brand-sand/30 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-lg font-bold uppercase text-brand-navy mb-6 pb-2 border-b border-brand-gold/15">
              {editingProduct ? 'Edit Tailoring Specification' : 'Bespoke Item Commission'}
            </h3>

            {productError && (
              <div className="mb-4 bg-red-50 border border-red-200 p-3 text-red-600 text-xs">
                {productError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs text-brand-navy">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Product Name</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Brand</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Apparel Description</label>
                <textarea
                  rows="3"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Active Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                    className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Vault Stock (units)</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Sizes (comma split)</label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Colors (comma split)</label>
                  <input
                    type="text"
                    value={prodColors}
                    onChange={(e) => setProdColors(e.target.value)}
                    className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Category (comma split)</label>
                  <input
                    type="text"
                    value={prodCategories}
                    onChange={(e) => setProdCategories(e.target.value)}
                    className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Image URLs (comma split)</label>
                <input
                  type="text"
                  value={prodImages}
                  onChange={(e) => setProdImages(e.target.value)}
                  className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingProduct}
                className="w-full btn-gold text-xs py-3.5 uppercase tracking-widest cursor-pointer disabled:opacity-50"
              >
                {savingProduct ? 'Saving specs...' : 'Save Product Spec'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PROMO CODE MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-brand-gold/30 p-8 w-full max-w-md shadow-xl relative text-xs text-brand-navy">
            <button 
              onClick={() => setShowPromoModal(false)}
              className="absolute top-4 right-4 p-1.5 text-brand-navy/50 hover:bg-brand-sand/30 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-base font-bold uppercase text-brand-navy mb-6 pb-2 border-b border-brand-gold/15 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-brand-gold" />
              Generate Discount Coupon
            </h3>

            {promoError && (
              <div className="mb-4 bg-red-50 border border-red-200 p-2 text-red-600">
                {promoError}
              </div>
            )}

            <form onSubmit={handleSavePromo} className="space-y-4">
              <div>
                <label className="block font-bold uppercase tracking-wider mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="KING50"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Discount Type</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value)}
                    className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Price ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={promoValue}
                    onChange={(e) => setPromoValue(e.target.value)}
                    className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-brand-gold" />
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={promoExpiry}
                  onChange={(e) => setPromoExpiry(e.target.value)}
                  className="w-full bg-brand-sand/10 border border-brand-navy/15 py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="singleUse"
                  checked={promoSingleUse}
                  onChange={(e) => setPromoSingleUse(e.target.checked)}
                  className="accent-brand-gold h-4 w-4"
                />
                <label htmlFor="singleUse" className="font-bold uppercase tracking-wider">
                  Single Customer Use Limit
                </label>
              </div>

              <button
                type="submit"
                disabled={savingPromo}
                className="w-full btn-navy text-xs py-3.5 uppercase tracking-widest cursor-pointer disabled:opacity-50"
              >
                {savingPromo ? 'Generating coupon...' : 'Generate Coupon Code'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
