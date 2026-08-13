import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Printer, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_WORKFLOW = [
  'Pending',
  'Accepted',
  'Preparing',
  'Ready',
  'Served'
];

const PAYMENT_STATUSES = [
  'Pending',
  'Paid',
  'Failed',
  'Refunded'
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order #${orderId} status set to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status.');
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPayStatus) => {
    try {
      await api.patch(`/orders/${orderId}/`, { payment_status: newPayStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newPayStatus } : o));
      toast.success(`Order #${orderId} payment is now "${newPayStatus}"`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update payment status.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order permanently?')) return;
    try {
      await api.delete(`/orders/${orderId}/`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success('Order deleted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete order.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Accepted':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Preparing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ready':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Served':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-250';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-250';
      case 'Refunded':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-250';
    }
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Order Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Live order workflow (Pending → Accepted → Preparing → Ready → Served)</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-350"
          >
            <option value="All">All Order Statuses</option>
            {STATUS_WORKFLOW.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Order Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold animate-pulse flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-emerald-500" /> Loading active food orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 font-bold">No orders found matching the filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer & Contact</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Bill</th>
                  <th className="py-3 px-4">Payment Info</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      #{order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{order.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{order.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400" title={order.address.replace(' / Counter Pickup', '')}>
                      {order.address.replace(' / Counter Pickup', '')}
                    </td>
                    <td className="py-3.5 px-4 truncate max-w-xs font-medium">
                      {order.items && order.items.length > 0
                        ? order.items.map(i => `${i.menu_item?.name || 'Dish'} (x${i.quantity})`).join(', ')
                        : 'Pure Veg Delicacies'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      ₹{parseFloat(order.grand_total || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-medium uppercase text-[10px] text-slate-500">{order.payment_method}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.payment_status || 'Pending'}
                        onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border focus:outline-none cursor-pointer ${getPaymentStatusBadge(order.payment_status)}`}
                      >
                        {PAYMENT_STATUSES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border focus:outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                      >
                        {STATUS_WORKFLOW.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition inline-flex items-center gap-1"
                        title="Print Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition inline-flex"
                        title="Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice PDF Pop-Up Modal */}
      <AnimatePresence>
        {selectedInvoiceOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setSelectedInvoiceOrder(null)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border dark:border-slate-800 z-50 flex flex-col"
            >
              {/* Print Sheet Header */}
              <div id="invoice-print-area" className="p-4 space-y-4 text-xs bg-white text-slate-800 rounded-xl">
                <div className="flex justify-between border-b pb-4 border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌿</span>
                      <span className="text-base font-black tracking-tight text-slate-950">HUNGRYHUB RESTAURANT</span>
                    </div>
                    <p className="text-[10px] text-slate-400">100% Pure Vegetarian Gourmet Base</p>
                    <p className="text-[9px] text-slate-400">Satellite, Ahmedabad, Gujarat - 380015</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider">OFFICIAL RECEIPT</span>
                    <h3 className="font-bold text-slate-900 mt-1">Invoice #{selectedInvoiceOrder.id}</h3>
                    <p className="text-[10px] text-slate-400">Date: {new Date(selectedInvoiceOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-3 border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[9px]">Bill To</span>
                    <span className="font-bold text-slate-900">{selectedInvoiceOrder.customer_name}</span>
                    <p>{selectedInvoiceOrder.phone}</p>
                    <p className="text-slate-500">{selectedInvoiceOrder.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[9px]">Logistics / Mode</span>
                    <p><span className="font-semibold text-slate-900">Address:</span> {selectedInvoiceOrder.address.replace(' / Counter Pickup', '')}</p>
                  </div>
                </div>

                {/* Items list */}
                <table className="w-full text-left text-xs border-b border-slate-150 pb-2">
                  <thead>
                    <tr className="text-slate-400 uppercase font-bold text-[9px] border-b border-slate-100 pb-1">
                      <th className="py-1">Dish Details</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Rate</th>
                      <th className="py-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoiceOrder.items?.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 py-1">
                        <td className="py-1.5 font-bold text-slate-900">{item.menu_item?.name || 'Veg Dish'}</td>
                        <td className="py-1.5 text-center">{item.quantity}</td>
                        <td className="py-1.5 text-right">₹{parseFloat(item.price).toFixed(2)}</td>
                        <td className="py-1.5 text-right font-semibold">₹{(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Calculation breakdown */}
                <div className="w-64 ml-auto space-y-1.5 text-right font-medium text-[11px] pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Item Total:</span>
                    <span>₹{parseFloat(selectedInvoiceOrder.item_total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GST (18%):</span>
                    <span>₹{parseFloat(selectedInvoiceOrder.gst_amount || 0).toFixed(2)}</span>
                  </div>
                  {parseFloat(selectedInvoiceOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-rose-500 font-bold">
                      <span>Promo Discount:</span>
                      <span>-₹{parseFloat(selectedInvoiceOrder.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1.5 font-black text-slate-900 text-sm">
                    <span>Grand Total:</span>
                    <span className="text-emerald-700">₹{parseFloat(selectedInvoiceOrder.grand_total || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-slate-100 text-[10px] text-slate-400 italic">
                  Thank you for dining with HungryHub! Pure ingredients, pure joy.
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="px-4 py-2 border dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition text-xs"
                >
                  Close Receipt
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
