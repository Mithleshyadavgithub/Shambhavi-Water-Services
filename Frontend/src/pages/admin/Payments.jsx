import { useState } from 'react';
import { FiPlus, FiCreditCard, FiTrendingDown } from 'react-icons/fi';
import api from '../../services/api';

const DEMO_PAYMENTS = [
  { _id: '1', paymentId: 'PAY00001', customer: { name: 'Rahul Kumar', customerId: 'SWS0001' }, amount: 500, method: 'upi', status: 'success', date: new Date() },
  { _id: '2', paymentId: 'PAY00002', customer: { name: 'Priya Sharma', customerId: 'SWS0003' }, amount: 300, method: 'cash', status: 'success', date: new Date() },
  { _id: '3', paymentId: 'PAY00003', customer: { name: 'Kavita Gupta', customerId: 'SWS0006' }, amount: 200, method: 'upi', status: 'success', date: new Date(Date.now() - 86400000) },
  { _id: '4', paymentId: 'PAY00004', customer: { name: 'Amit Singh', customerId: 'SWS0002' }, amount: 450, method: 'cash', status: 'success', date: new Date(Date.now() - 86400000) },
  { _id: '5', paymentId: 'PAY00005', customer: { name: 'Anita Mishra', customerId: 'SWS0008' }, amount: 150, method: 'bank-transfer', status: 'success', date: new Date(Date.now() - 172800000) },
];

const DUES = [
  { name: 'Amit Singh', id: 'SWS0002', due: 500, days: 15 },
  { name: 'Sunita Devi', id: 'SWS0004', due: 150, days: 8 },
  { name: 'Kavita Gupta', id: 'SWS0006', due: 300, days: 22 },
  { name: 'Anita Mishra', id: 'SWS0008', due: 120, days: 5 },
];

function AddPaymentModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ customerName: '', amount: '', method: 'cash', note: '' });
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-black text-lg uppercase tracking-wide mb-6">Record Payment</h2>
        <div className="space-y-4">
          <div>
            <label className="input-label">Customer Name</label>
            <input className="input-field" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Rahul Kumar" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Amount (₹)</label>
              <input type="number" className="input-field" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="500" />
            </div>
            <div>
              <label className="input-label">Payment Method</label>
              <select className="input-field" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
                {['cash', 'upi', 'bank-transfer', 'cheque', 'online'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Note (Optional)</label>
            <input className="input-field" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="August month payment" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-outline py-3 rounded-xl text-sm font-bold">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold">Record Payment</button>
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState(DEMO_PAYMENTS);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (form) => {
    const newPay = {
      _id: Date.now().toString(),
      paymentId: `PAY${String(payments.length + 100).padStart(5, '0')}`,
      customer: { name: form.customerName, customerId: '---' },
      amount: Number(form.amount), method: form.method, status: 'success', date: new Date(),
    };
    setPayments(prev => [newPay, ...prev]);
    setModalOpen(false);
  };

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalDues = DUES.reduce((s, d) => s + d.due, 0);

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="text-slate-400 text-sm mt-1">Track all payments and outstanding dues</p>
        </div>
        <button id="add-payment-btn" onClick={() => setModalOpen(true)} className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
          <FiPlus size={16} /> Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <FiCreditCard className="text-white" size={18} />
            </div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">Total Collected</span>
          </div>
          <div className="stat-value text-emerald-400">₹{totalCollected.toLocaleString()}</div>
          <p className="text-slate-500 text-xs mt-1">{payments.length} transactions</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <FiTrendingDown className="text-white" size={18} />
            </div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">Outstanding Dues</span>
          </div>
          <div className="stat-value text-amber-400">₹{totalDues.toLocaleString()}</div>
          <p className="text-slate-500 text-xs mt-1">{DUES.length} customers with dues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment History */}
        <div className="lg:col-span-2 table-container">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-white font-bold text-sm uppercase tracking-wide">Payment History</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Pay ID</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td className="text-cyan-400 font-semibold text-xs">{p.paymentId}</td>
                  <td>
                    <div className="text-white font-medium">{p.customer?.name}</div>
                    <div className="text-slate-500 text-xs">{p.customer?.customerId}</div>
                  </td>
                  <td className="text-emerald-400 font-bold">₹{p.amount}</td>
                  <td className="uppercase text-xs text-slate-400 font-semibold">{p.method}</td>
                  <td><span className="badge badge-paid">{p.status}</span></td>
                  <td className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dues Panel */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-white font-bold text-sm uppercase tracking-wide">Outstanding Dues</h2>
          </div>
          <div className="divide-y divide-white/5">
            {DUES.map((d, i) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="avatar">{d.name[0]}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{d.name}</p>
                    <p className="text-slate-500 text-xs">{d.days} days overdue</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-black text-sm">₹{d.due}</p>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-0.5">Remind</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddPaymentModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}
