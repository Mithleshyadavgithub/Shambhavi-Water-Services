import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FiSearch, 
  FiPackage, 
  FiTruck, 
  FiMapPin, 
  FiCheck, 
  FiArrowLeft, 
  FiAlertCircle, 
  FiPhone, 
  FiMail,
  FiRefreshCw,
  FiCopy,
  FiClock,
  FiShield,
  FiXCircle,
  FiChevronRight
} from 'react-icons/fi';

export default function TrackOrder() {
  const { theme } = useAuth();
  const { orderId } = useParams();
  const navigate = useNavigate();


  // All Orders History States (zero barrier, directly loaded)
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Single Order Tracking View States
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Simulated & current status state for timeline
  const [currentStatus, setCurrentStatus] = useState('');

  // Cancellation Modal States
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Order is delayed / late');
  const [cancelComments, setCancelComments] = useState('');

  // Fetch all orders on initial page load (zero barrier!)
  const fetchAllOrders = () => {
    setLoadingOrders(true);
    api.get('/orders/public/history')
      .then(res => {
        if (res.data.success) {
          setOrders(res.data.data || []);
        }
      })
      .catch(err => {
        console.error("Error loading order history", err);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Fetch tracking details if orderId is in URL
  const fetchTracking = (id) => {
    if (!id || !id.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    
    api.get(`/orders/track/${id.trim()}`)
      .then(res => {
        if (res.data.success) {
          setOrder(res.data.data);
        } else {
          setError(res.data.message || 'Order not found');
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Invalid Order ID or error retrieving tracking details.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (orderId) {
      fetchTracking(orderId);
    } else {
      setOrder(null);
    }
  }, [orderId]);

  // Sync state with order status
  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
    }
  }, [order]);

  // Automated Timeline Simulation Timer
  useEffect(() => {
    if (!order || currentStatus === 'delivered' || currentStatus === 'cancelled') return;

    const checkProgression = () => {
      const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
      const elapsedMins = elapsedMs / (1000 * 60);

      let simulated = order.status;
      if (order.status === 'pending' || order.status === 'assigned' || order.status === 'out-for-delivery') {
        if (elapsedMins >= 5) {
          simulated = 'delivered';
        } else if (elapsedMins >= 3) {
          simulated = 'out-for-delivery';
        } else if (elapsedMins >= 1) {
          simulated = 'assigned';
        }
      }

      if (simulated !== currentStatus) {
        setCurrentStatus(simulated);
      }
    };

    checkProgression();
    const interval = setInterval(checkProgression, 5000);
    return () => clearInterval(interval);
  }, [order, currentStatus]);

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!order) return;
    setLoading(true);
    setError('');
    try {
      const fullReason = `${selectedReason}${cancelComments.trim() ? ` - ${cancelComments.trim()}` : ''}`;
      const res = await api.put(`/orders/track/${order.orderId}/cancel`, { cancellationReason: fullReason });
      if (res.data.success) {
        setOrder(res.data.data);
        setCancellationModalOpen(false);
        fetchAllOrders();
      } else {
        setError(res.data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error cancelling order.');
    } finally {
      setLoading(false);
    }
  };

  // Timeline Steps
  const TIMELINE_STEPS = [
    { key: 'pending', label: 'Order Placed', desc: 'Received & Queued' },
    { key: 'assigned', label: 'Processing & Dispatched', desc: 'Assigned to Driver' },
    { key: 'out-for-delivery', label: 'Out for Delivery', desc: 'Driver on the Way' },
    { key: 'delivered', label: 'Delivered', desc: 'Safely Arrived' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'assigned': return 1;
      case 'out-for-delivery': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const activeStepIdx = getStepIndex(currentStatus);

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      (o.orderId && o.orderId.toLowerCase().includes(q)) ||
      (o.waterType && o.waterType.toLowerCase().includes(q)) ||
      (o.area && o.area.toLowerCase().includes(q)) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
      (o.customer?.phone && o.customer.phone.includes(q))
    );
  });

  return (
    <div className="water-bg min-h-screen flex flex-col justify-between">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Back button (Only in single order tracking view) */}
          {orderId && (
            <button 
              onClick={() => navigate('/my-orders')} 
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6 text-sm font-bold cursor-pointer"
            >
              <FiArrowLeft size={16} /> Back to All Orders
            </button>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW 1: MY ORDERS & ORDER HISTORY (ZERO BARRIER!)        */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {!orderId && (
            <div className="space-y-6 animate-fade-in">
              {/* Page Header */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        theme === 'light' ? 'bg-cyan-100 text-cyan-700 border border-cyan-300' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                      }`}>
                        <FiPackage size={18} />
                      </div>
                      <h1 className={`text-2xl sm:text-3xl font-black uppercase tracking-wide ${
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        My Orders
                      </h1>
                    </div>
                    <p className={`text-xs sm:text-sm ${
                      theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'
                    }`}>
                      View your order history, delivery progress, and tracking in real-time.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={fetchAllOrders}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        theme === 'light' 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-cyan-700 border-slate-300' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 border-white/10'
                      }`}
                      title="Refresh Orders"
                    >
                      <FiRefreshCw size={16} className={loadingOrders ? 'animate-spin text-cyan-600' : ''} />
                    </button>
                    <Link
                      to="/order"
                      className="btn-primary py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 whitespace-nowrap"
                    >
                      + Book New Order
                    </Link>
                  </div>
                </div>

                {/* Quick Search Filter Bar */}
                <div className={`mt-5 pt-5 border-t relative flex items-center ${
                  theme === 'light' ? 'border-slate-200' : 'border-white/5'
                }`}>
                  <FiSearch className={`absolute left-3.5 ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400/60'}`} size={16} />
                  <input
                    type="text"
                    placeholder="Search by Order ID (e.g. ORD00019), product, or area..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="input-field pl-10 pr-4 text-xs sm:text-sm"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="absolute right-3 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Order Cards List */}
              {loadingOrders ? (
                <div className="glass-card rounded-3xl p-16 border border-white/5 text-center">
                  <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} text-sm font-medium`}>Loading your orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="glass-card rounded-3xl p-12 border border-white/5 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 flex items-center justify-center mx-auto">
                    <FiPackage size={32} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>No Orders Found</h3>
                    <p className={`text-xs mt-1 max-w-sm mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      {searchFilter ? `No orders matched "${searchFilter}".` : 'You have not placed any orders yet.'}
                    </p>
                  </div>
                  <Link to="/order" className="btn-primary inline-flex px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                    Place Your First Order
                  </Link>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredOrders.map(o => {
                    const isDelivered = o.status === 'delivered';
                    const isCancelled = o.status === 'cancelled';
                    const isPaid = o.paymentStatus === 'paid';

                    return (
                      <div 
                        key={o._id || o.orderId}
                        className="glass-card rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-cyan-500/40 transition-all shadow-md group"
                      >
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 ${
                          theme === 'light' ? 'border-slate-100' : 'border-white/5'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isDelivered 
                                ? (theme === 'light' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')
                                : isCancelled
                                  ? (theme === 'light' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-red-500/20 text-red-400 border border-red-500/30')
                                  : (theme === 'light' ? 'bg-cyan-100 text-cyan-700 border border-cyan-300' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30')
                            }`}>
                              {isDelivered ? <FiCheck size={20} /> : isCancelled ? <FiXCircle size={20} /> : <FiTruck size={20} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-black text-base ${
                                  theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'
                                }`}>
                                  {o.orderId}
                                </span>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  isDelivered
                                    ? (theme === 'light' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
                                    : isCancelled
                                      ? (theme === 'light' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-red-500/20 text-red-300 border border-red-500/30')
                                      : (theme === 'light' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30')
                                }`}>
                                  {o.status.replace(/-/g, ' ')}
                                </span>
                              </div>
                              <p className={`text-[11px] mt-0.5 flex items-center gap-1.5 ${
                                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                              }`}>
                                <FiClock size={11} />
                                {new Date(o.createdAt || o.orderDate).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className={`text-lg font-black ${
                              theme === 'light' ? 'text-slate-900' : 'text-white'
                            }`}>
                              ₹{o.totalAmount}
                            </p>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block uppercase tracking-wider ${
                              isPaid 
                                ? (theme === 'light' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30')
                                : o.paymentScreenshot
                                  ? (theme === 'light' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30')
                                  : (theme === 'light' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30')
                            }`}>
                              {isPaid ? 'PAID & VERIFIED' : o.paymentScreenshot ? 'PROOF ATTACHED' : 'CASH ON DELIVERY'}
                            </span>
                          </div>
                        </div>

                        {/* Order Details Body */}
                        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <p className={`font-semibold ${
                              theme === 'light' ? 'text-slate-800' : 'text-white'
                            }`}>
                              Item: <span className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>{o.quantity} × {o.waterType}</span>
                            </p>
                            <p className={`flex items-center gap-1 ${
                              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                              <FiMapPin size={12} className={theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} />
                              {o.customer?.name ? `${o.customer.name} • ` : ''}{o.area || o.customer?.area || 'Gomti Nagar'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/track/${o.orderId}`)}
                              className="btn-primary py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-cyan-500/20 cursor-pointer"
                            >
                              <span>Track Live Delivery</span>
                              <FiChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* VIEW 2: SINGLE ORDER LIVE TRACKER & PROGRESSION VIEW     */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {orderId && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Loader */}
              {loading && !cancellationModalOpen && (
                <div className="glass-card rounded-3xl p-16 border border-white/5 text-center">
                  <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 text-sm">Fetching real-time tracking details...</p>
                </div>
              )}

              {/* Error */}
              {error && !order && (
                <div className="glass-card rounded-3xl p-12 border border-red-500/20 text-center space-y-4">
                  <FiAlertCircle size={44} className="text-red-400 mx-auto animate-pulse" />
                  <div>
                    <h3 className="text-white font-bold text-lg">Unable to Find Order</h3>
                    <p className="text-slate-400 text-xs mt-1">{error}</p>
                  </div>
                  <button onClick={() => navigate('/my-orders')} className="btn-outline px-6 py-2.5 rounded-xl text-xs font-bold mx-auto cursor-pointer border-white/20">
                    Back to All Orders
                  </button>
                </div>
              )}

              {/* Order Info & Timeline */}
              {order && (
                <>
                  {/* Order Overview Header Card */}
                  <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
                      theme === 'light' ? 'border-slate-100' : 'border-white/5'
                    }`}>
                      <div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${
                          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                        }`}>Order ID</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <h2 className={`font-black text-xl ${
                            theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'
                          }`}>{order.orderId}</h2>
                          <button 
                            onClick={() => handleCopyOrderId(order.orderId)}
                            className={`p-1 transition-colors cursor-pointer ${
                              theme === 'light' ? 'text-slate-500 hover:text-cyan-700' : 'text-slate-400 hover:text-cyan-400'
                            }`}
                            title="Copy Order ID"
                          >
                            {copiedId ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${
                          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                        }`}>Total Amount</span>
                        <h3 className={`font-black text-2xl ${
                          theme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}>₹{order.totalAmount}</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block uppercase tracking-wider mt-1 ${
                          order.paymentStatus === 'paid'
                            ? (theme === 'light' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30')
                            : (theme === 'light' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30')
                        }`}>
                          {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING VERIFICATION'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                      <div>
                        <span className={`block text-[10px] uppercase font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Item</span>
                        <p className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{order.quantity} × {order.waterType}</p>
                      </div>
                      <div>
                        <span className={`block text-[10px] uppercase font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Delivery Area</span>
                        <p className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{order.area || 'Gomti Nagar'}</p>
                      </div>
                      <div>
                        <span className={`block text-[10px] uppercase font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Estimated Delivery</span>
                        <p className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>Within 2-4 hours</p>
                      </div>
                      <div>
                        <span className={`block text-[10px] uppercase font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Order Placed</span>
                        <p className={`font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                          {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Timeline Card */}
                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
                    <div className={`flex items-center justify-between border-b pb-3 ${
                      theme === 'light' ? 'border-slate-100' : 'border-white/5'
                    }`}>
                      <h3 className={`font-black text-base uppercase tracking-wide flex items-center gap-2 ${
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        <FiTruck className={theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} />
                        Live Delivery Progress
                      </h3>
                      {currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full animate-pulse ${
                          theme === 'light' ? 'text-emerald-800 bg-emerald-100 border border-emerald-300' : 'text-green-400 bg-green-500/10 border border-green-500/20'
                        }`}>
                          <span className={`w-2 h-2 rounded-full inline-block ${theme === 'light' ? 'bg-emerald-600' : 'bg-green-500'}`} />
                          Live Tracking Active
                        </span>
                      )}
                    </div>

                    {/* Step-by-step progress timeline */}
                    {currentStatus === 'cancelled' ? (
                      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-2">
                        <FiXCircle size={36} className="text-red-400 mx-auto" />
                        <h4 className="text-lg font-black text-red-400 uppercase tracking-wide">Order Cancelled</h4>
                        <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>This order has been cancelled.</p>
                      </div>
                    ) : (
                      <div className="relative pl-6 sm:pl-8 border-l-2 border-cyan-500/20 space-y-8 my-4">
                        {TIMELINE_STEPS.map((stepItem, idx) => {
                          const isDone = activeStepIdx >= idx;
                          const isCurrent = activeStepIdx === idx;

                          return (
                            <div key={stepItem.key} className="relative group">
                              <span className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone 
                                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/40' 
                                  : (theme === 'light' ? 'bg-slate-200 border border-slate-300 text-slate-500' : 'bg-slate-800 border border-white/10 text-slate-500')
                              } ${isCurrent ? 'ring-4 ring-cyan-400/20 animate-pulse' : ''}`}>
                                {isDone ? '✓' : idx + 1}
                              </span>
                              <div>
                                <h4 className={`text-sm font-bold ${
                                  isDone 
                                    ? (theme === 'light' ? 'text-slate-900' : 'text-white') 
                                    : (theme === 'light' ? 'text-slate-400' : 'text-slate-500')
                                }`}>
                                  {stepItem.label}
                                </h4>
                                <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{stepItem.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/my-orders')}
                      className="btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex-1 text-center"
                    >
                      View All My Orders
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => setCancellationModalOpen(true)}
                        className="btn-outline py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-red-400 border-red-500/30 hover:bg-red-500/10 cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Cancellation Modal */}
      {cancellationModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-black text-white uppercase">Cancel Order</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to cancel order <strong>{order?.orderId}</strong>?
            </p>

            <form onSubmit={handleCancelOrder} className="space-y-3">
              <div>
                <label className="input-label text-[10px]">Reason</label>
                <select
                  value={selectedReason}
                  onChange={e => setSelectedReason(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Order is delayed / late">Order is delayed / late</option>
                  <option value="Placed order by mistake">Placed order by mistake</option>
                  <option value="Need to change delivery address">Need to change delivery address</option>
                  <option value="Found alternative water source">Found alternative water source</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Confirm Cancellation
                </button>
                <button
                  type="button"
                  onClick={() => setCancellationModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-white/10 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
