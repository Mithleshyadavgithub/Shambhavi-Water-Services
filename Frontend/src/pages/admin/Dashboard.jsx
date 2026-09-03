import { useState, useEffect } from 'react';
import { FiUsers, FiShoppingCart, FiDollarSign, FiTruck, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import api from '../../services/api';

// Demo data for charts
const monthlyData = [
  { month: 'Mar', revenue: 42000, orders: 280 },
  { month: 'Apr', revenue: 51000, orders: 340 },
  { month: 'May', revenue: 47000, orders: 310 },
  { month: 'Jun', revenue: 63000, orders: 420 },
  { month: 'Jul', revenue: 58000, orders: 390 },
  { month: 'Aug', revenue: 72000, orders: 480 },
];

const demoStats = {
  totalCustomers: 1250, activeCustomers: 980,
  todayOrders: 145, pendingDeliveries: 32,
  todayRevenue: 18450, pendingPayments: 42300,
  openComplaints: 8,
};

const demoRecentOrders = [
  { orderId: 'ORD00145', customer: { name: 'Rahul Kumar' }, waterType: '20L Can', quantity: 5, totalAmount: 270, status: 'delivered' },
  { orderId: 'ORD00144', customer: { name: 'Amit Singh' }, waterType: '20L Can', quantity: 10, totalAmount: 520, status: 'pending' },
  { orderId: 'ORD00143', customer: { name: 'Priya Sharma' }, waterType: '18L Can', quantity: 3, totalAmount: 140, status: 'delivered' },
  { orderId: 'ORD00142', customer: { name: 'Sunita Devi' }, waterType: '20L Can', quantity: 2, totalAmount: 120, status: 'assigned' },
  { orderId: 'ORD00141', customer: { name: 'Mohan Lal' }, waterType: '2L Bottle', quantity: 6, totalAmount: 140, status: 'out-for-delivery' },
];

const StatusBadge = ({ status }) => {
  const map = {
    delivered: 'badge-delivered', pending: 'badge-pending',
    assigned: 'badge-assigned', 'out-for-delivery': 'badge-out',
    cancelled: 'badge-cancelled',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status.replace(/-/g, ' ')}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-dark rounded-xl p-3 border border-cyan-500/20">
        <p className="text-cyan-400 text-xs font-bold mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white text-sm font-semibold">
            {p.name === 'revenue' ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(demoStats);
  const [recentOrders, setRecentOrders] = useState(demoRecentOrders);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
          if (res.data.data.recentOrders?.length) setRecentOrders(res.data.data.recentOrders);
        }
      } catch {
        // Use demo data if API fails
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Customers', value: stats.totalCustomers?.toLocaleString(), icon: FiUsers, color: 'from-cyan-500 to-blue-600', sub: `${stats.activeCustomers} active` },
    { label: "Today's Orders", value: stats.todayOrders, icon: FiShoppingCart, color: 'from-violet-500 to-purple-600', sub: `${stats.pendingDeliveries} pending` },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue?.toLocaleString()}`, icon: FiDollarSign, color: 'from-emerald-500 to-teal-600', sub: 'Collected today' },
    { label: 'Pending Payments', value: `₹${stats.pendingPayments?.toLocaleString()}`, icon: FiTrendingUp, color: 'from-amber-500 to-orange-600', sub: 'Outstanding dues' },
  ];

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-slate-400 text-sm glass-card px-4 py-2 rounded-lg">
          📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, sub }, i) => (
          <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="text-white" size={20} />
              </div>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <FiTrendingUp size={12} /> +12%
              </span>
            </div>
            <div className="stat-value">{value ?? '--'}</div>
            <div className="stat-label">{label}</div>
            <p className="text-cyan-400/60 text-xs mt-2 font-medium">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Alert */}
      {stats.openComplaints > 0 && (
        <div className="mb-6 flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <FiAlertCircle size={18} />
          <span className="text-sm font-semibold">{stats.openComplaints} open complaint{stats.openComplaints > 1 ? 's' : ''} need attention</span>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 chart-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-sm uppercase tracking-wide">Monthly Revenue</h2>
            <span className="text-cyan-400/60 text-xs">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#06b6d4', r: 4 }} activeDot={{ r: 6, fill: '#22d3ee' }} name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Bar Chart */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-sm uppercase tracking-wide">Monthly Orders</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="url(#barGrad)" radius={[4, 4, 0, 0]} name="orders">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0891b2" />
                    <stop offset="100%" stopColor="#164e63" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-bold text-sm uppercase tracking-wide">Recent Orders</h2>
          <a href="/admin/orders" className="text-cyan-400 text-xs hover:text-cyan-300 font-semibold transition-colors">View All →</a>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order, i) => (
              <tr key={i}>
                <td className="text-cyan-400 font-semibold text-xs">{order.orderId}</td>
                <td className="font-medium text-white">{order.customer?.name}</td>
                <td className="text-slate-400">{order.waterType}</td>
                <td>{order.quantity}</td>
                <td className="font-semibold text-white">₹{order.totalAmount}</td>
                <td><StatusBadge status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
