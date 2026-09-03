import { useState, useEffect } from 'react';
import { 
  FiX, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiLoader, 
  FiSmartphone, 
  FiShield, 
  FiExternalLink, 
  FiCopy, 
  FiCheck,
  FiUpload,
  FiTrash2,
  FiRefreshCw,
  FiImage,
  FiMaximize2
} from 'react-icons/fi';

const QrIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
    <path d="M7 7h.01M17 7h.01M7 17h.01"></path>
  </svg>
);

// UPI Brand SVG Icons
const GPayIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
    <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C33.7 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
    <path fill="#34A853" d="m6.3 14.7 6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
    <path fill="#FBBC05" d="M24 44c5.2 0 10-1.9 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-2.7-11.3-8l-6.6 5.1C9.6 39.5 16.2 44 24 44z"/>
    <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.4l6.3 5.2C41.7 34.6 44 28.7 44 24c0-1.2-.1-2.4-.4-3.5z"/>
  </svg>
);

const PhonePeIcon = () => (
  <div className="w-6 h-6 rounded-lg bg-[#5f259f] flex items-center justify-center shadow-md shadow-purple-500/30">
    <span className="text-white font-black text-sm leading-none font-serif select-none">पे</span>
  </div>
);

const PaytmIcon = () => (
  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00baf2] to-[#002970] flex items-center justify-center shadow-md shadow-sky-500/30">
    <span className="text-white font-black text-[9px] tracking-tighter select-none">Paytm</span>
  </div>
);

const UPI_APPS = [
  {
    id: 'gpay',
    name: 'Google Pay',
    shortName: 'GPay',
    icon: GPayIcon,
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-500/40 hover:border-blue-400',
    badge: 'Popular',
    scheme: 'gpay'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    shortName: 'PhonePe',
    icon: PhonePeIcon,
    color: 'from-purple-600 to-violet-800',
    border: 'border-purple-500/40 hover:border-purple-400',
    badge: 'Fast',
    scheme: 'phonepe'
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    shortName: 'Paytm',
    icon: PaytmIcon,
    color: 'from-sky-500 to-blue-700',
    border: 'border-sky-500/40 hover:border-sky-400',
    badge: 'Wallet/UPI',
    scheme: 'paytmmp'
  },
  {
    id: 'any_upi',
    name: 'Any UPI App',
    shortName: 'Other UPI',
    icon: QrIcon,
    color: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    badge: 'BHIM/Bank',
    scheme: 'upi'
  }
];

