import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiDroplet, 
  FiCalendar, 
  FiAlertCircle, 
  FiShoppingCart, 
  FiCreditCard, 
  FiClock, 
  FiPlus, 
  FiTrash2, 
  FiSettings, 
  FiActivity, 
  FiBookOpen, 
  FiAward,
  FiRotateCcw,
  FiInfo
} from 'react-icons/fi';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import api from '../../services/api';

// Recent orders mock data
const RECENT_ORDERS = [
  { orderId: 'ORD00138', date: '2026-08-20', waterType: '20L Can', quantity: 2, totalAmount: 120, status: 'delivered' },
  { orderId: 'ORD00132', date: '2026-08-18', waterType: '20L Can', quantity: 2, totalAmount: 120, status: 'delivered' },
  { orderId: 'ORD00125', date: '2026-08-16', waterType: '20L Can', quantity: 1, totalAmount: 70, status: 'delivered' },
  { orderId: 'ORD00145', date: '2026-08-21', waterType: '20L Can', quantity: 2, totalAmount: 120, status: 'pending' },
];

const STATUS_MAP = { delivered: 'badge-delivered', pending: 'badge-pending', assigned: 'badge-assigned', 'out-for-delivery': 'badge-out' };

const HEALTH_TIPS = [
  "Drink a glass of water right after waking up to activate internal organs.",
  "Drinking water before a meal helps digestion and natural portion control.",
  "Dehydration can cause fatigue, brain fog, and headaches. Keep sipping!",
  "Sip water continuously throughout the day rather than gulping large amounts.",
  "Water helps maintain energy levels and plays a vital role in muscle recovery.",
];

