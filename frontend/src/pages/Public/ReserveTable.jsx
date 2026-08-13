import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Forms/Input';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { jsPDF } from 'jspdf';
import api from '../../services/api';
import { 
  FiCalendar, 
  FiClock, 
  FiUsers, 
  FiCheckCircle, 
  FiDownload, 
  FiArrowLeft, 
  FiCreditCard, 
  FiSmartphone, 
  FiMail, 
  FiBookOpen, 
  FiX,
  FiUser,
  FiPhone,
  FiShield,
  FiHome,
  FiFileText,
  FiLock,
  FiGrid,
  FiTag,
  FiBriefcase,
  FiCheck,
  FiGift,
  FiHeart,
  FiInfo,
  FiCheckSquare
} from 'react-icons/fi';

const seatingOptionsData = {
  '2 Seater': {
    title: '2 Seater',
    type: '2 Seater',
    capacity: 2,
    charge: 100,
    desc: 'Perfect for intimate dates and quiet dining.',
    tables: ['Table 01', 'Table 02', 'Table 03', 'Table 04', 'Table 05', 'Table 06', 'Table 07', 'Table 08']
  },
  '4 Seater': {
    title: '4 Seater',
    type: '4 Seater',
    capacity: 4,
    charge: 200,
    desc: 'Ideal for family lunches and get-togethers.',
    tables: ['Table 09', 'Table 10', 'Table 11', 'Table 12', 'Table 13', 'Table 14', 'Table 15']
  },
  '6 Seater': {
    title: '6 Seater',
    type: '6 Seater',
    capacity: 6,
    charge: 300,
    desc: 'Spacious seating for groups and celebrations.',
    tables: ['Table 16', 'Table 17', 'Table 18', 'Table 19', 'Table 20']
  }
};

const mapPackage = (pkg) => {
  let eventTypeLabel = 'Other Celebration';
  if (pkg.event_type === 'birthday') eventTypeLabel = 'Birthday Party';
  else if (pkg.event_type === 'anniversary') eventTypeLabel = 'Anniversary Celebration';
  else if (pkg.event_type === 'corporate') eventTypeLabel = 'Corporate Event';
  else if (pkg.event_type === 'family') eventTypeLabel = 'Family Gathering';

  let image = pkg.image || '/other.jpeg';
  if (!pkg.image) {
    if (pkg.event_type === 'birthday') image = '/birthday.jpeg';
    else if (pkg.event_type === 'anniversary') image = '/aniversary.jpeg';
    else if (pkg.event_type === 'corporate') image = '/party.jpeg';
    else if (pkg.event_type === 'family') image = '/family.jpg';
  } else {
    if (!image.startsWith('http') && !image.startsWith('blob:')) {
      const backendBase = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:8000';
      image = `${backendBase}${image}`;
    }
  }

  let timeSlots = ['12:00 PM - 04:00 PM (Lunch)', '07:00 PM - 11:00 PM (Dinner)'];
  let highlights = ['Standard banquet seating', 'Dedicated hospitality staff'];
  let terms = ['Advance booking required.', 'Outside food is not permitted.'];

  if (pkg.event_type === 'birthday') {
    timeSlots = ['12:00 PM - 04:00 PM (Lunch)', '04:30 PM - 08:30 PM (Evening)', '07:00 PM - 11:00 PM (Dinner)'];
    highlights = [
      'Customized theme balloon & backdrop decor',
      'Dedicated party coordinator & sound system',
      'Complimentary 1.5kg designer celebration cake',
      'Welcome mocktail bar for all arriving guests'
    ];
    terms = [
      'Advance booking required at least 24 hours prior.',
      'Guest count changes must be informed 12 hours before event time.',
      'Outside food and beverages are strictly not permitted.',
      '18% GST applies on total billing.'
    ];
  } else if (pkg.event_type === 'anniversary') {
    timeSlots = ['01:00 PM - 04:30 PM (Lunch)', '07:00 PM - 10:30 PM (Dinner Candlelight)'];
    highlights = [
      'Private candlelit table setup with rose petal pathway',
      'Personalized music background playlist',
      'Sparkling wine toast or signature mocktails',
      'Mini fresh fruit/chocolate celebration cake'
    ];
    terms = [
      'Table hold time is 20 minutes from reservation time.',
      'Special dietary requirements must be informed during booking.',
      'Cancellation is free up to 6 hours before slot start time.'
    ];
  } else if (pkg.event_type === 'corporate') {
    timeSlots = ['10:00 AM - 03:00 PM (Morning Seminar + Lunch)', '05:00 PM - 10:00 PM (Evening Meet + Dinner)'];
    highlights = [
      'Executive seating layout with podium & microphone',
      'Full HD projector screen & wireless presenter',
      'Complimentary high-speed Wi-Fi access',
      'Dedicated lounge & refreshment coffee station'
    ];
    terms = [
      'Minimum guaranteed pax required: 15 guests.',
      'AV equipment check available 30 mins prior to event.',
      'Official GST invoice provided for corporate billing.'
    ];
  } else if (pkg.event_type === 'family') {
    timeSlots = ['12:30 PM - 05:00 PM (Afternoon Banquet)', '06:30 PM - 11:00 PM (Night Gala)'];
    highlights = [
      'Festive traditional seating arrangements with name cards',
      'Dedicated kids fun activity corner & games',
      'Generous authentic Indian & Continental feast',
      'Complimentary welcome family photography session'
    ];
    terms = [
      'Children below 5 years enter free of charge.',
      'Decor modifications subject to hall availability.'
    ];
  }

  return {
    id: pkg.id,
    name: pkg.name,
    eventType: eventTypeLabel,
    image,
    desc: pkg.description || '',
    shortDesc: pkg.description || '',
    price: parseFloat(pkg.price),
    priceType: pkg.price_type,
    maxCapacity: pkg.max_capacity,
    duration: pkg.duration || '4 Hours',
    timeSlots,
    highlights,
    included: pkg.inclusions || [],
    terms
  };
};

