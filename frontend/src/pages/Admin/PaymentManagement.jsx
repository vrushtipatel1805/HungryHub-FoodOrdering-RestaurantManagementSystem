import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  XCircle, 
  AlertCircle,
  Eye, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payments/');
      setPayments(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync transactional payments ledger.');
    } finally {
      setLoading(false);
    }
  };


  const downloadReceiptPDF = (payment) => {
    try {
      const doc = new jsPDF();
      
      // Top accent bar
      doc.setFillColor(183, 65, 14); // Rust color #B7410E
      doc.rect(0, 0, 210, 8, 'F');

      // Title & Branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(31, 41, 55);
      doc.text('HUNGRYHUB GOURMET', 14, 25);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('100% Pure Vegetarian Fine Dining', 14, 30);
      doc.text('Satellite Road, Ahmedabad, Gujarat - 380015', 14, 34);

      // Receipt Badge
      doc.setFillColor(250, 232, 227); // rust-100 bg
      doc.rect(140, 20, 56, 12, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(183, 65, 14); // Rust
      doc.text('PAYMENT RECEIPT', 146, 28);

      // Info Block
      doc.setDrawColor(229, 231, 235);
      doc.line(14, 42, 196, 42);

      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'normal');
      
      doc.text('Transaction ID:', 14, 50);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(payment.id, 45, 50);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text('Payment Date:', 14, 56);
      doc.setTextColor(31, 41, 55);
      doc.text(new Date(payment.payment_date).toLocaleString(), 45, 56);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text('Customer:', 14, 62);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(`${payment.customer_name || 'Guest User'} (${payment.customer_email || 'N/A'})`, 45, 62);

      doc.line(14, 68, 196, 68);

      // Reference details
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      if (payment.order) {
        doc.text('Order reference:', 14, 76);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text(`#${payment.order}`, 45, 76);
      } else if (payment.booking) {
        doc.text('Booking reference:', 14, 76);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text(`#${payment.booking}`, 45, 76);
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text('Payment Method:', 14, 82);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(payment.payment_method.toUpperCase(), 45, 82);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text('Transaction Status:', 14, 88);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(payment.status === 'Success' ? 16 : 225, payment.status === 'Success' ? 185 : 88, payment.status === 'Success' ? 129 : 80);
      doc.text(payment.status.toUpperCase(), 45, 88);

      // Financial breakdown table
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 98, 182, 38, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(14, 98, 182, 38, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Net Transaction Amount:', 20, 107);
      doc.text('GST Tax (18% Included):', 20, 114);
      doc.text('Discount applied:', 20, 121);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(`INR ${parseFloat(payment.amount - payment.gst).toFixed(2)}`, 140, 107);
      doc.text(`INR ${parseFloat(payment.gst).toFixed(2)}`, 140, 114);
      doc.text(`INR ${parseFloat(payment.discount).toFixed(2)}`, 140, 121);

      doc.line(20, 126, 190, 126);
      doc.setFontSize(11);
      doc.text('Total Settled Amount:', 20, 131);
      doc.setTextColor(183, 65, 14); // Rust color
      doc.text(`INR ${parseFloat(payment.amount).toFixed(2)}`, 140, 131);

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text('This is an auto-generated transaction receipt from HungryHub Secure Server.', 14, 155);
      doc.text('Contact support@hungryhub.com for billing conflicts.', 14, 160);

      doc.save(`HungryHub_Receipt_${payment.id}.pdf`);
      toast.success(`Receipt for transaction ${payment.id} exported to PDF.`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF receipt.');
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.customer_name && p.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.customer_email && p.customer_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.order && p.order.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.booking && p.booking.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = (statusFilter === 'All' || p.status === statusFilter) && p.status !== 'Refunded';
    const matchesMethod = methodFilter === 'All' || p.payment_method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod && p.status !== 'Refunded';
  });

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Payment</h1>
          <p className="text-slate-500 dark:text-slate-400">View real-time credit card, UPI, debit card, and net banking payment logs and print customer receipts.</p>
        </div>
        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 px-4 py-2 bg-rust-50 dark:bg-rust-950/30 text-rust-600 rounded-xl font-bold transition hover:opacity-95 text-xs shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Ledger
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Payment ID, customer name, email, Order ID, Booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-rust-500 text-xs transition"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350"
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350"
          >
            <option value="All">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="CASH/COUNTER">CASH/COUNTER</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold animate-pulse flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-rust-600" /> Connecting to payment gateway log...
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 font-bold">No payments found matching the selected filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Payment ID</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Ref Target</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">GST Included</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-rust-600 dark:text-rust-400">#{payment.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-850 dark:text-slate-200">{payment.customer_name || 'Guest User'}</div>
                      <div className="text-[10px] text-slate-400">{payment.customer_email || 'walkin@hungryhub.com'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {payment.order ? (
                        <span className="font-semibold text-slate-650 dark:text-slate-400">Order: #{payment.order}</span>
                      ) : payment.booking ? (
                        <span className="font-semibold text-slate-650 dark:text-slate-400">Hall/Hall Booking: #{payment.booking}</span>
                      ) : (
                        <span className="text-slate-400">Manual / POS</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">₹{parseFloat(payment.amount).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-500">₹{parseFloat(payment.gst).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-rose-500 font-bold">₹{parseFloat(payment.discount).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-medium uppercase text-[10px] text-slate-500">{payment.payment_method}</td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        payment.status === 'Success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        payment.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition inline-flex"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => downloadReceiptPDF(payment)}
                        className="p-1.5 bg-rust-50 hover:bg-rust-100 text-rust-600 rounded-lg transition inline-flex"
                        title="Download Receipt PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setSelectedPayment(null)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border dark:border-slate-800 z-50 text-xs"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-850">
                <h3 className="text-base font-extrabold">Transaction Detail Sheet</h3>
                <button onClick={() => setSelectedPayment(null)} className="text-slate-400 font-bold">✕</button>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Payment ID:</span>
                  <span className="font-mono font-bold text-rust-600 dark:text-rust-400">#{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Customer:</span>
                  <span className="font-semibold">{selectedPayment.customer_name || 'Guest User'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Email Contact:</span>
                  <span>{selectedPayment.customer_email || 'walkin@hungryhub.com'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Reference Link:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedPayment.order ? `Order Ref: #${selectedPayment.order}` : selectedPayment.booking ? `Hall Booking Ref: #${selectedPayment.booking}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-850 pt-2.5">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Gross Settled Amount:</span>
                  <span className="font-bold">₹{parseFloat(selectedPayment.amount - selectedPayment.gst).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Tax (18% GST Included):</span>
                  <span className="font-bold text-slate-500">₹{parseFloat(selectedPayment.gst).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Discount Code Adjustment:</span>
                  <span className="font-bold text-rose-500">-₹{parseFloat(selectedPayment.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-850 pt-2.5 font-bold text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Grand Settled Total:</span>
                  <span className="text-rust-600 dark:text-rust-400 text-base">₹{parseFloat(selectedPayment.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2.5">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Method Used:</span>
                  <span className="bg-slate-100 dark:bg-slate-800 font-bold px-2 py-0.5 rounded uppercase">{selectedPayment.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Date of Transaction:</span>
                  <span>{new Date(selectedPayment.payment_date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Settlement Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                    selectedPayment.status === 'Success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    selectedPayment.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    {selectedPayment.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 border dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-955 transition"
                >
                  Close Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
