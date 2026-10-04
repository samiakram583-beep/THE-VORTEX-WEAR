import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Heart, ShoppingBag, ArrowRight, User, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { ProductCard } from '../components/ProductCard';

interface PageProps {
  onNavigate: (path: string) => void;
  onSelectProduct?: (slug: string) => void;
}

export { AboutPage } from './AboutPage';

export const ContactPage: React.FC<PageProps> = () => {
  const { settings } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
          Concierge & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-display mt-1">
          Get in Touch with The Vortex Wear
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2">
          Whether you need advice on chest sizing, bespoke orders, or order status checks, our team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-stone-50 rounded-xl border border-stone-200/80 space-y-4 text-xs">
            <h3 className="font-bold text-stone-950 text-sm font-display uppercase tracking-wider">
              Direct Channels
            </h3>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-stone-700 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900">Email Inquiries</p>
                <a href={`mailto:${settings.business_email}`} className="text-stone-600 hover:underline">
                  {settings.business_email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#25D366] mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900">WhatsApp Concierge</p>
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 hover:underline"
                >
                  {settings.whatsapp_number}
                </a>
                <p className="text-[11px] text-stone-400 mt-0.5">Instant chat: Mon–Sat, 10 AM – 10 PM PKT</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-stone-700 mt-0.5" />
              <div>
                <p className="font-semibold text-stone-900">Distribution Headquarters</p>
                <p className="text-stone-600">Lahore / Karachi, Pakistan</p>
                <p className="text-[11px] text-stone-400">Nationwide courier fulfillment via Leopards & TCS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-stone-950 font-display">Message Sent</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Thank you, {name}. A stylist from The Vortex Wear will respond to your email at {email} or via WhatsApp within a few hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-stone-950 font-display mb-2">Send an Inquiry</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Usman Farooq"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="usman@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  placeholder="0300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us what you're looking for or your order number..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-6 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC<PageProps> = () => {
  const { settings } = useStore();
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">Logistics & Delivery</span>
        <h1 className="text-3xl font-extrabold text-stone-950 font-display mt-1">Shipping Policy</h1>
      </div>

      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
        <p className="font-semibold text-stone-950 mb-1">Key Delivery Rules:</p>
        <ul className="list-disc pl-5 space-y-1 text-stone-600">
          <li>Complimentary standard delivery on all orders exceeding {settings.currency_symbol} {settings.free_shipping_threshold.toLocaleString()}.</li>
          <li>A flat shipping fee of {settings.currency_symbol} {settings.standard_shipping_fee} applies to orders below this amount.</li>
          <li>Cash on Delivery (COD) is available nationwide with no additional surcharge.</li>
        </ul>
      </div>

      <h3 className="text-base font-bold text-stone-950 font-display">1. Order Processing Time</h3>
      <p>
        All orders are verified via automated SMS or WhatsApp and packed within 24 business hours from our central warehouse. Orders placed on Sunday or national holidays will be dispatched on the following business day.
      </p>

      <h3 className="text-base font-bold text-stone-950 font-display">2. Delivery Timeframes</h3>
      <p>
        - <strong>Major Metros (Lahore, Karachi, Islamabad, Rawalpindi):</strong> 2 to 3 business days.<br />
        - <strong>Secondary Cities (Faisalabad, Multan, Sialkot, Gujranwala, Peshawar):</strong> 3 to 4 business days.<br />
        - <strong>Other Regions & Rural Areas:</strong> 4 to 6 business days.
      </p>

      <h3 className="text-base font-bold text-stone-950 font-display">3. Courier Partners & Tracking</h3>
      <p>
        Deliveries are fulfilled through Leopards Courier, TCS, and Trax. Customers receive an SMS with live tracking link as soon as the courier scans the parcel.
      </p>
    </div>
  );
};

export const ReturnPolicyPage: React.FC<PageProps> = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">Customer Assurance</span>
        <h1 className="text-3xl font-extrabold text-stone-950 font-display mt-1">Returns & Exchanges</h1>
      </div>

      <p>
        At The Vortex Wear, we want you to feel complete confidence in your wardrobe investment. If your shirt or trouser size is not ideal, we offer an effortless 7-day exchange window.
      </p>

      <h3 className="text-base font-bold text-stone-950 font-display">1. Eligibility for Size Exchange</h3>
      <p>
        Items must be unworn, unwashed, and returned in their original packaging with garment tags intact within 7 calendar days of delivery.
      </p>

      <h3 className="text-base font-bold text-stone-950 font-display">2. How to Request an Exchange</h3>
      <p>
        Simply message our WhatsApp concierge at <strong>+92 300 1046010</strong> with your Order Number and desired replacement size. Our team will arrange a reverse courier pickup or provide drop-off instructions.
      </p>

      <h3 className="text-base font-bold text-stone-950 font-display">3. Refunds</h3>
      <p>
        In the rare event of a manufacturing flaw or defective delivery, full refunds will be disbursed via Bank Transfer / Raast or store credit within 3 business days after the returned garment is inspected.
      </p>
    </div>
  );
};

