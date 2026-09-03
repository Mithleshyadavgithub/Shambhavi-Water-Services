import { useState } from 'react';
import { FiPackage, FiAlertTriangle, FiEdit2 } from 'react-icons/fi';

const INVENTORY = [
  { _id: '1', product: '20L Can', pricePerUnit: 40, totalStock: 500, availableStock: 320, withCustomers: 150, damaged: 30, lowStockAlert: 50 },
  { _id: '2', product: '18L Can', pricePerUnit: 40, totalStock: 200, availableStock: 140, withCustomers: 50, damaged: 10, lowStockAlert: 30 },
  { _id: '3', product: '2L Bottle', pricePerUnit: 20, totalStock: 300, availableStock: 200, withCustomers: 80, damaged: 20, lowStockAlert: 40 },
  { _id: '4', product: '1L Bottle', pricePerUnit: 10, totalStock: 500, availableStock: 400, withCustomers: 80, damaged: 20, lowStockAlert: 60 },
];

function EditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({ ...item });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-black text-lg uppercase tracking-wide mb-6">Update Inventory — {item.product}</h2>
        <div className="grid grid-cols-2 gap-4">
          {[['Total Stock', 'totalStock'], ['Available Stock', 'availableStock'], ['With Customers', 'withCustomers'], ['Damaged', 'damaged']].map(([label, field]) => (
            <div key={field}>
              <label className="input-label">{label}</label>
              <input type="number" className="input-field" value={form[field]} onChange={e => setForm({ ...form, [field]: Number(e.target.value) })} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-outline py-3 rounded-xl text-sm font-bold">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold">Update</button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState(INVENTORY);
  const [editItem, setEditItem] = useState(null);

  const handleSave = (form) => {
    setInventory(prev => prev.map(i => i._id === editItem._id ? { ...i, ...form } : i));
    setEditItem(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
        <p className="text-slate-400 text-sm mt-1">Manage water cans and bottles stock</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {inventory.map((item, i) => {
          const pct = Math.round((item.availableStock / item.totalStock) * 100);
          const isLow = item.availableStock <= item.lowStockAlert;
          return (
            <div key={i} className={`stat-card relative ${isLow ? 'border-amber-500/30' : ''}`}>
              {isLow && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <FiAlertTriangle size={12} /> Low
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                  <FiPackage className="text-cyan-400" size={18} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{item.product}</p>
                  <p className="text-cyan-400/70 text-xs">₹{item.pricePerUnit}/unit</p>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                {[['Total', item.totalStock, 'text-white'], ['Available', item.availableStock, isLow ? 'text-amber-400' : 'text-emerald-400'], ['With Customers', item.withCustomers, 'text-cyan-400'], ['Damaged', item.damaged, 'text-red-400']].map(([l, v, cls]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-400 text-xs">{l}</span>
                    <span className={`font-bold text-xs ${cls}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="progress-bar mb-1">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-4">
                <span>Stock level</span><span>{pct}%</span>
              </div>
              <button onClick={() => setEditItem(item)} className="w-full text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 transition-colors py-1.5 rounded-lg hover:bg-cyan-500/10">
                <FiEdit2 size={12} /> Update Stock
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary Table */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-bold text-sm uppercase tracking-wide">Inventory Summary</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Product</th><th>Price/Unit</th><th>Total Stock</th><th>Available</th><th>With Customers</th><th>Damaged</th><th>Stock Level</th><th>Alert</th></tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const pct = Math.round((item.availableStock / item.totalStock) * 100);
              const isLow = item.availableStock <= item.lowStockAlert;
              return (
                <tr key={item._id}>
                  <td className="text-white font-semibold">{item.product}</td>
                  <td>₹{item.pricePerUnit}</td>
                  <td>{item.totalStock}</td>
                  <td className={isLow ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>{item.availableStock}</td>
                  <td className="text-cyan-400">{item.withCustomers}</td>
                  <td className="text-red-400">{item.damaged}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-20"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                      <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                  </td>
                  <td>{isLow ? <span className="badge badge-pending">Low Stock</span> : <span className="badge badge-active">OK</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editItem && <EditModal item={editItem} onClose={() => setEditItem(null)} onSave={handleSave} />}
    </div>
  );
}
