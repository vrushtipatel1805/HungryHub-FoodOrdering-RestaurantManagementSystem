import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Sparkles,
  Printer,
  Calendar,
  Clock,
  Gift,
  Grid
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Events() {
  const [packages, setPackages] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages'); // packages or bookings
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);

  // Search and Filter States for bookings
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');

  // Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG, and WebP formats are supported.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
    if (imagePath.startsWith('http')) return imagePath;
    const backendBase = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:8000';
    return `${backendBase}${imagePath}`;
  };



  const [formData, setFormData] = useState({
    id: '',
    event_type: 'birthday',
    name: '',
    description: '',
    price: '',
    price_type: 'per_person',
    min_capacity: 15,
    max_capacity: 100,
    duration: '4 Hours',
    inclusionsStr: 'Welcome Mocktail, 3 Starters, 2 Main Course, Live Dessert Counter',
    is_active: true
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [pkgRes, resvRes] = await Promise.all([
        api.get('/packages/'),
        api.get('/reservations/')
      ]);
      setPackages(pkgRes.data || []);
      // Filter reservations that represent event package bookings
      const bookings = (resvRes.data || []).filter(r => r.package !== null && r.package_details !== null);
      setEventBookings(bookings);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load banquet and event packages data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (pkg) => {
    const updatedStatus = !pkg.is_active;
    try {
      await api.patch(`/packages/${pkg.id}/`, { is_active: updatedStatus });
      setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, is_active: updatedStatus } : p));
      toast.success(`Package "${pkg.name}" is now ${updatedStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update package status.');
    }
  };

  const handleDeletePkg = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event package?')) return;
    try {
      await api.delete(`/packages/${id}/`);
      setPackages(prev => prev.filter(p => p.id !== id));
      toast.success('Event package deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete package.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.patch(`/reservations/${bookingId}/`, {
        reservation_status: newStatus
      });
      setEventBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, reservation_status: newStatus } : b));
      toast.success(`Booking #${bookingId} updated to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update event booking status.');
    }
  };

  const handleOpenAddModal = () => {
    setEditingPkg(null);
    setFormData({
      id: `pkg-${Date.now().toString().slice(-4)}`,
      event_type: 'birthday',
      name: '',
      description: '',
      price: '',
      price_type: 'per_person',
      min_capacity: 15,
      max_capacity: 100,
      duration: '4 Hours',
      inclusionsStr: 'Welcome Mocktail, 3 Starters, 2 Main Course, Live Dessert Counter',
      is_active: true
    });
    setImageFile(null);
    setImagePreview(null);
    setShowPkgModal(true);
  };

  const handleOpenEditModal = (pkg) => {
    setEditingPkg(pkg);
    setFormData({
      id: pkg.id,
      event_type: pkg.event_type,
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      price_type: pkg.price_type || 'per_person',
      min_capacity: pkg.min_capacity || 15,
      max_capacity: pkg.max_capacity || 100,
      duration: pkg.duration || '4 Hours',
      inclusionsStr: Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : '',
      is_active: pkg.is_active ?? true
    });
    setImageFile(null);
    setImagePreview(pkg.image || null);
    setShowPkgModal(true);
  };

  const handleSubmitPkg = async (e) => {
    e.preventDefault();
    try {
      const inclusions = formData.inclusionsStr.split(',').map(s => s.trim()).filter(Boolean);
      const data = new FormData();
      data.append('id', formData.id);
      data.append('event_type', formData.event_type);
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', parseFloat(formData.price));
      data.append('price_type', formData.price_type);
      data.append('min_capacity', parseInt(formData.min_capacity));
      data.append('max_capacity', parseInt(formData.max_capacity));
      data.append('duration', formData.duration);
      data.append('inclusions', JSON.stringify(inclusions));
      data.append('is_active', formData.is_active);

      if (imageFile) {
        data.append('image', imageFile);
      } else if (imagePreview === null) {
        data.append('image', '');
      }

      if (editingPkg) {
        await api.put(`/packages/${formData.id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Event package updated successfully.');
      } else {
        await api.post('/packages/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('New event package created!');
      }
      setShowPkgModal(false);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save event package. Check duplicate IDs.');
    }
  };



  return (
    <div className="space-y-6 text-sm">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Banquet & Event Packages</h1>
          <p className="text-slate-500 dark:text-slate-400">Configure function packages, review banquet bookings, calculate event invoices and handle guest lists.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'packages' ? 'bg-white dark:bg-slate-850 shadow-xs font-bold text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Catering Packages
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'bookings' ? 'bg-white dark:bg-slate-850 shadow-xs font-bold text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Event Bookings ({eventBookings.length})
            </button>
          </div>
          {activeTab === 'packages' && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition text-xs shadow-md"
            >
              <Plus className="w-4 h-4" /> Create Package
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold animate-pulse flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 animate-spin text-emerald-500" /> Loading banquet details...
        </div>
      ) : activeTab === 'packages' ? (
        /* Package lists Grid */
        packages.length === 0 ? (
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 text-center border dark:border-slate-800">
            <p className="text-slate-500 font-bold">No event packages configured yet. Click "Create Package" to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-40 w-full overflow-hidden border-b dark:border-slate-900 bg-slate-100 dark:bg-slate-900 relative">
                    <img
                      src={getImageUrl(pkg.image)}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b dark:border-slate-900 pb-2">
                      <span className="bg-emerald-700 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                        {pkg.event_type}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-sm ${pkg.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'}`}>
                        {pkg.is_active ? '● ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug pt-1">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{pkg.description || 'Exclusive 100% vegetarian banquet catering package.'}</p>

                    <div className="flex items-baseline gap-1 text-slate-900 dark:text-white font-bold text-xl pt-1">
                      ₹{pkg.price} <span className="text-xs text-slate-400 font-normal">/ {pkg.price_type === 'per_person' ? 'person' : 'flat rate'}</span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div><span className="font-semibold text-slate-700 dark:text-slate-350">Guests Limit:</span> {pkg.min_capacity} Pax (Max {pkg.max_capacity})</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-350">Duration:</span> {pkg.duration}</div>
                      <div className="pt-1"><span className="font-bold text-slate-700 dark:text-slate-350">Menu Inclusions:</span></div>
                      <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-450 space-y-0.5 pl-1">
                        {Array.isArray(pkg.inclusions) && pkg.inclusions.map((inc, i) => (
                          <li key={i}>{inc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${pkg.is_active
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 hover:bg-amber-100'
                        : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100'
                      }`}
                  >
                    {pkg.is_active ? <><XCircle className="w-4 h-4" /> Deactivate</> : <><CheckCircle className="w-4 h-4" /> Activate</>}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(pkg)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition"
                    title="Edit Package"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePkg(pkg.id)}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                    title="Delete Package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Event Bookings Tab */
        (() => {
          const filteredBookings = eventBookings.filter(b => {
            const searchLower = bookingSearch.toLowerCase();
            const eventName = b.event_name || b.package_details?.event_type || '';
            const packageName = b.package_name || b.package_details?.name || '';

            const matchesSearch =
              b.customer_name.toLowerCase().includes(searchLower) ||
              b.email.toLowerCase().includes(searchLower) ||
              b.booking_id.toLowerCase().includes(searchLower) ||
              eventName.toLowerCase().includes(searchLower) ||
              packageName.toLowerCase().includes(searchLower);

            const matchesStatus = bookingStatusFilter === 'All' || b.reservation_status === bookingStatusFilter;

            return matchesSearch && matchesStatus;
          });

          return (
            <div className="space-y-4">
              {/* Search and Filter Panel */}
              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Search by Booking ID, customer name, email, event, or package..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div className="w-full md:w-64">
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-350"
                  >
                    <option value="All">All Booking Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 text-center border dark:border-slate-800">
                  <p className="text-slate-500 font-bold">No event package bookings match your search and filter criteria.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Booking ID</th>
                          <th className="py-3 px-4">Guest Details</th>
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Package & Event</th>
                          <th className="py-3 px-4">Guests</th>
                          <th className="py-3 px-4">Email Status</th>
                          <th className="py-3 px-4">Booking Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredBookings.map(booking => (
                          <tr key={booking.booking_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition">
                            <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-450">#{booking.booking_id}</td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-850 dark:text-slate-100">{booking.customer_name}</div>
                              <div className="text-[10px] text-slate-400">{booking.phone} • {booking.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold">{booking.reservation_date}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{booking.reservation_time}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {booking.package_details?.name || booking.package_name || 'Party Banquet'}
                              </div>
                              {booking.event_name && (
                                <div className="text-[10px] text-slate-400 mt-0.5">Event: {booking.event_name}</div>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{booking.guests_count} PAX</td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${booking.email_sent_status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-rose-50 text-rose-700 border border-rose-250'}`}>
                                {booking.email_sent_status === 'Sent' ? 'Sent' : 'Failed'}
                              </span>
                              {booking.email_sent_timestamp && (
                                <div className="text-[9px] text-slate-400 mt-1 font-mono">{new Date(booking.email_sent_timestamp).toLocaleString('en-IN')}</div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={booking.reservation_status}
                                onChange={(e) => handleUpdateBookingStatus(booking.booking_id, e.target.value)}
                                className="px-2 py-0.5 rounded-full font-bold text-[10px] border focus:outline-none dark:bg-slate-950 cursor-pointer"
                              >
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()
      )}

      {/* Package Creation Add/Edit Modal */}
      <AnimatePresence>
        {showPkgModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setShowPkgModal(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border dark:border-slate-800 z-50"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <h2 className="text-base font-extrabold">
                  {editingPkg ? `Edit Event Package: ${editingPkg.name}` : 'Create Event Package'}
                </h2>
                <button onClick={() => setShowPkgModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmitPkg} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Function Type *</label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
                    >
                      <option value="birthday">Birthday Celebration</option>
                      <option value="anniversary">Anniversary Celebration</option>
                      <option value="corporate">Corporate Party</option>
                      <option value="family">Family Celebration</option>
                      <option value="other">Other Functions & Events</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Package Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
                      placeholder="e.g. Royal Vegetarian Banquet"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Price / Cost (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-bold text-emerald-650"
                      placeholder="650"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Price Billing Type *</label>
                    <select
                      value={formData.price_type}
                      onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
                    >
                      <option value="per_person">Per Person / Per Plate</option>
                      <option value="fixed">Fixed Package Fee</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Min Guests Limit</label>
                    <input
                      type="number"
                      value={formData.min_capacity}
                      onChange={(e) => setFormData({ ...formData, min_capacity: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Max Guests Limit</label>
                    <input
                      type="number"
                      value={formData.max_capacity}
                      onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
                      placeholder="4 Hours"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Menu Inclusions (Comma Separated)</label>
                  <textarea
                    rows="2.5"
                    value={formData.inclusionsStr}
                    onChange={(e) => setFormData({ ...formData, inclusionsStr: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
                    placeholder="Welcome Drink, Paneer Tikka Starter, Veg Biryani, Gulab Jamun"
                  ></textarea>
                </div>



                <div>
                  <label className="block font-bold text-slate-500 mb-1">Package Cover Image</label>
                  <div className="flex items-center gap-4 border dark:border-slate-800 dark:bg-slate-950 p-3 rounded-xl">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageChange}
                      className="hidden"
                      id="pkgImageUpload"
                    />
                    <label
                      htmlFor="pkgImageUpload"
                      className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition"
                    >
                      Choose File
                    </label>
                    {imagePreview ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={imagePreview.startsWith('http') || imagePreview.startsWith('blob:') ? imagePreview : getImageUrl(imagePreview)}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded-lg border dark:border-slate-800"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-rose-600 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">No image selected (uses placeholder)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="pkgActive"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded dark:bg-slate-950 dark:border-slate-800"
                  />
                  <label htmlFor="pkgActive" className="font-bold text-slate-700 dark:text-slate-350">Active & available on website bookings</label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPkgModal(false)}
                    className="px-4 py-2 border dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                  >
                    Save Package
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
