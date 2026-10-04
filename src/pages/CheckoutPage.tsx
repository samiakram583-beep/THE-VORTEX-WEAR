import React, { useState } from 'react';
import { ShieldCheck, Truck, ArrowRight, Tag, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useStore } from '../lib/store';
import confetti from 'canvas-confetti';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderSuccess: (orderNumber: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const {
    cart,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    createOrder,
    settings,
    currentUser,
  } = useStore();

  // Form Fields
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [province, setProvince] = useState('Punjab');
  const [city, setCity] = useState('Lahore');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-stone-900 mb-2">Your Bag is Empty</h2>
        <p className="text-xs text-stone-500 mb-6">Add garments to your shopping bag before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="py-2.5 px-6 bg-stone-900 text-white text-xs font-bold rounded-lg"
        >
          Explore Collections
        </button>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponCode('');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');

    if (!fullName || !email || !phone || !address || !city) {
      setOrderError('Please complete all required shipping fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullShippingAddress = `${address}, ${area ? area + ', ' : ''}${city}, ${province} ${postalCode}`.trim();

      const result = await createOrder({
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone,
        shipping_address: fullShippingAddress,
        city,
        province,
        postal_code: postalCode,
        notes,
      });

      if (!result.success || !result.order) {
        setOrderError(result.error || 'Failed to process order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Celebrate with confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore confetti errors
      }

      onOrderSuccess(result.order.order_number);
    } catch (err: any) {
      setOrderError(err?.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const pakistaniCities = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Sialkot',
    'Gujranwala',
    'Quetta',
    'Hyderabad',
    'Abbottabad',
    'Bahawalpur',
    'Sargodha',
    'Other City',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => onNavigate('/cart')}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 mb-8 font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Shopping Bag
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Shipping & Payment Details (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Checkout & Delivery
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-display mt-1">
              Shipping Information
            </h1>
          </div>

          {orderError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{orderError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} id="checkout-form" className="space-y-6">
            {/* Customer Contact */}
            <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-stone-950 font-display flex items-center gap-2">
                1. Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bilal Akram"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Phone Number (for Courier SMS/Call) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1046010"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Email Address (for Receipt) *</label>
                  <input
                    type="email"
                    required
                    placeholder="bilalakram1048@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-stone-950 font-display flex items-center gap-2">
                2. Delivery Destination
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Province *</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md bg-white focus:border-stone-900 focus:outline-hidden"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                    <option value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md bg-white focus:border-stone-900 focus:outline-hidden"
                  >
                    {pakistaniCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Area / Sector / Colony</label>
                  <input
                    type="text"
                    placeholder="e.g. DHA Phase 5, Gulberg III, F-7/2"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Postal Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 54000"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Complete Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House / Apartment #, Street #, Nearest Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Delivery Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Call before arrival, leave with security guard, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full py-2 px-3 border border-stone-300 rounded-md focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-stone-950 font-display flex items-center gap-2">
                3. Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 rounded-lg border border-stone-950 bg-stone-50 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 accent-stone-950"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-950">Cash on Delivery (COD)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded-sm">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Pay in cash to the delivery courier when your The Vortex Wear parcel arrives at your address.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border border-stone-200 hover:border-stone-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="mt-0.5 accent-stone-950"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-950">Direct Bank Transfer / Raast</span>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Transfer directly to our Meezan Bank account. Instructions sent to your email and WhatsApp upon order.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-stone-50 rounded-xl border border-stone-200/80 space-y-6 sticky top-24">
            <h2 className="text-sm font-bold text-stone-950 font-display pb-3 border-b border-stone-200">
              Order Summary ({cart.length} items)
            </h2>

            {/* Item Mini List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-stone-200/60 pr-1">
              {cart.map((item) => {
                const itemImg = item.product.images[0]?.image_url;
                const unitPrice = item.variant.sale_price ?? (item.product.sale_price ?? item.product.base_price);
                return (
                  <div key={item.variant_id} className="py-3 flex gap-3 text-xs">
                    <div className="w-14 h-16 bg-stone-200 rounded-md overflow-hidden shrink-0">
                      {itemImg && <img src={itemImg} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-stone-900 line-clamp-1">{item.product.name}</h4>
                        <p className="text-stone-500 text-[11px]">
                          {item.variant.color} · Size {item.variant.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <div className="font-bold text-stone-950 font-display tabular-nums">
                        {settings.currency_symbol} {(unitPrice * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Application */}
            <div className="pt-2 border-t border-stone-200">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </div>
                  <button onClick={removeCoupon} className="font-semibold text-stone-600 hover:text-stone-900">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 py-1.5 px-3 bg-white border border-stone-300 rounded-md text-xs uppercase focus:outline-hidden focus:border-stone-900"
                  />
                  <button
                    type="submit"
                    className="py-1.5 px-3 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900 tabular-nums">
                  {settings.currency_symbol} {subtotal.toLocaleString()}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums">- {settings.currency_symbol} {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-medium text-stone-900 tabular-nums">
                  {shippingFee === 0 ? 'FREE' : `${settings.currency_symbol} ${shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-950 pt-3 border-t border-stone-200">
                <span>Total Due</span>
                <span className="font-display tabular-nums">
                  {settings.currency_symbol} {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-[#121212] hover:bg-stone-800 disabled:bg-stone-400 text-white text-xs font-extrabold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm Cash on Delivery Order</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            <div className="text-[11px] text-stone-500 space-y-1.5 text-center">
              <p className="flex items-center justify-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-stone-600" />
                Delivery in 2–4 business days via Leopards/TCS Courier
              </p>
              <p className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
                Inspect parcel before payment on eligible delivery routes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