export const PrivacyTermsPage: React.FC<PageProps & { type: 'privacy' | 'terms' }> = ({ type }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">Legal Documentation</span>
        <h1 className="text-3xl font-extrabold text-stone-950 font-display mt-1">
          {type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
        </h1>
      </div>

      <p>
        Last updated: March 2026. The Vortex Wear is committed to maintaining privacy, security, and transparent retail practices for all shoppers in Pakistan.
      </p>

      {type === 'privacy' ? (
        <>
          <h3 className="text-base font-bold text-stone-950 font-display">Data Collection & Usage</h3>
          <p>
            We collect personal information necessary solely to process and deliver your clothing orders (name, mobile phone number, delivery address, and email). We never sell, lease, or monetize your personal data.
          </p>
          <h3 className="text-base font-bold text-stone-950 font-display">Payment Security</h3>
          <p>
            The Vortex Wear utilizes Cash on Delivery (COD) as our primary payment mechanism, eliminating the need to store sensitive credit or debit card records on our servers.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-base font-bold text-stone-950 font-display">Terms of Purchase</h3>
          <p>
            By placing an order with The Vortex Wear, you confirm that you are at least 18 years of age or possess guardian permission, and that the shipping address and mobile contact provided are accurate.
          </p>
          <h3 className="text-base font-bold text-stone-950 font-display">Pricing & Product Accuracy</h3>
          <p>
            All listed prices are in Pakistani Rupees (PKR) and include applicable taxes. We make every effort to display true fabric colors, although monitor calibration may create subtle variances.
          </p>
        </>
      )}
    </div>
  );
};

