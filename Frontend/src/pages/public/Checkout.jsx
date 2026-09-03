import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import UpiPaymentModal from '../../components/UpiPaymentModal';
import RazorpayModal from '../../components/RazorpayModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  FiDroplet, 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiCheckCircle, 
  FiArrowLeft, 
  FiMail, 
  FiAlertCircle,
  FiClock,
  FiCopy,
  FiCheck,
  FiShield,
  FiExternalLink,
  FiCreditCard,
  FiPlus,
  FiMinus,
  FiShoppingBag
} from 'react-icons/fi';

const prices = {
  '20L Can': 40,
  '18L Can': 40,
  '2L Bottle': 20,
  '1L Bottle': 10
};

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

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Order Details State
  const [waterType, setWaterType] = useState('20L Can');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'cash'

  // User Details State
  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    area: 'Gomti Nagar'
  });

  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Cancellation Modal States
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Order is delayed / late');
  const [cancelComments, setCancelComments] = useState('');

  // Payment Gateway Modal States
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  // Fetch logged in user details if available
  useEffect(() => {
    if (user) {
      setFetchingDetails(true);
      api.get('/auth/me')
        .then(res => {
          if (res.data.success && res.data.user) {
            const cust = res.data.user.customerId;
            if (cust) {
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
          console.error("Error fetching user details", err);
        })
        .finally(() => {
          setFetchingDetails(false);
        });
    }
  }, [user]);

  // Calculations
  const itemTotal = (prices[waterType] || 0) * quantity;
  const deliveryCharge = 20;
  const grandTotal = itemTotal + deliveryCharge;

  // Validate form details
  const validateDeliveryDetails = () => {
    if (!userDetails.name.trim()) {
      setError('Please enter your full name in Delivery Details.');
      return false;
    }
    if (!userDetails.phone.trim()) {
      setError('Please enter your mobile number in Delivery Details.');
      return false;
    }
    if (!userDetails.email.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    if (!userDetails.address.trim()) {
      setError('Please enter your complete delivery address.');
      return false;
    }
    if (!userDetails.area.trim()) {
      setError('Please select a delivery area.');
      return false;
    }
    setError('');
    return true;
  };

  // Place Order API call
  const placeOrder = async (paymentData = {}) => {
    if (!validateDeliveryDetails()) return;

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        waterType,
        quantity,
        totalAmount: grandTotal,
        paymentMethod: paymentData.paymentMethod || paymentMethod || 'cash',
        paymentStatus: paymentData.paymentStatus || (paymentMethod === 'cash' ? 'pending' : 'paid'),
        paidAmount: paymentData.paidAmount || (paymentMethod === 'cash' ? 0 : grandTotal),
        upiProvider: paymentData.upiProvider || '',
        transactionId: paymentData.transactionId || '',
        paymentScreenshot: paymentData.paymentScreenshot || '',
        address: userDetails.address,
        area: userDetails.area,
        name: userDetails.name,
        phone: userDetails.phone,
        email: userDetails.email
      };

      let response;

      if (user && user.customerId) {
        // Logged-in user with linked customer profile
        orderPayload.customer = typeof user.customerId === 'object' ? user.customerId._id : user.customerId;
        orderPayload.user = user.id;
        response = await api.post('/orders', orderPayload);
      } else {
        // Guest user flow OR logged-in user without a linked customer profile
        response = await api.post('/orders/public', orderPayload);
      }

      if (response.data.success) {
        setSuccessOrder(response.data.data);
      } else {
        setError(response.data.message || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDeliveryDetails()) return;

    if (paymentMethod === 'upi') {
      setIsUpiModalOpen(true);
    } else if (paymentMethod === 'razorpay') {
      setIsRazorpayModalOpen(true);
    } else {
      // Cash on Delivery
      await placeOrder({ paymentMethod: 'cash', paymentStatus: 'pending' });
    }
  };

  // Handle UPI Success from modal
  const handleUpiPaymentSuccess = async (paymentDetails) => {
    await placeOrder({
      paymentMethod: paymentDetails.paymentMethod || 'upi',
      paymentStatus: 'paid',
      paidAmount: paymentDetails.amount || grandTotal,
      upiProvider: paymentDetails.upiProvider || 'UPI',
      transactionId: paymentDetails.transactionId || '',
      paymentScreenshot: paymentDetails.paymentScreenshot || ''
    });
  };

  // Handle Razorpay Success from modal
  const handleRazorpayPaymentSuccess = async (paymentDetails) => {
    await placeOrder({
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      paidAmount: paymentDetails.amount || grandTotal,
      upiProvider: paymentDetails.upiProvider || 'Razorpay Gateway',
      transactionId: paymentDetails.transactionId || `pay_rzp_${Date.now()}`
    });
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fullReason = `${selectedReason}${cancelComments.trim() ? ` - ${cancelComments.trim()}` : ''}`;
      const res = await api.put(`/orders/track/${successOrder.orderId}/cancel`, { cancellationReason: fullReason });
      if (res.data.success) {
        setSuccessOrder(res.data.data);
        setCancellationModalOpen(false);
      } else {
        setError(res.data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error cancelling order.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderId = () => {
    if (successOrder?.orderId) {
      navigator.clipboard.writeText(successOrder.orderId);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ORDER CONFIRMED SCREEN
  // ─────────────────────────────────────────────────────────────
  if (successOrder) {
    const isCancelled = successOrder.status === 'cancelled';
    const isPaid = successOrder.paymentStatus === 'paid';
    
    return (
      <div className="water-bg min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="pt-28 pb-20 px-4 sm:px-6 flex-1 flex items-center justify-center">
          <div 
            className="teal-panel max-w-xl w-full rounded-3xl p-6 sm:p-8 text-center animate-fade-in shadow-2xl relative overflow-hidden" 
            style={{ borderColor: isCancelled ? 'rgba(239, 68, 68, 0.3)' : 'rgba(20, 184, 166, 0.4)' }}
          >
            {/* Top decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-cyan-400/20 blur-2xl rounded-full" />

            {/* Icon */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
              isCancelled 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
            }`}>
              {isCancelled ? (
                <FiAlertCircle size={44} className="animate-pulse" />
              ) : (
                <FiCheckCircle size={44} className="animate-bounce" />
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mb-1">
              {isCancelled ? 'Order Cancelled' : 'Order Confirmed! 🎉'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mb-4">
              {isCancelled 
                ? 'This order has been cancelled.' 
                : 'Thank you for choosing Shambhavi Water Services.'}
            </p>

            {/* Order ID Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-300 font-mono text-sm mb-6 shadow-inner">
              <span>Order ID: <strong>{successOrder.orderId}</strong></span>
              <button 
                onClick={handleCopyOrderId}
                className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
                title="Copy Order ID"
              >
                {copiedOrderId ? <FiCheck size={14} className="text-green-400" /> : <FiCopy size={14} />}
              </button>
            </div>

            {/* Order Summary Box */}
            <div className="glass-dark border border-white/10 rounded-2xl p-4 sm:p-5 text-left space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-slate-400">Items Ordered</span>
                <span className="text-white font-bold">{successOrder.quantity} × {successOrder.waterType}</span>
              </div>

              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-slate-400">Total Amount</span>
                <span className="text-cyan-400 font-black text-base">₹{successOrder.totalAmount}</span>
              </div>

              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-slate-400">Payment Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isPaid 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : successOrder.paymentScreenshot
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isPaid 
                    ? 'PAID & VERIFIED' 
                    : successOrder.paymentScreenshot 
                      ? 'PROOF ATTACHED (PENDING VERIFICATION)' 
                      : 'CASH ON DELIVERY'}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-slate-400">Payment Method</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <FiShield className="text-cyan-400" size={13} />
                  {successOrder.upiProvider 
                    ? `${successOrder.upiProvider}` 
                    : (successOrder.paymentMethod === 'cash' ? 'Cash on Delivery' : (successOrder.paymentMethod ? String(successOrder.paymentMethod).toUpperCase() : 'ONLINE'))}
                </span>
              </div>

              {successOrder.transactionId && (
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-400">Transaction Ref / UTR</span>
                  <span className="text-slate-300 font-mono font-medium">{successOrder.transactionId}</span>
                </div>
              )}

              {successOrder.paymentScreenshot && (
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-400">Payment Screenshot</span>
                  <div className="flex items-center gap-2">
                    <img 
                      src={successOrder.paymentScreenshot} 
                      alt="Receipt Proof" 
                      className="w-8 h-8 object-cover rounded-lg border border-cyan-400/40"
                    />
                    <span className="text-cyan-400 font-bold text-[11px]">Attached ✓</span>
                  </div>
                </div>
              )}

              <div className="pt-1 flex items-start gap-2 text-xs text-slate-300">
                <FiMapPin className="text-cyan-400 mt-0.5 flex-shrink-0" size={14} />
                <span>
                  Delivery to: <strong>{successOrder.address}, {successOrder.area}</strong>
                </span>
              </div>
            </div>

            {/* Delivery timeline note */}
            {!isCancelled && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-300 bg-cyan-950/40 border border-cyan-500/20 rounded-xl p-3 mb-6">
                <FiClock className="text-cyan-400 animate-spin" size={16} />
                <span>Estimated Delivery: <strong>Within 2-4 hours</strong></span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/track/${successOrder.orderId}`)} 
                className="btn-primary w-full py-3.5 rounded-xl font-black tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-cyan-500/30"
              >
                Track My Order in Real-Time
              </button>

              <button
                onClick={() => {
                  setSuccessOrder(null);
                  navigate('/order');
                }}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-white/5"
              >
                Place Another Order
              </button>

              {!isCancelled && (
                <button 
                  onClick={() => setCancellationModalOpen(true)} 
                  className="btn-outline w-full py-3 rounded-xl text-xs font-bold border-red-500/35 text-red-400 hover:bg-red-500/10 hover:border-red-400 cursor-pointer transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cancellation Modal */}
        {cancellationModalOpen && (
          <div className="modal-overlay" onClick={() => setCancellationModalOpen(false)}>
            <div className="modal-box max-w-md p-6 relative text-left" onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-black text-lg uppercase tracking-wide mb-4">Cancel Your Order</h3>
              
              <p className="text-slate-400 text-xs mb-4">Please select a reason for cancellation.</p>
              
              <form onSubmit={handleCancelOrder} className="space-y-4">
                <div className="space-y-2">
                  {[
                    'Order is delayed / late',
                    'Poor water quality / service experience',
                    'Changed my mind / no longer needed',
                    'Ordered incorrect item / quantity',
                    'Other reason'
                  ].map(r => (
                    <label key={r} className="flex items-center gap-3 text-slate-300 text-xs font-semibold cursor-pointer p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                      <input 
                        type="radio" 
                        name="cancel_reason" 
                        value={r}
                        checked={selectedReason === r}
                        onChange={() => setSelectedReason(r)}
                        className="accent-cyan-400"
                      />
                      {r}
                    </label>
                  ))}
                </div>

                <div>
                  <label className="input-label text-[10px] uppercase">Additional Comments (Optional)</label>
                  <textarea 
                    rows={2}
                    className="input-field py-2 text-xs resize-none text-white bg-slate-950/50"
                    placeholder="Tell us more..."
                    value={cancelComments}
                    onChange={e => setCancelComments(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setCancellationModalOpen(false)} 
                    className="flex-1 btn-outline py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 border-none text-white cursor-pointer"
                  >
                    {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN CHECKOUT FORM
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="water-bg min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-semibold cursor-pointer"
          >
            <FiArrowLeft size={16} /> Go Back
          </button>

          <div className="text-center mb-10">
            <div className="label-tag rounded-full border-cyan-400/40 text-cyan-400 text-xs mb-3 inline-block">SECURE CHECKOUT</div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wide">Place Your Order</h1>
            <p className="text-slate-400 text-sm mt-2">Get pure, mineral-rich water delivered straight to your door step.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm text-center font-semibold animate-fade-in flex items-center justify-center gap-2">
              <FiAlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Left Column: Forms */}
            <div className="md:col-span-3 space-y-6">
              
              {/* User Details */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <h2 className="text-white font-bold text-lg uppercase tracking-wide border-b border-white/5 pb-2">1. Delivery Details</h2>
                
                {fetchingDetails ? (
                  <p className="text-slate-400 text-xs animate-pulse">Pre-filling customer details...</p>
                ) : (
                  <>
                    <div>
                      <label className="input-label">Full Name</label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" size={16} />
                        <input
                          type="text"
                          required
                          className="input-field pl-10"
                          placeholder="e.g. Rahul Sharma"
                          value={userDetails.name}
                          onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Mobile Number</label>
                        <div className="relative">
                          <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" size={16} />
                          <input
                            type="tel"
                            required
                            className="input-field pl-10"
                            placeholder="10 digit mobile"
                            value={userDetails.phone}
                            onChange={e => setUserDetails({ ...userDetails, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="input-label">Email Address</label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" size={16} />
                          <input
                            type="email"
                            required
                            className="input-field pl-10"
                            placeholder="email@example.com"
                            value={userDetails.email}
                            onChange={e => setUserDetails({ ...userDetails, email: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="input-label">Delivery Area</label>
                        <div className="relative">
                          <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" size={16} />
                          <select
                            className="input-field pl-10"
                            value={userDetails.area}
                            onChange={e => setUserDetails({ ...userDetails, area: e.target.value })}
                          >
                            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="input-label">Complete Delivery Address</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-4 text-cyan-400/60" size={16} />
                        <textarea
                          required
                          rows={3}
                          className="input-field pl-10 pt-3 resize-none"
                          placeholder="Flat/House No, Building, Street, Landmark"
                          value={userDetails.address}
                          onChange={e => setUserDetails({ ...userDetails, address: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Payment Details */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h2 className="text-white font-bold text-lg uppercase tracking-wide">2. Payment Method</h2>
                  <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                    <FiShield size={12} /> Instant Confirmation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                      paymentMethod === 'upi'
                        ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-cyan-500/30'
                    }`}
                  >
                    <span className="text-sm block">⚡ Direct UPI / QR</span>
                    <span className="text-[10px] text-cyan-300 font-normal mt-0.5 block">GPay, PhonePe, Paytm QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'razorpay'
                        ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-cyan-500/30'
                    }`}
                  >
                    <span className="text-sm block">💳 Razorpay Online</span>
                    <span className="text-[10px] text-cyan-300 font-normal mt-0.5 block">Cards, NetBanking, All UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-cyan-500/30'
                    }`}
                  >
                    <span className="text-sm block">💵 Cash on Delivery</span>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">Pay upon delivery</span>
                  </button>
                </div>

                {/* Direct App Launchers Tray for UPI */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-3 pt-3 border-t border-white/5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-300 text-xs font-semibold">
                        Choose your preferred UPI app to pay <strong className="text-cyan-400">₹{grandTotal}</strong>:
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (validateDeliveryDetails()) setIsUpiModalOpen(true);
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                      >
                        Open QR Scanner →
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'gpay', name: 'Google Pay', label: 'GPay', color: 'bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25' },
                        { id: 'phonepe', name: 'PhonePe', label: 'PhonePe', color: 'bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25' },
                        { id: 'paytm', name: 'Paytm', label: 'Paytm', color: 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25' },
                        { id: 'other_upi', name: 'Other UPI', label: 'BHIM/QR', color: 'bg-teal-500/15 border-teal-500/30 text-teal-300 hover:bg-teal-500/25' }
                      ].map(app => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            if (validateDeliveryDetails()) {
                              setIsUpiModalOpen(true);
                            }
                          }}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${app.color} hover:scale-105`}
                        >
                          <span className="font-black text-sm">{app.label}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Scan & Pay</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Razorpay Gateway Tray */}
                {paymentMethod === 'razorpay' && (
                  <div className="space-y-3 pt-3 border-t border-white/5 animate-fade-in">
                    <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-400">
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
                          if (validateDeliveryDetails()) setIsRazorpayModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-500/20"
                      >
                        Launch →
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Cart & Summary */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Product Selection */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <h2 className="text-white font-bold text-lg uppercase tracking-wide border-b border-white/5 pb-2">3. Items</h2>

                <div>
                  <label className="input-label">Water Type</label>
                  <select
                    className="input-field"
                    value={waterType}
                    onChange={e => setWaterType(e.target.value)}
                  >
                    {Object.entries(prices).map(([name, price]) => (
                      <option key={name} value={name}>{name} — ₹{price}/unit</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <FiMinus size={16} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className="input-field text-center font-bold text-lg"
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                <h2 className="text-white font-bold text-lg uppercase tracking-wide border-b border-white/5 pb-2">Summary</h2>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>{quantity} × {waterType}</span>
                    <span className="text-white font-medium">₹{itemTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Delivery Charge</span>
                    <span className="text-white font-medium">₹{deliveryCharge}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between text-base font-black text-white">
                    <span>Total Amount</span>
                    <span className="text-cyan-400 text-xl">₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 rounded-xl font-black text-sm uppercase tracking-wide transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-4 shadow-lg hover:shadow-cyan-500/30"
                >
                  {loading ? (
                    'Processing Order...'
                  ) : paymentMethod === 'upi' ? (
                    <>
                      <FiShoppingBag size={18} />
                      Pay ₹{grandTotal} via Direct UPI / QR
                    </>
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <FiCreditCard size={18} />
                      Pay ₹{grandTotal} via Razorpay Gateway
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={18} />
                      Confirm Cash on Delivery
                    </>
                  )}
                </button>
              </div>

            </div>

          </form>

        </div>
      </div>

      {/* Modern UPI Payment Modal */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        amount={grandTotal}
        merchantVpa="sushmayadavaditya0107@oksbi"
        merchantName="Sushma Yadav"
        onPaymentSuccess={handleUpiPaymentSuccess}
        onPaymentFailure={(err) => setError(err || 'UPI Payment could not be completed')}
      />

      {/* Interactive Razorpay Gateway Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        amount={grandTotal}
        customerDetails={userDetails}
        onPaymentSuccess={handleRazorpayPaymentSuccess}
        onPaymentFailure={(err) => setError(err || 'Razorpay payment was cancelled or could not be completed')}
      />

      <Footer />
    </div>
  );
}
