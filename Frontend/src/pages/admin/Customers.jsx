import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiUser } from 'react-icons/fi';
import api from '../../services/api';

const DEMO_CUSTOMERS = [
  { _id: '1', customerId: 'SWS0001', name: 'Rahul Kumar', phone: '9811111111', area: 'Gomti Nagar', waterType: '20L Can', status: 'active', outstandingAmount: 250, subscriptionType: 'daily' },
  { _id: '2', customerId: 'SWS0002', name: 'Amit Singh', phone: '9822222222', area: 'Hazratganj', waterType: '20L Can', status: 'active', outstandingAmount: 500, subscriptionType: 'alternate' },
  { _id: '3', customerId: 'SWS0003', name: 'Priya Sharma', phone: '9833333333', area: 'Indira Nagar', waterType: '18L Can', status: 'active', outstandingAmount: 0, subscriptionType: 'daily' },
  { _id: '4', customerId: 'SWS0004', name: 'Sunita Devi', phone: '9844444444', area: 'Alambagh', waterType: '20L Can', status: 'inactive', outstandingAmount: 150, subscriptionType: 'weekly' },
  { _id: '5', customerId: 'SWS0005', name: 'Mohan Lal', phone: '9855555555', area: 'Aashiyana', waterType: '2L Bottle', status: 'active', outstandingAmount: 0, subscriptionType: 'on-demand' },
  { _id: '6', customerId: 'SWS0006', name: 'Kavita Gupta', phone: '9866666666', area: 'Rajajipuram', waterType: '20L Can', status: 'active', outstandingAmount: 300, subscriptionType: 'daily' },
  { _id: '7', customerId: 'SWS0007', name: 'Deepak Verma', phone: '9877777777', area: 'Vikas Nagar', waterType: '20L Can', status: 'active', outstandingAmount: 0, subscriptionType: 'alternate' },
  { _id: '8', customerId: 'SWS0008', name: 'Anita Mishra', phone: '9888888888', area: 'Chinhat', waterType: '18L Can', status: 'inactive', outstandingAmount: 120, subscriptionType: 'daily' },
];

const statusBadge = (s) => {
  const map = { active: 'badge-active', inactive: 'badge-inactive', suspended: 'badge-cancelled' };
  return <span className={`badge ${map[s]}`}>{s}</span>;
};

function Modal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { name: '', phone: '', email: '', address: '', area: '', waterType: '20L Can', subscriptionType: 'on-demand' });
  useEffect(() => { if (initial) setForm(initial); }, [initial]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-black text-lg uppercase tracking-wide mb-6">{initial?._id ? 'Edit Customer' : 'Add Customer'}</h2>
        <div className="grid grid-cols-2 gap-4">
          {[['Full Name', 'name', 'text'], ['Phone', 'phone', 'text'], ['Email', 'email', 'email'], ['Area', 'area', 'text']].map(([label, field, type]) => (
            <div key={field}>
              <label className="input-label">{label}</label>
              <input type={type} className="input-field" value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} />
            </div>
          ))}
          <div className="col-span-2">
            <label className="input-label">Address</label>
            <input className="input-field" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Water Type</label>
            <select className="input-field" value={form.waterType} onChange={e => setForm({ ...form, waterType: e.target.value })}>
              {['20L Can', '18L Can', '2L Bottle', '1L Bottle'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Subscription</label>
            <select className="input-field" value={form.subscriptionType} onChange={e => setForm({ ...form, subscriptionType: e.target.value })}>
              {['daily', 'alternate', 'weekly', 'monthly', 'on-demand'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 btn-outline py-3 rounded-xl text-sm font-bold">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold">Save Customer</button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState(DEMO_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    api.get(`/customers?search=${search}&status=${filter}&page=${page}&limit=${limit}`)
      .then(r => { if (r.data.success && r.data.data.length) setCustomers(r.data.data); })
      .catch(() => {});
  }, [search, filter, page]);

  const filtered = customers.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.customerId?.includes(search) || c.phone.includes(search)) &&
    (filter ? c.status === filter : true)
  );

  const handleSave = async (form) => {
    try {
      if (editTarget?._id && !editTarget._id.match(/^\d+$/)) {
        await api.put(`/customers/${editTarget._id}`, form);
      } else {
        await api.post('/customers', form);
      }
    } catch {}
    setCustomers(prev => editTarget
      ? prev.map(c => c._id === editTarget._id ? { ...c, ...form } : c)
      : [{ _id: Date.now().toString(), customerId: `SWS${String(prev.length + 1).padStart(4, '0')}`, ...form, outstandingAmount: 0, status: 'active' }, ...prev]
    );
    setModalOpen(false); setEditTarget(null);
  };

  const handleDelete = (id) => {
    if (!confirm('Deactivate this customer?')) return;
    setCustomers(prev => prev.map(c => c._id === id ? { ...c, status: 'inactive' } : c));
    api.delete(`/customers/${id}`).catch(() => {});
  };

  const paged = filtered.slice((page - 1) * limit, page * limit);
  const pages = Math.ceil(filtered.length / limit);

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">{customers.length} total registered customers</p>
        </div>
        <button id="add-customer-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
          <FiPlus size={16} /> Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input id="customer-search" className="search-bar pl-10 w-full rounded-xl" placeholder="Search by name, phone, ID..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select id="customer-filter" className="input-field w-full sm:w-40 rounded-xl" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer ID</th><th>Name</th><th>Phone</th><th>Area</th>
              <th>Water Type</th><th>Subscription</th><th>Status</th>
              <th>Outstanding</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-slate-500 py-12">No customers found</td></tr>
            ) : paged.map(c => (
              <tr key={c._id}>
                <td className="text-cyan-400 font-semibold text-xs">{c.customerId}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="avatar text-xs">{c.name[0]}</div>
                    <span className="text-white font-medium">{c.name}</span>
                  </div>
                </td>
                <td>{c.phone}</td>
                <td>{c.area}</td>
                <td>{c.waterType}</td>
                <td className="capitalize text-xs text-slate-400">{c.subscriptionType}</td>
                <td>{statusBadge(c.status)}</td>
                <td className={`font-semibold ${c.outstandingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹{c.outstandingAmount}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditTarget(c); setModalOpen(true); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(c._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
          <span className="text-slate-500 text-xs">Showing {Math.min((page - 1) * limit + 1, filtered.length)}–{Math.min(page * limit, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-2">
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-400'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
