import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STATUS_MAP = { 
  delivered: 'badge-delivered', 
  pending: 'badge-pending', 
  assigned: 'badge-assigned', 
  'out-for-delivery': 'badge-out',
  cancelled: 'badge-cancelled'
};
const PAY_MAP = { 
  paid: 'badge-paid', 
  pending: 'badge-pending', 
  partial: 'badge-assigned',
  failed: 'badge-cancelled'
};

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cid = typeof user?.customerId === 'object' ? user.customerId?._id : (user?.customerId || user?._id);
    if (cid && typeof cid === 'string') {
      api.get(`/orders?customer=${cid}`)
        .then(res => {
          if (res.data.success) {
            setOrders(res.data.data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? 'Loading orders...' : `${orders.length} total orders`}
          </p>
        </div>
        <button 
          id="place-order-btn" 
          onClick={() => navigate('/order')} 
          className="btn-primary px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
        >
          <FiPlus size={16} /> New Order
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <FiClock size={36} className="mx-auto text-slate-600 mb-3" />
            <p className="text-base font-semibold">No orders yet</p>
            <p className="text-xs text-slate-500 mt-1">Click "New Order" to get started.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Order Status</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id || o.orderId}>
                  <td className="text-cyan-400 font-semibold text-xs">{o.orderId}</td>
                  <td className="text-slate-400 text-xs">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                  </td>
                  <td>{o.waterType}</td>
                  <td>{o.quantity}</td>
                  <td className="font-semibold text-white">₹{o.totalAmount}</td>
                  <td>
                    <span className={`badge ${STATUS_MAP[o.status] || 'badge-pending'}`}>
                      {o.status?.replace(/-/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${PAY_MAP[o.paymentStatus] || 'badge-pending'}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => navigate(`/track/${o.orderId}`)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/25 hover:text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
