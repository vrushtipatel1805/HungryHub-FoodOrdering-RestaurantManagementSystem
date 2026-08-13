import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Printer, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function TableBookings() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPrintBooking, setSelectedPrintBooking] = useState(null);
  const [resendingId, setResendingId] = useState(null);

  const handleResendEmail = async (bookingId) => {
    try {
      setResendingId(bookingId);
      const res = await api.post(`/reservations/${bookingId}/resend-email/`);
      if (res.data?.ok) {
        toast.success(res.data.message || 'Confirmation email resent successfully!');
        if (res.data.email_sent_status) {
          setReservations(prev => prev.map(r => r.booking_id === bookingId ? {
            ...r,
            email_sent_status: res.data.email_sent_status,
            email_sent_timestamp: res.data.email_sent_timestamp
          } : r));
        }
      } else {
        toast.error(res.data?.error || 'Failed to resend confirmation email.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error resending confirmation email.');
    } finally {
      setResendingId(null);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reservations/');
      // Filter out event packages (bookings where package is not null go to Events)
      // Only keep normal table reservations
      const normalBookings = (res.data || []).filter(r => r.package === null || r.package_details === null);
      setReservations(normalBookings);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load table reservations.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.patch(`/reservations/${bookingId}/`, {
        reservation_status: newStatus
      });
      setReservations(prev => prev.map(r => r.booking_id === bookingId ? { ...r, reservation_status: newStatus } : r));
      toast.success(`Reservation #${bookingId} is now "${newStatus}"`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update reservation status.');
    }
  };



  const handlePrint = () => {
    window.print();
  };

  const filteredReservations = reservations.filter(r => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = r.booking_id.toLowerCase().includes(query) ||
                          r.customer_name.toLowerCase().includes(query) ||
                          (r.email && r.email.toLowerCase().includes(query)) ||
                          (r.phone && r.phone.includes(query)) ||
                          (r.reservation_date && r.reservation_date.includes(query)) ||
                          (r.table_number && r.table_number.toString().includes(query));
    const matchesStatus = statusFilter === 'All' || r.reservation_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Completed':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Table Reservations</h1>
          <p className="text-slate-500 dark:text-slate-400">Approve, reject, cancel and manage counter dining reservations, arrival times and tables allocation.</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Booking ID, customer name, phone, or table number..."
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
            <option value="All">All Booking Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Reservation Data Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold animate-pulse flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4 animate-spin text-emerald-500" /> Loading dine-in table bookings...
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 font-bold">No table bookings match your filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer Name & Contact</th>
                  <th className="py-3 px-4">Table / Capacity</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Advance Paid</th>
                  <th className="py-3 px-4">Email Status</th>
                  <th className="py-3 px-4">Booking Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReservations.map(resItem => (
                  <tr key={resItem.booking_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{resItem.booking_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-850 dark:text-slate-100">{resItem.customer_name}</div>
                      <div className="text-[10px] text-slate-400">{resItem.phone} • {resItem.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-600 dark:text-emerald-450">Table #{resItem.table_number || 'TBD'}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{resItem.table_type || 'Standard Dinner'} ({resItem.guests_count} Guests)</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold">{resItem.reservation_date}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {resItem.reservation_time}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-950 dark:text-white">
                      ₹{parseFloat(resItem.amount_paid || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${resItem.email_sent_status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-rose-50 text-rose-700 border border-rose-250'}`}>
                        {resItem.email_sent_status === 'Sent' ? 'Sent' : 'Failed'}
                      </span>
                      {resItem.email_sent_timestamp && (
                        <div className="text-[9px] text-slate-400 mt-1 font-mono">{new Date(resItem.email_sent_timestamp).toLocaleString('en-IN')}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={resItem.reservation_status}
                        onChange={(e) => handleUpdateStatus(resItem.booking_id, e.target.value)}
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border cursor-pointer focus:outline-none ${getStatusBadge(resItem.reservation_status)}`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleResendEmail(resItem.booking_id)}
                        disabled={resendingId === resItem.booking_id}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-950/20 hover:opacity-90 text-blue-600 rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {resendingId === resItem.booking_id ? 'Sending...' : 'Resend Email'}
                      </button>
                      {resItem.reservation_status === 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(resItem.booking_id, 'Completed')}
                          className="px-2 py-1 bg-teal-650 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold transition shadow-xs"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedPrintBooking(resItem)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition inline-flex"
                        title="Print slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Slip Modal */}
      <AnimatePresence>
        {selectedPrintBooking && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setSelectedPrintBooking(null)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border dark:border-slate-800 z-50 flex flex-col"
            >
              {/* Receipt Area */}
              <div id="invoice-print-area" className="p-4 space-y-4 text-xs bg-white text-slate-800 rounded-xl">
                <div className="text-center border-b pb-3 border-slate-100">
                  <span className="text-xl">🌿</span>
                  <h3 className="font-extrabold text-sm text-slate-900">HUNGRYHUB DINING</h3>
                  <p className="text-[10px] text-slate-400">Commerce Six Roads, Navrangpura, Ahmedabad</p>
                  <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mt-1.5">RESERVATION SLIP</p>
                </div>

                <div className="space-y-2 text-[11px]">
                  <p className="flex justify-between"><span className="text-slate-400">Booking ID:</span> <strong className="font-mono">{selectedPrintBooking.booking_id}</strong></p>
                  <p className="flex justify-between"><span className="text-slate-400">Guest Name:</span> <strong>{selectedPrintBooking.customer_name}</strong></p>
                  <p className="flex justify-between"><span className="text-slate-400">Contact:</span> <span>{selectedPrintBooking.phone}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="truncate max-w-[150px]">{selectedPrintBooking.email}</span></p>
                  
                  <div className="border-t border-b border-dashed py-2 my-2 border-slate-200">
                    <p className="flex justify-between"><span className="text-slate-400">Table Number:</span> <strong className="text-emerald-700">Table #{selectedPrintBooking.table_number || 'TBD'}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Seating Capacity:</span> <span>{selectedPrintBooking.table_type || 'Standard'} ({selectedPrintBooking.guests_count} Guests)</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Date:</span> <strong>{selectedPrintBooking.reservation_date}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Time Window:</span> <strong>{selectedPrintBooking.reservation_time}</strong></p>
                  </div>
                  
                  <p className="flex justify-between"><span className="text-slate-400">Advance Paid:</span> <strong className="text-slate-900">₹{parseFloat(selectedPrintBooking.amount_paid || 0).toFixed(2)}</strong></p>
                  <p className="flex justify-between"><span className="text-slate-400">Payment Mode:</span> <span>{selectedPrintBooking.payment_method}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Status:</span> <strong className="text-emerald-600">{selectedPrintBooking.reservation_status}</strong></p>
                </div>

                <div className="text-center pt-3 border-t border-slate-100 text-[10px] text-slate-400 italic">
                  Pure Vegetarian Dining Experience
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  onClick={() => setSelectedPrintBooking(null)}
                  className="px-4 py-2 border dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition text-xs"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Slip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