export default function ReserveTable() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.name === 'Guest') {
      toast.error("Please log in to continue. You need to be logged in to reserve a table, book an event, or add items to your cart.");
      navigate('/login?redirect=' + encodeURIComponent(location.pathname + location.search));
    }
  }, [user, navigate, location]);

  useEffect(() => {
    if (user && user.name !== 'Guest') {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  // Mode: 'table' or 'package'
  const [activeMode, setActiveMode] = useState('landing'); 
  // Workflows: 'landing', 'package-details', 'package-form', 'payment', 'confirmation', 'table-booking'
  const [step, setStep] = useState('landing');
  
  // Table Seating States
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedSeater, setSelectedSeater] = useState(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState(null);

  // Package Booking States
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Form State
  const [form, setForm] = useState({
    name: user && user.name !== 'Guest' ? user.name || '' : '',
    phone: '',
    email: user && user.name !== 'Guest' ? user.email || '' : '',
    guests: '10',
    date: '',
    time: '',
    eventType: 'Birthday Party',
    specialRequest: ''
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'UPI', 'CARD', 'NET_BANKING', 'WALLET'
  const [upiId, setUpiId] = useState('');
  const [upiApp, setUpiApp] = useState('gpay');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [netBank, setNetBank] = useState('SBI');
  const [digitalWallet, setDigitalWallet] = useState('PAYTM');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Confirmation & Reserved Items
  const [recentBooking, setRecentBooking] = useState(null);

  // Dynamic Packages & Table Bookings
  const [eventPackages, setEventPackages] = useState([]);
  const [reservedTableIds, setReservedTableIds] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get('/packages/');
        const mapped = (res.data || []).filter(p => p.is_active).map(mapPackage);
        setEventPackages(mapped);
      } catch (err) {
        console.warn("Failed to load catering packages.", err);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchReservedTables = async () => {
      if (!form.date) return;
      try {
        const res = await api.get('/tables/status/', { params: { date: form.date } });
        setReservedTableIds(res.data || []);
      } catch (err) {
        console.warn("Failed to load reserved tables.", err);
      }
    };
    fetchReservedTables();
  }, [form.date]);

  // Saved Package Reservations in localStorage
  const [packageReservations, setPackageReservations] = useState(() => {
    const saved = localStorage.getItem('hh_package_reservations');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved Table Reservations in localStorage
  const [tableReservations, setTableReservations] = useState(() => {
    const saved = localStorage.getItem('hh_table_reservations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hh_package_reservations', JSON.stringify(packageReservations));
  }, [packageReservations]);

  useEffect(() => {
    localStorage.setItem('hh_table_reservations', JSON.stringify(tableReservations));
  }, [tableReservations]);

  // Tables availability stats
  const totalTablesCount = 20;
  const userBookedTableIds = tableReservations.map(r => r.tableNumber).filter(t => t);
  const allReservedTableIds = [...new Set([...reservedTableIds, ...userBookedTableIds])];
  const reservedTablesCount = allReservedTableIds.length;
  const availableTablesCount = Math.max(0, totalTablesCount - reservedTablesCount);

  // Open Seating Options Modal
  const handleOpenSeatingModal = () => {
    setShowTableModal(true);
  };

  const handleSelectSeater = (seaterKey) => {
    setSelectedSeater(seaterKey);
    setSelectedTableNumber(null);
    setForm(prev => ({
      ...prev,
      guests: seatingOptionsData[seaterKey].capacity.toString()
    }));
    setShowTableModal(false);
    setActiveMode('table');
    setStep('table-booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Package Details Modal
  const handleExplorePackage = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedTimeSlot(pkg.timeSlots[0]);
    setForm(prev => ({
      ...prev,
      eventType: pkg.eventType,
      guests: pkg.priceType === 'fixed' ? '2' : '15'
    }));
    setActiveMode('package');
    setStep('package-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Booking Form for Package
  const handleStartPackageBooking = () => {
    setErrors({});
    setStep('package-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Pricing Details Calculation
  const getPricingDetails = () => {
    if (activeMode === 'package' && selectedPackage) {
      const priceRate = selectedPackage.price;
      const guestsCount = parseInt(form.guests, 10) || 1;
      const packageCharge = selectedPackage.priceType === 'per_person' ? priceRate * guestsCount : priceRate;
      
      let cakeCharge = 0;
      let decorCharge = 0;
      if (selectedPackage.id === 'birthday-party') {
        cakeCharge = 1200;
        decorCharge = 2500;
      }
      
      const subtotal = packageCharge + cakeCharge + decorCharge;
      const gst = subtotal * 0.18;
      const totalAmount = subtotal + gst;
      return { charge: subtotal, gst, totalAmount, packageCharge, cakeCharge, decorCharge };
    } else if (selectedSeater) {
      const charge = seatingOptionsData[selectedSeater].charge;
      const gst = charge * 0.18;
      const totalAmount = charge + gst;
      return { charge, gst, totalAmount, packageCharge: charge, cakeCharge: 0, decorCharge: 0 };
    }
    return { charge: 0, gst: 0, totalAmount: 0, packageCharge: 0, cakeCharge: 0, decorCharge: 0 };
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Full Name is required';
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(form.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      newErrors.phone = 'Mobile Number must be exactly 10 digits';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    const guestsCount = parseInt(form.guests, 10);
    if (!form.guests) {
      newErrors.guests = 'Number of Guests is required';
    } else if (isNaN(guestsCount) || guestsCount < 1) {
      newErrors.guests = 'Number of Guests must be at least 1';
    }

    if (!form.date) {
      newErrors.date = 'Event Date is required';
    }

    if (activeMode === 'table' && !selectedTableNumber) {
      toast.error('Please select an available table number');
      return false;
    }

    if (activeMode === 'package' && !selectedTimeSlot) {
      toast.error('Please select a preferred time slot');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Proceed to Payment
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please complete all required fields correctly.');
    }
  };

  // Payment Details Validation
  const validatePayment = () => {
    const newErrors = {};

    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) {
        newErrors.upiId = 'UPI Address ID is required';
      } else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
        newErrors.upiId = 'Enter a valid UPI ID (e.g. user@upi)';
      }
    } else if (paymentMethod === 'CARD') {
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
      }

      if (!cardDetails.cvv.trim()) {
        newErrors.cardCvv = 'CVV is required';
      } else if (!/^\d{3}$/.test(cardDetails.cvv.trim())) {
        newErrors.cardCvv = 'Must be 3 digits';
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'UPI': return `UPI (${upiApp.toUpperCase()}: ${upiId})`;
      case 'CARD': return 'Credit/Debit Card';
      case 'NET_BANKING': return `Net Banking (${netBank})`;
      case 'WALLET': return `Digital Wallet (${digitalWallet})`;
      default: return method;
    }
  };

  // Confirm Booking & Submit
  const handleConfirmPayment = async () => {
    if (!validatePayment()) {
      toast.error('Payment authorization failed. Please check details.');
      return;
    }
    setLoading(true);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const bookingId = `BK${dateStr}${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `TXN${dateStr}${Math.floor(100000 + Math.random() * 900000)}`;
    const { charge, gst, totalAmount, packageCharge, cakeCharge, decorCharge } = getPricingDetails();

    const isPackageBooking = activeMode === 'package' && selectedPackage;
    
    const invoice_data = isPackageBooking && selectedPackage.id === 'birthday-party' ? {
      title: "Birthday Party Booking Invoice",
      package_charge_rate: 799,
      guests_count: parseInt(form.guests, 10),
      package_food_charge: packageCharge,
      cake_charge: cakeCharge,
      decoration_charge: decorCharge,
      subtotal: charge,
      gst: gst,
      grand_total: totalAmount
    } : null;

    const newBooking = {
      bookingId,
      transactionId,
      customerName: form.name,
      mobileNumber: form.phone,
      emailAddress: form.email,
      bookingType: isPackageBooking ? 'package' : 'table',
      packageName: isPackageBooking ? selectedPackage.name : selectedSeater,
      tableType: isPackageBooking ? 'Event Hall' : selectedSeater,
      tableNumber: isPackageBooking ? 'Event Banquet Area' : selectedTableNumber,
      guestsCount: form.guests,
      eventDate: form.date,
      timeSlot: isPackageBooking ? selectedTimeSlot : form.time,
      amountPaid: totalAmount,
      paymentMethod: getPaymentMethodLabel(paymentMethod),
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      specialRequest: form.specialRequest || '',
      invoice_data
    };

    const backendPayload = {
      booking_id: bookingId,
      transaction_id: transactionId,
      customer_name: form.name,
      phone: form.phone,
      email: form.email,
      table_type: isPackageBooking ? 'Event Hall' : selectedSeater,
      table_number: isPackageBooking ? 'Event Banquet Area' : selectedTableNumber,
      guests_count: parseInt(form.guests, 10),
      reservation_date: form.date,
      reservation_time: isPackageBooking ? "19:00:00" : (form.time.length === 5 ? `${form.time}:00` : form.time),
      amount_paid: totalAmount,
      payment_method: getPaymentMethodLabel(paymentMethod),
      payment_status: 'Paid',
      reservation_status: 'Confirmed',
      package_id: isPackageBooking ? selectedPackage.id : null,
      special_request: form.specialRequest || '',
      invoice_data
    };

    try {
      await api.post('/reservations/', backendPayload);
    } catch (err) {
      console.warn("Backend reservation logging notice.", err);
    }

    if (isPackageBooking) {
      setPackageReservations(prev => [newBooking, ...prev]);
    } else {
      setTableReservations(prev => [newBooking, ...prev]);
    }

    setRecentBooking(newBooking);
    toast.success('Booking Confirmed & Payment Verified!');
    setStep('confirmation');
    setLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // PDF Receipt Generator using jsPDF
  const handleDownloadReceipt = () => {
    if (!recentBooking) return;
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const primaryColor = [183, 65, 14];
      const darkColor = [31, 41, 55];
      const lightGray = [229, 231, 235];

      // Draw Top Branding Header Band
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 42, 'F');

      // Brand Logo Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.text("HungryHub", 15, 18);

      // Slogan & Contact
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Fresh & Premium Vegetarian Dining Experiences Curated for You", 15, 26);
      doc.text("Email: bookings@hungryhub.com | Contact: +91 98765 43210 | Ahmedabad, India", 15, 32);

      // Title on Top Right
      const isBirthday = recentBooking.packageName === 'Birthday Party Package';
      const invoiceTitle = isBirthday ? "Birthday Party Booking Invoice" : "Official Table Booking Invoice";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(invoiceTitle.toUpperCase(), 200, 18, { align: 'right' });

      // Customer Details (Left Column)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("CUSTOMER DETAILS:", 15, 52);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(`Full Name: ${recentBooking.customerName}`, 15, 58);
      doc.text(`Mobile Number: ${recentBooking.mobileNumber}`, 15, 64);
      if (recentBooking.emailAddress) {
        doc.text(`Email Address: ${recentBooking.emailAddress}`, 15, 70);
      }
      if (recentBooking.specialRequest) {
        doc.text(`Special Request: ${recentBooking.specialRequest}`, 15, 76);
      }

      // Booking Details (Right Column)
      doc.setFont("helvetica", "bold");
      doc.text("BOOKING DETAILS:", 120, 52);

      doc.setFont("helvetica", "normal");
      doc.text(`Booking ID: ${recentBooking.bookingId}`, 120, 58);
      doc.text(`Transaction ID: ${recentBooking.transactionId}`, 120, 64);
      doc.text(`Package Type: ${recentBooking.packageName}`, 120, 70);
      doc.text(`Date & Time Slot: ${recentBooking.eventDate} (${recentBooking.timeSlot})`, 120, 76);
      doc.text(`Guests Count: ${recentBooking.guestsCount} Guests`, 120, 82);
      doc.text(`Payment Status: PAID (${recentBooking.paymentMethod})`, 120, 88);

      // Separate Line
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.4);
      doc.line(15, 94, 195, 94);

      // Description Table Headers
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("Description", 15, 100);
      doc.text("Qty", 120, 100, { align: 'center' });
      doc.text("Rate", 150, 100, { align: 'right' });
      doc.text("Amount", 195, 100, { align: 'right' });

      // Table Header Underline
      doc.line(15, 103, 195, 103);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      const totalAmount = recentBooking.amountPaid;
      let packageCharge = 0, cakeCharge = 0, decorCharge = 0;
      let subtotalVal = 0, gst = 0;

      let currentY = 110;

      if (isBirthday) {
        const guestsCount = parseInt(recentBooking.guestsCount, 10) || 1;
        packageCharge = 799 * guestsCount;
        cakeCharge = 1200;
        decorCharge = 2500;
        subtotalVal = packageCharge + cakeCharge + decorCharge;
        gst = subtotalVal * 0.18;

        // Row 1: Package
        doc.text("Birthday Party Package (Food Included)", 15, currentY);
        doc.text(String(guestsCount), 120, currentY, { align: 'center' });
        doc.text("₹799.00", 150, currentY, { align: 'right' });
        doc.text(`₹${packageCharge.toFixed(2)}`, 195, currentY, { align: 'right' });

        // Row 1 Sub-label
        currentY += 4.5;
        doc.setFont("helvetica", "oblique");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Food Included in Package", 15, currentY);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

        // Row 2: Cake
        currentY += 7.5;
        doc.text("Birthday Cake", 15, currentY);
        doc.text("1", 120, currentY, { align: 'center' });
        doc.text("₹1200.00", 150, currentY, { align: 'right' });
        doc.text(`₹${cakeCharge.toFixed(2)}`, 195, currentY, { align: 'right' });

        // Row 3: Decoration
        currentY += 7.5;
        doc.text("Decoration Charges", 15, currentY);
        doc.text("1", 120, currentY, { align: 'center' });
        doc.text("₹2500.00", 150, currentY, { align: 'right' });
        doc.text(`₹${decorCharge.toFixed(2)}`, 195, currentY, { align: 'right' });
        
        currentY += 5;
      } else {
        // Non-birthday package or standard table seating
        subtotalVal = Math.round(totalAmount / 1.18 * 100) / 100;
        gst = totalAmount - subtotalVal;

        const rateStr = `₹${subtotalVal.toFixed(2)}`;
        doc.text(`Table Reservation Booking / Event Package: ${recentBooking.packageName}`, 15, currentY);
        doc.text("1", 120, currentY, { align: 'center' });
        doc.text(rateStr, 150, currentY, { align: 'right' });
        doc.text(`₹${subtotalVal.toFixed(2)}`, 195, currentY, { align: 'right' });
        
        currentY += 5;
      }

      // Border line below items
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.line(15, currentY, 195, currentY);

      // Calculations Section
      currentY += 7;
      doc.setFont("helvetica", "normal");
      doc.text("Subtotal:", 135, currentY);
      doc.text(`₹${subtotalVal.toFixed(2)}`, 195, currentY, { align: 'right' });

      currentY += 6;
      doc.text("GST (18%):", 135, currentY);
      doc.text(`₹${gst.toFixed(2)}`, 195, currentY, { align: 'right' });

      // Solid line above grand total
      currentY += 5;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.6);
      doc.line(130, currentY, 195, currentY);

      // Grand Total
      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(11);
      doc.text("Grand Total:", 130, currentY);
      doc.text(`₹${totalAmount.toFixed(2)}`, 195, currentY, { align: 'right' });

      // Footnote
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.text("This invoice is automatically generated. No signature is required.", 105, 275, { align: 'center' });
      doc.text("Thank you for choosing HungryHub!", 105, 280, { align: 'center' });

      doc.save(`HungryHub_Invoice_${recentBooking.bookingId}.pdf`);
      toast.success('Invoice PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF receipt.');
    }
  };

  const scrollToReservedPackages = () => {
    if (reservedPackagesRef.current) {
      reservedPackagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8 font-sans">
      
      {/* PAGE HEADER */}
      <div className="text-center mb-10 no-print">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
          Reserve Your Table
        </h1>
        <p className="text-sm font-normal text-slate-500 max-w-xl mx-auto leading-relaxed">
          Reserve your preferred table in advance and enjoy a comfortable dining experience with your family and friends.
        </p>
      </div>

      {/* STEP 1: LANDING VIEW WITH HERO CARD & EVENT CELEBRATION SECTION */}
      {step === 'landing' && (
        <div className="space-y-16">
          
          {/* Main Full-Width Restaurant Card */}
          <div className="overflow-hidden rounded-[2.5rem] border-2 border-rust-100 bg-white shadow-xl hover:shadow-2xl transition duration-500 flex flex-col md:flex-row items-stretch">
            <div className="md:w-1/2 relative min-h-[320px] bg-slate-100">
              <img 
                src="/reserve.jpeg" 
                alt="HungryHub Fine Dining" 
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
            </div>
            <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between">
              <div>
                <span className="text-xs text-rust-500 font-bold uppercase tracking-widest block mb-2 font-mono">FINE DINING SEATING</span>
                <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4">HungryHub Restaurant</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-light">
                  Experience culinary excellence in an ambient atmosphere. From cozy 2-seater romantic tables to spacious family dining setups, choose the perfect spot for your next meal.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleOpenSeatingModal}
                  className="flex-1 rounded-full bg-rust-500 hover:bg-rust-600 px-6 py-3.5 text-sm font-bold text-white text-center shadow-lg hover:shadow-rust-500/20 active:scale-95 transition"
                >
                  Reserve Table
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/menu')}
                  className="flex-1 rounded-full border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 hover:text-slate-900 text-center transition"
                >
                  View Menu
                </button>
              </div>
            </div>
          </div>

          {/* EVENT CELEBRATION & FUNCTIONS SECTION */}
          <div id="event-packages" className="border-t border-slate-150 pt-12">
            <div className="text-center mb-12">
              <span className="text-xs text-rust-500 font-bold uppercase tracking-widest block mb-2 font-mono">Host Your Events</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Event Celebration & Functions</h2>
              <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-light">
                Explore our specially curated packages for birthdays, anniversaries, corporate meetings, and family reunions.
              </p>
            </div>

            {/* 4 Event Package Cards Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {eventPackages.map((pkg) => (
                <div 
                  key={pkg.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-[2.5rem] border-2 border-rust-100 bg-white shadow-md hover:shadow-xl transition duration-300"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img 
                        src={pkg.image} 
                        alt={pkg.name} 
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                      <span className="absolute bottom-3 left-4 rounded-full bg-rust-500 px-3 py-1 text-2xs font-black text-white uppercase tracking-wider">
                        ₹{pkg.price} {pkg.priceType === 'per_person' ? '/ person' : ' fixed'}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-extrabold text-slate-900 mb-2 leading-snug">{pkg.name}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3 font-light">
                        {pkg.shortDesc}
                      </p>

                      <div className="border-t border-rust-100/60 pt-3 mb-2 space-y-1.5 text-[11px] text-slate-600">
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-rust-500 h-3.5 w-3.5 shrink-0" />
                          <span>Max Guests: <strong>{pkg.maxCapacity} Guests</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="text-rust-500 h-3.5 w-3.5 shrink-0" />
                          <span>Duration: <strong>{pkg.duration}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={() => handleExplorePackage(pkg)}
                      className="w-full rounded-full border-2 border-rust-500 hover:bg-rust-500 hover:text-white text-rust-600 font-bold text-xs py-3 transition shadow-sm active:scale-95 text-center"
                    >
                      Explore Packages
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
      )}

      {/* STEP 2-PACKAGE: PACKAGE DETAILS PAGE / MODAL */}
      {step === 'package-details' && selectedPackage && (
        <div className="space-y-8 animate-fade-in no-print max-w-4xl mx-auto font-sans">
          
          {/* Back button */}
          <button 
            type="button"
            onClick={() => setStep('landing')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-rust-500 transition"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Event Packages
          </button>

          {/* Package Details Card */}
          <div className="rounded-[2.5rem] border-2 border-rust-200 bg-white overflow-hidden shadow-xl">
            <div className="relative h-64 md:h-80 bg-slate-100">
              <img 
                src={selectedPackage.image} 
                alt={selectedPackage.name} 
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-rust-300 block mb-1">Curated Package</span>
                  <h2 className="text-3xl md:text-4xl font-black">{selectedPackage.name}</h2>
                </div>
                <div className="rounded-2xl bg-rust-500/90 backdrop-blur-md px-5 py-2.5 text-right w-fit">
                  <span className="text-2xs uppercase tracking-wider block opacity-80 font-bold">Package Price</span>
                  <span className="text-2xl font-black font-mono">₹{selectedPackage.price}</span>
                  <span className="text-2xs block">{selectedPackage.priceType === 'per_person' ? '/ person' : ' fixed'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 space-y-8">
              
              {/* Short description */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Package Overview</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-light">{selectedPackage.shortDesc}</p>
              </div>

              {/* Package Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-rust-50/40 p-5 rounded-2xl border border-rust-100 text-sm">
                <div>
                  <span className="text-2xs text-rust-500 uppercase font-bold tracking-wider block">Max Capacity</span>
                  <span className="font-extrabold text-slate-800">{selectedPackage.maxCapacity} Guests</span>
                </div>
                <div>
                  <span className="text-2xs text-rust-500 uppercase font-bold tracking-wider block">Event Duration</span>
                  <span className="font-extrabold text-slate-800">{selectedPackage.duration}</span>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <span className="text-2xs text-rust-500 uppercase font-bold tracking-wider block">Rate Structure</span>
                  <span className="font-extrabold text-slate-800 capitalize">{selectedPackage.priceType.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Available Time Slots */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Available Time Slots</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPackage.timeSlots.map((slot, i) => (
                    <span key={i} className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-200">
                      <FiClock className="inline h-3.5 w-3.5 text-rust-500 mr-1.5" />
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              {/* Package Highlights */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Package Highlights</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedPackage.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-rust-100 shadow-2xs">
                      <FiCheckCircle className="text-emerald-500 h-4 w-4 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">What's Included</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedPackage.included.map((inc, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 bg-rust-50/20 p-3 rounded-xl border border-rust-100">
                      <FiGift className="text-rust-500 h-4 w-4 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="border-t border-slate-150 pt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Terms & Conditions</h3>
                <ul className="list-disc list-inside space-y-1 text-2xs text-slate-400 font-light">
                  {selectedPackage.terms.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              {/* Book This Package Button */}
              <PrimaryButton 
                onClick={handleStartPackageBooking}
                className="w-full py-4 text-sm font-bold shadow-lg"
              >
                Book This Package
              </PrimaryButton>

            </div>
          </div>

        </div>
      )}

      {/* STEP 3-PACKAGE: PACKAGE BOOKING FORM */}
      {step === 'package-form' && selectedPackage && (
        <div className="space-y-8 animate-fade-in no-print max-w-3xl mx-auto font-sans">
          
          {/* Back button */}
          <button 
            type="button"
            onClick={() => setStep('package-details')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-rust-500 transition"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Package Details
          </button>

          {/* Selected Package Summary Header */}
          <div className="rounded-[2rem] border-2 border-rust-200 bg-gradient-to-r from-rust-500 to-rust-600 p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-rust-100 block mb-1">Selected Package</span>
              <h2 className="text-2xl font-black">{selectedPackage.name}</h2>
              <p className="text-xs text-rust-100 mt-1">Duration: {selectedPackage.duration} | Max Capacity: {selectedPackage.maxCapacity} Guests</p>
            </div>
            <div className="text-right border-t md:border-t-0 border-white/20 pt-2 md:pt-0">
              <span className="text-2xs uppercase tracking-wider block opacity-80">Rate</span>
              <span className="text-xl font-black font-mono">₹{selectedPackage.price}</span>
              <span className="text-2xs block">{selectedPackage.priceType === 'per_person' ? '/ person' : ' fixed'}</span>
            </div>
          </div>

          {/* Booking Form Card */}
          <div className="rounded-[2.5rem] border-2 border-rust-200 bg-white p-6 md:p-8 shadow-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Package Booking Form</h2>
            <p className="text-xs text-slate-500 mb-6 border-b border-rust-100 pb-4">
              Please fill in your details to confirm your package reservation. All required fields are marked.
            </p>

            <form onSubmit={handleProceedToPayment} className="space-y-6">
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input 
                    label="Full Name" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="Enter customer full name"
                    error={errors.name}
                    icon={<FiUser />}
                    required 
                  />
                </div>

                <Input 
                  label="Mobile Number" 
                  type="tel"
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  error={errors.phone}
                  icon={<FiPhone />}
                  required 
                />

                <Input 
                  label="Email Address" 
                  type="email"
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  placeholder="name@example.com"
                  error={errors.email}
                  icon={<FiMail />}
                  required 
                />

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Event Type</label>
                  <div className="relative">
                    <FiTag className="absolute left-3.5 top-3 text-rust-400 h-4 w-4" />
                    <input 
                      type="text" 
                      value={form.eventType} 
                      readOnly 
                      disabled
                      className="w-full rounded-2xl border-2 border-rust-200 bg-rust-50/40 pl-10 pr-4 py-2.5 text-slate-800 font-bold outline-none text-sm cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <Input 
                  label="Number of Guests" 
                  type="number"
                  min="1"
                  max={selectedPackage.maxCapacity.toString()}
                  value={form.guests} 
                  onChange={(e) => setForm({ ...form, guests: e.target.value })} 
                  error={errors.guests}
                  icon={<FiUsers />}
                  required 
                />

                <Input 
                  label="Event Date" 
                  type="date"
                  value={form.date} 
                  onChange={(e) => setForm({ ...form, date: e.target.value })} 
                  error={errors.date}
                  icon={<FiCalendar />}
                  required 
                />

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Time Slot</label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-rust-500 focus:outline-none transition shadow-xs"
                  >
                    {selectedPackage.timeSlots.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Special Requests (Optional)</label>
                  <textarea 
                    value={form.specialRequest} 
                    onChange={(e) => setForm({ ...form, specialRequest: e.target.value })} 
                    rows="3"
                    className="w-full rounded-2xl border-2 border-rust-200 px-4 py-3 text-slate-800 focus:border-rust-500 focus:outline-none transition text-sm leading-relaxed"
                    placeholder="Dietary requests, stage setup preferences, cake wording, etc."
                  />
                </div>
              </div>

              <PrimaryButton className="w-full py-4 text-sm font-bold shadow-lg mt-4" type="submit">
                Proceed to Payment
              </PrimaryButton>
            </form>
          </div>

        </div>
      )}

      {/* STEP 2-TABLE: TABLE BOOKING SCREEN */}
      {step === 'table-booking' && selectedSeater && (
        <div className="space-y-8 animate-fade-in no-print max-w-4xl mx-auto font-sans">
          
          <button 
            type="button"
            onClick={() => setStep('landing')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-rust-500 transition"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Restaurant Page
          </button>

          {/* Table Stats Counters */}
          <div className="grid grid-cols-3 gap-4 p-6 rounded-[2rem] border-2 border-rust-200 bg-white shadow-sm text-center">
            <div>
              <span className="block text-2xl md:text-3xl font-black text-slate-800">{totalTablesCount}</span>
              <span className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider block mt-1">Total Tables</span>
            </div>
            <div className="border-x border-slate-100">
              <span className="block text-2xl md:text-3xl font-black text-rust-500">{reservedTablesCount}</span>
              <span className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider block mt-1">Reserved Tables</span>
            </div>
            <div>
              <span className="block text-2xl md:text-3xl font-black text-emerald-500">{availableTablesCount}</span>
              <span className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider block mt-1">Available Tables</span>
            </div>
          </div>

          <div className="rounded-[2rem] border-2 border-rust-200 bg-white p-6 md:p-8 shadow-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Book Your {selectedSeater}</h2>
            <p className="text-xs text-slate-500 mb-6 border-b border-rust-100 pb-4">
              Select one of the currently available table numbers below and enter your reservation details.
            </p>

            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-rust-500 block mb-4">Step 1: Choose Available Table</span>
              <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-8 gap-3">
                {seatingOptionsData[selectedSeater].tables.map((tableNum) => {
                  const isReserved = allReservedTableIds.includes(tableNum);
                  const isSelected = selectedTableNumber === tableNum;
                  return (
                    <button
                      key={tableNum}
                      type="button"
                      disabled={isReserved}
                      onClick={() => setSelectedTableNumber(tableNum)}
                      className={`py-3 rounded-xl text-xs font-bold border-2 transition duration-200 flex flex-col items-center justify-center gap-1 ${
                        isReserved 
                          ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-60'
                          : isSelected
                            ? 'border-rust-500 bg-rust-500 text-white shadow-md scale-105'
                            : 'border-rust-100 hover:border-rust-400 text-slate-700 bg-white hover:bg-rust-50/20'
                      }`}
                    >
                      <span>{tableNum}</span>
                      <span className="text-[9px] font-normal opacity-80">
                        {isReserved ? 'Reserved' : isSelected ? 'Selected' : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedTableNumber && (
              <form onSubmit={handleProceedToPayment} className="space-y-6 border-t border-rust-100 pt-8 animate-fade-in">
                <span className="text-xs font-bold uppercase tracking-wider text-rust-500 block">Step 2: Enter Reservation Information</span>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input 
                      label="Full Name" 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      placeholder="Enter customer full name"
                      error={errors.name}
                      icon={<FiUser />}
                      required 
                    />
                  </div>

                  <Input 
                    label="Mobile Number" 
                    type="tel"
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    error={errors.phone}
                    icon={<FiPhone />}
                    required 
                  />

                  <Input 
                    label="Email Address" 
                    type="email"
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    placeholder="name@example.com"
                    error={errors.email}
                    icon={<FiMail />}
                    required 
                  />

                  <Input 
                    label="Number of Guests" 
                    type="number"
                    min="1"
                    max={seatingOptionsData[selectedSeater].capacity.toString()}
                    value={form.guests} 
                    onChange={(e) => setForm({ ...form, guests: e.target.value })} 
                    error={errors.guests}
                    icon={<FiUsers />}
                    required 
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      label="Reservation Date" 
                      type="date"
                      value={form.date} 
                      onChange={(e) => setForm({ ...form, date: e.target.value })} 
                      error={errors.date}
                      icon={<FiCalendar />}
                      required 
                    />

                    <Input 
                      label="Reservation Time" 
                      type="time"
                      value={form.time} 
                      onChange={(e) => setForm({ ...form, time: e.target.value })} 
                      error={errors.time}
                      icon={<FiClock />}
                      required 
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Selected Table Number</label>
                    <input 
                      type="text" 
                      value={selectedTableNumber} 
                      readOnly 
                      disabled
                      className="w-full rounded-2xl border-2 border-rust-200 bg-rust-50/50 px-4 py-2.5 text-slate-800 font-bold focus:outline-none text-sm cursor-not-allowed select-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Special Request (Optional)</label>
                    <textarea 
                      value={form.specialRequest} 
                      onChange={(e) => setForm({ ...form, specialRequest: e.target.value })} 
                      rows="3"
                      className="w-full rounded-2xl border-2 border-rust-200 px-4 py-3 text-slate-800 focus:border-rust-500 focus:outline-none transition text-sm leading-relaxed"
                      placeholder="Allergen info, seating preferences, kid highchair, etc."
                    />
                  </div>
                </div>

                <PrimaryButton className="w-full py-4 text-sm font-bold shadow-lg mt-4" type="submit">
                  Proceed to Payment
                </PrimaryButton>
              </form>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: PAYMENT PAGE & BOOKING SUMMARY */}
      {step === 'payment' && (
        <div className="space-y-8 animate-fade-in no-print max-w-4xl mx-auto font-sans">
          
          {/* Back button */}
          <button 
            type="button"
            onClick={() => setStep(activeMode === 'package' ? 'package-form' : 'table-booking')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-rust-500 transition"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Details Form
          </button>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
            
            {/* Payment Methods */}
            <div className="rounded-[2.5rem] border-2 border-rust-200 bg-white p-6 md:p-8 shadow-md">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-rust-100 pb-3 mb-2 font-black">Select Payment Method</h2>
              <p className="text-slate-500 text-xs mb-6">Choose your preferred online checkout gateway.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                {[
                  { id: 'UPI', label: 'UPI', icon: FiSmartphone },
                  { id: 'CARD', label: 'Card', icon: FiCreditCard },
                  { id: 'NET_BANKING', label: 'Net Banking', icon: FiBookOpen },
                  { id: 'WALLET', label: 'Wallet', icon: FiBriefcase },
                ].map((method) => {
                  const Icon = method.icon;
                  const isChosen = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-2 transition h-20 ${
                        isChosen 
                          ? 'border-rust-500 bg-rust-50/20 text-rust-600 shadow-sm font-bold'
                          : 'border-slate-200 hover:border-rust-200 text-slate-700 bg-white'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isChosen ? 'text-rust-500' : 'text-slate-400'}`} />
                      <span className="text-xs leading-tight">{method.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-Forms */}
              <div className="border-t border-rust-100 pt-4 mb-6">
                {paymentMethod === 'UPI' && (
                  <div className="p-4 border-2 border-rust-200 rounded-2xl bg-rust-50/10 space-y-4">
                    <span className="block text-xs font-bold uppercase text-rust-500 tracking-wider">UPI Service App</span>
                    <div className="grid grid-cols-4 gap-2">
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
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="p-4 border-2 border-rust-200 rounded-2xl bg-rust-50/10 space-y-4">
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
                  </div>
                )}

                {paymentMethod === 'NET_BANKING' && (
                  <div className="p-4 border-2 border-rust-200 rounded-2xl bg-rust-50/10 space-y-2">
                    <label className="block text-xs font-bold uppercase text-rust-500 tracking-wider">Select Bank</label>
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
                  </div>
                )}

                {paymentMethod === 'WALLET' && (
                  <div className="p-4 border-2 border-rust-200 rounded-2xl bg-rust-50/10 space-y-2">
                    <label className="block text-xs font-bold uppercase text-rust-500 tracking-wider">Select Wallet Gateway</label>
                    <select
                      value={digitalWallet}
                      onChange={(e) => setDigitalWallet(e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-rust-500 focus:outline-none transition shadow-sm font-semibold"
                    >
                      <option value="PAYTM">Paytm Wallet</option>
                      <option value="PHONEPE">PhonePe Wallet</option>
                      <option value="MOBIKWIK">MobiKwik</option>
                      <option value="AMAZON">Amazon Pay</option>
                    </select>
                  </div>
                )}
              </div>

              <PrimaryButton 
                onClick={handleConfirmPayment}
                disabled={loading}
                className="w-full py-4 text-sm font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <FiShield className="h-4.5 w-4.5" />
                {loading ? 'Authorizing Payment...' : 'Pay & Confirm Booking'}
              </PrimaryButton>
            </div>

            {/* BOOKING SUMMARY */}
            <div className="rounded-[2.5rem] border-2 border-rust-200 bg-gradient-to-br from-rust-50/50 to-white p-6 md:p-8 shadow-md">
              <h2 className="text-xl font-black text-slate-900 border-b border-rust-100 pb-3 mb-4">Booking Summary</h2>

              {(() => {
                const { charge, gst, totalAmount, packageCharge, cakeCharge, decorCharge } = getPricingDetails();
                const isBirthday = activeMode === 'package' && selectedPackage && selectedPackage.id === 'birthday-party';
                return (
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="flex justify-between border-b border-rust-100/60 pb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selected Package/Table</span>
                      <span className="font-bold text-rust-600">{activeMode === 'package' ? selectedPackage.name : selectedSeater}</span>
                    </div>

                    {activeMode === 'table' && (
                      <div className="flex justify-between border-b border-rust-100/60 pb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Table Number</span>
                        <span className="font-extrabold text-slate-900">{selectedTableNumber}</span>
                      </div>
                    )}

                    <div className="flex justify-between border-b border-rust-100/60 pb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Name</span>
                      <span className="font-semibold text-slate-800">{form.name}</span>
                    </div>

                    <div className="flex justify-between border-b border-rust-100/60 pb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Guests Count</span>
                      <span className="font-bold text-slate-800">{form.guests} Guests</span>
                    </div>

                    <div className="flex justify-between border-b border-rust-100/60 pb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Date</span>
                      <span className="font-bold text-slate-800">{form.date}</span>
                    </div>

                    <div className="flex justify-between border-b border-rust-100/60 pb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Slot</span>
                      <span className="font-bold text-slate-800">{activeMode === 'package' ? selectedTimeSlot : form.time}</span>
                    </div>

                    <div className="pt-2 space-y-2 text-xs">
                      {isBirthday ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Birthday Package (₹799 × {form.guests})</span>
                            <span className="font-mono font-semibold">₹{packageCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Birthday Cake</span>
                            <span className="font-mono font-semibold">₹{cakeCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Decoration Charges</span>
                            <span className="font-mono font-semibold">₹{decorCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Base Charge</span>
                          <span className="font-mono font-semibold">₹{packageCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between border-t border-dashed border-rust-200 pt-2 font-bold">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-mono">₹{charge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">GST Taxes (18%)</span>
                        <span className="font-mono font-semibold">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <hr className="border-rust-200 my-2" />
                      <div className="flex justify-between text-sm font-black text-rust-600">
                        <span>Total Amount Payable</span>
                        <span className="font-mono">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}

      {/* STEP 5: BOOKING CONFIRMATION PAGE */}
      {step === 'confirmation' && recentBooking && (
        <div className="space-y-8 animate-fade-in max-w-3xl mx-auto font-sans">
          
          <div className="text-center no-print">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4 border-2 border-emerald-200 shadow-sm animate-bounce">
              <FiCheck className="h-9 w-9 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Booking Confirmed!</h2>
            <p className="mt-2 text-slate-600 text-sm max-w-lg mx-auto font-medium">
              {recentBooking.bookingType === 'table'
                ? 'Your Table Seating reservation has been confirmed. A confirmation email has been sent to your registered email address.'
                : 'Your reservation has been confirmed. A confirmation email has been sent to your registered email address.'}
            </p>
          </div>

          <div 
            id="invoice-print-area"
            className="bg-white rounded-[2.5rem] border-2 border-rust-200 p-6 md:p-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-rust-500"></div>

            {/* Restaurant Logo Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-dashed border-rust-100 pb-6 mb-6 gap-4">
              <div>
                <h3 className="text-2xl font-black text-rust-600 tracking-wide">HungryHub</h3>
                <p className="text-2xs text-slate-400 font-medium">Fresh & Premium Vegetarian Dining Experiences</p>
              </div>
              <div className="sm:text-right">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                  {recentBooking.packageName === 'Birthday Party Package' ? 'Birthday Party Booking Invoice' : 'Table Reservation Invoice'}
                </h4>
                <p className="text-xs text-slate-500 font-mono">Invoice Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {/* Invoice Meta details */}
            <div className="grid gap-6 sm:grid-cols-2 text-sm text-slate-600 mb-8">
              <div className="space-y-2 bg-rust-50/50 p-4 rounded-2xl border border-rust-100/60">
                <span className="text-2xs font-extrabold text-rust-500 uppercase tracking-widest block">Customer Details</span>
                <div>
                  <span className="text-slate-400 text-2xs block">Full Name</span>
                  <p className="font-bold text-slate-800">{recentBooking.customerName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-2xs block">Mobile Number</span>
                  <p className="font-semibold text-slate-800">{recentBooking.mobileNumber}</p>
                </div>
                {recentBooking.emailAddress && (
                  <div>
                    <span className="text-slate-400 text-2xs block">Email Address</span>
                    <p className="font-medium text-slate-800">{recentBooking.emailAddress}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 bg-rust-50/50 p-4 rounded-2xl border border-rust-100/60">
                <span className="text-2xs font-extrabold text-rust-500 uppercase tracking-widest block">Booking Details</span>
                <div>
                  <span className="text-slate-400 text-2xs block">Booking ID</span>
                  <p className="font-extrabold text-slate-900 font-mono">{recentBooking.bookingId}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-2xs block">Package / Table Type</span>
                  <p className="font-bold text-rust-600">{recentBooking.packageName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-2xs block">Event Date & Time</span>
                  <p className="font-semibold text-slate-800">{recentBooking.eventDate} ({recentBooking.timeSlot})</p>
                </div>
                <div>
                  <span className="text-slate-400 text-2xs block">Guests Count</span>
                  <p className="font-bold text-slate-800">{recentBooking.guestsCount} Guests</p>
                </div>
              </div>
            </div>

            {/* Description Table on screen */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-rust-100">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-rust-50 text-xs font-bold uppercase text-rust-900 border-b border-rust-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">Description</th>
                    <th scope="col" className="px-6 py-3 text-center">Qty</th>
                    <th scope="col" className="px-6 py-3 text-right">Rate</th>
                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rust-100 bg-white">
                  {recentBooking.packageName === 'Birthday Party Package' ? (
                    <>
                      {/* Row 1: Birthday Package */}
                      <tr className="hover:bg-rust-50/20">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          <div>Birthday Party Package (Food Included)</div>
                          <span className="text-2xs text-slate-400 font-normal italic">Food Included in Package</span>
                        </td>
                        <td className="px-6 py-4 text-center">{recentBooking.guestsCount}</td>
                        <td className="px-6 py-4 text-right">₹799</td>
                        <td className="px-6 py-4 text-right font-semibold">₹{(799 * parseInt(recentBooking.guestsCount, 10)).toLocaleString('en-IN')}</td>
                      </tr>
                      {/* Row 2: Cake */}
                      <tr className="hover:bg-rust-50/20">
                        <td className="px-6 py-4 font-medium text-slate-900">Birthday Cake</td>
                        <td className="px-6 py-4 text-center">1</td>
                        <td className="px-6 py-4 text-right">₹900</td>
                        <td className="px-6 py-4 text-right font-semibold">₹900</td>
                      </tr>
                      {/* Row 3: Decoration */}
                      <tr className="hover:bg-rust-50/20">
                        <td className="px-6 py-4 font-medium text-slate-900">Decoration Charges</td>
                        <td className="px-6 py-4 text-center">1</td>
                        <td className="px-6 py-4 text-right">₹1500</td>
                        <td className="px-6 py-4 text-right font-semibold">₹1,500</td>
                      </tr>
                    </>
                  ) : (
                    <tr className="hover:bg-rust-50/20">
                      <td className="px-6 py-4 font-medium text-slate-900">{recentBooking.packageName} Booking</td>
                      <td className="px-6 py-4 text-center">1</td>
                      <td className="px-6 py-4 text-right">
                        ₹{(recentBooking.amountPaid / 1.18).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        ₹{(recentBooking.amountPaid / 1.18).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations Footer */}
            <div className="flex justify-end mb-6">
              <div className="w-full sm:w-64 text-sm text-slate-600 space-y-2 border-t border-rust-100 pt-4">
                {(() => {
                  const total = parseFloat(recentBooking.amountPaid);
                  let subtotal = total;
                  let gst = 0;
                  
                  if (recentBooking.packageName === 'Birthday Party Package') {
                    const guestsCount = parseInt(recentBooking.guestsCount, 10) || 1;
                    subtotal = (799 * guestsCount) + 1200 + 2500;
                    gst = subtotal * 0.18;
                  } else {
                    subtotal = total / 1.18;
                    gst = total - subtotal;
                  }
                  
                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST Taxes (18%)</span>
                        <span className="font-semibold text-slate-800">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between border-t border-rust-200 pt-2 text-base font-black text-rust-600">
                        <span>Grand Total</span>
                        <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest block">Payment Status</span>
                <span className="font-bold text-emerald-600 uppercase text-sm">Paid ({recentBooking.paymentMethod})</span>
              </div>
              <div className="text-right">
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-widest block">Amount Paid</span>
                <span className="font-black text-slate-900 text-lg font-mono">₹{parseFloat(recentBooking.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center no-print">
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 flex items-center justify-center gap-2 rounded-full border-2 border-rust-500 bg-white px-6 py-3.5 font-bold text-rust-500 transition hover:bg-rust-50 shadow-sm active:scale-95 text-sm"
            >
              <FiDownload className="h-5 w-5" /> Download Invoice PDF
            </button>

            <button
              onClick={() => {
                navigate('/');
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-rust-500 hover:bg-rust-600 text-white font-bold px-6 py-3.5 transition shadow-md active:scale-95 text-sm"
            >
              <FiHome className="h-5 w-5" /> Return to Home
            </button>
          </div>

        </div>
      )}

      {/* SEATING OPTIONS MODAL (2 Seater, 4 Seater, 6 Seater) */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rust-950/65 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in no-print font-sans">
          <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] border-2 border-rust-200 p-6 md:p-10 max-h-[95vh] overflow-y-auto shadow-2xl">
            <button
              type="button"
              onClick={() => setShowTableModal(false)}
              className="absolute top-6 right-6 rounded-full border border-rust-100 p-2 text-slate-400 hover:text-rust-500 hover:bg-rust-50 transition shadow-sm"
              aria-label="Close modal"
            >
              <FiX className="h-5 w-5" />
            </button>

            <div className="mb-8 pr-8 text-center sm:text-left">
              <span className="text-xs text-rust-500 font-bold uppercase tracking-wider font-mono">Reserve Table Options</span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Select Table Seating</h3>
              <p className="text-slate-500 text-xs mt-2 font-light">Choose your seating capacity option to proceed to available table selection.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 items-stretch">
              {Object.entries(seatingOptionsData).map(([key, details]) => (
                <div 
                  key={key}
                  className="flex flex-col justify-between p-6 rounded-[2rem] border-2 border-rust-100 bg-gradient-to-br from-white to-rust-50/10 hover:border-rust-400 shadow-sm hover:shadow-md transition duration-300"
                >
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900 mb-2">{details.title}</h4>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rust-50 px-3 py-1 text-xs font-bold text-rust-600 mb-4">
                      Capacity: {details.capacity} Guests
                    </span>
                    <p className="text-slate-500 text-xs leading-relaxed mb-6 font-light">{details.desc}</p>
                  </div>

                  <div>
                    <div className="mb-4 border-t border-rust-100/60 pt-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reservation Charge:</span>
                      <span className="text-xl font-black text-rust-600">₹{details.charge}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectSeater(key)}
                      className="w-full rounded-full bg-rust-500 hover:bg-rust-600 text-white font-bold text-xs py-3 transition shadow-sm active:scale-95 text-center"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
