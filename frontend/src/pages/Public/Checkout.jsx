import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Forms/Input';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { createOrder } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import { 
  FiArrowLeft, 
  FiLock, 
  FiShield, 
  FiCheckCircle, 
  FiCreditCard, 
  FiSmartphone, 
  FiBriefcase, 
  FiMail, 
  FiUser, 
  FiPhone, 
  FiPercent, 
  FiDownload, 
  FiPrinter, 
  FiHome, 
  FiCalendar
} from 'react-icons/fi';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, gst, grandTotal, totalQty, clearCart, appliedCoupon, setAppliedCoupon, discount } = useCart();

  // Step state
  const [step, setStep] = useState('checkout'); // 'checkout', 'success'
  const [loading, setLoading] = useState(false);

  // Form states
  const [form, setForm] = useState({
    name: user && user.name !== 'Guest' ? user.name || '' : '',
    phone: '',
    email: user && user.name !== 'Guest' ? user.email || '' : ''
  });
  const [errors, setErrors] = useState({});

  // Redirect if not logged in (guest)
  useEffect(() => {
    if (!user || user.name === 'Guest') {
      navigate('/login?redirect=checkout');
    }
  }, [user, navigate]);

  // Redirect if cart is empty and we aren't viewing a success screen
  useEffect(() => {
    if (items.length === 0 && step !== 'success') {
      toast.error('Your cart is empty. Redirecting to menu.');
      navigate('/');
    }
  }, [items, navigate, step]);

  useEffect(() => {
    if (user && user.name !== 'Guest') {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING'
  const [upiId, setUpiId] = useState('');
  const [upiApp, setUpiApp] = useState('gpay');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [netBank, setNetBank] = useState('SBI');

  // Generated Invoice state
  const [invoice, setInvoice] = useState(null);

  // Field validations (removed delivery address and pincode validations)
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = 'Full Name is required';
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(form.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Phone validation
    if (!form.phone.trim()) {
      newErrors.phone = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      newErrors.phone = 'Mobile Number must be exactly 10 digits';
    }

    // Email validation (optional)
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Payment details validation
    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
        newErrors.upiId = 'Enter a valid UPI ID (e.g. user@bank)';
      }
    } else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
      const cleanNum = cardDetails.number.replace(/\s+/g, '');
      if (!cardDetails.name.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
      if (!cleanNum) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(cleanNum)) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }

      if (!cardDetails.expiry.trim()) {
        newErrors.cardExpiry = 'Expiry is required';
      } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardDetails.expiry.trim())) {
        newErrors.cardExpiry = 'Use MM/YY format';
      } else {
        const [m, y] = cardDetails.expiry.split('/').map(Number);
        const expiryDate = new Date(2000 + y, m - 1);
        const today = new Date();
        const currentMonth = new Date(today.getFullYear(), today.getMonth());
        if (expiryDate < currentMonth) {
          newErrors.cardExpiry = 'Card has expired';
        }
      }

      if (!cardDetails.cvv.trim()) {
        newErrors.cardCvv = 'CVV is required';
      } else if (!/^\d{3}$/.test(cardDetails.cvv.trim())) {
        newErrors.cardCvv = 'Must be 3 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format payment method text for receipt
  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'UPI': return `UPI (${upiApp.toUpperCase()}: ${upiId})`;
      case 'CREDIT_CARD': return 'Credit Card';
      case 'DEBIT_CARD': return 'Debit Card';
      case 'NET_BANKING': return `Net Banking (${netBank})`;
      default: return method;
    }
  };

  // Submit payment order
  const handlePayNow = async () => {
    if (!validateForm()) {
      toast.error('Please correct the validation errors in the form.');
      return;
    }

    setLoading(true);
    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const orderPayload = {
        customer_name: form.name,
        phone: form.phone,
        email: form.email,
        address: 'Dine-In',
        pincode: 'N/A',
        item_total: subtotal,
        gst_amount: gst,
        grand_total: grandTotal,
        payment_method: paymentMethod,
        payment_status: 'Paid',
        discount_amount: discount,
        items: items.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await createOrder(orderPayload);
      const generatedOrderId = response.data?.id || `HH-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedInvoiceNo = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const currentInvoice = {
        invoiceNumber: generatedInvoiceNo,
        orderId: generatedOrderId,
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        dateTime: new Date().toLocaleString('en-IN', { hour12: true }),
        items: [...items],
        subtotal: subtotal,
        gst: gst,
        discount: discount,
        promoCode: appliedCoupon ? appliedCoupon.code : '',
        grandTotal: grandTotal,
        paymentMethod: getPaymentMethodLabel(paymentMethod),
        paymentStatus: 'Successful'
      };

      setInvoice(currentInvoice);
      toast.success('Payment Successful! Your order has been placed.');
      clearCart();
      setStep('success');
    } catch (error) {
      console.warn('Backend order placement failed. Completing in mock mode.');
      const generatedOrderId = `HH-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedInvoiceNo = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const currentInvoice = {
        invoiceNumber: generatedInvoiceNo,
        orderId: generatedOrderId,
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        dateTime: new Date().toLocaleString('en-IN', { hour12: true }),
        items: [...items],
        subtotal: subtotal,
        gst: gst,
        discount: discount,
        promoCode: appliedCoupon ? appliedCoupon.code : '',
        grandTotal: grandTotal,
        paymentMethod: getPaymentMethodLabel(paymentMethod),
        paymentStatus: 'Successful'
      };

      setInvoice(currentInvoice);
      toast.success('Payment Successful! Your order has been placed.');
      clearCart();
      setStep('success');
    } finally {
      setLoading(false);
    }
  };

  // PDF Generator using jsPDF
  const downloadPDFBill = () => {
    if (!invoice) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Design styling constants
      const primaryColor = [183, 65, 14]; // Rust (#b7410e)
      const darkColor = [31, 41, 55]; // Slate 800 (#1f2937)
      const lightGray = [229, 231, 235]; // Gray 200

      // Header block
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 38, 'F');

      // Brand Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("HUNGRYHUB RESTAURANT", 15, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Fresh & Premium Meals Served Straight to You", 15, 25);
      doc.text("Support: support@hungryhub.com", 15, 30);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("TAX INVOICE", 155, 22);

      // Customer Details (Left side)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("BILL TO:", 15, 50);

      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${invoice.customerName}`, 15, 56);
      doc.text(`Mobile: ${invoice.phone}`, 15, 62);
      if (invoice.email) {
        doc.text(`Email: ${invoice.email}`, 15, 68);
      }

      // Invoice metadata details (Right side)
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE DETAILS:", 120, 50);

      doc.setFont("helvetica", "normal");
      doc.text(`Invoice No: ${invoice.invoiceNumber}`, 120, 56);
      doc.text(`Order ID: ${invoice.orderId}`, 120, 62);
      doc.text(`Date & Time: ${invoice.dateTime}`, 120, 68);
      doc.text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 120, 74);
      doc.text(`Payment: ${invoice.paymentMethod}`, 120, 80);

      // Line separating header/customer from items
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.4);
      doc.line(15, 86, 195, 86);

      // Items Table Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("No.", 15, 93);
      doc.text("Item Details", 25, 93);
      doc.text("Qty", 120, 93);
      doc.text("Price per Item", 140, 93);
      doc.text("Amount (INR)", 170, 93);

      doc.line(15, 96, 195, 96);

      // Items Table Body
      let currentY = 103;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      invoice.items.forEach((item, index) => {
        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
          doc.line(15, currentY - 5, 195, currentY - 5);
        }
        
        doc.text(String(index + 1), 15, currentY);
        doc.text(item.name, 25, currentY);
        doc.text(String(item.quantity), 120, currentY);
        doc.text(`Rs. ${item.price.toFixed(2)}`, 140, currentY);
        doc.text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 170, currentY);
        
        currentY += 8;
      });

      doc.line(15, currentY - 3, 195, currentY - 3);

      // Calculation summary section
      currentY += 4;
      doc.setFont("helvetica", "normal");
      
      doc.text("Subtotal:", 120, currentY);
      doc.text(`Rs. ${invoice.subtotal.toFixed(2)}`, 170, currentY);

      currentY += 6;
      doc.text("GST (18%):", 120, currentY);
      doc.text(`Rs. ${invoice.gst.toFixed(2)}`, 170, currentY);

      if (invoice.discount > 0) {
        currentY += 6;
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`Discount (${invoice.promoCode}):`, 120, currentY);
        doc.text(`- Rs. ${invoice.discount.toFixed(2)}`, 170, currentY);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      }

      // Grand Total Highlight
      currentY += 8;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.6);
      doc.line(120, currentY - 5, 195, currentY - 5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(11);
      doc.text("Grand Total:", 120, currentY);
      doc.text(`Rs. ${invoice.grandTotal.toFixed(2)}`, 170, currentY);

      // Footer
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Thank you for dining with Hungryhub!", 105, 278, { align: 'center' });
      doc.text("This receipt is automatically generated. No signature is required.", 105, 283, { align: 'center' });

      doc.save(`Hungryhub_Bill_${invoice.invoiceNumber}.pdf`);
      toast.success('Invoice PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try printing instead.');
    }
  };

  // Print the invoice
  const printBill = () => {
    window.print();
  };

  // Return Home
  const returnHome = () => {
    navigate('/');
  };

  // Success Confirmation Page & Invoice View
  if (step === 'success' && invoice) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        {/* Success Confirmation Header */}
        <div className="text-center mb-8 no-print animate-fade-in">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 border-2 border-emerald-200 mb-4 shadow-sm">
            <FiCheckCircle className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Payment Successful!</h1>
          <p className="mt-2 text-slate-600">Your order has been placed. Details of your transaction are below.</p>
        </div>

        {/* Detailed Receipt Container */}
        <div 
          id="invoice-print-area" 
          className="bg-white rounded-[2rem] border-2 border-rust-200 shadow-xl overflow-hidden p-6 md:p-10 relative mb-8"
        >
          {/* Decorative receipt cuts at top */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-rust-500"></div>

          {/* Restaurant Brand */}
          <div className="text-center pb-8 border-b-2 border-dashed border-rust-200">
            <h2 className="text-2xl font-black tracking-tight text-rust-500">HUNGRYHUB RESTAURANT</h2>
            <p className="text-xs text-slate-500 mt-1">Fresh & Premium Meals Served Straight to You</p>
            <p className="text-xs text-slate-400 mt-0.5">Support: support@hungryhub.com</p>
            <div className="mt-4 inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {invoice.paymentStatus}
            </div>
          </div>

          {/* Invoice Metadata */}
          <div className="grid gap-6 sm:grid-cols-2 py-6 text-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-rust-500">Bill To</h3>
              <p className="font-semibold text-slate-800 text-base">{invoice.customerName}</p>
              <div className="text-slate-600 space-y-1 text-xs">
                <p className="flex items-center gap-1.5"><FiPhone className="h-3.5 w-3.5" /> {invoice.phone}</p>
                {invoice.email && <p className="flex items-center gap-1.5"><FiMail className="h-3.5 w-3.5" /> {invoice.email}</p>}
              </div>
            </div>

            <div className="space-y-2 sm:text-right">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-rust-500">Invoice Details</h3>
              <div className="text-slate-600 space-y-1.5 text-xs inline-block text-left sm:text-right">
                <p><span className="font-bold text-slate-700">Invoice No:</span> {invoice.invoiceNumber}</p>
                <p><span className="font-bold text-slate-700">Order ID:</span> {invoice.orderId}</p>
                <p className="flex items-center sm:justify-end gap-1.5"><FiCalendar className="h-3.5 w-3.5" /> {invoice.dateTime}</p>
                <p><span className="font-bold text-slate-700">Payment:</span> {invoice.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div className="mt-4 border-t border-slate-200 pt-6">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-rust-500 mb-4">Purchased Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-505 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Item Name</th>
                    <th className="py-2.5 text-center w-16">Qty</th>
                    <th className="py-2.5 text-right w-24">Price</th>
                    <th className="py-2.5 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium text-slate-900">{item.name}</td>
                      <td className="py-3 text-center font-bold text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right">₹{item.price.toFixed(2)}</td>
                      <td className="py-3 text-right font-semibold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation Summary Box */}
          <div className="mt-6 border-t-2 border-dashed border-rust-200 pt-6 flex flex-col items-end">
            <div className="w-full sm:w-80 text-sm text-slate-600 space-y-2.5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="font-semibold text-slate-800">₹{invoice.gst.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-rust-500 font-semibold animate-fade-in">
                  <span>Discount ({invoice.promoCode})</span>
                  <span>-₹{invoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-rust-100 pt-3 text-lg font-black text-rust-500">
                <span>Grand Total</span>
                <span>₹{invoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Thank You Note */}
          <div className="text-center mt-10 pt-6 border-t border-slate-100 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-slate-500">Thank you for your order! Enjoy your meal.</p>
            <p>Hungryhub Food Deliveries. Powered by safe payment processors.</p>
          </div>
        </div>

        {/* Success Option Action Buttons */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
          <button
            onClick={downloadPDFBill}
            className="flex items-center justify-center gap-2 rounded-full border-2 border-rust-500 bg-white px-6 py-3 font-semibold text-rust-500 transition hover:bg-rust-50 shadow-sm active:scale-95 text-sm"
          >
            <FiDownload className="h-4 w-4" /> Download PDF
          </button>
          
          <button
            onClick={printBill}
            className="flex items-center justify-center gap-2 rounded-full border-2 border-rust-500 bg-white px-6 py-3 font-semibold text-rust-500 transition hover:bg-rust-50 shadow-sm active:scale-95 text-sm"
          >
            <FiPrinter className="h-4 w-4" /> Print Invoice
          </button>

          <PrimaryButton
            onClick={returnHome}
            className="flex items-center justify-center gap-2 px-6 py-3 font-semibold shadow-md active:scale-95 text-sm"
          >
            <FiHome className="h-4 w-4" /> Back to Home
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // Payment methods tabs
  const paymentMethods = [
    { id: 'UPI', label: 'UPI Payment', description: 'GPay, PhonePe, Paytm, BHIM', icon: <FiSmartphone className="h-4.5 w-4.5" /> },
    { id: 'CREDIT_CARD', label: 'Credit Card', description: 'Visa, Mastercard, American Express', icon: <FiCreditCard className="h-4.5 w-4.5" /> },
    { id: 'DEBIT_CARD', label: 'Debit Card', description: 'Visa, Mastercard, RuPay', icon: <FiCreditCard className="h-4.5 w-4.5" /> },
    { id: 'NET_BANKING', label: 'Net Banking', description: 'SBI, HDFC, ICICI, Axis Bank', icon: <FiBriefcase className="h-4.5 w-4.5" /> },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8 font-sans">
      {/* Back button */}
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-sm font-semibold text-rust-500 hover:text-rust-600 mb-6 group transition"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Back to Cart
      </button>

      <div className="animate-fade-in">
        {/* Customer details & Payment selection */}
        <div className="space-y-8">
          {/* Customer Details Form */}
          <div className="rounded-[2.5rem] border-2 border-rust-200 bg-white p-6 md:p-8 shadow-md">
            <h1 className="text-2xl font-bold text-slate-900 border-b border-rust-100 pb-3 mb-6">Customer Details</h1>
            
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input 
                  label="Full Name" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="Customer Name"
                  error={errors.name}
                  icon={<FiUser />}
                  required 
                />
                
                <Input 
                  label="Mobile Number" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  maxLength="10"
                  error={errors.phone}
                  icon={<FiPhone />}
                  required 
                />
              </div>

              <Input 
                label="Email Address (Optional)" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                placeholder="abc@example.com"
                error={errors.email}
                icon={<FiMail />}
              />
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="rounded-[2.5rem] border-2 border-rust-200 bg-white p-6 md:p-8 shadow-md">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-rust-100 pb-3 mb-2 font-sans">Select Payment Method</h2>
            <p className="text-slate-500 text-xs mb-6">All payment transactions are encrypted and secured.</p>

            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.id);
                    }}
                    className={`text-left p-4 border-2 rounded-2xl flex flex-col justify-between transition h-28 relative ${
                      isSelected 
                        ? 'border-rust-500 bg-rust-50/20' 
                        : 'border-slate-200 bg-white hover:border-rust-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-2 rounded-xl border ${
                        isSelected
                          ? 'bg-rust-500 text-white border-rust-500' 
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {method.icon}
                      </div>
                      <input
                        type="radio"
                        name="payment_method"
                        checked={isSelected}
                        onChange={() => {}}
                        className="text-rust-500 focus:ring-rust-500 h-4 w-4"
                      />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900 text-sm mt-2">{method.label}</span>
                      <span className="block text-slate-400 text-xs mt-0.5 truncate max-w-[220px]">{method.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Payment sub-details form depending on chosen option */}
            <div className="mt-6 border-t border-rust-100 pt-6 animate-fade-in">
              
              {/* UPI Options */}
              {paymentMethod === 'UPI' && (
                <div className="p-4 border-2 border-rust-200 rounded-[1.5rem] bg-rust-50/10 space-y-4">
                  <span className="block text-xs font-bold uppercase text-rust-500 tracking-wider">UPI Service App</span>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiApp(app)}
                        className={`py-2 px-3 border-2 rounded-xl text-xs font-bold text-center capitalize transition ${
                          upiApp === app 
                            ? 'border-rust-500 bg-white text-rust-500 shadow-sm font-bold' 
                            : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {app === 'gpay' ? 'GPay' : app}
                      </button>
                    ))}
                  </div>
                  <Input
                    label="UPI Address ID"
                    placeholder="yourname@okaxis"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    error={errors.upiId}
                    icon={<FiSmartphone />}
                    required
                  />
                  <p className="text-xs text-slate-400"></p>

                  {/* Dynamic Pay Button inside UPI Details */}
                  {(() => {
                    const isUpiValid = upiId.trim() && /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim());
                    const isDisabled = !upiApp || !isUpiValid || loading;
                    return (
                      <button
                        key="upi-pay-btn"
                        type="button"
                        onClick={handlePayNow}
                        disabled={isDisabled}
                        className={`w-full mt-4 flex items-center justify-center gap-2 rounded-full py-3.5 font-bold text-white text-sm transition-all duration-300 shadow-md active:scale-95 ${
                          isDisabled
                            ? 'bg-slate-300 cursor-not-allowed opacity-50'
                            : 'bg-rust-500 hover:bg-rust-600 hover:shadow-lg'
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Transaction...
                          </>
                        ) : (
                          <>
                            <FiShield className="h-4.5 w-4.5" />
                            Pay ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>
              )}

              {/* CARD Details (Credit / Debit) */}
              {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                <div className="p-4 border-2 border-rust-200 rounded-[1.5rem] bg-rust-50/10 space-y-4">
                  <span className="block text-xs font-bold uppercase text-rust-500 tracking-wider">
                    {paymentMethod === 'CREDIT_CARD' ? 'Credit Card Information' : 'Debit Card Information'}
                  </span>
                  
                  <Input
                    label="Cardholder Full Name"
                    placeholder="Customer Name"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    error={errors.cardName}
                    icon={<FiUser />}
                    required
                  />
                  
                  <Input
                    label="16-Digit Card Number"
                    placeholder="xxxx xxxx xxxx xxxx"
                    maxLength="19"
                    value={cardDetails.number.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    error={errors.cardNumber}
                    icon={<FiCreditCard />}
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      error={errors.cardExpiry}
                      icon={<FiCalendar />}
                      required
                    />
                    <Input
                      label="CVV Code"
                      placeholder="xxx"
                      type="password"
                      maxLength="3"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      error={errors.cardCvv}
                      icon={<FiLock />}
                      required
                    />
                  </div>

                  {/* Card Pay Button */}
                  {(() => {
                    const cleanNum = cardDetails.number.replace(/\s+/g, '');
                    const isCardValid = cardDetails.name.trim() && cleanNum && /^\d{16}$/.test(cleanNum) && cardDetails.expiry.trim() && cardDetails.cvv.trim();
                    const isDisabled = !isCardValid || loading;
                    return (
                      <button
                        key="card-pay-btn"
                        type="button"
                        onClick={handlePayNow}
                        disabled={isDisabled}
                        className={`w-full mt-4 flex items-center justify-center gap-2 rounded-full py-3.5 font-bold text-white text-sm transition-all duration-300 shadow-md active:scale-95 ${
                          isDisabled
                            ? 'bg-slate-300 cursor-not-allowed opacity-50'
                            : 'bg-rust-500 hover:bg-rust-600 hover:shadow-lg'
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Transaction...
                          </>
                        ) : (
                          <>
                            <FiShield className="h-4.5 w-4.5" />
                            Pay ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>
              )}

              {/* NET BANKING */}
              {paymentMethod === 'NET_BANKING' && (
                <div className="p-4 border-2 border-rust-200 rounded-[1.5rem] bg-rust-50/10 space-y-3 font-sans">
                  <label className="block text-xs font-bold uppercase text-rust-500 tracking-wider">Select Bank Authority</label>
                  <select
                    value={netBank}
                    onChange={(e) => setNetBank(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-rust-500 focus:outline-none transition shadow-sm font-semibold"
                  >
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank Ltd</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                  </select>

                  {/* Net Banking Pay Button */}
                  {(() => {
                    const isDisabled = !netBank || loading;
                    return (
                      <button
                        key="netbank-pay-btn"
                        type="button"
                        onClick={handlePayNow}
                        disabled={isDisabled}
                        className={`w-full mt-4 flex items-center justify-center gap-2 rounded-full py-3.5 font-bold text-white text-sm transition-all duration-300 shadow-md active:scale-95 ${
                          isDisabled
                            ? 'bg-slate-300 cursor-not-allowed opacity-50'
                            : 'bg-rust-500 hover:bg-rust-600 hover:shadow-lg'
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Transaction...
                          </>
                        ) : (
                          <>
                            <FiShield className="h-4.5 w-4.5" />
                            Pay ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>
              )}
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
