import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiEye } from 'react-icons/fi';
import api from '../../services/api';

const DEMO_ORDERS = [
  { _id: '1', orderId: 'ORD00145', customer: { name: 'Rahul Kumar', area: 'Gomti Nagar' }, waterType: '20L Can', quantity: 5, totalAmount: 270, status: 'delivered', paymentStatus: 'paid', orderDate: new Date() },
  { _id: '2', orderId: 'ORD00144', customer: { name: 'Amit Singh', area: 'Hazratganj' }, waterType: '20L Can', quantity: 10, totalAmount: 520, status: 'pending', paymentStatus: 'pending', orderDate: new Date() },
  { _id: '3', orderId: 'ORD00143', customer: { name: 'Priya Sharma', area: 'Indira Nagar' }, waterType: '18L Can', quantity: 3, totalAmount: 140, status: 'delivered', paymentStatus: 'paid', orderDate: new Date() },
  { _id: '4', orderId: 'ORD00142', customer: { name: 'Sunita Devi', area: 'Alambagh' }, waterType: '20L Can', quantity: 2, totalAmount: 100, status: 'assigned', paymentStatus: 'pending', orderDate: new Date() },
  { _id: '5', orderId: 'ORD00141', customer: { name: 'Mohan Lal', area: 'Aashiyana' }, waterType: '2L Bottle', quantity: 6, totalAmount: 140, status: 'out-for-delivery', paymentStatus: 'partial', orderDate: new Date() },
  { _id: '6', orderId: 'ORD00140', customer: { name: 'Kavita Gupta', area: 'Rajajipuram' }, waterType: '20L Can', quantity: 4, totalAmount: 220, status: 'delivered', paymentStatus: 'paid', orderDate: new Date(Date.now() - 86400000) },
  { _id: '7', orderId: 'ORD00139', customer: { name: 'Deepak Verma', area: 'Vikas Nagar' }, waterType: '1L Bottle', quantity: 12, totalAmount: 140, status: 'cancelled', paymentStatus: 'pending', orderDate: new Date(Date.now() - 86400000) },
];

const STATUS_COLORS = {
  pending: 'badge-pending', assigned: 'badge-assigned',
  'out-for-delivery': 'badge-out', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};
const PAY_COLORS = { paid: 'badge-paid', pending: 'badge-pending', partial: 'badge-assigned' };

const StatusBadge = ({ s, map }) => <span className={`badge ${map[s] || 'badge-pending'}`}>{s?.replace(/-/g, ' ')}</span>;

const TABS = ['all', 'pending', 'assigned', 'out-for-delivery', 'delivered'];

function CreateOrderModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ customerName: '', waterType: '20L Can', quantity: 1, deliveryCharge: 20 });
  const prices = { '20L Can': 40, '18L Can': 40, '2L Bottle': 20, '1L Bottle': 10 };
  const total = form.quantity * prices[form.waterType] + Number(form.deliveryCharge);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-black text-lg uppercase tracking-wide mb-6">Create New Order</h2>
        <div className="space-y-4">
          <div>
            <label className="input-label">Customer Name</label>
            <input className="input-field" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Rahul Kumar" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Water Type</label>
              <select className="input-field" value={form.waterType} onChange={e => setForm({ ...form, waterType: e.target.value })}>
                {Object.keys(prices).map(t => <option key={t} value={t}>{t} — ₹{prices[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Quantity</label>
              <input type="number" min={1} className="input-field" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
          </div>
          <div className="glass-dark rounded-xl p-4 border border-cyan-500/15">
            <div className="flex justify-between text-sm text-slate-300 mb-1">
              <span>{form.quantity} × {form.waterType}</span><span>₹{form.quantity * prices[form.waterType]}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-300 mb-3">
              <span>Delivery Charge</span><span>₹{form.deliveryCharge}</span>
            </div>
            <div className="flex justify-between text-base font-black text-white border-t border-white/10 pt-2">
              <span>Total</span><span className="text-cyan-400">₹{total}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-outline py-3 rounded-xl text-sm font-bold">Cancel</button>
          <button onClick={() => onSave({ ...form, totalAmount: total })} className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold">Create Order</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingScreenshot, setViewingScreenshot] = useState(null);

  useEffect(() => {
    api.get(`/orders?status=${tab === 'all' ? '' : tab}`)
      .then(r => { if (r.data.success && r.data.data.length) setOrders(r.data.data); })
      .catch(() => {});
  }, [tab]);

  const filtered = orders.filter(o =>
    (tab === 'all' || o.status === tab) &&
    (o.orderId?.toLowerCase().includes(search.toLowerCase()) || o.customer?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStatusUpdate = (id, newStatus) => {
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
    api.put(`/orders/${id}/status`, { status: newStatus }).catch(() => {});
  };

  const handleCreate = (form) => {
    const newOrder = {
      _id: Date.now().toString(),
      orderId: `ORD${String(orders.length + 200).padStart(5, '0')}`,
      customer: { name: form.customerName, area: 'General' },
      waterType: form.waterType, quantity: form.quantity,
      totalAmount: form.totalAmount, status: 'pending', paymentStatus: 'pending', orderDate: new Date(),
    };
    setOrders(prev => [newOrder, ...prev]);
    setModalOpen(false);
  };

  const handlePaymentApproval = (id, newPaymentStatus) => {
    setOrders(prev => prev.map(o => o._id === id ? { 
      ...o, 
      paymentStatus: newPaymentStatus,
      paidAmount: newPaymentStatus === 'paid' ? o.totalAmount : 0
    } : o));
    api.put(`/orders/${id}`, { 
      paymentStatus: newPaymentStatus,
      paidAmount: newPaymentStatus === 'paid' ? viewingScreenshot.totalAmount : 0
    }).catch(() => {});
    setViewingScreenshot(null);
  };

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button id="create-order-btn" onClick={() => setModalOpen(true)} className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer">
          <FiPlus size={16} /> Create Order
        </button>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              tab === t ? 'bg-cyan-500 text-white' : 'glass-card text-slate-400 hover:text-cyan-400'
            }`}>
            {t === 'all' ? 'All Orders' : t.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input id="orders-search" className="search-bar pl-10 w-full sm:w-80 rounded-xl"
          placeholder="Search order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Customer</th><th>Area</th><th>Product</th>
              <th>Qty</th><th>Amount</th><th>Payment</th><th>Status</th><th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-slate-500 py-12">No orders found</td></tr>
            ) : filtered.map(o => (
              <tr key={o._id}>
                <td className="text-cyan-400 font-semibold text-xs font-mono">{o.orderId}</td>
                <td className="text-white font-medium">{o.customer?.name}</td>
                <td className="text-slate-400 text-xs">{o.customer?.area}</td>
                <td>{o.waterType}</td>
                <td>{o.quantity}</td>
                <td className="font-semibold text-white">₹{o.totalAmount}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <StatusBadge s={o.paymentStatus} map={PAY_COLORS} />
                    {o.paymentScreenshot && (
                      <button 
                        onClick={() => setViewingScreenshot(o)}
                        className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/25 hover:text-cyan-300 transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px] font-bold"
                        title="View Payment Screenshot & Verify"
                      >
                        <FiEye size={12} /> Proof
                      </button>
                    )}
                  </div>
                </td>
                <td><StatusBadge s={o.status} map={STATUS_COLORS} /></td>
                <td>
                  <select className="input-field py-1 text-xs w-36"
                    value={o.status}
                    onChange={e => handleStatusUpdate(o._id, e.target.value)}>
                    {['pending', 'assigned', 'out-for-delivery', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateOrderModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />

      {viewingScreenshot && (
        <div className="modal-overlay" onClick={() => setViewingScreenshot(null)}>
          <div className="modal-box max-w-lg p-6 relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-black text-base mb-2 uppercase tracking-wide">Payment Proof Verification</h3>
            <div className="w-full flex justify-between text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-white/5 mb-3 font-mono">
              <span>Order: <strong>{viewingScreenshot.orderId}</strong></span>
              <span>Amount: <strong className="text-cyan-400">₹{viewingScreenshot.totalAmount}</strong></span>
              {viewingScreenshot.transactionId && <span>UTR: <strong>{viewingScreenshot.transactionId}</strong></span>}
            </div>
            
            <img 
              src={viewingScreenshot.paymentScreenshot} 
              alt="Payment Receipt" 
              className="max-w-full max-h-[55vh] rounded-xl shadow-2xl border border-cyan-500/20 object-contain mb-4" 
            />

            <div className="flex gap-2.5 w-full">
              {viewingScreenshot.paymentStatus !== 'paid' && (
                <button 
                  onClick={() => handlePaymentApproval(viewingScreenshot._id, 'paid')}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  ✓ Approve Payment (Mark Paid)
                </button>
              )}
              {viewingScreenshot.paymentStatus !== 'failed' && (
                <button 
                  onClick={() => handlePaymentApproval(viewingScreenshot._id, 'failed')}
                  className="px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  ✕ Reject
                </button>
              )}
              <button 
                onClick={() => setViewingScreenshot(null)} 
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
