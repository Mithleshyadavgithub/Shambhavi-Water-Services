import { useState } from 'react';
import { FiPlus, FiEdit2, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';

const DEMO_COMPLAINTS = [
  { _id: '1', complaintId: 'CMP0001', customer: { name: 'Rahul Kumar', customerId: 'SWS0001' }, type: 'late-delivery', description: 'Delivery was 2 hours late yesterday', priority: 'high', status: 'open', createdAt: new Date() },
  { _id: '2', complaintId: 'CMP0002', customer: { name: 'Amit Singh', customerId: 'SWS0002' }, type: 'water-quality', description: 'Water has bad smell today', priority: 'urgent', status: 'assigned', createdAt: new Date() },
  { _id: '3', complaintId: 'CMP0003', customer: { name: 'Priya Sharma', customerId: 'SWS0003' }, type: 'billing', description: 'Incorrect bill amount this month', priority: 'medium', status: 'resolved', createdAt: new Date(Date.now() - 86400000) },
  { _id: '4', complaintId: 'CMP0004', customer: { name: 'Sunita Devi', customerId: 'SWS0004' }, type: 'damaged-can', description: 'Received damaged water can', priority: 'low', status: 'in-progress', createdAt: new Date(Date.now() - 172800000) },
];

const PRIORITY_MAP = { low: 'badge-active', medium: 'badge-assigned', high: 'badge-pending', urgent: 'badge-cancelled' };
const STATUS_MAP = { open: 'badge-open', assigned: 'badge-assigned', 'in-progress': 'badge-out', resolved: 'badge-resolved', closed: 'badge-inactive' };

function AddComplaintModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ customerName: '', type: 'late-delivery', description: '', priority: 'medium' });
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-black text-lg uppercase tracking-wide mb-6">Add Complaint</h2>
        <div className="space-y-4">
          <div>
            <label className="input-label">Customer Name</label>
            <input className="input-field" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['water-quality', 'late-delivery', 'billing', 'damaged-can', 'staff-behavior', 'other'].map(t => (
                  <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-outline py-3 rounded-xl text-sm font-bold">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold">Add Complaint</button>
        </div>
      </div>
    </div>
  );
}

export default function Complaints() {
  const [complaints, setComplaints] = useState(DEMO_COMPLAINTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleSave = (form) => {
    const newC = {
      _id: Date.now().toString(),
      complaintId: `CMP${String(complaints.length + 100).padStart(4, '0')}`,
      customer: { name: form.customerName, customerId: '---' },
      type: form.type, description: form.description,
      priority: form.priority, status: 'open', createdAt: new Date(),
    };
    setComplaints(prev => [newC, ...prev]);
    setModalOpen(false);
  };

  const updateStatus = (id, status) => {
    setComplaints(prev => prev.map(c => c._id === id ? { ...c, status } : c));
    api.put(`/complaints/${id}`, { status }).catch(() => {});
  };

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);

  const counts = { open: 0, 'in-progress': 0, resolved: 0 };
  complaints.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++; else if (c.status === 'assigned') counts.open++; });

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Complaints</h1>
          <p className="text-slate-400 text-sm mt-1">Manage customer complaints and resolutions</p>
        </div>
        <button id="add-complaint-btn" onClick={() => setModalOpen(true)} className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
          <FiPlus size={16} /> Add Complaint
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Open', counts.open + (complaints.filter(c => c.status === 'assigned').length), 'text-red-400', 'border-red-500/20'],
          ['In Progress', complaints.filter(c => c.status === 'in-progress').length, 'text-amber-400', 'border-amber-500/20'],
          ['Resolved', complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length, 'text-emerald-400', 'border-emerald-500/20']
        ].map(([label, count, cls, border]) => (
          <div key={label} className={`stat-card border ${border}`}>
            <div className={`stat-value ${cls}`}>{count}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['all', 'open', 'assigned', 'in-progress', 'resolved'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              filter === s ? 'bg-cyan-500 text-white' : 'glass-card text-slate-400 hover:text-cyan-400'
            }`}>
            {s === 'all' ? 'All' : s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Complaints Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-500">No complaints found</div>
        ) : filtered.map(c => (
          <div key={c._id} className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className={`w-1.5 self-stretch rounded-full shrink-0 ${c.priority === 'urgent' ? 'bg-red-500' : c.priority === 'high' ? 'bg-amber-500' : c.priority === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-cyan-400 font-bold text-xs">{c.complaintId}</span>
                <span className={`badge ${PRIORITY_MAP[c.priority]}`}>{c.priority}</span>
                <span className={`badge ${STATUS_MAP[c.status]}`}>{c.status.replace(/-/g, ' ')}</span>
              </div>
              <p className="text-white font-semibold text-sm mb-1">{c.customer?.name} <span className="text-slate-500 font-normal">· {c.type.replace(/-/g, ' ')}</span></p>
              <p className="text-slate-400 text-xs leading-relaxed">{c.description}</p>
              <p className="text-slate-600 text-xs mt-1">{new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="shrink-0">
              <select className="input-field py-2 text-xs w-36" value={c.status} onChange={e => updateStatus(c._id, e.target.value)}>
                {['open', 'assigned', 'in-progress', 'resolved', 'closed'].map(s => (
                  <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <AddComplaintModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}
