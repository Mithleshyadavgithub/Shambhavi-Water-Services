import { useState, useEffect } from 'react';
import { 
  FiCreditCard, 
  FiLoader, 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCw, 
  FiShield, 
  FiExternalLink,
  FiUpload,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiMaximize2,
  FiX
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import UpiPaymentModal from './UpiPaymentModal';
import RazorpayModal from './RazorpayModal';

// UPI Brand SVG Icons
const GPayIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" fill="none">
    <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C33.7 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
    <path fill="#34A853" d="m6.3 14.7 6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
    <path fill="#FBBC05" d="M24 44c5.2 0 10-1.9 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-2.7-11.3-8l-6.6 5.1C9.6 39.5 16.2 44 24 44z"/>
    <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.4l6.3 5.2C41.7 34.6 44 28.7 44 24c0-1.2-.1-2.4-.4-3.5z"/>
  </svg>
);

const PhonePeIcon = () => (
  <div className="w-5 h-5 rounded-md bg-[#5f259f] flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/30">
    <span className="text-white font-black text-xs leading-none font-serif select-none">पे</span>
  </div>
);

const PaytmIcon = () => (
  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#00baf2] to-[#002970] flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/30">
    <span className="text-white font-black text-[8px] tracking-tighter select-none">Paytm</span>
  </div>
);

const RazorpayIcon = () => (
  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.5 2L4 14h7l-2 8 10-12h-7.5l2.5-8z" />
    </svg>
  </div>
);

