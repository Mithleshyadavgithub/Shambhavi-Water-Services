import { useState } from 'react';
import { FiCreditCard, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import UpiPaymentModal from '../../components/UpiPaymentModal';

const MY_PAYMENTS = [
  { paymentId: 'PAY00023', date: '2026-08-15', amount: 300, method: 'UPI', note: 'July payment' },
  { paymentId: 'PAY00019', date: '2026-08-01', amount: 400, method: 'Cash', note: 'June payment' },
  { paymentId: 'PAY00012', date: '2026-07-15', amount: 350, method: 'UPI', note: 'May payment' },
];

export default function MyPayments() {
  const [outstanding, setOutstanding] = useState(250);
  const [payments, setPayments] = useState(MY_PAYMENTS);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  const total = payments.reduce((s, p) => s + p.amount, 0);

  const handleUpiSuccess = (details) => {
    const newPayment = {
      paymentId: details.transactionId || `PAY000${payments.length + 10}`,
      date: new Date().toISOString().split('T')[0],
      amount: outstanding,
      method: details.upiProvider || 'UPI',
      note: 'Dues Clearance Payment',
      status: 'success'
    };

    setPayments([newPayment, ...payments]);
    setOutstanding(0);
    setPaymentSuccessMsg(`Payment of ₹${outstanding} successfully processed via ${details.upiProvider || 'UPI'}!`);
    setTimeout(() => setPaymentSuccessMsg(''), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="page-header">
        <h1 className="page-title">My Payments</h1>
        <p className="text-slate-400 text-sm mt-1">Your payment history and outstanding dues</p>
      </div>

      {paymentSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <FiCheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          {paymentSuccessMsg}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <FiCreditCard className="text-white" size={18} />
            </div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Paid</span>
          </div>
          <div className="stat-value text-emerald-400">₹{total.toLocaleString()}</div>
          <p className="text-slate-500 text-xs mt-1">{payments.length} transactions</p>
        </div>
        
        <div className="stat-card border border-amber-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FiAlertCircle className="text-white" size={18} />
            </div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Outstanding Due</span>
          </div>
          <div className="stat-value text-amber-400">₹{outstanding}</div>
          {outstanding > 0 ? (
            <button 
              onClick={() => setIsUpiModalOpen(true)}
              className="btn-primary mt-3 w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-cyan-500/30 transition-all"
            >
              Pay Now via UPI (GPay / PhonePe / Paytm)
            </button>
          ) : (
            <div className="mt-3 py-2 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              All Dues Cleared ✓
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-bold text-sm uppercase tracking-wide">Payment History</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Pay ID</th><th>Date</th><th>Amount</th><th>Method</th><th>Note</th><th>Status</th></tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.paymentId}>
                <td className="text-cyan-400 font-semibold text-xs font-mono">{p.paymentId}</td>
                <td className="text-slate-400 text-xs">{p.date}</td>
                <td className="text-emerald-400 font-bold">₹{p.amount}</td>
                <td className="uppercase text-xs text-slate-400 font-semibold">{p.method}</td>
                <td className="text-slate-400 text-xs">{p.note}</td>
                <td><span className="badge badge-paid">Success</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* UPI Payment Modal */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        amount={outstanding}
        merchantVpa="sushmayadavaditya0107@oksbi"
        merchantName="Sushma Yadav"
        onPaymentSuccess={handleUpiSuccess}
      />
    </div>
  );
}