// Helper to get local date string YYYY-MM-DD
const getTodayDateStr = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper to generate last 7 days of hydration data
const generateInitialHistory = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const history = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = days[d.getDay()];
    history.push({
      date: dateStr,
      day: dayName,
      ml: i === 0 ? 0 : Math.floor(Math.random() * 1200) + 1800 // random ml between 1800 and 3000 ml
    });
  }
  return history;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-dark rounded-xl p-3 border border-cyan-500/20 shadow-lg">
        <p className="text-cyan-400 text-xs font-black mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white text-sm font-bold">
            {p.name === 'ml' ? `${p.value} ml` : `${p.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CustomerDashboard() {
  const { user, theme } = useAuth();
  const outstanding = 250;
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (user && user.customerId) {
      api.get(`/orders?customer=${user.customerId}&limit=5`)
        .then(res => {
          if (res.data.success) {
            setRecentOrders(res.data.data);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  // --- STATE FOR WATER INTAKE TRACKER ---
  const [dashboardMode, setDashboardMode] = useState(() => {
    return localStorage.getItem('sws_dashboard_mode') || 'standard';
  });

  const [waterGoal, setWaterGoal] = useState(() => {
    const val = localStorage.getItem('sws_water_goal');
    return val ? parseInt(val, 10) : 2500;
  });

  const [waterConsumed, setWaterConsumed] = useState(() => {
    const val = localStorage.getItem('sws_water_consumed');
    return val ? parseInt(val, 10) : 0;
  });

  const [waterLogs, setWaterLogs] = useState(() => {
    const val = localStorage.getItem('sws_water_logs');
    return val ? JSON.parse(val) : [];
  });

  const [weeklyHistory, setWeeklyHistory] = useState(() => {
    const val = localStorage.getItem('sws_water_history');
    if (val) {
      try {
        const parsed = JSON.parse(val);
        const todayStr = getTodayDateStr();
        const hasToday = parsed.some(item => item.date === todayStr);
        if (hasToday) return parsed;
      } catch (e) {
        console.error('Failed to parse water history', e);
      }
    }
    return generateInitialHistory();
  });

  const [customMl, setCustomMl] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState(waterGoal);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate health tips every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % HEALTH_TIPS.length);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('sws_dashboard_mode', dashboardMode);
  }, [dashboardMode]);

  useEffect(() => {
    localStorage.setItem('sws_water_goal', waterGoal.toString());
    setNewGoalValue(waterGoal);
  }, [waterGoal]);

  useEffect(() => {
    localStorage.setItem('sws_water_consumed', waterConsumed.toString());
    
    // Update weeklyHistory live for today
    const todayStr = getTodayDateStr();
    setWeeklyHistory(prev => {
      const updated = prev.map(item => {
        if (item.date === todayStr) {
          return { ...item, ml: waterConsumed };
        }
        return item;
      });
      localStorage.setItem('sws_water_history', JSON.stringify(updated));
      return updated;
    });
  }, [waterConsumed]);

  useEffect(() => {
    localStorage.setItem('sws_water_logs', JSON.stringify(waterLogs));
  }, [waterLogs]);

  // Handle Day Rollover Check
  useEffect(() => {
    const todayStr = getTodayDateStr();
    const lastItem = weeklyHistory[weeklyHistory.length - 1];
    
    if (lastItem && lastItem.date !== todayStr) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const d = new Date();
      const newToday = {
        date: todayStr,
        day: days[d.getDay()],
        ml: 0
      };
      
      // Keep last 6 days + add new today
      const updatedHistory = [...weeklyHistory.slice(1), newToday];
      setWeeklyHistory(updatedHistory);
      localStorage.setItem('sws_water_history', JSON.stringify(updatedHistory));
      
      // Reset today's logs and intake
      setWaterConsumed(0);
      setWaterLogs([]);
      localStorage.setItem('sws_water_consumed', '0');
      localStorage.setItem('sws_water_logs', '[]');
    }
  }, [weeklyHistory]);

  // --- ACTIONS ---
  const addWater = (amount, containerLabel = 'Glass') => {
    if (!amount || amount <= 0) return;
    const newConsumed = waterConsumed + amount;
    setWaterConsumed(newConsumed);
    
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      time,
      amount,
      label: containerLabel
    };
    setWaterLogs(prev => [newLog, ...prev]);
  };

  const deleteLog = (id, amount) => {
    setWaterLogs(prev => prev.filter(log => log.id !== id));
    setWaterConsumed(prev => Math.max(0, prev - amount));
  };

  const resetToday = () => {
    if (window.confirm('Are you sure you want to reset today\'s intake logs?')) {
      setWaterConsumed(0);
      setWaterLogs([]);
    }
  };

  const saveGoal = () => {
    const goalVal = parseInt(newGoalValue, 10);
    if (goalVal && goalVal > 0) {
      setWaterGoal(goalVal);
      setShowGoalInput(false);
    }
  };

  const percentage = Math.min((waterConsumed / waterGoal) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <style>
        {`
          @keyframes wave-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .wave-container {
            position: relative;
            width: 175px;
            height: 175px;
            background: ${theme === 'light' ? '#f1f5f9' : '#0a192f'};
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .wave-liquid-wrapper {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, #22d3ee 0%, #0891b2 100%);
            transition: transform 1.2s cubic-bezier(0.1, 0.8, 0.25, 1);
            border-radius: 50%;
          }
          .wave-crest-1 {
            position: absolute;
            width: 230%;
            height: 230%;
            top: -215%;
            left: -65%;
            background: ${theme === 'light' ? '#f1f5f9' : '#0a1628'};
            border-radius: 38%;
            animation: wave-rotate 9s infinite linear;
          }
          .wave-crest-2 {
            position: absolute;
            width: 230%;
            height: 230%;
            top: -210%;
            left: -65%;
            background: ${theme === 'light' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(34, 211, 238, 0.25)'};
            border-radius: 41%;
            animation: wave-rotate 5s infinite linear;
          }
        `}
      </style>

      {/* Header and Toggle Mode Slider */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b pb-6 ${
        theme === 'light' ? 'border-slate-200' : 'border-white/5'
      }`}>
        <div>
          <h1 className={`text-3xl font-black tracking-wide uppercase ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {dashboardMode === 'standard' ? `Welcome, ${user?.name?.split(' ')[0] || 'Ravi'} 👋` : "Hydration Tracker 💧"}
          </h1>
          <p className={`mt-1 text-sm font-medium ${
            theme === 'light' ? 'text-slate-600 font-semibold' : 'text-slate-400'
          }`}>
            {dashboardMode === 'standard' 
              ? "Here's a summary of your account and orders." 
              : "Track, monitor, and configure your daily water consumption."
            }
          </p>
        </div>

        {/* Premium Sliding Toggle */}
        <div className={`flex p-1 rounded-2xl border shadow-inner max-w-xs self-start sm:self-center ${
          theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-slate-950/60 border-white/10'
        }`}>
          <button
            onClick={() => setDashboardMode('standard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
              dashboardMode === 'standard'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : (theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            Account Summary
          </button>
          <button
            onClick={() => setDashboardMode('tracker')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
              dashboardMode === 'tracker'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : (theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
            }`}
          >
            Water Tracker (Pro)
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* STANDARD DASHBOARD VIEW                    */}
      {/* ========================================== */}
      {dashboardMode === 'standard' && (
        <>
          {/* Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {/* Subscription */}
            <div className="teal-panel rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === 'light' ? 'bg-cyan-100 text-cyan-700' : 'bg-white/20 text-white'
                }`}>
                  <FiDroplet size={20} />
                </div>
                <span className={`font-bold text-xs uppercase tracking-widest ${
                  theme === 'light' ? 'text-cyan-800' : 'text-white/80'
                }`}>Active Subscription</span>
              </div>
              <p className={`font-black text-xl mb-1 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>20L Can</p>
              <p className={`text-sm ${
                theme === 'light' ? 'text-slate-600 font-medium' : 'text-white/70'
              }`}>1 Can / Day</p>
              <div className={`mt-4 pt-4 border-t ${
                theme === 'light' ? 'border-cyan-200' : 'border-white/10'
              }`}>
                <p className={`text-xs font-bold ${
                  theme === 'light' ? 'text-slate-500' : 'text-white/50'
                }`}>Next Delivery</p>
                <p className={`font-bold text-sm mt-0.5 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>Tomorrow, 10:00 AM</p>
              </div>
            </div>

            {/* Next Delivery */}
            <div className="glass-card rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === 'light' ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 text-violet-400'
                }`}>
                  <FiCalendar size={20} />
                </div>
                <span className={`font-bold text-xs uppercase tracking-widest ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>Next Delivery</span>
              </div>
              <p className={`font-black text-xl mb-1 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>Tomorrow</p>
              <p className={`text-sm ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>10:00 AM – 12:00 PM</p>
              <div className={`mt-4 pt-4 border-t ${
                theme === 'light' ? 'border-slate-100' : 'border-white/5'
              }`}>
                <span className="badge badge-assigned">Slot Booked</span>
              </div>
            </div>

            {/* Outstanding */}
            <div className={`glass-card rounded-2xl p-6 border shadow-md ${
              theme === 'light' ? 'border-amber-400/40 bg-amber-50/20' : 'border-amber-500/20'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === 'light' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-amber-400'
                }`}>
                  <FiAlertCircle size={20} />
                </div>
                <span className={`font-bold text-xs uppercase tracking-widest ${
                  theme === 'light' ? 'text-amber-800' : 'text-slate-400'
                }`}>Outstanding</span>
              </div>
              <p className={`font-black text-3xl mb-1 ${
                theme === 'light' ? 'text-amber-700' : 'text-amber-400'
              }`}>₹{outstanding}</p>
              <p className={`text-xs ${
                theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-500'
              }`}>Due since Aug 10</p>
              <div className="mt-4">
                <Link to="/portal/payments" className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold text-center block shadow-md">Pay Now</Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link to="/order" id="portal-order-water"
              className="btn-primary flex-1 py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
              <FiShoppingCart size={18} /> Order Water
            </Link>
            <Link to="/portal/payments" id="portal-pay-now"
              className={`flex-1 py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 border transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50 hover:border-cyan-500'
                  : 'btn-outline'
              }`}>
              <FiCreditCard size={18} /> View Payments
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="table-container">
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              theme === 'light' ? 'border-slate-100' : 'border-white/5'
            }`}>
              <h2 className={`font-bold text-sm uppercase tracking-wide flex items-center gap-2 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                <FiClock size={16} className={theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} /> Recent Orders
              </h2>
              <Link to="/portal/orders" className={`text-xs font-bold ${
                theme === 'light' ? 'text-cyan-700 hover:text-cyan-800' : 'text-cyan-400 hover:text-cyan-300'
              }`}>View All →</Link>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Order ID</th><th>Date</th><th>Product</th><th>Qty</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-500 py-6">No recent orders found</td>
                  </tr>
                ) : (
                  recentOrders.map(o => (
                    <tr key={o._id || o.orderId}>
                      <td className={`font-semibold text-xs ${
                        theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'
                      }`}>{o.orderId}</td>
                      <td className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                      </td>
                      <td className={theme === 'light' ? 'text-slate-800 font-medium' : ''}>{o.waterType}</td>
                      <td className={theme === 'light' ? 'text-slate-800 font-medium' : ''}>{o.quantity}</td>
                      <td className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>₹{o.totalAmount}</td>
                      <td><span className={`badge ${STATUS_MAP[o.status] || 'badge-pending'}`}>{o.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========================================== */}
      {/* PROFESSIONAL WATER INTAKE TRACKER VIEW    */}
      {/* ========================================== */}
      {dashboardMode === 'tracker' && (
        <div className="animate-fade-in">
          
          {/* Row 1: Hydration Gauge, Logger Panel, Recharts Weekly Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Visual Gauge Card */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-between min-h-[360px] border border-cyan-500/10">
              <div className="w-full flex items-center justify-between">
                <span className={`font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  <FiActivity className={theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} size={14} /> Hydration Status
                </span>
                <span className={`text-xs font-black ${
                  theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'
                }`}>{Math.round(percentage)}%</span>
              </div>

              {/* Wave circular indicator */}
              <div className="my-4">
                <div className="wave-container border-4 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                  {/* Liquid Wrapper */}
                  <div 
                    className="wave-liquid-wrapper"
                    style={{ transform: `translateY(${100 - percentage}%)` }}
                  >
                    <div className="wave-crest-1" />
                    <div className="wave-crest-2" />
                  </div>
                  {/* Text Overlay */}
                  <div className="relative z-10 text-center select-none pointer-events-none">
                    <span className="text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                      {Math.round(percentage)}%
                    </span>
                    <p className="text-[10px] font-black text-cyan-200 uppercase tracking-widest mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      Hydrated
                    </p>
                    <p className="text-white text-[11px] mt-1.5 font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {waterConsumed} / {waterGoal} ml
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Quote */}
              <div className="text-center">
                <p className={`text-xs font-semibold ${
                  theme === 'light' ? 'text-slate-800' : 'text-white'
                }`}>
                  {percentage >= 100 
                    ? "Goal achieved! Excellent hydration! 🏆" 
                    : percentage >= 75 
                      ? "Almost there! Keep it up. 👍" 
                      : percentage >= 50 
                        ? "Halfway done. Take a quick sip! 🥤" 
                        : percentage > 0 
                          ? "Good start. Keep tracking today! 💧" 
                          : "Hydrate yourself! Drink some water. ❄️"
                  }
                </p>
                <p className={`text-[10px] mt-1 ${
                  theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-500'
                }`}>Goal: {waterGoal} ml • Remaining: {Math.max(0, waterGoal - waterConsumed)} ml</p>
              </div>
            </div>

            {/* Quick Log Panel */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[360px] border border-cyan-500/10">
              <div>
                <span className={`font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-5 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  <FiDroplet className={theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} size={14} /> Quick Add Intake
                </span>

                {/* Preset Cups Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {/* Cup Preset */}
                  <button 
                    onClick={() => addWater(250, 'Glass')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group cursor-pointer ${
                      theme === 'light' 
                        ? 'bg-slate-50 hover:bg-cyan-50 border-slate-200 hover:border-cyan-400 shadow-xs' 
                        : 'bg-slate-900/50 hover:bg-cyan-500/10 border-white/5 hover:border-cyan-500/30'
                    }`}
                  >
                    <FiDroplet className={`${theme === 'light' ? 'text-cyan-600' : 'text-slate-400 group-hover:text-cyan-400'} transition-colors mb-1.5`} size={20} />
                    <span className={`font-black text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>250 ml</span>
                    <span className={`${theme === 'light' ? 'text-slate-500 font-medium' : 'text-slate-500'} text-[9px] mt-0.5`}>Glass</span>
                  </button>

                  {/* Bottle Preset */}
                  <button 
                    onClick={() => addWater(500, 'Sport Bottle')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group cursor-pointer ${
                      theme === 'light' 
                        ? 'bg-slate-50 hover:bg-cyan-50 border-slate-200 hover:border-cyan-400 shadow-xs' 
                        : 'bg-slate-900/50 hover:bg-cyan-500/10 border-white/5 hover:border-cyan-500/30'
                    }`}
                  >
                    <FiDroplet className={`${theme === 'light' ? 'text-cyan-600' : 'text-slate-400 group-hover:text-cyan-400'} transition-colors mb-1.5`} size={24} />
                    <span className={`font-black text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>500 ml</span>
                    <span className={`${theme === 'light' ? 'text-slate-500 font-medium' : 'text-slate-500'} text-[9px] mt-0.5`}>Bottle</span>
                  </button>

                  {/* Jug Preset */}
                  <button 
                    onClick={() => addWater(1000, 'Carafe')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group cursor-pointer ${
                      theme === 'light' 
                        ? 'bg-slate-50 hover:bg-cyan-50 border-slate-200 hover:border-cyan-400 shadow-xs' 
                        : 'bg-slate-900/50 hover:bg-cyan-500/10 border-white/5 hover:border-cyan-500/30'
                    }`}
                  >
                    <FiDroplet className={`${theme === 'light' ? 'text-cyan-600' : 'text-slate-400 group-hover:text-cyan-400'} transition-colors mb-1.5`} size={28} />
                    <span className={`font-black text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>1.0 L</span>
                    <span className={`${theme === 'light' ? 'text-slate-500 font-medium' : 'text-slate-500'} text-[9px] mt-0.5`}>Carafe</span>
                  </button>
                </div>

                {/* Custom Intake Input */}
                <div className="mb-4">
                  <label className="input-label text-[10px]">Custom Intake Amount</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="e.g. 350"
                      value={customMl}
                      onChange={(e) => setCustomMl(e.target.value)}
                      className="input-field py-2 text-sm flex-1"
                    />
                    <button 
                      onClick={() => {
                        const val = parseInt(customMl, 10);
                        if (val && val > 0) {
                          addWater(val, 'Custom');
                          setCustomMl('');
                        }
                      }}
                      className="btn-primary py-2 px-4 rounded-lg text-xs font-black flex items-center gap-1"
                    >
                      <FiPlus size={14} /> Log
                    </button>
                  </div>
                </div>
              </div>

              {/* Utility reset button */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={resetToday}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 text-xs transition-colors font-bold"
                >
                  <FiRotateCcw size={13} /> Reset Day
                </button>
                
                {/* Target Configuration Toggle */}
                {!showGoalInput ? (
                  <button 
                    onClick={() => setShowGoalInput(true)}
                    className="flex items-center gap-1 text-slate-500 hover:text-cyan-400 text-xs transition-colors font-bold"
                  >
                    <FiSettings size={13} /> Edit Target
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={newGoalValue}
                      onChange={(e) => setNewGoalValue(e.target.value)}
                      className="input-field py-1 px-2 text-xs w-16 text-center"
                    />
                    <button onClick={saveGoal} className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-[10px] font-bold text-white">Save</button>
                    <button onClick={() => setShowGoalInput(false)} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-slate-400">X</button>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Analysis Chart Card */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[360px] border border-cyan-500/10">
              <div>
                <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <FiActivity className="text-cyan-400" size={14} /> Weekly Consumption
                </span>
                <p className="text-slate-400 text-xs font-semibold mb-3">Daily water levels logged (ml)</p>
              </div>

              {/* Chart widget */}
              <div className="w-full h-44 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyHistory} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="waterAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 9 }} 
                      axisLine={false} 
                      tickLine={false}
                      width={28}
                      tickFormatter={(val) => `${val / 1000}L`} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={waterGoal} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Goal', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }} />
                    <Area 
                      type="monotone" 
                      dataKey="ml" 
                      stroke="#06b6d4" 
                      strokeWidth={2} 
                      fill="url(#waterAreaGrad)" 
                      dot={{ fill: '#22d3ee', r: 3 }} 
                      activeDot={{ r: 5, fill: '#ffffff' }}
                      name="ml"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-bold flex items-center gap-1">
                  <FiAward className="text-yellow-500" size={12} /> Target achieved: {weeklyHistory.filter(h => h.ml >= waterGoal).length} / 7 days
                </span>
                <span className="text-cyan-400 font-semibold">Today: {waterConsumed} ml</span>
              </div>
            </div>

          </div>

          {/* Row 2: Intake Logs (Left) and Health Tips/Information (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Today's Log entries */}
            <div className="glass-card rounded-2xl p-6 md:col-span-2 border border-cyan-500/10 flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <FiClock className="text-cyan-400" size={14} /> Today's Log History
                </span>
                
                {waterLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FiDroplet className="text-slate-600 mb-2 animate-bounce" size={24} />
                    <p className="text-slate-400 text-xs font-semibold">No logs added today.</p>
                    <p className="text-slate-600 text-[10px] mt-0.5">Use the presets above to start logging water.</p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto pr-1">
                    <div className="space-y-2">
                      {waterLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 hover:border-cyan-500/20 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                            <div>
                              <p className="text-white text-xs font-bold">{log.label}</p>
                              <p className="text-slate-500 text-[9px]">{log.time}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-cyan-400 font-black text-xs">+{log.amount} ml</span>
                            <button 
                              onClick={() => deleteLog(log.id, log.amount)}
                              className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                              title="Delete log"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Health Info and Tips */}
            <div className="glass-card rounded-2xl p-6 border border-cyan-500/10 flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <FiBookOpen className="text-cyan-400" size={14} /> Hydration Education
                </span>
                <p className="text-cyan-400/90 text-xs font-bold mb-2 flex items-center gap-1">
                  <FiInfo size={12} /> Did You Know?
                </p>
                <div className="bg-slate-900/40 rounded-xl p-3 border border-white/5 min-h-[85px] flex items-center">
                  <p className="text-slate-300 text-xs font-medium leading-relaxed italic">
                    "{HEALTH_TIPS[tipIndex]}"
                  </p>
                </div>
              </div>
              
              <div className="pt-3 text-[10px] text-slate-500 border-t border-white/5 flex items-center justify-between">
                <span>Tips rotate every 30s</span>
                <button 
                  onClick={() => setTipIndex(prev => (prev + 1) % HEALTH_TIPS.length)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Next Tip →
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