export default function RazorpayCheckout({ orderId, amount = 60, onSuccess, onFailure }) {
  const { theme } = useAuth();
  const [status, setStatus] = useState('idle'); // idle | loading | success | failed
  const [errorMsg, setErrorMsg] = useState('');
  
  // Payment methods: 'upi' | 'razorpay' | 'cash'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [isQrZoomOpen, setIsQrZoomOpen] = useState(false); // Direct enlarged zoom without validation!
  const [confirmedData, setConfirmedData] = useState(null);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Inline Screenshot State
  const [screenshot, setScreenshot] = useState('');

  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    area: 'Gomti Nagar'
  });
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [validationError, setValidationError] = useState('');

  const merchantVpa = 'sushmayadavaditya0107@oksbi';
  const merchantName = 'Sushma Yadav';

  const AREAS = [
    'Gomti Nagar',
    'Hazratganj',
    'Indira Nagar',
    'Alambagh',
    'Aashiyana',
    'Vikas Nagar',
    'Rajajipuram',
    'General'
  ];

  // Fetch logged in user details if available
  useEffect(() => {
    setFetchingDetails(true);
    api.get('/auth/me')
      .then(res => {
        if (res.data?.success && res.data?.user) {
          const cust = res.data.user.customerId;
          if (cust && typeof cust === 'object') {
            setUserDetails({
              name: cust.name || res.data.user.name || '',
              phone: cust.phone || res.data.user.phone || '',
              email: cust.email || res.data.user.email || '',
              address: cust.address || '',
              area: cust.area || 'Gomti Nagar'
            });
          } else {
            setUserDetails(prev => ({
              ...prev,
              name: res.data.user.name || '',
              phone: res.data.user.phone || '',
              email: res.data.user.email || ''
            }));
          }
        }
      })
      .catch(err => {
        console.warn("User details fetch skipped:", err);
      })
      .finally(() => {
        setFetchingDetails(false);
      });
  }, []);

  const validateForm = () => {
    if (!userDetails.name?.trim()) {
      setValidationError('Please enter full name');
      return false;
    }
    if (!userDetails.phone?.trim()) {
      setValidationError('Please enter mobile number');
      return false;
    }
    if (!userDetails.address?.trim()) {
      setValidationError('Please enter delivery address');
      return false;
    }
    if (!userDetails.area?.trim()) {
      setValidationError('Please select delivery area');
      return false;
    }
    setValidationError('');
    return true;
  };

  const executeOrderConfirmation = async (paymentPayload = {}) => {
    if (!validateForm()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      let res;
      if (orderId) {
        // Confirm existing pending order created by AI assistant
        res = await api.put(`/orders/${orderId}/confirm`, {
          name: userDetails.name,
          phone: userDetails.phone,
          email: userDetails.email,
          address: userDetails.address,
          area: userDetails.area,
          paymentMethod: paymentPayload.paymentMethod || paymentMethod,
          paymentStatus: paymentPayload.paymentStatus || (paymentMethod === 'cash' ? 'pending' : 'paid'),
          paidAmount: paymentPayload.paidAmount || (paymentMethod === 'cash' ? 0 : amount),
          upiProvider: paymentPayload.upiProvider || '',
          transactionId: paymentPayload.transactionId || '',
          paymentScreenshot: paymentPayload.paymentScreenshot || screenshot || ''
        });
      } else {
        // Direct public order creation
        res = await api.post('/orders/public', {
          waterType: '20L Can',
          quantity: 1,
          totalAmount: amount,
          name: userDetails.name,
          phone: userDetails.phone,
          email: userDetails.email || 'customer@shambhavi.com',
          address: userDetails.address,
          area: userDetails.area,
          paymentMethod: paymentPayload.paymentMethod || paymentMethod,
          paymentStatus: paymentPayload.paymentStatus || (paymentMethod === 'cash' ? 'pending' : 'paid'),
          paidAmount: paymentPayload.paidAmount || (paymentMethod === 'cash' ? 0 : amount),
          upiProvider: paymentPayload.upiProvider || '',
          transactionId: paymentPayload.transactionId || '',
          paymentScreenshot: paymentPayload.paymentScreenshot || screenshot || ''
        });
      }

      const data = res.data;

      if (data?.success) {
        setStatus('success');
        setConfirmedData(data.data || { orderId: orderId || 'CONFIRMED', totalAmount: amount });
        onSuccess?.(data.data);
      } else {
        setStatus('failed');
        setErrorMsg(data?.message || 'Could not confirm your order');
        onFailure?.(data?.message);
      }
    } catch (err) {
      setStatus('failed');
      const msg = err.response?.data?.message || err.message || 'Error confirming order';
      setErrorMsg(msg);
      onFailure?.(msg);
    }
  };

  const handleConfirmOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod === 'upi') {
      setIsUpiModalOpen(true);
    } else if (paymentMethod === 'razorpay') {
      setIsRazorpayModalOpen(true);
    } else {
      await executeOrderConfirmation({ paymentMethod: 'cash', paymentStatus: 'pending' });
    }
  };

  const handleUpiAppClick = (scheme, appName) => {
    if (!validateForm()) return;

    const upiUri = `${scheme}://upi/pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=Shambhavi%20Water%20Order`;
    window.location.href = upiUri;

    setTimeout(() => {
      setIsUpiModalOpen(true);
    }, 600);
  };

  const handleUpiSuccess = async (upiDetails) => {
    await executeOrderConfirmation({
      paymentMethod: upiDetails.paymentMethod || 'upi',
      paymentStatus: 'pending',
      paidAmount: upiDetails.amount || amount,
      upiProvider: upiDetails.upiProvider || 'Google Pay QR',
      transactionId: upiDetails.transactionId || '',
      paymentScreenshot: upiDetails.paymentScreenshot || screenshot || ''
    });
  };

  const handleRazorpaySuccess = async (rzpDetails) => {
    await executeOrderConfirmation({
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      paidAmount: rzpDetails.amount || amount,
      upiProvider: rzpDetails.upiProvider || 'Razorpay Gateway',
      transactionId: rzpDetails.transactionId || `pay_rzp_${Date.now()}`
    });
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(merchantVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Screenshot size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result);
      setValidationError('');
    };
    reader.readAsDataURL(file);
  };

  if (status === 'success') {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mt-3 animate-fade-in space-y-2.5">
        <div className="flex items-center gap-2.5">
          <FiCheckCircle className="text-emerald-400 flex-shrink-0" size={22} />
          <div>
            <p className="text-emerald-400 font-black text-sm sm:text-base">Order Confirmed! 🎉</p>
            <p className="text-emerald-300/80 text-xs">
              {paymentMethod === 'upi' 
                ? `Payment Proof of ₹${amount} Attached • Delivery in 2-4 hrs` 
                : paymentMethod === 'razorpay'
                  ? `Paid ₹${amount} via Razorpay Online • Delivery in 2-4 hrs`
                  : 'Cash on Delivery • Expect delivery within 2-4 hours 💧'}
            </p>
          </div>
        </div>
        {confirmedData?.orderId && (
          <div className="pt-2 border-t border-emerald-500/20 flex justify-between text-xs text-emerald-300/90 font-mono">
            <span>Order #{confirmedData.orderId}</span>
            {confirmedData.transactionId && <span>Ref: {confirmedData.transactionId}</span>}
          </div>
        )}
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="space-y-2 mt-3 animate-fade-in">
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30">
          <FiXCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-red-400 text-xs">{errorMsg || 'Payment / Confirmation failed'}</p>
        </div>
        <button
          id="razorpay-retry-btn"
          onClick={() => { setStatus('idle'); setErrorMsg(''); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-semibold cursor-pointer"
        >
          <FiRefreshCw size={14} />
          Retry Confirmation
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleConfirmOrder} className="space-y-3.5 mt-3 animate-fade-in w-full">
      {fetchingDetails ? (
        <div className="flex items-center gap-2 py-2">
          <FiLoader className="animate-spin text-cyan-500" size={14} />
          <span className="text-xs text-slate-500 dark:text-slate-400">Loading delivery details...</span>
        </div>
      ) : (
        <>
          <div className="border-t border-slate-200 dark:border-white/5 pt-3 mt-1 flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">1. Delivery Details</h4>
            <span className="text-[10px] text-slate-400">Step 1 of 2</span>
          </div>

          {validationError && (
            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
              ⚠️ {validationError}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-100/50 dark:bg-slate-900/50 border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
              value={userDetails.name}
              onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                placeholder="10 digits"
                className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-100/50 dark:bg-slate-900/50 border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
                value={userDetails.phone}
                onChange={e => setUserDetails({ ...userDetails, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-100/50 dark:bg-slate-900/50 border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
                value={userDetails.email}
                onChange={e => setUserDetails({ ...userDetails, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Delivery Area</label>
              <select
                className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-100/50 dark:bg-slate-900/50 border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-500 transition-all"
                value={userDetails.area}
                onChange={e => setUserDetails({ ...userDetails, area: e.target.value })}
              >
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Complete Address</label>
            <textarea
              required
              rows={2}
              placeholder="Flat/House No, Building, Street, Landmark"
              className="w-full px-3 py-2 rounded-xl border text-xs bg-slate-100/50 dark:bg-slate-900/50 border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-cyan-500 transition-all resize-none"
              value={userDetails.address}
              onChange={e => setUserDetails({ ...userDetails, address: e.target.value })}
            />
          </div>

          {/* PAYMENT METHOD SELECTION */}
          <div className="border-t border-slate-200 dark:border-white/5 pt-3 mt-1 flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">2. Payment Method</h4>
            <span className="text-[10px] text-cyan-400 font-bold">₹{amount}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                paymentMethod === 'upi'
                  ? theme === 'light'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold shadow-sm'
                    : 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-md shadow-cyan-500/15'
                  : theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-cyan-500/30'
              }`}
            >
              <span className="text-xs block">⚡ Direct UPI</span>
              <span className={`text-[9px] font-medium ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>GPay / QR</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('razorpay')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                paymentMethod === 'razorpay'
                  ? theme === 'light'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold shadow-sm'
                    : 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-md shadow-cyan-500/15'
                  : theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-cyan-500/30'
              }`}
            >
              <span className="text-xs block">💳 Razorpay</span>
              <span className={`text-[9px] font-medium ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>Card/NetBank</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                paymentMethod === 'cash'
                  ? theme === 'light'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold shadow-sm'
                    : 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-md shadow-cyan-500/15'
                  : theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-cyan-500/30'
              }`}
            >
              <span className="text-xs block">💵 COD</span>
              <span className={`text-[9px] font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Pay Later</span>
            </button>
          </div>

          {/* ⚡ UPI PAYMENT DETAILS & QR SCANNER */}
          {paymentMethod === 'upi' && (
            <div className={`p-3.5 rounded-2xl border space-y-3 animate-fade-in ${
              theme === 'light' ? 'bg-slate-50 border-cyan-500/30 shadow-sm' : 'bg-slate-900/90 border-cyan-500/30'
            }`}>
              
              {/* QR Code Card & Bank Badge */}
              <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/70 border-white/10'
              }`}>
                {/* Click directly to Zoom Scanner (ZERO validation required!) */}
                <div 
                  onClick={() => setIsQrZoomOpen(true)}
                  className="relative group cursor-pointer shrink-0"
                  title="Click to Zoom / Enlarge QR Scanner"
                >
                  <img
                    src="/sushma-gpay-qr.png"
                    alt="Sushma Yadav Google Pay QR"
                    className="w-16 h-16 rounded-lg object-contain bg-white p-1 border border-cyan-400/40 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity text-white text-[9px] font-bold">
                    <FiMaximize2 size={14} />
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-black truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Sushma Yadav</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      theme === 'light' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    }`}>
                      SBI (oksbi)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <code className={`text-[11px] font-mono font-bold truncate ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>{merchantVpa}</code>
                    <button
                      type="button"
                      onClick={handleCopyVpa}
                      className="p-1 text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedVpa ? <FiCheck size={12} className="text-green-500" /> : <FiCopy size={12} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQrZoomOpen(true)}
                    className={`text-[10px] font-bold hover:underline flex items-center gap-1 mt-0.5 cursor-pointer ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}
                  >
                    <FiMaximize2 size={10} /> Click to Enlarge Scanner
                  </button>
                </div>
              </div>

              {/* 1-Click UPI App Launchers (Fully Clickable) */}
              <div>
                <p className={`text-[11px] font-bold mb-1.5 flex items-center justify-between ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  <span>Tap to Pay with App:</span>
                  <button
                    type="button"
                    onClick={() => setIsQrZoomOpen(true)}
                    className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer font-bold"
                  >
                    View Big QR →
                  </button>
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpiAppClick('gpay', 'Google Pay')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer hover:scale-105 ${
                      theme === 'light'
                        ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900 shadow-sm'
                        : 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/30 text-blue-200'
                    }`}
                  >
                    <GPayIcon />
                    <span className={`text-xs font-black ${theme === 'light' ? 'text-blue-900' : 'text-blue-200'}`}>Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpiAppClick('phonepe', 'PhonePe')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer hover:scale-105 ${
                      theme === 'light'
                        ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900 shadow-sm'
                        : 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-200'
                    }`}
                  >
                    <PhonePeIcon />
                    <span className={`text-xs font-black ${theme === 'light' ? 'text-purple-900' : 'text-purple-200'}`}>PhonePe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpiAppClick('paytmmp', 'Paytm')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer hover:scale-105 ${
                      theme === 'light'
                        ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-900 shadow-sm'
                        : 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/30 text-sky-200'
                    }`}
                  >
                    <PaytmIcon />
                    <span className={`text-xs font-black ${theme === 'light' ? 'text-sky-900' : 'text-sky-200'}`}>Paytm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateForm()) setIsRazorpayModalOpen(true);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer hover:scale-105 ${
                      theme === 'light'
                        ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-900 shadow-sm'
                        : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/30 text-cyan-200'
                    }`}
                  >
                    <RazorpayIcon />
                    <span className={`text-xs font-black ${theme === 'light' ? 'text-cyan-900' : 'text-cyan-200'}`}>Razorpay</span>
                  </button>
                </div>
              </div>

              {/* Inline Screenshot Upload Section */}
              <div className={`pt-2 border-t space-y-1.5 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Attach Payment Screenshot (Required for Proof)
                </label>
                
                {screenshot ? (
                  <div className={`flex items-center justify-between p-2 rounded-xl border ${
                    theme === 'light' ? 'bg-white border-green-300' : 'bg-slate-950/80 border-green-500/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <img src={screenshot} alt="Payment Receipt" className="w-10 h-10 object-cover rounded-lg border border-white/20" />
                      <div>
                        <p className={`text-[11px] font-bold flex items-center gap-1 ${theme === 'light' ? 'text-green-700' : 'text-green-400'}`}>
                          <FiCheck size={12} /> Receipt Uploaded
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">Ready for shop verification</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshot('')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label className={`border border-dashed rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    theme === 'light' 
                      ? 'bg-white border-slate-300 hover:border-cyan-500 hover:bg-cyan-50/50' 
                      : 'border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleScreenshotChange}
                    />
                    <FiUpload className="text-cyan-600 dark:text-cyan-400 mb-1" size={16} />
                    <span className={`text-[11px] font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>Upload Screenshot / Receipt</span>
                    <span className="text-[9px] text-slate-400">PNG, JPG up to 5MB</span>
                  </label>
                )}
              </div>

            </div>
          )}

          {/* 💳 RAZORPAY ONLINE GATEWAY SELECTION */}
          {paymentMethod === 'razorpay' && (
            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-400">
                  <FiCreditCard size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Razorpay Online Gateway</p>
                  <p className="text-[10px] text-blue-300">Cards, NetBanking, All UPIs & Wallets</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (validateForm()) setIsRazorpayModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/20"
              >
                Launch →
              </button>
            </div>
          )}
        </>
      )}

      {/* Main Order Confirmation Button */}
      <button
        type="submit"
        id="razorpay-pay-btn"
        disabled={status === 'loading' || fetchingDetails}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-3 cursor-pointer"
      >
        {status === 'loading' ? (
          <>
            <FiLoader size={16} className="animate-spin" />
            Processing Order...
          </>
        ) : paymentMethod === 'upi' ? (
          <>
            <FiShield size={16} />
            {screenshot ? `Submit Order with Payment Proof (₹${amount})` : `Proceed with UPI & Scanner (₹${amount})`}
          </>
        ) : paymentMethod === 'razorpay' ? (
          <>
            <FiCreditCard size={16} />
            Pay ₹{amount} via Razorpay Gateway
          </>
        ) : (
          <>
            <FiCheckCircle size={16} />
            Confirm Order (Cash on Delivery)
          </>
        )}
      </button>

      {/* 🔍 DIRECT QR ZOOM MODAL (Click-to-Enlarge without filling form!) */}
      {isQrZoomOpen && (
        <div 
          className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsQrZoomOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center space-y-3.5 sm:space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsQrZoomOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <FiX size={18} />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <span>State Bank of India</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-black">SBI (oksbi)</span>
            </div>

            <h3 className="text-base font-black text-white">Sushma Yadav</h3>

            {/* Big High-Resolution QR Scanner */}
            <div className="p-2.5 sm:p-3 bg-white rounded-2xl shadow-xl border-2 border-cyan-400/40 inline-block mx-auto">
              <img
                src="/sushma-gpay-qr.png"
                alt="Enlarged QR Scanner"
                className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-xl"
              />
            </div>

            {/* Order Amount */}
            <div className="py-2 px-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Amount to Pay:</span>
              <span className="text-lg font-black text-cyan-400">₹{amount}</span>
            </div>

            {/* Copy VPA */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs">
              <code className="text-cyan-400 font-mono font-bold truncate">{merchantVpa}</code>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Copy UPI ID"
              >
                {copiedVpa ? <FiCheck size={14} className="text-green-400" /> : <FiCopy size={14} />}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Scan with Google Pay, PhonePe, Paytm, or BHIM.
            </p>

            <button
              type="button"
              onClick={() => {
                setIsQrZoomOpen(false);
                if (validateForm()) setIsUpiModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              {screenshot ? 'Screenshot Attached ✓ Confirm Order' : 'Upload Payment Screenshot Proof →'}
            </button>
          </div>
        </div>
      )}

      {/* Modern UPI Payment Modal with Mithlesh Yadav QR */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        amount={amount}
        merchantVpa={merchantVpa}
        merchantName="Shambhavi Water Services"
        onPaymentSuccess={handleUpiSuccess}
        onPaymentFailure={(err) => setValidationError(err || 'Payment could not be completed')}
      />

      {/* Interactive Razorpay Gateway Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        amount={amount}
        customerDetails={userDetails}
        orderId={orderId}
        onPaymentSuccess={handleRazorpaySuccess}
        onPaymentFailure={(err) => setValidationError(err || 'Razorpay payment was cancelled or failed')}
      />
    </form>
  );
}
