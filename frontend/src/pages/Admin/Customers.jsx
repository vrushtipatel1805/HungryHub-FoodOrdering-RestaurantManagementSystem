import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  User, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  Trash2, 
  Edit3,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [editFormData, setEditFormData] = useState({
    pk: '',
    name: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/customers/');
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customer database.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!customers.length) return;
    const headers = ['Customer ID', 'Name', 'Email', 'Phone', 'Total Orders', 'Total Spend (INR)', 'Last Order Date', 'Reservations', 'Status'];
    const rows = customers.map(c => [
      c.id,
      `"${c.name}"`,
      c.email,
      c.phone,
      c.totalOrders,
      c.totalSpend,
      c.lastOrderDate,
      c.reservationCount,
      c.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hungryhub_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Customer CSV database exported successfully!');
  };

  const handleToggleStatus = async (customer) => {
    const updatedStatus = !customer.is_active;
    try {
      await api.put(`/auth/customers/${customer.pk}/`, { is_active: updatedStatus });
      setCustomers(prev => prev.map(c => c.pk === customer.pk ? { ...c, is_active: updatedStatus } : c));
      toast.success(`Customer "${customer.name}" set to ${updatedStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle customer active status.');
    }
  };

  const handleDeleteCustomer = async (pk) => {
    if (!window.confirm('Are you sure you want to delete this customer account permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/auth/customers/${pk}/`);
      setCustomers(prev => prev.filter(c => c.pk !== pk));
      setSelectedCustomer(null);
      toast.success('Customer profile deleted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete customer profile.');
    }
  };

  const handleOpenEditModal = (c) => {
    setEditingCustomer(c);
    setEditFormData({
      pk: c.pk,
      name: c.name,
      email: c.email,
      is_active: c.is_active
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send PUT update request to backend CustomerDetailView
      await api.put(`/auth/customers/${editFormData.pk}/`, {
        full_name: editFormData.name,
        email: editFormData.email,
        is_active: editFormData.is_active
      });
      toast.success('Customer details updated successfully.');
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update customer details.');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Customer Database</h1>
          <p className="text-slate-500 dark:text-slate-400">View registered customers, toggle active status, review order summaries, reservations frequency and manage accounts.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-750 text-white px-4 py-2.5 rounded-xl font-bold transition text-xs shadow-md"
        >
          <Download className="w-4 h-4" /> Export Customers (CSV)
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by customer name, email, or customer ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>
      </div>

      {/* Customer Data Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold animate-pulse flex items-center justify-center gap-2">
          <User className="w-4 h-4 animate-spin text-emerald-500" /> Loading customer records...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 font-bold">No registered customers match your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Name & Email</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Total Spend</th>
                  <th className="py-3.5 px-4">Last Order</th>
                  <th className="py-3.5 px-4">Reservations</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-550">{customer.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-850 dark:text-slate-200">{customer.name}</div>
                      <div className="text-[10px] text-slate-400">{customer.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">{customer.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400">
                        {customer.totalOrders} orders
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">₹{customer.totalSpend.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-slate-400">{customer.lastOrderDate}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-350">{customer.reservationCount} bookings</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(customer)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          customer.is_active
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}
                      >
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-250 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold transition text-[11px]"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(customer)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg inline-flex"
                        title="Edit profile details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.pk)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg inline-flex"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Profile Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setSelectedCustomer(null)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border dark:border-slate-800 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450 flex items-center justify-center font-bold text-xl shadow-xs">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">{selectedCustomer.name}</h2>
                    <p className="text-[10px] text-slate-400 font-mono">Customer ID: {selectedCustomer.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 font-bold text-[9px] uppercase"><Mail className="w-3.5 h-3.5" /> Email Address</span>
                  <p className="text-slate-800 dark:text-slate-200 truncate">{selectedCustomer.email}</p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                  <span className="text-slate-400 flex items-center gap-1 font-bold text-[9px] uppercase"><Phone className="w-3.5 h-3.5" /> Contact Number</span>
                  <p className="text-slate-800 dark:text-slate-200">{selectedCustomer.phone}</p>
                </div>
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl space-y-1">
                  <span className="text-emerald-650 flex items-center gap-1 font-bold text-[9px] uppercase"><ShoppingBag className="w-3.5 h-3.5" /> Total Orders</span>
                  <p className="font-extrabold text-emerald-800 dark:text-emerald-400 text-lg">{selectedCustomer.totalOrders} Orders</p>
                </div>
                <div className="p-3.5 bg-teal-50 dark:bg-teal-950/20 rounded-xl space-y-1">
                  <span className="text-teal-650 flex items-center gap-1 font-bold text-[9px] uppercase"><DollarSign className="w-3.5 h-3.5" /> Total Spendings</span>
                  <p className="font-extrabold text-teal-800 dark:text-teal-400 text-lg">₹{selectedCustomer.totalSpend.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-slate-550 dark:text-slate-400">
                  <span>Joined Date:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.joinedDate || '2026-01-15'}</span>
                </div>
                <div className="flex justify-between text-slate-550 dark:text-slate-400">
                  <span>Last Order Placed:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.lastOrderDate}</span>
                </div>
                <div className="flex justify-between text-slate-550 dark:text-slate-400">
                  <span>Table Reservations:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.reservationCount} Table Bookings</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t dark:border-slate-800">
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer.pk)}
                  className="px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-xs font-bold transition"
                >
                  Delete Account
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-5 py-2 bg-slate-850 dark:bg-slate-800 hover:opacity-90 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {editingCustomer && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setEditingCustomer(null)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border dark:border-slate-800 z-50"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <h3 className="text-base font-extrabold">Edit Customer Profile</h3>
                <button onClick={() => setEditingCustomer(null)} className="text-slate-455 font-bold">✕</button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editActive"
                    checked={editFormData.is_active}
                    onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded dark:bg-slate-950 dark:border-slate-800"
                  />
                  <label htmlFor="editActive" className="font-bold text-slate-700 dark:text-slate-350">Account Active (Allows Login)</label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-4 py-2 border dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                  >
                    Save Changes
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
