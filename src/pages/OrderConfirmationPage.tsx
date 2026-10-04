import React from 'react';
import { CheckCircle2, MessageCircle, Printer, ArrowRight, Package, Truck, Phone } from 'lucide-react';
import { useStore } from '../lib/store';

interface OrderConfirmationPageProps {
  orderNumber: string;
  onNavigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderNumber,
  onNavigate,
}) => {
  const { getOrderByNumber, settings } = useStore();
  const order = getOrderByNumber(orderNumber);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-stone-500 mb-6">Could not find order #{orderNumber}.</p>
        <button
          onClick={() => onNavigate('/')}
          className="py-2.5 px-6 bg-stone-900 text-white text-xs font-bold rounded-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const whatsappInquiryUrl = `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello The Vortex Wear! I just placed order #${order.order_number} for ${settings.currency_symbol} ${order.total.toLocaleString()} (Cash on Delivery). Can you confirm dispatch timeframe?`
  )}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 pb-8 border-b border-stone-200">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Order Successfully Placed
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-display">
          Thank You, {order.customer_name}!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Your order has been recorded. Our fulfillment team is preparing your parcel for dispatch via express courier.
        </p>

        <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-stone-100 rounded-lg text-xs font-semibold text-stone-800">
          <span>Order Number:</span>
          <span className="font-bold text-stone-950 font-display">{order.order_number}</span>
        </div>
      </div>

      {/* Details Card */}
      <div className="mt-8 bg-white rounded-xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Status Tracker */}
        <div className="p-4 bg-stone-50 rounded-lg border border-stone-200/80">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-semibold text-stone-800">Status:</span>
            <span className="font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-sm">
              {order.order_status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs mb-1">
                1
              </div>
              <span className="font-semibold text-stone-900">Received</span>
            </div>
            <div className="flex flex-col items-center opacity-60">
              <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs mb-1">
                2
              </div>
              <span>Dispatched</span>
            </div>
            <div className="flex flex-col items-center opacity-60">
              <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs mb-1">
                3
              </div>
              <span>Delivered</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-stone-100 pb-6">
          <div>
            <h3 className="font-bold text-stone-950 uppercase tracking-wider mb-2">Delivery Address</h3>
            <p className="text-stone-700 leading-relaxed">{order.shipping_address}</p>
            <p className="text-stone-500 mt-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              {order.customer_phone}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-stone-950 uppercase tracking-wider mb-2">Payment Details</h3>
            <p className="text-stone-700 font-semibold">
              {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer'}
            </p>
            <p className="text-stone-500 mt-1">
              Please keep <strong>{settings.currency_symbol} {order.total.toLocaleString()}</strong> ready in exact cash for the delivery rider.
            </p>
          </div>
        </div>

        {/* Itemized Receipt */}
        <div>
          <h3 className="text-xs font-bold text-stone-950 uppercase tracking-wider mb-3">Purchased Items</h3>
          <div className="divide-y divide-stone-100 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-12 bg-stone-100 rounded-md overflow-hidden shrink-0">
                    {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">{item.product_name}</h4>
                    <p className="text-stone-500 text-[11px]">
                      {item.variant_description} · Qty {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="font-bold text-stone-950 font-display tabular-nums">
                  {settings.currency_symbol} {item.total_price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="pt-4 border-t border-stone-200 text-xs text-stone-600 space-y-1.5">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium text-stone-900">
              {settings.currency_symbol} {order.subtotal.toLocaleString()}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount ({order.coupon_code || 'Promo'})</span>
              <span className="tabular-nums">- {settings.currency_symbol} {order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="tabular-nums font-medium text-stone-900">
              {order.shipping_cost === 0 ? 'FREE' : `${settings.currency_symbol} ${order.shipping_cost.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200">
            <span>Amount Payable at Doorstep</span>
            <span className="font-display tabular-nums">
              {settings.currency_symbol} {order.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => onNavigate(`/track-order?id=${order.order_number}`)}
            className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Live</span>
          </button>

          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            Track on WhatsApp
          </a>

          <button
            onClick={() => onNavigate('/shop')}
            className="py-2.5 px-5 bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