export const WishlistPage: React.FC<PageProps> = ({ onNavigate, onSelectProduct }) => {
  const { wishlist, products } = useStore();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="pb-8 border-b border-stone-200 mb-8 flex items-baseline justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">Saved Pieces</span>
          <h1 className="text-3xl font-extrabold text-stone-950 font-display mt-1">My Wishlist</h1>
        </div>
        <span className="text-xs text-stone-500 tabular-nums">{wishlistedProducts.length} items</span>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="py-20 text-center bg-stone-50 rounded-xl border border-stone-200/80">
          <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-950 font-display mb-1">Your wishlist is empty</h3>
          <p className="text-xs text-stone-500 mb-6 max-w-xs mx-auto">
            Click the heart icon on any shirt or trouser to save it for later.
          </p>
          <button
            onClick={() => onNavigate('/shop')}
            className="py-2.5 px-6 bg-stone-950 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onNavigate={onSelectProduct || ((slug) => onNavigate(`/product/${slug}`))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AccountOrdersPage: React.FC<PageProps> = ({ onNavigate }) => {
  const {
    orders,
    currentUser,
    settings,
    addresses,
    addAddress,
    deleteAddress,
    updateProfile,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  // Profile edit states
  const [profileName, setProfileName] = useState(currentUser?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // New address states
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrName, setNewAddrName] = useState(currentUser?.full_name || '');
  const [newAddrPhone, setNewAddrPhone] = useState(currentUser?.phone || '');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Lahore');
  const [newAddrProvince, setNewAddrProvince] = useState('Punjab');
  const [newAddrPostal, setNewAddrPostal] = useState('');
  const [newAddrDefault, setNewAddrDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // STRICT PRIVACY: Customers can only access their own orders
  const customerOrders = currentUser
    ? orders.filter(
        (ord) =>
          (ord.customer_email && ord.customer_email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (ord.user_id && ord.user_id === currentUser.id)
      )
    : [];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setIsUpdatingProfile(true);
    try {
      await updateProfile({ full_name: profileName, phone: profilePhone });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim() || !newAddrCity.trim()) {
      showToast('Please enter address and city', 'error');
      return;
    }
    setIsSavingAddress(true);
    try {
      const ok = await addAddress({
        full_name: newAddrName,
        phone: newAddrPhone,
        address: newAddrStreet,
        city: newAddrCity,
        province: newAddrProvince,
        postal_code: newAddrPostal,
        is_default: newAddrDefault,
      });
      if (ok) {
        setIsAddingAddress(false);
        setNewAddrStreet('');
        setNewAddrPostal('');
      }
    } finally {
      setIsSavingAddress(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="pb-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">Customer Account</span>
          <h1 className="text-3xl font-extrabold text-stone-950 font-display mt-1">
            {currentUser ? `Welcome, ${currentUser.full_name}` : 'My Account'}
          </h1>
          {currentUser && <p className="text-xs text-stone-500 mt-1">{currentUser.email}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/wishlist')}
            className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Wishlist</span>
          </button>
          <button
            onClick={() => onNavigate('/shop')}
            className="py-2 px-4 bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Explore Shop
          </button>
        </div>
      </div>

      {!currentUser ? (
        <div className="py-16 text-center bg-stone-50 rounded-xl border border-stone-200/80 p-8 space-y-4">
          <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-900 font-display">Authentication Required</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Sign in with your The Vortex Wear customer account to access your orders, saved addresses, profile details, and private settings.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/')}
              className="py-2.5 px-6 bg-stone-950 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors"
            >
              Sign In to Your Account
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-stone-200 gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-stone-950 text-stone-950'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({customerOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'addresses'
                  ? 'border-stone-950 text-stone-950'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Addresses ({addresses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-stone-950 text-stone-950'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Details</span>
            </button>
          </div>

          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Showing private orders for <strong className="text-stone-900">{currentUser.email}</strong>
                </span>
              </div>

              {customerOrders.length === 0 ? (
                <div className="py-16 text-center bg-stone-50 rounded-xl border border-stone-200/80">
                  <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 mb-4">No past orders found for your account.</p>
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="py-2 px-5 bg-stone-950 text-white text-xs font-bold rounded-lg"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                        <div>
                          <span className="text-xs text-stone-500">Order ID: </span>
                          <strong className="text-xs font-bold text-stone-950 font-display">{ord.order_number}</strong>
                          <span className="text-xs text-stone-400 ml-2">· {new Date(ord.created_at).toLocaleDateString()}</span>
                        </div>

                        <span className="text-[11px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800 px-2 py-0.5 rounded-sm self-start sm:self-auto">
                          {ord.order_status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="divide-y divide-stone-50 text-xs">
                        {ord.items.map((item) => (
                          <div key={item.id} className="py-2 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-stone-900">{item.product_name}</p>
                              <p className="text-stone-500 text-[11px]">{item.variant_description} × {item.quantity}</p>
                            </div>
                            <span className="font-bold text-stone-950 font-display tabular-nums">
                              {settings.currency_symbol} {item.total_price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-950">
                        <span>Total Amount ({ord.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'})</span>
                        <span className="text-sm font-display tabular-nums">
                          {settings.currency_symbol} {ord.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-stone-950 font-display">Saved Shipping Addresses</h2>
                  <p className="text-xs text-stone-500">Manage multiple addresses for streamlined checkout.</p>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="py-1.5 px-3 bg-stone-950 text-white text-xs font-bold rounded-md flex items-center gap-1.5 hover:bg-stone-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                )}
              </div>

              {isAddingAddress && (
                <form onSubmit={handleAddAddress} className="p-6 bg-white rounded-xl border border-stone-300 shadow-xs space-y-4 text-xs">
                  <h3 className="font-bold text-stone-950 text-sm font-display">New Shipping Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                        className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                        className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-stone-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="House / Apartment #, Street name"
                        value={newAddrStreet}
                        onChange={(e) => setNewAddrStreet(e.target.value)}
                        className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                        className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Province</label>
                      <select
                        value={newAddrProvince}
                        onChange={(e) => setNewAddrProvince(e.target.value)}
                        className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden bg-white"
                      >
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                        <option value="Balochistan">Balochistan</option>
                        <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Postal Code (Optional)</label>
                      <input
                        type="text"
                        value={newAddrPostal}
                        onChange={(e) => setNewAddrPostal(e.target.value)}
                        className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="default_addr"
                        checked={newAddrDefault}
                        onChange={(e) => setNewAddrDefault(e.target.checked)}
                        className="w-4 h-4 accent-stone-950"
                      />
                      <label htmlFor="default_addr" className="font-semibold text-stone-700 cursor-pointer">
                        Set as default address
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="py-2 px-4 border border-stone-300 rounded-md font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="py-2 px-4 bg-stone-950 hover:bg-stone-800 disabled:opacity-50 text-white rounded-md font-bold cursor-pointer"
                    >
                      {isSavingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              )}

              {addresses.length === 0 && !isAddingAddress ? (
                <div className="py-12 text-center bg-stone-50 rounded-xl border border-stone-200/80 p-6 space-y-2">
                  <MapPin className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-600">No saved addresses yet.</p>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="py-1.5 px-4 bg-stone-950 text-white text-xs font-bold rounded-md hover:bg-stone-800"
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs space-y-2 text-xs relative">
                      <div className="flex items-center justify-between">
                        <strong className="font-bold text-stone-950">{addr.full_name}</strong>
                        {addr.is_default && (
                          <span className="text-[10px] bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-stone-600">{addr.address}</p>
                      <p className="text-stone-600">{addr.city}, {addr.province} {addr.postal_code}</p>
                      <p className="text-stone-500 font-mono text-[11px]">{addr.phone}</p>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-6 max-w-xl text-xs">
              <div>
                <h2 className="text-sm font-bold text-stone-950 font-display">Account Profile Details</h2>
                <p className="text-xs text-stone-500">Update your verified personal customer profile.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full py-2 px-3 bg-stone-100 border border-stone-200 rounded-md text-stone-500 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">Managed securely through Supabase Auth.</p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Security Role</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.role.toUpperCase()}
                    className="w-full py-2 px-3 bg-stone-100 border border-stone-200 rounded-md text-stone-500 cursor-not-allowed font-mono text-[11px]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="py-2.5 px-6 bg-stone-950 hover:bg-stone-800 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
