import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Download,
  FileText,
  Calendar,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reportType, setReportType] = useState('revenue');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const reportsList = [
    { id: 'revenue', title: 'Revenue Report', desc: 'Detailed breakdown of online orders, counter dine-in billing, GST collected, and net margins.' },
    { id: 'orders', title: 'Order History Report', desc: 'Comprehensive list of served and preparing orders with customer details.' },
    { id: 'reservations', title: 'Table Reservation Report', desc: 'Summary of table bookings, guest counts, reservation dates, and advance payments.' },
    { id: 'menu_sales', title: 'Menu Sales & Item Performance', desc: 'Category-wise item sales, most popular dishes, and overall quantities sold.' },
    { id: 'coupons', title: 'Coupons Performance', desc: 'Promo code usage count, percentage vs flat values granted, and live conversion rates.' },
  ];

  const handleGenerateReport = async () => {
    const selectedReport = reportsList.find(r => r.id === reportType);
    setLoading(true);

    try {
      // Query the backend aggregated reports view
      const res = await api.get(`/admin/reports-data/?report_type=${reportType}&start_date=${startDate}&end_date=${endDate}`);
      const dataset = res.data || [];

      if (dataset.length === 0) {
        toast.error('No database records found for selected date filters.');
        setLoading(false);
        return;
      }

      if (exportFormat === 'csv') {
        // Compile CSV Rows
        let headers = [];
        let rows = [];

        if (reportType === 'revenue') {
          headers = ['Date', 'Gross Revenue (₹)', 'GST (18% Collected)', 'Net Revenue'];
          rows = dataset.map(d => [d.date, d.revenue, d.gst, d.net]);
        } else if (reportType === 'orders') {
          headers = ['Order ID', 'Customer', 'Phone', 'Amount (₹)', 'GST', 'Status', 'Date'];
          rows = dataset.map(d => [d.id, `"${d.customer}"`, d.phone, d.amount, d.gst, d.status, d.date]);
        } else if (reportType === 'reservations') {
          headers = ['Booking ID', 'Customer', 'Phone', 'Guests', 'Table', 'Date', 'Time', 'Status'];
          rows = dataset.map(d => [d.id, `"${d.customer}"`, d.phone, d.guests, d.table, d.date, d.time, d.status]);
        } else if (reportType === 'menu_sales') {
          headers = ['Dish Name', 'Category', 'Servings Sold', 'Total Sales Revenue (₹)'];
          rows = dataset.map(d => [`"${d.name}"`, `"${d.category}"`, d.quantity, d.revenue]);

        } else if (reportType === 'coupons') {
          headers = ['Promo Code', 'Coupon Title', 'Discount Percent', 'Flat Discount (₹)', 'Usage Count', 'Status'];
          rows = dataset.map(d => [d.code, `"${d.title}"`, d.discount_pct, d.flat_discount, d.usage_count, d.status]);
        }

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `HungryHub_${reportType}_report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${selectedReport.title} CSV spreadsheet downloaded!`);

      } else {
        // PDF Generation using jsPDF
        const doc = new jsPDF();

        doc.setFillColor(16, 185, 129); // Emerald Green Accent header line
        doc.rect(0, 0, 210, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(31, 41, 55);
        doc.text('HUNGRYHUB OPERATIONAL REPORT', 14, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Report Type: ${selectedReport.title}`, 14, 30);
        doc.text(`Timeline: ${startDate} to ${endDate}`, 14, 36);
        doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 42);
        doc.text(`Restaurant: 100% Pure Vegetarian Gourmet (Ahmedabad Hub)`, 14, 48);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(14, 54, 196, 54);

        let y = 64;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('REPORT DETAILS & METRICS SUMMARY', 14, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);

        // Render appropriate rows dynamically
        if (reportType === 'revenue') {
          doc.text('Date', 14, y); doc.text('Gross Revenue', 70, y); doc.text('18% GST', 120, y); doc.text('Net Revenue', 160, y);
          y += 3; doc.line(14, y, 196, y); y += 6;
          dataset.forEach(row => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(row.date, 14, y);
            doc.text(`INR ${parseFloat(row.revenue).toFixed(2)}`, 70, y);
            doc.text(`INR ${parseFloat(row.gst).toFixed(2)}`, 120, y);
            doc.text(`INR ${parseFloat(row.net).toFixed(2)}`, 160, y);
            y += 8;
          });
        } else if (reportType === 'orders') {
          doc.text('ID', 14, y); doc.text('Customer', 45, y); doc.text('Bill Total', 105, y); doc.text('Status', 140, y); doc.text('Date', 170, y);
          y += 3; doc.line(14, y, 196, y); y += 6;
          dataset.forEach(row => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(row.id, 14, y);
            doc.text(row.customer.slice(0, 20), 45, y);
            doc.text(`INR ${parseFloat(row.amount).toFixed(2)}`, 105, y);
            doc.text(row.status, 140, y);
            doc.text(row.date.split(' ')[0], 170, y);
            y += 8;
          });
        } else if (reportType === 'reservations') {
          doc.text('ID', 14, y); doc.text('Customer', 50, y); doc.text('Guests', 110, y); doc.text('Table', 130, y); doc.text('Status', 150, y);
          y += 3; doc.line(14, y, 196, y); y += 6;
          dataset.forEach(row => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(row.id, 14, y);
            doc.text(row.customer.slice(0, 20), 50, y);
            doc.text(`${row.guests} PAX`, 110, y);
            doc.text(`Table ${row.table || 'N/A'}`, 130, y);
            doc.text(row.status, 150, y);
            y += 8;
          });
        } else if (reportType === 'menu_sales') {
          doc.text('Dish Name', 14, y); doc.text('Category', 80, y); doc.text('Servings', 140, y); doc.text('Revenue', 170, y);
          y += 3; doc.line(14, y, 196, y); y += 6;
          dataset.forEach(row => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(row.name.slice(0, 25), 14, y);
            doc.text(row.category.slice(0, 20), 80, y);
            doc.text(`${row.quantity}`, 140, y);
            doc.text(`INR ${parseFloat(row.revenue).toFixed(2)}`, 170, y);
            y += 8;
          });

        } else if (reportType === 'coupons') {
          doc.text('Code', 14, y); doc.text('Discount Title', 45, y); doc.text('Flat Rate', 115, y); doc.text('Usages', 150, y); doc.text('Status', 175, y);
          y += 3; doc.line(14, y, 196, y); y += 6;
          dataset.forEach(row => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(row.code, 14, y);
            doc.text(row.title.slice(0, 22), 45, y);
            doc.text(`INR ${parseFloat(row.flat_discount).toFixed(2)}`, 115, y);
            doc.text(`${row.usage_count}`, 150, y);
            doc.text(row.status, 175, y);
            y += 8;
          });
        }

        y += 10;
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('Confidential - HungryHub Admin Operational Database Report.', 105, y, { align: 'center' });

        doc.save(`HungryHub_${reportType}_report_${startDate}_to_${endDate}.pdf`);
        toast.success(`${selectedReport.title} generated & downloaded as PDF!`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to query database logs for this report timeframe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Reports & Export Engine</h1>
        <p className="text-slate-500 dark:text-slate-400">Compile PostgreSQL database statistics over custom dates ranges. Downloads compliant CSV, PDF documents.</p>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 space-y-6">
        <h2 className="text-base font-bold border-b dark:border-slate-800 pb-3 flex items-center gap-2">
          <Filter className="text-emerald-500 w-5 h-5" /> Report Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div>
            <label className="block font-bold text-slate-500 mb-1.5">Select Report Type *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200"
            >
              {reportsList.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-500 mb-1.5">Start Date *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-500 mb-1.5">End Date *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Export Format Selector */}
        <div className="space-y-2">
          <label className="block font-bold text-slate-500 text-xs">Choose Export Format *</label>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {[
              { format: 'pdf', label: 'PDF Document', icon: FileText, desc: "Compliant PDF report", color: "text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200" },
              { format: 'csv', label: 'CSV Spreadsheet', icon: FileSpreadsheet, desc: "Excel compatible CSV", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.format}
                  type="button"
                  onClick={() => setExportFormat(item.format)}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${exportFormat === item.format
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-805 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-450 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" /> Includes 18% GST collected breakdown and discount details.
          </p>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition text-xs"
          >
            <Download className="w-4 h-4" /> {loading ? 'Compiling Report...' : 'Generate & Download Report'}
          </button>
        </div>
      </div>

      {/* Reports Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportsList.map(r => (
          <div
            key={r.id}
            onClick={() => setReportType(r.id)}
            className={`bg-white dark:bg-slate-950 p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${reportType === r.id ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-slate-100 dark:border-slate-800 shadow-xs hover:border-slate-350 dark:hover:border-slate-700'
              }`}
          >
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">{r.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{r.desc}</p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-450 pt-2 border-t border-slate-100 dark:border-slate-850">
              <span>{reportType === r.id ? '✓ Selected Report' : 'Click to select'}</span>
              <FileText className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
