import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check } from 'lucide-react';
import { useStore } from '../lib/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onCheckout,
  onNavigate,
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    settings,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  const freeShippingRemainder = Math.max(0, settings.free_shipping_threshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / settings.free_shipping_threshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-900" />
            <h3 className="text-base font-bold text-stone-900 font-display">
              Shopping Bag ({cart.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-md transition-colors"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-stone-50 px-5 py-3 border-b border-stone-200 text-xs">
          {freeShippingRemainder > 0 ? (
            <p className="text-stone-600 mb-2">
              Add <span className="font-semibold text-stone-950 font-display">{settings.currency_symbol} {freeShippingRemainder.toLocaleString()}</span> more to unlock <span className="font-semibold text-stone-950">Free Express Delivery</span>!
            </p>
          ) : (
            <p className="text-emerald-700 font-semibold mb-2 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              You qualify for Free Express Delivery across Pakistan!
            </p>
          )}
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-900 transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-stone-500">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-stone-900 font-display mb-1">
                Your bag is currently empty
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mb-6">
                Discover our signature Japanese twill shirts and tailored tactical pants.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/shirts');
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#121212] hover:bg-stone-800 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Shop Shirts
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/pants');
                  }}
                  className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold rounded-md transition-colors"
                >
                  Shop Pants
                </button>
              </div>
            </div>
          ) : (
            cart.map((item) => {
              const itemImage = item.product.images[0]?.image_url;
              const unitPrice = item.variant.sale_price ?? (item.product.sale_price ?? item.product.base_price);

              return (
                <div key={item.variant_id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-stone-100 rounded-md overflow-hidden shrink-0 border border-stone-200/60">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 text-center px-0.5">
                        The Vortex Wear
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            onClose();
                            onNavigate(`/product/${item.product.slug}`);
                          }}
                          className="text-xs font-bold text-stone-900 line-clamp-1 hover:underline cursor-pointer"
                        >
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.variant_id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-2">
                        <span>Color: {item.variant.color}</span>
                        <span aria-hidden="true">·</span>
                        <span>Size: {item.variant.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded-md">
                        <button
                          onClick={() => updateCartQuantity(item.variant_id, item.quantity - 1)}
                          className="p-1 text-stone-500 hover:text-stone-950 disabled:opacity-30"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold tabular-nums text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.variant_id, item.quantity + 1)}
                          className="p-1 text-stone-500 hover:text-stone-950 disabled:opacity-30"
                          disabled={item.quantity >= item.variant.stock_quantity}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <div className="text-xs font-bold text-stone-950 tabular-nums font-display">
                        {settings.currency_symbol} {(unitPrice * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Module */}
        {cart.length > 0 && (
          <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-4">
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-500 hover:text-stone-900 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 py-1.5 px-3 bg-white border border-stone-300 rounded-md text-xs uppercase focus:outline-hidden focus:border-stone-900"
                  />
                  <button
                    type="submit"
                    className="py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-1 border-t border-stone-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-stone-900">
                  {settings.currency_symbol} {subtotal.toLocaleString()}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span className="tabular-nums">
                    - {settings.currency_symbol} {discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="tabular-nums font-medium text-stone-900">
                  {shippingFee === 0 ? 'FREE' : `${settings.currency_symbol} ${shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200">
                <span>Estimated Total</span>
                <span className="tabular-nums font-display">
                  {settings.currency_symbol} {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="w-full py-3 px-4 bg-[#121212] hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-stone-500">
              Cash on Delivery · Verified secure order checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
