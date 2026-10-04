import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Order, OrderStatus } from '../lib/types';

interface TrackOrderPageProps {
  onNavigate: (path: string) => void;
  initialOrderQuery?: string;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  onNavigate,
  initialOrderQuery,
}) => {
  const { orders, settings, getOrderByNumber, getOrderById } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Read URL query parameters (?order=VW-... or ?id=...) on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get('order') || params.get('id') || initialOrderQuery || '';
    if (orderParam) {
      setSearchQuery(orderParam);
      performSearch(orderParam);
    }
  }, [initialOrderQuery]);

  const performSearch = (query: string) => {
    const cleaned = query.trim().toUpperCase();
    if (!cleaned) return;

    setIsSearching(true);
    setHasSearched(true);

    // 1. Look up in local orders
    let found = getOrderByNumber(cleaned) || getOrderById(cleaned.toLowerCase());

    // 2. Fuzzy match by partial order_number or phone or email
    if (!found) {
      found = orders.find(
        (o) =>
          o.order_number.toUpperCase() === cleaned ||
          o.order_number.toUpperCase().includes(cleaned) ||
          o.id.toLowerCase() === query.trim().toLowerCase()
      );
    }

    setTrackedOrder(found || null);
    setIsSearching(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  // Helper to determine stage active state
  const getStageStatus = (
    currentStatus: OrderStatus,
    stageIndex: number
  ): 'completed' | 'current' | 'upcoming' | 'cancelled' => {
    if (currentStatus === 'cancelled' || currentStatus === 'returned' || currentStatus === 'refunded') {
      return 'cancelled';
    }

    const statusHierarchy: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 1,
      processing: 1,
      shipped: 2,
      out_for_delivery: 3,
      delivered: 4,
      cancelled: -1,
      returned: -1,
      refunded: -1,
    };

    const currentRank = statusHierarchy[currentStatus] ?? 0;

    if (currentRank > stageIndex) return 'completed';
    if (currentRank === stageIndex) return 'current';
    return 'upcoming';
  };

  const stages = [
    {
      title: 'Order Placed',
      description: 'Order received and logged in system',
      icon: Clock,
    },
    {
      title: 'Processing & Packed',
      description: 'Garments quality-checked and packaged',
      icon: Package,
    },
    {
      title: 'Dispatched in Transit',
      description: 'Handed to express courier (Leopards / TCS / Trax)',
      icon: Truck,
    },
    {
      title: 'Out for Delivery',
      description: 'Courier rider en route to your address',
      icon: MapPin,
    },
    {
      title: 'Delivered',
      description: 'Cash collected and order completed',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-[#FBFBF9] text-[#121212] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold uppercase tracking-widest text-stone-600">
            <Truck className="w-3.5 h-3.5 text-stone-900" />
            <span>Real-Time Shipment Logistics</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-950 font-display tracking-tight">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Enter your Vortex Wear Order Number (e.g., <strong className="text-stone-900">VW-2026-1001</strong>) to view real-time fulfillment status, courier dispatch details, and estimated doorstep delivery.
          </p>
        </div>

        {/* Search Bar Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order # (e.g. VW-2026-1001) or Order ID"
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder:text-stone-400 text-sm font-medium focus:bg-white focus:border-stone-900 focus:outline-hidden transition-all uppercase tracking-wider font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="py-3 px-8 bg-stone-950 hover:bg-stone-800 disabled:bg-stone-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer"
            >
              {isSearching ? (
                <span>Tracking...</span>
              ) : (
                <>
                  <span>Track Shipment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick sample orders if available */}
          {orders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span className="font-medium text-stone-700">Recent store orders:</span>
              {orders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(o.order_number);
                    performSearch(o.order_number);
                  }}
                  className="font-mono bg-stone-100 hover:bg-stone-200 text-stone-800 px-2.5 py-1 rounded-md text-[11px] transition-colors"
                >
                  #{o.order_number}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RESULTS: ORDER FOUND */}
        {trackedOrder && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Order Overview Header Card */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
                      Order Reference
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-stone-950 font-display mt-0.5">
                    #{trackedOrder.order_number}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Placed on {new Date(trackedOrder.created_at).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end">
                  <span className="text-xs text-stone-500">Current Shipment Status</span>
                  <span
                    className={`mt-1 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-md ${
                      trackedOrder.order_status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : trackedOrder.order_status === 'shipped' || trackedOrder.order_status === 'out_for_delivery'
                        ? 'bg-indigo-100 text-indigo-900'
                        : trackedOrder.order_status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {trackedOrder.order_status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Visual 5-Stage Stepper */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-950 mb-6">
                  Fulfillment Timeline
                </h3>

                <div className="relative">
                  {/* Connecting Line (Desktop) */}
                  <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-stone-200 z-0" />

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                    {stages.map((stg, idx) => {
                      const state = getStageStatus(trackedOrder.order_status, idx);
                      const Icon = stg.icon;

                      return (
                        <div key={idx} className="flex md:flex-col items-start md:items-center gap-3 text-left md:text-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors shadow-xs ${
                              state === 'completed'
                                ? 'bg-stone-950 text-white'
                                : state === 'current'
                                ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                                : state === 'cancelled'
                                ? 'bg-rose-600 text-white'
                                : 'bg-stone-100 text-stone-400 border border-stone-200'
                            }`}
                          >
                            {state === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>

                          <div className="flex-1 md:flex-initial">
                            <h4
                              className={`text-xs font-bold ${
                                state === 'current'
                                  ? 'text-stone-950 font-display'
                                  : state === 'completed'
                                  ? 'text-stone-900'
                                  : 'text-stone-400'
                              }`}
                            >
                              {stg.title}
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                              {stg.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Delivery Courier Notice */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-900">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-950">Logistics Partner: Leopards / TCS / Trax Express</h4>
                    <p className="text-stone-500 text-[11px]">
                      Nationwide delivery window: 2 to 4 business days. SMS notification dispatched prior to delivery.
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello The Vortex Wear! I am tracking order #${trackedOrder.order_number}. Could you share the courier tracking update?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Recipient & Payment Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-3">
                <div className="flex items-center gap-2 text-stone-900">
                  <MapPin className="w-4 h-4 text-stone-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Shipping Destination</h3>
                </div>
                <div className="text-xs text-stone-700 space-y-1">
                  <p className="font-bold text-stone-950 text-sm">{trackedOrder.customer_name}</p>
                  <p className="leading-relaxed">{trackedOrder.shipping_address}</p>
                  <p className="font-medium text-stone-900">
                    {trackedOrder.city}, {trackedOrder.province} {trackedOrder.postal_code || ''}
                  </p>
                  <p className="pt-2 text-stone-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{trackedOrder.customer_phone}</span>
                  </p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-3">
                <div className="flex items-center gap-2 text-stone-900">
                  <ShieldCheck className="w-4 h-4 text-stone-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Payment Breakdown</h3>
                </div>
                <div className="text-xs text-stone-700 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment Mode</span>
                    <span className="font-semibold text-stone-900">
                      {trackedOrder.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment Status</span>
                    <span
                      className={`font-semibold uppercase text-[11px] ${
                        trackedOrder.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {trackedOrder.payment_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="tabular-nums font-medium text-stone-900">
                      {settings.currency_symbol} {trackedOrder.subtotal.toLocaleString()}
                    </span>
                  </div>
                  {trackedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({trackedOrder.coupon_code || 'Coupon'})</span>
                      <span className="tabular-nums">- {settings.currency_symbol} {trackedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-500">Shipping</span>
                    <span className="tabular-nums font-medium text-stone-900">
                      {trackedOrder.shipping_cost === 0 ? 'FREE' : `${settings.currency_symbol} ${trackedOrder.shipping_cost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-stone-950 pt-2 border-t border-stone-100">
                    <span>Payable at Doorstep</span>
                    <span className="font-display tabular-nums">
                      {settings.currency_symbol} {trackedOrder.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Itemized Garments Card */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-950 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-stone-600" />
                  <span>Garments in this Shipment ({trackedOrder.items.length})</span>
                </h3>
              </div>

              <div className="divide-y divide-stone-100">
                {trackedOrder.items.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-14 rounded-lg bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
                            The Vortex
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-950 text-sm font-display">{item.product_name}</h4>
                        <p className="text-stone-500 text-[11px] mt-0.5">
                          {item.variant_description} · Quantity: <strong>{item.quantity}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-stone-950 font-display tabular-nums">
                        {settings.currency_symbol} {item.total_price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NOT FOUND STATE */}
        {hasSearched && !trackedOrder && !isSearching && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-sm animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-display text-stone-950">
              No Shipment Record Found
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find an order matching <code className="bg-stone-100 px-2 py-0.5 rounded text-stone-900 font-bold font-mono">{searchQuery}</code>. Please double-check your order number from the order confirmation SMS or email.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello The Vortex Wear! I am trying to track my order (${searchQuery}) but cannot find it. Could you check for me?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact WhatsApp Concierge</span>
              </a>
              <button
                type="button"
                onClick={() => onNavigate('/shop')}
                className="py-2.5 px-5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Return to Store
              </button>
            </div>
          </div>
        )}

        {/* Informational Guidelines Card */}
        <div className="bg-stone-100/70 rounded-2xl border border-stone-200/80 p-6 text-xs text-stone-600 space-y-3">
          <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
            Delivery & Courier Guidelines
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>Orders are dispatched within 24 hours of placement across all business days.</li>
            <li>Major metropolitan cities (Lahore, Karachi, Islamabad, Rawalpindi) arrive within 24–48 hours.</li>
            <li>Other cities and regional districts are delivered within 2–4 business days via express courier network.</li>
            <li>Exact cash amount is required for Cash on Delivery parcels upon doorstep arrival.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
