import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Tag, 
  Calendar, 
  DollarSign, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Percent, 
  Info 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Discount type selector: 'percentage' or 'flat'
  const [discountType, setDiscountType] = useState('percentage');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percent: 20,
    flat_discount: 0.00,
    promo_code: '',
    start_date: new Date().toISOString().slice(0, 10),
    expiry_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
    applicable_category: 'All',
    min_order_value: 499,
    is_active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons/');
      setCoupons(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load active coupons.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    const updatedStatus = !coupon.is_active;
    try {
      await api.patch(`/coupons/${coupon.id}/`, { is_active: updatedStatus });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: updatedStatus } : c));
      toast.success(`Coupon "${coupon.title}" is now ${updatedStatus ? 'Active' : 'Disabled'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle coupon status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}/`);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Coupon deleted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete coupon.');
    }
  };

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setDiscountType('percentage');
    setFormData({
      title: '',
      description: '',
      discount_percent: 20,
      flat_discount: 0,
      promo_code: `HUNGRY${Math.floor(100 + Math.random() * 900)}`,
      start_date: new Date().toISOString().slice(0, 10),
      expiry_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
      applicable_category: 'All',
      min_order_value: 499,
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    const type = parseFloat(coupon.flat_discount || 0) > 0 ? 'flat' : 'percentage';
    setDiscountType(type);
    setFormData({
      title: coupon.title,
      description: coupon.description || '',
      discount_percent: coupon.discount_percent,
      flat_discount: coupon.flat_discount || 0,
      promo_code: coupon.promo_code,
      start_date: coupon.start_date,
      expiry_date: coupon.expiry_date,
      applicable_category: coupon.applicable_category || 'All',
      min_order_value: coupon.min_order_value,
      is_active: coupon.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clear alternative discount value based on chosen type
      const payload = {
        ...formData,
        discount_percent: discountType === 'percentage' ? parseInt(formData.discount_percent) : 0,
        flat_discount: discountType === 'flat' ? parseFloat(formData.flat_discount) : 0.00
      };

      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon.id}/`, payload);
        toast.success('Coupon updated successfully.');
      } else {
        await api.post('/coupons/', payload);
        toast.success('Coupon published live!');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save coupon. Check duplicate codes.');
    }
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Coupons</h1>
          <p className="text-slate-500 dark:text-slate-400">Deploy dynamic percentage and flat rate discount coupon codes that immediately sync live on checkout processes.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition text-xs shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold animate-pulse flex items-center justify-center gap-2">
          <Tag className="w-4 h-4 animate-spin text-emerald-500" /> Loading coupon codes...
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 text-center border dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 font-bold mb-2">No coupons configured yet.</p>
          <button onClick={handleOpenAddModal} className="text-emerald-600 font-bold hover:underline">Deploy your first coupon</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map(coupon => {
            const isFlat = parseFloat(coupon.flat_discount || 0) > 0;
            return (
              <div key={coupon.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                            {isFlat ? `₹${parseFloat(coupon.flat_discount).toFixed(0)} FLAT OFF` : `${coupon.discount_percent}% OFF`}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs ${coupon.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`}>
                            {coupon.is_active ? '● LIVE' : 'DISABLED'}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-tight mt-1">{coupon.title}</h3>
                      </div>
                      <span className="font-mono bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50 px-3 py-1 rounded-xl text-xs font-black tracking-wide">
                        {coupon.promo_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{coupon.description || 'Exclusive discount on 100% vegetarian gourmet delicacies.'}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-850 font-semibold">
                      <div><span className="text-slate-500">Min Order:</span> ₹{coupon.min_order_value}</div>
                      <div><span className="text-slate-500">Category:</span> {coupon.applicable_category}</div>
                      <div><span className="text-slate-500">Valid From:</span> {coupon.start_date}</div>
                      <div><span className="text-slate-500">Expires:</span> {coupon.expiry_date}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(coupon)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      coupon.is_active
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 hover:bg-amber-100'
                        : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {coupon.is_active ? <><XCircle className="w-3.5 h-3.5" /> Disable Coupon</> : <><CheckCircle className="w-3.5 h-3.5" /> Publish Live</>}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(coupon)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 rounded-xl transition"
                    title="Edit Coupon"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Coupon Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setShowModal(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border dark:border-slate-800 z-50"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <h2 className="text-base font-extrabold">
                  {editingCoupon ? 'Edit Coupon' : 'Publish New Coupon'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Coupon Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                      placeholder="e.g. Monsoon Special Veg Coupon"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Promo Code (uppercase, unique) *</label>
                    <input
                      type="text"
                      required
                      value={formData.promo_code}
                      onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500 font-mono font-bold text-emerald-650"
                      placeholder="VEG20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border dark:border-slate-850">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Discount Type *</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full px-3 py-2 border dark:border-slate-855 dark:bg-slate-955 rounded-xl"
                    >
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="flat">Flat Cash Discount (₹)</option>
                    </select>
                  </div>
                  <div>
                    {discountType === 'percentage' ? (
                      <>
                        <label className="block font-bold text-slate-650 dark:text-slate-400 mb-1">Discount Percent (%) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="100"
                          value={formData.discount_percent}
                          onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                          className="w-full px-3 py-2 border dark:border-slate-855 dark:bg-slate-955 rounded-xl font-bold focus:border-emerald-500"
                          placeholder="20"
                        />
                      </>
                    ) : (
                      <>
                        <label className="block font-bold text-slate-655 dark:text-slate-400 mb-1">Flat Cash Discount (INR ₹) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.flat_discount}
                          onChange={(e) => setFormData({ ...formData, flat_discount: e.target.value })}
                          className="w-full px-3 py-2 border dark:border-slate-855 dark:bg-slate-955 rounded-xl font-bold focus:border-emerald-500"
                          placeholder="150"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Min Order Value (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.min_order_value}
                      onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                      placeholder="499"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Applicable Category</label>
                    <input
                      type="text"
                      value={formData.applicable_category}
                      onChange={(e) => setFormData({ ...formData, applicable_category: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                      placeholder="All / Paneer / Pizza"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Description</label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                    placeholder="Brief highlights of this coupon..."
                  ></textarea>
                </div>



                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="couponActive"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded dark:bg-slate-950 dark:border-slate-800"
                  />
                  <label htmlFor="couponActive" className="font-bold text-slate-700 dark:text-slate-350">Coupon Active & Visible during checkout</label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border dark:border-slate-850 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                  >
                    Publish Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
