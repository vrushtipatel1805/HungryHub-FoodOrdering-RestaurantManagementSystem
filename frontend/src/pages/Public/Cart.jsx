import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { FiMinus, FiPlus, FiTrash2, FiPercent } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Cart() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    subtotal, 
    gst, 
    discount,
    grandTotal, 
    totalQty,
    appliedCoupon,
    setAppliedCoupon
  } = useCart();
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await api.get('/coupons/active/');
        setCoupons(response.data || []);
      } catch (err) {
        console.warn("Failed to load active coupons.", err);
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = () => {
    setCouponError('');
    const enteredCode = couponInput.trim().toUpperCase();
    if (!enteredCode) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const coupon = coupons.find(c => (c.promo_code || '').toUpperCase() === enteredCode);
    if (!coupon) {
      setCouponError('Invalid or expired coupon code.');
      return;
    }

    // Check min order value
    const minVal = parseFloat(coupon.min_order_value || 0);
    if (subtotal < minVal) {
      setCouponError(`Minimum order value of ₹${minVal.toFixed(2)} required for this coupon.`);
      return;
    }

    // Apply coupon
    const isPercent = !!coupon.discount_percent;
    const val = isPercent ? parseInt(coupon.discount_percent) : parseFloat(coupon.flat_discount);
    setAppliedCoupon({
      code: coupon.promo_code,
      type: isPercent ? 'percent' : 'flat',
      value: val
    });
    toast.success('Coupon applied successfully!');
    setCouponInput('');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8 font-sans">
      <h1 className="text-3xl font-semibold text-slate-900 mb-8 text-center">Cart Summary</h1>

      <div className="rounded-[2rem] border-2 border-rust-200 bg-rust-50 p-6 md:p-8 shadow-md">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b-2 border-rust-200">Your Cart</h2>

        {items.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border-2 border-rust-200 bg-white p-6">
            <p className="text-slate-600 text-lg">No items in your cart yet.</p>
            <button
              onClick={() => navigate('/?scroll=menu-categories')}
              className="mt-6 rounded-full bg-rust-500 px-8 py-3 font-semibold text-white hover:bg-rust-600 transition shadow-md hover:shadow-lg active:scale-95"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="divide-y divide-rust-100 rounded-2xl border-2 border-rust-200 bg-white p-4 mb-6 shadow-sm">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-base md:text-lg truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">₹{Number(item.price).toFixed(2)} each</p>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="rounded-full border border-rust-200 p-1.5 text-slate-700 hover:bg-rust-100 transition shadow-sm"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-slate-900 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="rounded-full border border-rust-200 p-1.5 text-slate-700 hover:bg-rust-100 transition shadow-sm"
                        aria-label="Increase quantity"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total Price */}
                    <span className="text-right text-rust-500 font-bold min-w-[80px]">
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </span>

                    {/* Remove Option */}
                    <button
                      onClick={() => {
                        removeItem(item.id);
                        toast.success(`${item.name} removed from cart`);
                      }}
                      className="text-slate-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full"
                      aria-label="Remove item"
                    >
                      <FiTrash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Have a Coupon? Section */}
            <div className="mb-6 rounded-2xl border-2 border-rust-200 bg-white p-6 shadow-sm font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-2">Have a Coupon?</h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-sm font-semibold animate-fade-in">
                  <span className="flex items-center gap-1.5">
                    <FiPercent className="h-4 w-4 text-emerald-600" />
                    <span>Coupon <span className="font-extrabold font-mono bg-emerald-100 px-1.5 py-0.5 rounded">{appliedCoupon.code}</span> applied successfully!</span>
                  </span>
                  <button 
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      toast.success('Coupon removed');
                    }}
                    className="text-red-500 hover:text-red-700 font-bold transition-colors ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="ENTER PROMO CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm text-slate-800 uppercase focus:border-rust-500 focus:outline-none transition font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-rust-500 hover:bg-rust-600 text-white text-sm font-bold px-6 py-2 rounded-xl transition shadow active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 font-medium pl-1">{couponError}</p>}
                  
                  {coupons.length > 0 && (
                    <div className="mt-2.5 p-3.5 bg-rust-50/60 rounded-xl border border-rust-100/60 text-xs">
                      <span className="font-extrabold text-slate-700 block mb-2 uppercase tracking-wide text-[10px]">Available Offers:</span>
                      <div className="flex flex-wrap gap-3">
                        {coupons.map(c => {
                          const discountText = c.discount_percent 
                            ? `${c.discount_percent}% OFF` 
                            : `₹${parseFloat(c.flat_discount).toFixed(0)} OFF`;
                          const statusLabel = c.is_active ? 'Active' : 'Inactive';
                          return (
                            <button
                              key={c.promo_code}
                              type="button"
                              onClick={() => setCouponInput(c.promo_code)}
                              className="rounded-xl bg-white border border-rust-200 p-3.5 text-rust-600 hover:bg-rust-50 transition shadow-2xs text-left flex flex-col gap-1 w-full sm:w-[calc(50%-8px)]"
                            >
                              <div className="flex items-center justify-between gap-2 w-full">
                                <span className="font-mono text-sm text-slate-800 font-extrabold tracking-wide">{c.promo_code}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${c.is_active ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-600 font-semibold mt-0.5">
                                {discountText} {parseFloat(c.min_order_value) > 0 ? ` (Min. ₹${parseFloat(c.min_order_value).toFixed(0)})` : ''}
                              </span>
                              {c.expiry_date && (
                                <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                                  Valid till: {c.expiry_date}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Billing Summary Box */}
            <div className="rounded-2xl border-2 border-rust-200 bg-white p-4 text-sm text-slate-700 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span>Item total</span>
                <span className="text-slate-900 font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>18% GST</span>
                <span className="text-slate-900 font-medium">₹{gst.toFixed(2)}</span>
              </div>
              {discount > 0 && appliedCoupon && (
                <div className="flex items-center justify-between text-rust-500 font-semibold animate-fade-in animate-duration-300">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-rust-100 pt-3 text-base font-bold text-rust-500">
                <span>Grand total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  if (user && user.name !== 'Guest') {
                    navigate('/checkout');
                  } else {
                    navigate('/login?redirect=checkout');
                  }
                }}
                className="w-full rounded-full border-2 border-rust-500 px-6 py-2.5 text-center text-sm font-semibold text-rust-500 transition hover:bg-rust-50 shadow-sm active:scale-95"
              >
                Pay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
