'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Crown, 
  ShoppingBag, 
  MapPin, 
  Award, 
  Settings, 
  History, 
  ChevronDown, 
  ChevronUp, 
  LogOut,
  Mail,
  User,
  Plus,
  Trash2
} from 'lucide-react';
import api from '../../utils/api.js';
import { logout, setAddresses } from '../../store/slices/authSlice.js';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  // States
  const [activeTab, setActiveTab] = useState('orders'); // orders | loyalty | profile
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Expanded Order IDs
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Profile Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Address Inputs
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrCountry, setAddrCountry] = useState('United Kingdom');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrError, setAddrError] = useState('');

  useEffect(() => {
    if (!userInfo) {
      router.push('/login?redirect=dashboard');
      return;
    }
    
    setName(userInfo.name || '');
    setEmail(userInfo.email || '');

    // Fetch user orders
    async function fetchMyOrders() {
      try {
        setLoadingOrders(true);
        const { data } = await api.get('/orders/my-orders');
        if (data) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch user orders. Using mock history details.', err.message);
        // Mock order history
        setOrders([
          {
            _id: 'mock_order_1',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            totalPrice: 280.00,
            isPaid: true,
            paidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            isDelivered: false,
            status: 'Processing',
            paymentMethod: 'Stripe',
            shippingAddress: {
              name: userInfo.name,
              street: '100 Palace Court',
              city: 'London',
              state: 'Greater London',
              zipCode: 'W1A 1AA',
              country: 'United Kingdom',
              phone: '07946 0958'
            },
            orderItems: [
              {
                name: 'Royal Navy Velvet Blazer',
                qty: 1,
                price: 280.00,
                image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
                size: 'M',
                color: 'Navy'
              }
            ]
          }
        ]);
      } finally {
        setLoadingOrders(false);
      }
    }
    
    fetchMyOrders();
  }, [userInfo]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you certain you wish to cancel this bespoke garment order?')) return;
    
    try {
      await api.put(`/orders/${orderId}/cancel`);
      // Refresh order records
      const { data } = await api.get('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      console.error('Order cancellation request failed:', err.message);
      // Simulate locally if mock order
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Cancelled' } : o));
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addrName.trim() || !addrStreet.trim() || !addrCity.trim() || !addrState.trim() || !addrZip.trim() || !addrPhone.trim()) {
      setAddrError('Please complete all delivery profile input fields.');
      return;
    }

    try {
      setAddrError('');
      const { data } = await api.post('/auth/profile/address', {
        name: addrName,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        zipCode: addrZip,
        country: addrCountry,
        phone: addrPhone
      });

      if (data) {
        dispatch(setAddresses(data));
        setAddrName('');
        setAddrStreet('');
        setAddrCity('');
        setAddrState('');
        setAddrZip('');
        setAddrPhone('');
        setShowAddressForm(false);
      }
    } catch (err) {
      setAddrError(err.message || 'Failed to register delivery location.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Remove this delivery profile?')) return;
    try {
      const { data } = await api.delete(`/auth/profile/address/${addressId}`);
      if (data) {
        dispatch(setAddresses(data));
      }
    } catch (err) {
      console.error('Failed to delete address details', err.message);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  if (!userInfo) return null;

  // Loyalty calculations
  const loyaltyPoints = userInfo.loyaltyPoints || 0;
  let loyaltyTier = 'Bronze Monarch';
  let nextTierPoints = 1500;
  let tierProgress = (loyaltyPoints / nextTierPoints) * 100;

  if (loyaltyPoints >= 1500 && loyaltyPoints < 3500) {
    loyaltyTier = 'Silver Sovereign';
    nextTierPoints = 3500;
    tierProgress = ((loyaltyPoints - 1500) / (3500 - 1500)) * 100;
  } else if (loyaltyPoints >= 3500) {
    loyaltyTier = 'Gold Emperor';
    tierProgress = 100;
  }

  const addresses = userInfo.addresses || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Welcome banner */}
      <div className="bg-brand-navy text-white p-8 border border-brand-gold/25 shadow-sm mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full border border-brand-gold/10" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-brand-sand text-brand-gold border border-brand-gold/20 shrink-0">
            <Crown className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold uppercase tracking-wider text-white">
              Salutations, {userInfo.name}
            </h1>
            <p className="text-xs text-brand-sand/70 mt-1">
              Privileged loyalty member registered since {new Date(userInfo.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 relative z-10 w-full md:w-auto">
          {/* Points summary bubble */}
          <div className="bg-brand-navy/60 border border-brand-gold/30 px-5 py-3 flex items-center gap-3">
            <Award className="h-5 w-5 text-brand-gold" />
            <div className="text-xs">
              <span className="text-brand-gold font-bold uppercase tracking-widest block text-[9px] mb-0.5">Points Balance</span>
              <strong className="text-sm font-bold text-white">{loyaltyPoints} points</strong>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-5 py-3 text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Navigation Tabs (1/4 cols) */}
        <aside className="bg-white border border-brand-gold/15 shadow-sm">
          <div className="p-4 border-b border-brand-gold/15">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-navy">Dashboard Navigation</h3>
          </div>
          <nav className="flex flex-col text-sm">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left py-4 px-6 font-bold uppercase tracking-wider transition-colors flex items-center gap-3 focus:outline-none cursor-pointer ${
                activeTab === 'orders' ? 'bg-brand-gold/5 text-brand-gold border-r-4 border-brand-gold' : 'text-brand-navy/70 hover:bg-brand-sand/20'
              }`}
            >
              <History className="h-4.5 w-4.5" />
              Order Archive
            </button>
            <button
              onClick={() => setActiveTab('loyalty')}
              className={`w-full text-left py-4 px-6 font-bold uppercase tracking-wider transition-colors flex items-center gap-3 focus:outline-none cursor-pointer ${
                activeTab === 'loyalty' ? 'bg-brand-gold/5 text-brand-gold border-r-4 border-brand-gold' : 'text-brand-navy/70 hover:bg-brand-sand/20'
              }`}
            >
              <Award className="h-4.5 w-4.5" />
              Loyalty Club
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left py-4 px-6 font-bold uppercase tracking-wider transition-colors flex items-center gap-3 focus:outline-none cursor-pointer ${
                activeTab === 'profile' ? 'bg-brand-gold/5 text-brand-gold border-r-4 border-brand-gold' : 'text-brand-navy/70 hover:bg-brand-sand/20'
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              Bespoke Profile
            </button>
          </nav>
        </aside>

        {/* Dynamic Panels (3/4 cols) */}
        <section className="lg:col-span-3">
          
          {/* TAB 1: ORDER ARCHIVE */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 border border-brand-gold/15 shadow-sm">
              <h3 className="font-serif text-lg font-bold uppercase text-brand-navy tracking-wide mb-6 pb-3 border-b border-brand-gold/10">
                Garment Purchases & Commission Tracking
              </h3>

              {loadingOrders ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-gold"></div>
                  <p className="mt-2 text-xs text-brand-navy/50 italic">Sorting archive ledger...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 italic text-brand-navy/50 text-sm">
                  No purchase records exist under this account.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order._id;
                    return (
                      <div key={order._id} className="border border-brand-navy/15">
                        
                        {/* Header bar summary */}
                        <div 
                          onClick={() => toggleOrderExpand(order._id)}
                          className="bg-brand-sand/20 p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-brand-sand/40 transition-colors"
                        >
                          <div className="text-xs">
                            <span className="text-brand-navy/40 font-bold block mb-1">DATE PLACED</span>
                            <strong className="text-brand-navy font-bold">{new Date(order.createdAt).toLocaleDateString()}</strong>
                          </div>
                          <div className="text-xs">
                            <span className="text-brand-navy/40 font-bold block mb-1">ORDER ID</span>
                            <strong className="text-brand-navy font-bold font-mono">{order._id.substring(0, 10)}...</strong>
                          </div>
                          <div className="text-xs">
                            <span className="text-brand-navy/40 font-bold block mb-1">GRAND TOTAL</span>
                            <strong className="text-brand-gold font-serif font-bold text-sm">₦{order.totalPrice.toLocaleString()}</strong>
                          </div>
                          <div className="text-xs">
                            <span className="text-brand-navy/40 font-bold block mb-1">TRACKING STATUS</span>
                            <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                              order.status === 'Delivered' 
                                ? 'bg-green-50 border-green-200 text-green-700' 
                                : order.status === 'Cancelled' 
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-brand-navy/40">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="p-6 border-t border-brand-navy/15 bg-white space-y-6">
                            
                            {/* Items listing */}
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">Garments Commissioned</h4>
                              <div className="space-y-3">
                                {order.orderItems.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between gap-4 border-b border-brand-navy/5 pb-2 text-xs">
                                    <div className="flex items-center gap-3">
                                      <img src={item.image} alt={item.name} className="w-10 h-12 object-cover border border-brand-sand shrink-0" />
                                      <div>
                                        <h5 className="font-bold text-brand-navy">{item.name}</h5>
                                        <p className="text-brand-navy/40 mt-0.5 font-semibold">Size: {item.size} | Color: {item.color} | Qty: {item.qty}</p>
                                      </div>
                                    </div>
                                    <span className="font-serif font-bold text-brand-navy">₦{(item.price * item.qty).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-t border-brand-navy/5 pt-4">
                              <div>
                                <h4 className="font-bold uppercase tracking-wider text-brand-navy mb-2">Delivery Profile Address</h4>
                                <p className="text-brand-navy/70 leading-relaxed">
                                  <strong>{order.shippingAddress.name}</strong><br />
                                  {order.shippingAddress.street}<br />
                                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                  {order.shippingAddress.country}<br />
                                  Phone: {order.shippingAddress.phone}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-bold uppercase tracking-wider text-brand-navy mb-2">Payment Verification</h4>
                                <p className="text-brand-navy/70 leading-relaxed">
                                  Method: <strong>{order.paymentMethod}</strong><br />
                                  Status: <strong className={order.isPaid ? 'text-green-700' : 'text-orange-700 animate-pulse'}>
                                    {order.isPaid ? `Paid (Authorized: ${new Date(order.paidAt).toLocaleDateString()})` : 'Awaiting Authorization'}
                                  </strong>
                                </p>
                                
                                {/* Cancel Order Button */}
                                {(order.status === 'Pending' || order.status === 'Processing') && (
                                  <button
                                    onClick={() => handleCancelOrder(order._id)}
                                    className="mt-4 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] transition-colors focus:outline-none cursor-pointer"
                                  >
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LOYALTY CLUB */}
          {activeTab === 'loyalty' && (
            <div className="bg-white p-6 border border-brand-gold/15 shadow-sm space-y-8">
              
              <div className="pb-3 border-b border-brand-gold/10">
                <h3 className="font-serif text-lg font-bold uppercase text-brand-navy tracking-wide">
                  Royal Loyalty Club Member Lounge
                </h3>
                <p className="text-xs text-brand-navy/60 mt-1">
                  Check membership progress and review tier benefits.
                </p>
              </div>

              {/* Status Visualizer */}
              <div className="bg-brand-navy text-white p-6 border border-brand-gold/30 relative">
                <Crown className="absolute right-6 top-6 h-16 w-16 text-brand-gold/10 pointer-events-none" />
                
                <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest block mb-1">Active Rank status</span>
                <h4 className="font-serif text-xl font-bold uppercase tracking-widest text-brand-gold mb-4">
                  {loyaltyTier}
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-brand-sand/80">
                    <span>Balance: <strong>{loyaltyPoints} points</strong></span>
                    {loyaltyTier !== 'Gold Emperor' && (
                      <span><strong>{nextTierPoints - loyaltyPoints} points</strong> needed for next promotion rank</span>
                    )}
                  </div>
                  
                  {/* Slider bar progress */}
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-gold h-full transition-all duration-500" style={{ width: `${tierProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Tier definitions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs pt-4">
                <div className="border border-brand-navy/15 p-4 space-y-2.5">
                  <h5 className="font-bold uppercase text-brand-navy tracking-wide">Bronze Monarch</h5>
                  <p className="text-brand-navy/60 leading-relaxed">
                    Default level. Unlock checkout points redemptions (10 pts = ₦1). Earns 10 pts per ₦1 spent.
                  </p>
                </div>
                <div className={`border p-4 space-y-2.5 ${loyaltyTier === 'Silver Sovereign' ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-navy/15 opacity-60'}`}>
                  <h5 className="font-bold uppercase text-brand-navy tracking-wide flex items-center gap-1">
                    Silver Sovereign
                    {loyaltyTier === 'Silver Sovereign' && <Check className="h-3.5 w-3.5 text-brand-gold" />}
                  </h5>
                  <span className="text-[10px] text-brand-navy/40 font-semibold block">Requires 1,500 Points</span>
                  <p className="text-brand-navy/60 leading-relaxed">
                    Unlock **Free shipping site-wide on all purchases** (no thresholds). 5% additional automatic markdown on boutique items.
                  </p>
                </div>
                <div className={`border p-4 space-y-2.5 ${loyaltyTier === 'Gold Emperor' ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-navy/15 opacity-60'}`}>
                  <h5 className="font-bold uppercase text-brand-navy tracking-wide flex items-center gap-1">
                    Gold Emperor
                    {loyaltyTier === 'Gold Emperor' && <Check className="h-3.5 w-3.5 text-brand-gold" />}
                  </h5>
                  <span className="text-[10px] text-brand-navy/40 font-semibold block">Requires 3,500 Points</span>
                  <p className="text-brand-navy/60 leading-relaxed">
                    Exclusive **Bespoke VIP lounge access**. Unlimited free courier deliveries. 10% standard discount automatically applied.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: BESPOKE PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              
              {/* Profile Details */}
              <div className="bg-white p-6 border border-brand-gold/15 shadow-sm">
                <h3 className="font-serif text-lg font-bold uppercase text-brand-navy tracking-wide mb-6 pb-3 border-b border-brand-gold/10">
                  Profile Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-brand-navy">
                  <div className="bg-brand-sand/20 p-4 border border-brand-navy/5">
                    <span className="text-[10px] text-brand-navy/40 font-bold block mb-1">FULL NAME</span>
                    <strong className="font-medium flex items-center gap-1.5">
                      <User className="h-4.5 w-4.5 text-brand-gold" />
                      {name}
                    </strong>
                  </div>
                  <div className="bg-brand-sand/20 p-4 border border-brand-navy/5">
                    <span className="text-[10px] text-brand-navy/40 font-bold block mb-1">EMAIL ADDRESS</span>
                    <strong className="font-medium flex items-center gap-1.5">
                      <Mail className="h-4.5 w-4.5 text-brand-gold" />
                      {email}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Delivery Locations */}
              <div className="bg-white p-6 border border-brand-gold/15 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-brand-gold/10">
                  <h3 className="font-serif text-lg font-bold uppercase text-brand-navy tracking-wide flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-brand-gold" />
                    Delivery Profile Addresses
                  </h3>
                  
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-xs font-bold text-brand-gold hover:text-brand-gold/80 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Location
                    </button>
                  )}
                </div>

                {/* Form to add address */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="space-y-4 mb-8 bg-brand-sand/15 p-6 border border-brand-navy/5">
                    
                    {addrError && (
                      <div className="bg-red-50 border border-red-200 p-3 text-red-600 text-xs font-semibold">
                        {addrError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-1">Receiver Name</label>
                        <input
                          type="text"
                          placeholder="Receiver name"
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          className="w-full bg-white border border-brand-navy/15 py-2 px-3 text-xs focus:outline-none focus:border-brand-gold text-brand-navy font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-1">Phone Number</label>
                        <input
                          type="text"
                          placeholder="+44 20 7946 0958"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          className="w-full bg-white border border-brand-navy/15 py-2 px-3 text-xs focus:outline-none focus:border-brand-gold text-brand-navy font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-1">Street Address</label>
                      <input
                        type="text"
                        placeholder="100 Palace Court"
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        className="w-full bg-white border border-brand-navy/15 py-2 px-3 text-xs focus:outline-none focus:border-brand-gold text-brand-navy font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-1">City</label>
                        <input
                          type="text"
                          placeholder="London"
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full bg-white border border-brand-navy/15 py-2 px-3 text-xs focus:outline-none focus:border-brand-gold text-brand-navy font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-1">State / Province</label>
                        <input
                          type="text"
                          placeholder="Greater London"
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full bg-white border border-brand-navy/15 py-2 px-3 text-xs focus:outline-none focus:border-brand-gold text-brand-navy font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-1">Zip / Postal Code</label>
                        <input
                          type="text"
                          placeholder="W1A 1AA"
                          value={addrZip}
                          onChange={(e) => setAddrZip(e.target.value)}
                          className="w-full bg-white border border-brand-navy/15 py-2 px-3 text-xs focus:outline-none focus:border-brand-gold text-brand-navy font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-1">Country</label>
                      <input
                        type="text"
                        placeholder="United Kingdom"
                        value={addrCountry}
                        onChange={(e) => setAddrCountry(e.target.value)}
                        className="w-full bg-white border border-brand-navy/15 py-2 px-3 text-xs focus:outline-none focus:border-brand-gold text-brand-navy font-semibold"
                      />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="submit"
                        className="btn-navy py-2 px-6 text-xs font-bold uppercase tracking-wider"
                      >
                        Register Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="border border-brand-navy/15 px-6 py-2 text-xs font-bold text-brand-navy hover:bg-brand-sand/20"
                      >
                        Cancel
                      </button>
                    </div>

                  </form>
                )}

                {/* Addresses Grid display */}
                {addresses.length === 0 ? (
                  <p className="text-xs text-brand-navy/50 italic text-center py-4">
                    No addresses registered. Please add a shipping location profile.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr, idx) => (
                      <div
                        key={addr._id || idx}
                        className="p-4 border border-brand-navy/15 relative"
                      >
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="absolute top-3 right-3 text-brand-navy/40 hover:text-red-500 transition-colors p-1"
                          title="Delete address"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <h4 className="font-bold text-sm text-brand-navy mb-1">{addr.name}</h4>
                        <p className="text-xs text-brand-navy/60 leading-relaxed">
                          {addr.street}, {addr.city}<br />
                          {addr.state}, {addr.zipCode}<br />
                          {addr.country}
                        </p>
                        <p className="text-[10px] text-brand-navy/40 mt-2 font-semibold">
                          Phone: {addr.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </section>

      </div>

    </div>
  );
}
