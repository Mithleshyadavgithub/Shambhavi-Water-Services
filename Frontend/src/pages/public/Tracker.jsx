import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackButton from '../../components/BackButton';
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
  FiInfo,
  FiUserPlus,
  FiX
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

// Mock orders for preview
const RECENT_ORDERS_PREVIEW = [
  { orderId: 'ORD-DEMO1', date: '2026-08-22', waterType: '20L Can', quantity: 2, totalAmount: 120, status: 'delivered' },
  { orderId: 'ORD-DEMO2', date: '2026-08-20', waterType: '20L Can', quantity: 1, totalAmount: 70, status: 'delivered' },
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
      ml: i === 0 ? 0 : Math.floor(Math.random() * 1200) + 1800
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

export default function Tracker() {
  const { user, theme } = useAuth();
  const navigate = useNavigate();

  // --- STATE FOR WATER INTAKE TRACKER ---
  const [dashboardMode, setDashboardMode] = useState(() => {
    return localStorage.getItem('sws_dashboard_mode') || 'tracker';
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
      
      const updatedHistory = [...weeklyHistory.slice(1), newToday];
      setWeeklyHistory(updatedHistory);
      localStorage.setItem('sws_water_history', JSON.stringify(updatedHistory));
      
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
    <div className="water-bg min-h-screen">
      <Navbar />

      {/* Floating Close Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="fixed top-24 right-6 z-40 bg-slate-900/50 hover:bg-slate-900 border border-white/10 text-slate-400 hover:text-white p-2.5 rounded-full shadow-lg transition-all cursor-pointer"
        title="Go Back"
      >
        <FiX size={18} />
      </button>

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

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <BackButton />
          </div>
          
          {/* Header Banner for Unregistered Users */}
          {!user && (
            <div className="teal-panel rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-cyan-400/30 animate-fade-in">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <FiUserPlus size={22} />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-wide">You are using the Guest Tracker</h3>
                  <p className="text-white/80 text-xs mt-0.5">Your daily stats are saved locally. Sign up to unlock deliveries, auto-billing, and AI support!</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/register" className="btn-primary text-xs font-black py-2.5 px-4 rounded-xl">Register Now</Link>
                <Link to="/login" className="btn-outline text-xs font-black py-2.5 px-4 rounded-xl border-white/35">Login</Link>
              </div>
            </div>
          )}

          {/* Heading and Segment Slider */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl font-black text-white tracking-wide uppercase">
                {dashboardMode === 'standard' ? "Portal Preview 💻" : "Hydration Tracker 💧"}
              </h1>
              <p className="text-slate-400 mt-1 text-sm font-medium">
                {dashboardMode === 'standard' 
                  ? "Take a look at the Shambhavi user portal features." 
                  : "Track your drinking target with our high-fidelity logger tool."
                }
              </p>
            </div>

            {/* Segment Toggle */}
            <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/10 shadow-inner max-w-xs self-start sm:self-center">
              <button
                onClick={() => setDashboardMode('standard')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
                  dashboardMode === 'standard'
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard Preview
              </button>
              <button
                onClick={() => setDashboardMode('tracker')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
                  dashboardMode === 'tracker'
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Water Tracker (Pro)
              </button>
            </div>
          </div>

          {/* ========================================== */}
          {/* STANDARD VIEW PREVIEW                      */}
          {/* ========================================== */}
          {dashboardMode === 'standard' && (
            <div className="animate-fade-in">
              
              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {/* Subscription Card */}
                <div className="teal-panel rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-white/20 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Preview</div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <FiDroplet className="text-white" size={20} />
                    </div>
                    <span className="text-white/80 font-bold text-xs uppercase tracking-widest">Active Subscription</span>
                  </div>
                  <p className="text-white font-black text-xl mb-1">20L Can</p>
                  <p className="text-white/70 text-sm">1 Can / Day</p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/50 text-xs font-medium">Next Delivery</p>
                    <p className="text-white font-bold text-sm mt-0.5">Tomorrow, 10:00 AM</p>
                  </div>
                </div>

                {/* Next Delivery Card */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-cyan-500/20 text-cyan-400 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Preview</div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-center">
                      <FiCalendar className="text-violet-400" size={20} />
                    </div>
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Next Delivery</span>
                  </div>
                  <p className="text-white font-black text-xl mb-1">Tomorrow</p>
                  <p className="text-slate-400 text-sm">10:00 AM – 12:00 PM</p>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <span className="badge badge-assigned">Slot Booked</span>
                  </div>
                </div>

                {/* Outstanding Balance */}
                <div className="glass-card rounded-2xl p-6 border border-amber-500/20 relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-amber-500/20 text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Preview</div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
                      <FiAlertCircle className="text-amber-400" size={20} />
                    </div>
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Outstanding</span>
                  </div>
                  <p className="text-amber-400 font-black text-3xl mb-1">₹250</p>
                  <p className="text-slate-500 text-xs">Due since Aug 10</p>
                  <div className="mt-4">
                    <button onClick={() => navigate('/login')} className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold text-center block">Pay Now</button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button onClick={() => navigate('/register')}
                  className="btn-primary flex-1 py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2">
                  <FiShoppingCart size={18} /> Register to Order Water
                </button>
                <button onClick={() => navigate('/login')}
                  className="btn-outline flex-1 py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 border-white/35">
                  <FiCreditCard size={18} /> View Payments
                </button>
              </div>

              {/* Recent Orders Preview */}
              <div className="table-container">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                    <FiClock size={16} className="text-cyan-400" /> Recent Orders (Sample)
                  </h2>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>Order ID</th><th>Date</th><th>Product</th><th>Qty</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {RECENT_ORDERS_PREVIEW.map(o => (
                      <tr key={o.orderId}>
                        <td className="text-cyan-400 font-semibold text-xs">{o.orderId}</td>
                        <td className="text-slate-400 text-xs">{o.date}</td>
                        <td>{o.waterType}</td>
                        <td>{o.quantity}</td>
                        <td className="font-semibold text-white">₹{o.totalAmount}</td>
                        <td><span className={`badge ${STATUS_MAP[o.status]}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* WATER INTAKE TRACKER                       */}
          {/* ========================================== */}
          {dashboardMode === 'tracker' && (
            <div className="animate-fade-in">
              
              {/* Row 1: Visual, Add Log, History Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Visual Circle Progress */}
                <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-between min-h-[360px] border border-cyan-500/10">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                      <FiActivity className="text-cyan-400" size={14} /> Hydration Status
                    </span>
                    <span className="text-cyan-400 text-xs font-black">{Math.round(percentage)}%</span>
                  </div>

                  {/* Circle SVG */}
                  <div className="my-4">
                    <div className="wave-container border-4 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                      <div 
                        className="wave-liquid-wrapper"
                        style={{ transform: `translateY(${100 - percentage}%)` }}
                      >
                        <div className="wave-crest-1" />
                        <div className="wave-crest-2" />
                      </div>
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

                  {/* Hydro quote */}
                  <div className="text-center">
                    <p className="text-white text-xs font-semibold">
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
                    <p className="text-slate-500 text-[10px] mt-1">Goal: {waterGoal} ml • Remaining: {Math.max(0, waterGoal - waterConsumed)} ml</p>
                  </div>
                </div>

                {/* Log Control Card */}
                <div className="glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[360px] border border-cyan-500/10">
                  <div>
                    <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-5">
                      <FiDroplet className="text-cyan-400" size={14} /> Quick Add Intake
                    </span>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <button 
                        onClick={() => addWater(250, 'Glass')}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/50 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all group"
                      >
                        <FiDroplet className="text-slate-400 group-hover:text-cyan-400 transition-colors mb-1.5" size={20} />
                        <span className="text-white font-black text-xs">250 ml</span>
                        <span className="text-slate-500 text-[9px] mt-0.5">Glass</span>
                      </button>

                      <button 
                        onClick={() => addWater(500, 'Sport Bottle')}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/50 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all group"
                      >
                        <FiDroplet className="text-slate-400 group-hover:text-cyan-400 transition-colors mb-1.5" size={24} />
                        <span className="text-white font-black text-xs">500 ml</span>
                        <span className="text-slate-500 text-[9px] mt-0.5">Bottle</span>
                      </button>

                      <button 
                        onClick={() => addWater(1000, 'Carafe')}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/50 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all group"
                      >
                        <FiDroplet className="text-slate-400 group-hover:text-cyan-400 transition-colors mb-1.5" size={28} />
                        <span className="text-white font-black text-xs">1.0 L</span>
                        <span className="text-slate-500 text-[9px] mt-0.5">Carafe</span>
                      </button>
                    </div>

                    {/* Custom log input */}
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

                  {/* Reset/Setting Target footer */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <button onClick={resetToday} className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 text-xs transition-colors font-bold">
                      <FiRotateCcw size={13} /> Reset Day
                    </button>
                    
                    {!showGoalInput ? (
                      <button onClick={() => setShowGoalInput(true)} className="flex items-center gap-1 text-slate-500 hover:text-cyan-400 text-xs transition-colors font-bold">
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

                {/* History Analytics Card */}
                <div className="glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[360px] border border-cyan-500/10">
                  <div>
                    <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-4">
                      <FiActivity className="text-cyan-400" size={14} /> Weekly Consumption
                    </span>
                    <p className="text-slate-400 text-xs font-semibold mb-3">Daily water levels logged (ml)</p>
                  </div>

                  <div className="w-full h-44 mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyHistory} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="waterAreaGradPublic" x1="0" y1="0" x2="0" y2="1">
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
                          fill="url(#waterAreaGradPublic)" 
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

              {/* Row 2: History lists (Left) & Tips panel (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Entries table */}
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
                                <button onClick={() => deleteLog(log.id, log.amount)} className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors" title="Delete log">
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

                {/* Health details */}
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
                    <button onClick={() => setTipIndex(prev => (prev + 1) % HEALTH_TIPS.length)} className="text-cyan-400 hover:text-cyan-300 font-semibold">
                      Next Tip →
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
