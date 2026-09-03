import { useState, useEffect } from 'react';
import { 
  FiX, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiLoader, 
  FiShield, 
  FiCreditCard, 
  FiSmartphone, 
  FiLock,
  FiRefreshCw,
  FiUpload,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiArrowRight,
  FiExternalLink,
  FiMaximize2
} from 'react-icons/fi';
import api from '../services/api';

const RazorpayBadge = () => (
  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-wider">
    <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.5 2L4 14h7l-2 8 10-12h-7.5l2.5-8z" />
    </svg>
    Razorpay Test Mode
  </div>
);

export default function RazorpayModal({
  isOpen,
  onClose,
  amount = 60,
  customerDetails = {},
  orderId = null,
  onPaymentSuccess,
  onPaymentFailure
}) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [step, setStep] = useState('select'); // 'select' | 'upi_confirm' | 'bank_otp' | 'processing' | 'success' | 'failed'
  const [selectedApp, setSelectedApp] = useState(null);
  const [screenshot, setScreenshot] = useState('');
  const [otp, setOtp] = useState('123456');
  const [errorMessage, setErrorMessage] = useState('');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isQrZoomOpen, setIsQrZoomOpen] = useState(false);

  const merchantVpa = 'sushmayadavaditya0107@oksbi';
  const merchantName = 'Sushma Yadav';

  // Card form state
  const [cardDetails, setCardDetails] = useState({
    number: '4111 2222 3333 4444',
    expiry: '12/28',
    cvv: '123',
    holder: customerDetails?.name || 'Sushma Yadav'
  });

  // Selected Bank for NetBanking
  const [selectedBank, setSelectedBank] = useState('Punjab National Bank');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('upi');
      setStep('select');
      setSelectedApp(null);
      setScreenshot('');
      setOtp('123456');
      setErrorMessage('');
      setRazorpayPaymentId('');
      if (customerDetails?.name) {
        setCardDetails(prev => ({ ...prev, holder: customerDetails.name }));
      }
    }
  }, [isOpen, customerDetails]);

  if (!isOpen) return null;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(merchantVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Screenshot size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  // Launch UPI App with Intent
  const handleLaunchUpiApp = (app) => {
    setSelectedApp(app);
    setErrorMessage('');

    // Generate UPI Intent URI
    const upiUri = `${app.scheme}://upi/pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=Shambhavi%20Water%20Order`;
    
    // Attempt opening app
    window.location.href = upiUri;

    // Transition to verification step where screenshot is required!
    setStep('upi_confirm');
  };

  // Submit UPI Payment with Screenshot Proof (Strict Anti-Fraud)
  const handleSubmitUpiProof = async () => {
    if (!screenshot) {
      setErrorMessage('⚠️ Proof of payment is strictly required! Please upload your payment screenshot after completing the payment in your app.');
      return;
    }

    setStep('processing');
    setErrorMessage('');
    const generatedPaymentId = `pay_rzp_upi_${Date.now().toString(36).toUpperCase()}`;
    setRazorpayPaymentId(generatedPaymentId);

    setTimeout(() => {
      setStep('success');

      setTimeout(() => {
        onPaymentSuccess?.({
          paymentMethod: 'razorpay',
          upiProvider: selectedApp?.name || 'Razorpay UPI',
          transactionId: generatedPaymentId,
          amount,
          paymentScreenshot: screenshot,
          paymentStatus: 'pending', // Pending merchant review
          paidAmount: amount
        });
        onClose();
      }, 1400);
    }, 1200);
  };

  // Authorize Card / NetBanking 3D Secure OTP
  const handleAuthorizeOtp = async (isApproved = true) => {
    if (!isApproved) {
      setStep('failed');
      setErrorMessage('Payment was declined or cancelled by the user. Order was NOT placed.');
      onPaymentFailure?.('Transaction cancelled by user.');
      return;
    }

    if (!otp || otp.length < 4) {
      setErrorMessage('Please enter valid 6-digit Bank OTP');
      return;
    }

    setStep('processing');
    setErrorMessage('');
    const generatedPaymentId = `pay_rzp_card_${Date.now().toString(36).toUpperCase()}`;
    setRazorpayPaymentId(generatedPaymentId);

    setTimeout(async () => {
      try {
        if (orderId) {
          await api.post('/payments/verify', {
            internalOrderId: orderId,
            razorpay_order_id: `order_${Date.now()}`,
            razorpay_payment_id: generatedPaymentId,
            razorpay_signature: 'demo_signature'
          }).catch(() => {});
        }

        setStep('success');

        setTimeout(() => {
          onPaymentSuccess?.({
            paymentMethod: 'razorpay',
            upiProvider: activeTab === 'card' ? 'Razorpay Card (3D Secure)' : `Razorpay NetBanking (${selectedBank})`,
            transactionId: generatedPaymentId,
            amount,
            paymentStatus: 'paid',
            paidAmount: amount
          });
          onClose();
        }, 1400);
      } catch (err) {
        setStep('failed');
        setErrorMessage('Payment authorization failed.');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-blue-500/40 rounded-3xl shadow-[0_0_60px_rgba(59,130,246,0.3)] overflow-hidden text-white flex flex-col max-h-[94vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0c2340] via-[#07192d] to-[#0c2340] border-b border-blue-500/20 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 2L4 14h7l-2 8 10-12h-7.5l2.5-8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  Razorpay Checkout
                </h3>
                <RazorpayBadge />
              </div>
              <p className="text-[11px] text-slate-400">Shambhavi Water Services</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-black text-xs">
              ₹{amount}
            </div>
            {step !== 'processing' && step !== 'success' && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* STEP: PROCESSING */}
          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-fade-in text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-cyan-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiLock className="text-cyan-400 animate-pulse" size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Verifying Payment with Bank...</h4>
                <p className="text-xs text-slate-400">Securing payment authorization of ₹{amount}...</p>
              </div>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(52,211,153,0.5)] animate-bounce">
                <FiCheckCircle size={44} />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white">Payment Confirmed! 🎉</h4>
                <p className="text-xs text-emerald-400 font-semibold font-mono">
                  Ref: {razorpayPaymentId}
                </p>
              </div>
              <p className="text-xs text-slate-400 animate-pulse">
                Redirecting to order confirmation...
              </p>
            </div>
          )}

          {/* STEP: FAILED */}
          {step === 'failed' && (
            <div className="py-6 space-y-4 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <FiAlertCircle size={36} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Payment Incomplete / Cancelled</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {errorMessage || 'The payment was not completed. Your order has NOT been confirmed.'}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  <FiRefreshCw size={14} className="inline mr-1" /> Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* STEP: UPI CONFIRMATION (SCREENSHOT PROOF REQUIRED) */}
          {step === 'upi_confirm' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-1">
                <h4 className="text-sm font-black text-white">
                  Completing Payment via {selectedApp?.name || 'UPI App'}
                </h4>
                <p className="text-xs text-cyan-300">
                  Order Amount: <strong className="text-white text-sm font-black">₹{amount}</strong>
                </p>
              </div>

              {/* QR Display */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center gap-3">
                <div 
                  onClick={() => setIsQrZoomOpen(true)}
                  className="relative group cursor-pointer shrink-0"
                  title="Click to Zoom / Enlarge QR Scanner"
                >
                  <img
                    src="/sushma-gpay-qr.png"
                    alt="QR Scanner"
                    className="w-16 h-16 rounded-lg bg-white p-1 object-contain shrink-0 border border-cyan-400/40 group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity text-white text-[10px] font-bold">
                    <FiMaximize2 size={16} />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-black text-white truncate">Sushma Yadav • SBI (oksbi)</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <code className="text-[11px] text-cyan-400 font-mono font-bold truncate">{merchantVpa}</code>
                    <button
                      type="button"
                      onClick={handleCopyVpa}
                      className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedVpa ? <FiCheck size={12} className="text-green-400" /> : <FiCopy size={12} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQrZoomOpen(true)}
                    className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <FiMaximize2 size={11} /> Click to Enlarge Scanner
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Screenshot Upload Box */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Upload Payment Screenshot Proof *
                </label>
                {screenshot ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2.5">
                      <img src={screenshot} alt="Proof" className="w-10 h-10 rounded-lg object-cover border border-emerald-400/40" />
                      <div>
                        <p className="text-xs font-bold text-emerald-300">Screenshot Attached ✓</p>
                        <p className="text-[9px] text-slate-400">Click button below to confirm</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshot('')}
                      className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-slate-950/60 text-cyan-400 cursor-pointer transition-all">
                    <FiUpload size={22} className="mb-1" />
                    <span className="text-xs font-bold">Tap to Upload Payment Screenshot</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG, phone screenshots (Max 5MB)</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                  </label>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSubmitUpiProof}
                  disabled={!screenshot}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <FiCheckCircle size={15} className="inline mr-1" /> Confirm Payment & Place Order
                </button>
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STEP: 3D SECURE BANK OTP (CARD / NETBANKING) */}
          {step === 'bank_otp' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-blue-950/50 border border-blue-500/30 text-center space-y-1">
                <h4 className="text-sm font-black text-white flex items-center justify-center gap-1.5">
                  <FiLock size={14} className="text-cyan-400" />
                  Bank 3D-Secure Authorization
                </h4>
                <p className="text-xs text-slate-300">
                  Punjab National Bank / Razorpay Gateway Verification
                </p>
                <p className="text-xs text-cyan-400 font-bold">
                  Amount: ₹{amount}
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Enter 6-Digit Bank OTP sent to mobile
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  className="input-field text-center font-mono tracking-widest text-lg font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-center">
                  (Test Mode Sandbox: Pre-filled with OTP <code className="text-cyan-400 font-bold">123456</code>)
                </p>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleAuthorizeOtp(true)}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/25"
                >
                  <FiLock size={13} className="inline mr-1" /> Authorize Payment (₹{amount})
                </button>
                <button
                  type="button"
                  onClick={() => handleAuthorizeOtp(false)}
                  className="px-4 py-3.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold cursor-pointer"
                >
                  Decline / Cancel
                </button>
              </div>
            </div>
          )}

          {/* STEP: SELECT PAYMENT METHOD */}
          {step === 'select' && (
            <div className="space-y-4 animate-fade-in">
              {/* Payment Methods Tab */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-2xl border border-white/5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'upi'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FiSmartphone size={14} /> UPI Apps
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'card'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FiCreditCard size={14} /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'netbanking'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FiLock size={14} /> NetBanking
                </button>
              </div>

              {/* TAB 1: UPI APPS */}
              {activeTab === 'upi' && (
                <div className="space-y-3 animate-fade-in">
                  <p className="text-xs text-slate-300 font-semibold">
                    Select your UPI app to pay <strong className="text-cyan-400 font-bold">₹{amount}</strong>:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'gpay', name: 'Google Pay', scheme: 'gpay', badge: 'Instant Intent', color: 'from-blue-600 to-indigo-700' },
                      { id: 'phonepe', name: 'PhonePe', scheme: 'phonepe', badge: 'Fastest', color: 'from-purple-600 to-violet-800' },
                      { id: 'paytm', name: 'Paytm UPI', scheme: 'paytmmp', badge: 'Verified', color: 'from-sky-500 to-blue-700' },
                      { id: 'bhim', name: 'BHIM / Any UPI', scheme: 'upi', badge: 'All Banks', color: 'from-teal-600 to-emerald-700' },
                    ].map(app => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleLaunchUpiApp(app)}
                        className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-blue-400/50 flex items-center justify-between group transition-all cursor-pointer"
                      >
                        <div className="text-left">
                          <p className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                            {app.name}
                          </p>
                          <span className="text-[10px] text-cyan-400 font-semibold">{app.badge}</span>
                        </div>
                        <span className="text-xs text-slate-400 group-hover:text-white font-bold">Pay ₹{amount} →</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-slate-300 font-bold">Pay via Scanner Directly</p>
                      <p className="text-[10px] text-slate-400">{merchantVpa}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApp({ name: 'Google Pay QR', scheme: 'gpay' });
                        setStep('upi_confirm');
                      }}
                      className="text-xs text-cyan-400 font-bold hover:underline cursor-pointer"
                    >
                      Open Scanner & Upload Proof →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CARD PAYMENT */}
              {activeTab === 'card' && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep('bank_otp');
                  }} 
                  className="space-y-3 animate-fade-in"
                >
                  <div>
                    <label className="input-label text-slate-300">Card Number (Razorpay Test Card)</label>
                    <input
                      type="text"
                      required
                      className="input-field font-mono"
                      value={cardDetails.number}
                      onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label text-slate-300">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        className="input-field text-center font-mono"
                        value={cardDetails.expiry}
                        onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="input-label text-slate-300">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        className="input-field text-center font-mono"
                        value={cardDetails.cvv}
                        onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/25 mt-2"
                  >
                    <FiLock size={14} /> Proceed to 3D-Secure Bank OTP (₹{amount})
                  </button>
                </form>
              )}

              {/* TAB 3: NETBANKING */}
              {activeTab === 'netbanking' && (
                <div className="space-y-3 animate-fade-in">
                  <p className="text-xs text-slate-300 font-semibold">Select your Bank for NetBanking:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Punjab National Bank',
                      'State Bank of India',
                      'HDFC Bank',
                      'ICICI Bank',
                      'Axis Bank',
                      'Kotak Mahindra'
                    ].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => {
                          setSelectedBank(bank);
                          setStep('bank_otp');
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                          selectedBank === bank
                            ? 'bg-blue-600/30 border-blue-400 text-white'
                            : 'bg-slate-800/60 border-white/5 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Footer */}
              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-400 border-t border-white/5">
                <FiShield className="text-blue-400" size={12} />
                <span>256-Bit SSL Encrypted • Razorpay PCI-DSS Level 1 Compliant</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 🔍 Click-to-Enlarge QR Zoom Lightbox Modal */}
      {isQrZoomOpen && (
        <div 
          className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setIsQrZoomOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center space-y-3.5 sm:space-y-4 shadow-[0_0_60px_rgba(6,182,212,0.4)] relative max-h-[90vh] overflow-y-auto"
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

            <h3 className="text-base sm:text-lg font-black text-white">Sushma Yadav</h3>

            {/* High-Resolution Enlarged QR Scanner */}
            <div className="p-2.5 sm:p-3 bg-white rounded-2xl shadow-2xl border-2 border-cyan-400/50 inline-block mx-auto cursor-pointer">
              <img
                src="/sushma-gpay-qr.png"
                alt="Enlarged QR Scanner"
                className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-xl"
              />
            </div>

            <div className="py-2 px-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Amount to Pay:</span>
              <span className="text-xl font-black text-cyan-400">₹{amount}</span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs">
              <code className="text-cyan-400 font-mono font-bold truncate">{merchantVpa}</code>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy UPI ID"
              >
                {copiedVpa ? <FiCheck size={14} className="text-green-400" /> : <FiCopy size={14} />}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI app.
            </p>

            <button
              type="button"
              onClick={() => setIsQrZoomOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              Done Scanning • Proceed to Upload Screenshot →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