export default function UpiPaymentModal({
  isOpen,
  onClose,
  amount = 60,
  merchantVpa = 'sushmayadavaditya0107@oksbi',
  merchantName = 'Sushma Yadav',
  onPaymentSuccess,
  onPaymentFailure
}) {
  // Step flow: 'scan_and_pay' | 'verifying' | 'success' | 'try_again'
  const [step, setStep] = useState('scan_and_pay');
  const [selectedApp, setSelectedApp] = useState(null);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isQrZoomOpen, setIsQrZoomOpen] = useState(false);
  
  // Payment Proof Screenshot States
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Standard UPI URI with prefilled amount
  const encodedMerchant = encodeURIComponent('Sushma Yadav');
  const note = `Shambhavi Water Order - ₹${amount}`;
  const encodedNote = encodeURIComponent(note);
  const standardUpiUrl = `upi://pay?pa=${merchantVpa}&pn=${encodedMerchant}&am=${amount}&cu=INR&tn=${encodedNote}`;

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('scan_and_pay');
      setSelectedApp(null);
      setCopiedVpa(false);
      setScreenshot(null);
      setScreenshotPreview(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build deep link for specific app
  const getAppDeepLink = (appId) => {
    if (appId === 'gpay') {
      return `gpay://upi/pay?pa=${merchantVpa}&pn=${encodedMerchant}&am=${amount}&cu=INR&tn=${encodedNote}`;
    }
    if (appId === 'phonepe') {
      return `phonepe://pay?pa=${merchantVpa}&pn=${encodedMerchant}&am=${amount}&cu=INR&tn=${encodedNote}`;
    }
    if (appId === 'paytm') {
      return `paytmmp://pay?pa=${merchantVpa}&pn=${encodedMerchant}&am=${amount}&cu=INR&tn=${encodedNote}`;
    }
    return standardUpiUrl;
  };

  // Launch native UPI app directly with amount
  const handleLaunchApp = (app) => {
    setSelectedApp(app);
    setErrorMessage('');
    const deepLink = getAppDeepLink(app.id);

    try {
      window.location.href = deepLink;
    } catch (e) {
      console.warn('App launch handled:', e);
    }

    setTimeout(() => {
      try {
        const link = document.createElement('a');
        link.href = standardUpiUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {}
    }, 600);
  };

  // File upload handler
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Screenshot file size must be less than 5MB');
        return;
      }
      setErrorMessage('');
      setScreenshotPreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  // Submit payment & verify
  const handleSubmitPayment = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage('');

    // Require screenshot to confirm payment
    if (!screenshot) {
      setErrorMessage('⚠️ Please upload your payment screenshot after completing payment in your UPI app.');
      setStep('try_again');
      return;
    }

    setStep('verifying');
    const finalTxnId = `UPI-PROOF-${Date.now().toString(36).toUpperCase()}`;

    setTimeout(() => {
      setStep('success');

      setTimeout(() => {
        onPaymentSuccess?.({
          paymentMethod: 'upi',
          upiProvider: selectedApp?.name || 'Google Pay QR',
          transactionId: finalTxnId,
          amount,
          paymentScreenshot: screenshot || '',
          paymentStatus: 'pending' // Pending shop owner verification
        });
        onClose();
      }, 1400);
    }, 1200);
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(merchantVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden text-white flex flex-col max-h-[94vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <QrIcon size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                UPI Payment & Scanner
              </h3>
              <p className="text-[11px] text-cyan-400 font-semibold">Sushma Yadav • Shambhavi Water</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-black text-xs">
              ₹{amount}
            </div>
            {step !== 'verifying' && step !== 'success' && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* STEP: SUCCESS */}
          {step === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(52,211,153,0.5)] animate-bounce">
                <FiCheckCircle size={44} />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white">Payment Screenshot Received! 🎉</h4>
                <p className="text-xs text-emerald-400 font-semibold">
                  Payment proof of ₹{amount} registered successfully
                </p>
              </div>
              <p className="text-xs text-slate-400 animate-pulse">
                Redirecting to your Order Confirmed receipt...
              </p>
            </div>
          )}

          {/* STEP: VERIFYING */}
          {step === 'verifying' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-fade-in text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiShield className="text-cyan-400 animate-pulse" size={22} />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Saving Payment Receipt...</h4>
                <p className="text-xs text-slate-400">Attaching your screenshot proof and creating order...</p>
              </div>
            </div>
          )}

          {/* STEP: TRY AGAIN (Payment Not Done / Incomplete) */}
          {step === 'try_again' && (
            <div className="py-4 space-y-4 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                <FiAlertCircle size={36} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Payment Not Completed Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {errorMessage || `Payment of ₹${amount} was not confirmed. Please open your UPI app, complete the payment, and upload the screenshot.`}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleLaunchApp(selectedApp || UPI_APPS[0])}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  <FiExternalLink size={16} />
                  Re-Open {selectedApp?.name || 'Google Pay'} to Pay ₹{amount}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('scan_and_pay')}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-cyan-500/30"
                >
                  <FiRefreshCw size={15} />
                  Scan QR / Upload Screenshot & Try Again
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  Cancel / Choose Cash on Delivery
                </button>
              </div>
            </div>
          )}

          {/* STEP: MAIN SCANNER & PAYMENT FLOW */}
          {step === 'scan_and_pay' && (
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Official Google Pay Merchant QR Scanner Card */}
              <div className="bg-white text-slate-900 rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-cyan-400/40 relative overflow-hidden text-center">
                {/* User Profile Header */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm flex-shrink-0">
                    <img 
                      src="/sushma-gpay-qr.png" 
                      alt="Sushma Yadav" 
                      className="w-full h-full object-cover object-top scale-150"
                      onError={(e) => { e.target.src = "/favicon.svg"; }}
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-base text-slate-900 leading-tight">Sushma Yadav</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Shambhavi Water Services</p>
                  </div>
                </div>

                {/* QR Image with Click to Zoom */}
                <div 
                  onClick={() => setIsQrZoomOpen(true)}
                  className="relative max-w-[210px] mx-auto rounded-2xl overflow-hidden shadow-inner border border-slate-200 p-1 bg-white group cursor-pointer"
                  title="Click to Zoom / Enlarge QR Scanner"
                >
                  <img 
                    src="/sushma-gpay-qr.png" 
                    alt="Sushma Yadav Google Pay Scanner" 
                    className="w-full h-auto object-contain rounded-xl group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity text-white text-xs font-bold gap-1.5">
                    <FiMaximize2 size={16} />
                    <span>Click to Zoom</span>
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-xs font-semibold text-slate-600">
                    Scan to pay <strong className="text-cyan-600 text-sm font-black">₹{amount}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsQrZoomOpen(true)}
                    className="text-[11px] text-cyan-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FiMaximize2 size={12} /> Enlarge QR
                  </button>
                </div>

                {/* Bank Banner */}
                <div className="mt-2.5 py-1.5 px-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700 max-w-xs mx-auto">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">
                      SBI
                    </span>
                    <span>State Bank of India (oksbi)</span>
                  </div>
                  <span className="text-slate-400 font-bold">›</span>
                </div>

                {/* UPI ID with Copy */}
                <div className="mt-2 flex items-center justify-center gap-2 text-xs font-mono text-slate-700">
                  <span>UPI ID: <strong>{merchantVpa}</strong></span>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="p-1 text-cyan-600 hover:text-cyan-700 cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copiedVpa ? <FiCheck size={14} className="text-green-600" /> : <FiCopy size={14} />}
                  </button>
                </div>
              </div>

              {/* Direct App Launchers (Opens App Directly with Preset Amount) */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Or Click App to Pay ₹{amount} Directly:</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Opens with prefilled amount</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {UPI_APPS.map((app) => {
                    const Icon = app.icon;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleLaunchApp(app)}
                        className={`p-2.5 rounded-xl bg-slate-800/90 border ${app.border} flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.03] hover:bg-slate-800 cursor-pointer group`}
                      >
                        <Icon />
                        <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                          {app.shortName}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">
                          Open App →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Screenshot to Confirm */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <FiShield size={14} /> Upload Payment Screenshot
                  </h4>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Mandatory
                  </span>
                </div>

                {/* Screenshot Dropzone */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Screenshot of Successful Payment Screen <span className="text-red-400">*</span>
                  </label>

                  {screenshotPreview ? (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img 
                          src={screenshotPreview} 
                          alt="Screenshot" 
                          className="w-12 h-12 object-cover rounded-lg border border-white/10 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 truncate">
                            <FiCheckCircle size={13} /> Screenshot Attached
                          </p>
                          <p className="text-[10px] text-slate-400">Payment receipt ready to confirm</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer transition-colors"
                        title="Remove Screenshot"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-xl p-4 text-center bg-slate-900/60 cursor-pointer group transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <FiUpload className="text-cyan-400 group-hover:scale-110 transition-transform" size={20} />
                        <p className="text-xs font-bold text-white group-hover:text-cyan-300">
                          Click to Upload Payment Screenshot
                        </p>
                        <p className="text-[10px] text-slate-400">Supports JPG, PNG, Phone screenshots (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold flex items-start gap-2 animate-fade-in">
                    <FiAlertCircle className="flex-shrink-0 mt-0.5" size={15} />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-500/30"
                >
                  <FiCheckCircle size={18} />
                  Confirm Order & Submit Proof (₹{amount})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('Please complete the payment in your UPI app, then attach your payment screenshot.');
                    setStep('try_again');
                  }}
                  className="w-full py-2.5 text-xs text-slate-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer text-center"
                >
                  Payment not completed or failed? Click here for Try Again
                </button>
              </div>
            </form>
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
