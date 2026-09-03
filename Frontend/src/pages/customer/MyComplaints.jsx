import { useState } from 'react';
import { FiPlus, FiMessageSquare } from 'react-icons/fi';

const MY_COMPLAINTS = [
  { complaintId: 'CMP0012', date: '2026-08-19', type: 'late-delivery', description: 'Yesterday delivery was 2 hours late', priority: 'high', status: 'assigned' },
  { complaintId: 'CMP0007', date: '2026-08-10', type: 'billing', description: 'My July bill amount seems incorrect', priority: 'medium', status: 'resolved', resolution: 'Bill recalculated and corrected' },
];

const PRIORITY_MAP = { low: 'badge-active', medium: 'badge-assigned', high: 'badge-pending', urgent: 'badge-cancelled' };
const STATUS_MAP = { open: 'badge-open', assigned: 'badge-assigned', 'in-progress': 'badge-out', resolved: 'badge-resolved', closed: 'badge-inactive' };

function NewComplaintModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ type: 'late-delivery', description: '', priority: 'medium' });
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-black text-lg uppercase tracking-wide mb-6">Submit Complaint</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Complaint Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['water-quality', 'late-delivery', 'billing', 'damaged-can', 'staff-behavior', 'other'].map(t => (
                  <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Describe Your Issue</label>
            <textarea className="input-field resize-none" rows={4} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Please describe your issue in detail..." />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-outline py-3 rounded-xl text-sm font-bold">Cancel</button>
          <button onClick={() => { onSubmit(form); onClose(); }} className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold">Submit</button>
        </div>
      </div>
    </div>
  );
}

export default function MyComplaints() {
  const [complaints, setComplaints] = useState(MY_COMPLAINTS);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = (form) => {
    setComplaints(prev => [{
      complaintId: `CMP${String(prev.length + 100).padStart(4, '0')}`,
      date: new Date().toLocaleDateString('en-CA'),
      type: form.type, description: form.description,
      priority: form.priority, status: 'open',
    }, ...prev]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Complaints</h1>
          <p className="text-slate-400 text-sm mt-1">Submit and track your complaints</p>
        </div>
        <button id="new-complaint-btn" onClick={() => setModalOpen(true)} className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
          <FiPlus size={16} /> New Complaint
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <FiMessageSquare className="text-cyan-400/40 mx-auto mb-4" size={40} />
          <p className="text-slate-400">No complaints yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => (
            <div key={c.complaintId} className="glass-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-cyan-400 font-bold text-xs">{c.complaintId}</span>
                <span className={`badge ${PRIORITY_MAP[c.priority]}`}>{c.priority}</span>
                <span className={`badge ${STATUS_MAP[c.status]}`}>{c.status.replace(/-/g, ' ')}</span>
                <span className="text-slate-600 text-xs ml-auto">{c.date}</span>
              </div>
              <p className="text-white font-semibold text-sm mb-1 capitalize">{c.type.replace(/-/g, ' ')}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{c.description}</p>
              {c.resolution && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 text-xs font-bold mb-1">✅ Resolution</p>
                  <p className="text-slate-300 text-xs">{c.resolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <NewComplaintModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}
