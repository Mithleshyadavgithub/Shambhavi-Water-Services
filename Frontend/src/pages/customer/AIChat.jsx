import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import BackButton from '../../components/BackButton';
import { 
  FiSend, FiUser, FiShoppingCart, FiZap, FiDroplet, FiLoader, 
  FiCompass, FiMapPin, FiCheckCircle, FiArrowRight, FiShield, 
  FiActivity, FiLayers, FiHelpCircle, FiX, FiExternalLink, FiSearch, FiRotateCcw
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import api from '../../services/api';
import RazorpayCheckout from '../../components/RazorpayCheckout';

const QUICK_EXPLORATION_PILLS = [
  { label: '🌟 Explore Services', prompt: 'Explore all services and features' },
  { label: '🧮 Water Calculator', prompt: 'Calculate water requirement for family of 4' },
  { label: '📦 Browse Products', prompt: 'Show me all products and prices' },
  { label: '🚚 Live Order Tracker', prompt: 'How do I track my order delivery in real time?' },
  { label: '💎 Water Purity & TDS', prompt: 'What is your water TDS level and 8-stage purification?' },
  { label: '📋 Subscription Plans', prompt: 'What are your subscription plans and savings?' },
  { label: '📍 Delivery Areas', prompt: 'Where do you deliver in Lucknow?' },
  { label: '🛠️ Grievance & Support', prompt: 'How do I file a complaint or contact 24/7 support?' },
];

const ALL_PLATFORM_SERVICES = [
  {
    title: 'Product Catalog',
    route: '/products',
    category: 'Shop',
    badge: 'Popular',
    icon: '📦',
    desc: 'Browse 20L jars, 10L cans, 1L/2L/5L bottles, dispenser stands & pumps.',
  },
  {
    title: 'Instant Order & Checkout',
    route: '/order',
    category: 'Shop',
    badge: 'Fast',
    icon: '🛒',
    desc: 'Fast online checkout in under 60 seconds with Razorpay or Cash on Delivery.',
  },
  {
    title: 'Live GPS Delivery Tracker',
    route: '/track',
    category: 'Tracking',
    badge: 'Real-Time',
    icon: '🚚',
    desc: 'Track your delivery van live on interactive map with driver ETA.',
  },
  {
    title: 'Daily Hydration Tracker',
    route: '/tracker',
    category: 'Health',
    badge: 'Wellness',
    icon: '💧',
    desc: 'Interactive tool to log daily water intake, set health targets & reminders.',
  },
  {
    title: 'About Us & Purity Guide',
    route: '/about',
    category: 'Quality',
    badge: 'TDS 100-150',
    icon: '🧪',
    desc: '8-stage RO+UV purification, balanced minerals, and BIS/FSSAI certifications.',
  },
  {
    title: 'Contact & 24/7 Helpline',
    route: '/contact',
    category: 'Support',
    badge: '24/7',
    icon: '📞',
    desc: 'Helpline +91 98765 43210, WhatsApp assistance & emergency bulk requests.',
  },
  {
    title: 'Customer Dashboard',
    route: '/portal',
    category: 'Portal',
    badge: 'Account',
    icon: '📊',
    desc: 'Manage active deliveries, 1-click reorders & water consumption graphs.',
  },
  {
    title: 'My Orders & Invoices',
    route: '/portal/orders',
    category: 'Portal',
    badge: 'Orders',
    icon: '📋',
    desc: 'Past order history, real-time stage updates & downloadable receipts.',
  },
  {
    title: 'Payment History & Dues',
    route: '/portal/payments',
    category: 'Portal',
    badge: 'Billing',
    icon: '💳',
    desc: 'Online payment records, Razorpay invoice IDs & clear bottle dues.',
  },
  {
    title: 'Grievance & Complaints',
    route: '/portal/complaints',
    category: 'Support',
    badge: 'Guarantee',
    icon: '🛠️',
    desc: 'Report broken seal, delayed delivery or bottle pickup with 100% resolution.',
  },
  {
    title: 'Rate & Review Service',
    route: '/feedback',
    category: 'Feedback',
    badge: 'Reviews',
    icon: '⭐',
    desc: 'Submit ratings for water taste, delivery promptness & driver courtesy.',
  },
];

function TypingIndicator() {
  const { theme } = useAuth();
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0 animate-pulse shadow-md shadow-cyan-500/20">
        <FaRobot size={14} className="text-white" />
      </div>
      <div className={`rounded-2xl rounded-bl-sm px-4 py-3 ${
        theme === 'light' ? 'bg-slate-200/70 border border-slate-300' : 'glass-card'
      }`}>
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map(i => (
            <span key={i} className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-cyan-600' : 'bg-cyan-400'}`}
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageNavigationCard({ data, navigate, onAskAI }) {
  const { theme } = useAuth();
  if (!data) return null;

  return (
    <div className={`mt-3 p-4 rounded-2xl border transition-all duration-200 shadow-lg ${
      theme === 'light'
        ? 'bg-gradient-to-br from-white to-cyan-50/60 border-cyan-500/30'
        : 'bg-gradient-to-br from-slate-900/90 to-cyan-950/30 border-cyan-500/30'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{data.icon || '🚀'}</span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`font-black text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {data.title}
              </h4>
              {data.badge && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  {data.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {data.desc}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-cyan-500/15">
        <button
          onClick={() => navigate(data.route)}
          className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
        >
          <span>{data.actionText || 'Open Page'}</span>
          <FiArrowRight size={13} />
        </button>
        {onAskAI && (
          <button
            onClick={() => onAskAI(`Tell me more about ${data.title}`)}
            className="py-2 px-3 rounded-xl border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 text-xs font-bold transition-all cursor-pointer"
            title="Ask AI details"
          >
            <FiHelpCircle size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function ServiceExplorerCard({ data, navigate, onAskAI }) {
  const { theme } = useAuth();
  const services = data?.services || [];

  return (
    <div className="mt-3 space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {services.map((svc) => (
          <div
            key={svc.id}
            className={`p-3 rounded-xl border transition-all duration-200 hover:border-cyan-500/50 hover:shadow-md ${
              theme === 'light'
                ? 'bg-white/90 border-slate-200'
                : 'bg-slate-900/60 border-white/10'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xl shrink-0 p-1.5 rounded-lg bg-cyan-500/10">{svc.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h5 className={`font-black text-xs truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {svc.title}
                  </h5>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shrink-0">
                    {svc.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {svc.desc}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => navigate(svc.route)}
                    className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{svc.actionText || 'Explore'}</span>
                    <FiArrowRight size={10} />
                  </button>
                  <button
                    onClick={() => onAskAI(`How does ${svc.title} work?`)}
                    className="text-[10px] text-slate-400 hover:text-cyan-400 cursor-pointer ml-auto"
                  >
                    Ask AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaterCalculatorCard({ data, navigate, onAskAI }) {
  const { theme } = useAuth();
  const c = data?.calculation;
  const input = data?.input;
  if (!c) return null;

  return (
    <div className={`mt-3 p-4 rounded-2xl border ${
      theme === 'light'
        ? 'bg-gradient-to-br from-cyan-50/70 to-teal-50/50 border-cyan-500/30'
        : 'bg-gradient-to-br from-slate-900 to-cyan-950/40 border-cyan-500/30'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧮</span>
          <span className={`font-black text-xs uppercase tracking-wider ${theme === 'light' ? 'text-cyan-900' : 'text-cyan-300'}`}>
            Hydration Calculation Summary
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500">
          {input?.peopleCount} {input?.userType === 'office' ? 'Staff' : 'Members'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className={`p-2.5 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`}>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Daily Intake</p>
          <p className="text-sm font-black text-cyan-600 dark:text-cyan-400">{c.dailyLiters} Liters/day</p>
        </div>
        <div className={`p-2.5 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`}>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Monthly 20L Jars</p>
          <p className="text-sm font-black text-teal-600 dark:text-teal-400">{c.recommended20LJarsPerMonth} Jars/mo</p>
        </div>
      </div>

      <div className={`p-3 rounded-xl mb-3 border ${theme === 'light' ? 'bg-white/80 border-cyan-500/20' : 'bg-cyan-950/30 border-cyan-500/20'}`}>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-500 dark:text-slate-400">One-Time Price:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300 line-through">₹{c.estimatedCostOneTime}/mo</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-cyan-600 dark:text-cyan-400">Subscription Price:</span>
          <span className="font-black text-base text-green-600 dark:text-green-400">₹{c.estimatedCostSubscription}/mo</span>
        </div>
        <p className="text-[11px] text-green-600 dark:text-green-400 font-bold mt-1">
          🎉 You save ₹{c.monthlySavings}/month with a subscription!
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate('/products')}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <span>Subscribe & Save</span>
          <FiArrowRight size={12} />
        </button>
        <button
          onClick={() => onAskAI(`I want to order ${c.recommended20LJarsPerMonth} jars of 20L water`)}
          className="py-2 px-3 rounded-xl border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold hover:bg-cyan-500/10 cursor-pointer"
        >
          Order Now
        </button>
      </div>
    </div>
  );
}

function TrackOrderCard({ data, navigate }) {
  const { theme } = useAuth();
  const o = data?.order;
  if (!o) return null;

  return (
    <div className={`mt-3 p-4 rounded-2xl border ${
      theme === 'light'
        ? 'bg-white border-cyan-500/30 shadow-md'
        : 'glass-card border-cyan-500/30'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{o.orderNumber}</span>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 uppercase">
          {o.status.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-1.5 text-xs mb-3">
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Items:</span>
          <span className="font-bold text-slate-800 dark:text-white">{o.quantity} × {o.waterType}</span>
        </div>
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Amount:</span>
          <span className="font-black text-slate-800 dark:text-white">₹{o.totalAmount}</span>
        </div>
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>ETA:</span>
          <span className="font-black text-cyan-600 dark:text-cyan-400">{o.eta}</span>
        </div>
      </div>

      <button
        onClick={() => navigate(data.route || `/track/${o.orderNumber}`)}
        className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
      >
        <span>Open Live GPS Map Tracker</span>
        <FiArrowRight size={12} />
      </button>
    </div>
  );
}

function MessageBubble({ msg, onProductClick, navigate }) {
  const { theme } = useAuth();
  const isAI = msg.role === 'ai';

  if (msg.type === 'PAYMENT_READY') {
    return (
      <div className="flex items-start gap-3 mb-4 animate-fade-in w-full">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/20">
          <FaRobot size={14} className="text-white" />
        </div>
        <div className="flex-1 w-full max-w-md sm:max-w-lg md:max-w-xl">
          <div className={`rounded-2xl rounded-bl-sm p-4 sm:p-5 border ${
            theme === 'light' 
              ? 'bg-white border-cyan-500/40 shadow-md' 
              : 'glass-card border-cyan-500/30 shadow-lg'
          }`}>
            <p className={`text-sm mb-3 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{msg.content || ''}</p>
            <div className={`border rounded-xl p-3 mb-3 ${
              theme === 'light' 
                ? 'bg-cyan-50/50 border-cyan-500/20' 
                : 'bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} text-xs`}>Order Total</span>
                <span className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-black text-lg`}>₹{msg.amount}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} text-xs`}>Order #</span>
                <span className="text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold">{msg.orderNumber || msg.orderId}</span>
              </div>
            </div>
            <RazorpayCheckout orderId={msg.orderId} amount={msg.amount} onSuccess={msg.onSuccess} onFailure={msg.onFailure} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-3 mb-4 ${isAI ? '' : 'flex-row-reverse'} animate-fade-in`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isAI
          ? 'bg-gradient-to-br from-cyan-500 to-teal-600 shadow-md shadow-cyan-500/20'
          : 'bg-gradient-to-br from-violet-500 to-purple-600'
      }`}>
        {isAI ? <FaRobot size={14} className="text-white" /> : <FiUser size={14} className="text-white" />}
      </div>
      
      <div className={`max-w-xs sm:max-w-md lg:max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isAI
          ? theme === 'light'
            ? 'bg-slate-200/70 border border-slate-300 text-slate-800 rounded-bl-sm shadow-sm'
            : 'glass-card rounded-bl-sm text-slate-100'
          : 'bg-gradient-to-br from-cyan-600 to-teal-700 rounded-br-sm text-[#ffffff] shadow-sm'
      }`}>
        {/* Render text with smart highlight & clicks */}
        {(msg?.content || '').split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <p key={i} className={`font-bold my-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {line.slice(2, -2)}
              </p>
            );
          }
          if (line.startsWith('• ')) {
            const boldMatch = line.match(/\*\*(.*?)\*\*/);
            const quoteMatch = line.match(/"(.*?)"/);
            
            let actionText = '';
            let highlightedHtml = '';
            
            if (boldMatch) {
              const itemTitle = boldMatch[1];
              actionText = `I want to order 1 ${itemTitle}`;
              highlightedHtml = line.replace(/\*\*(.*?)\*\*/g, `<strong class="${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} font-black hover:underline cursor-pointer">$1</strong>`);
            } else if (quoteMatch) {
              const optionText = quoteMatch[1];
              actionText = optionText;
              highlightedHtml = line.replace(/"(.*?)"/g, `"<strong class="${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} font-black hover:underline cursor-pointer">$1</strong>"`);
            } else {
              highlightedHtml = line;
            }
            
            return (
              <p 
                key={i} 
                className={`pl-2.5 my-1.5 py-0.5 border-l-2 border-cyan-500/30 text-xs font-semibold leading-relaxed rounded-r-xl transition-all cursor-pointer group ${
                  theme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5'
                }`}
                onClick={() => {
                  if (onProductClick && actionText) {
                    onProductClick(actionText);
                  }
                }}
                dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
              />
            );
          }
          if (line.trim() === '') return <div key={i} className="h-1.5" />;
          
          const boldReplaced = line.replace(/\*\*(.*?)\*\*/g, `<strong class="${theme === 'light' ? 'text-slate-900 font-black' : 'text-white font-black'}">$1</strong>`);
          return <p key={i} dangerouslySetInnerHTML={{ __html: boldReplaced }} />;
        })}

        {/* Structured Interactive Component Cards */}
        {msg.type === 'PAGE_NAVIGATION' && (
          <PageNavigationCard data={msg.data} navigate={navigate} onAskAI={onProductClick} />
        )}
        {msg.type === 'SERVICE_EXPLORER' && (
          <ServiceExplorerCard data={msg.data} navigate={navigate} onAskAI={onProductClick} />
        )}
        {msg.type === 'WATER_CALCULATOR_RESULT' && (
          <WaterCalculatorCard data={msg.data} navigate={navigate} onAskAI={onProductClick} />
        )}
        {msg.type === 'TRACK_ORDER_RESULT' && (
          <TrackOrderCard data={msg.data} navigate={navigate} />
        )}

        {/* Tool calls badges */}
        {msg.toolCalls?.length > 0 && (
          <div className={`mt-2.5 pt-2 border-t flex flex-wrap gap-1.5 ${theme === 'light' ? 'border-slate-300/60' : 'border-white/10'}`}>
            {msg.toolCalls.map((t, i) => (
              <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                t.success 
                  ? theme === 'light' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-green-500/20 text-green-400' 
                  : theme === 'light' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-red-500/20 text-red-400'
              }`}>
                ⚡ {t.tool || 'Action'}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIChat() {
  const { user, theme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicRoute = location.pathname === '/ai-assistant' || !location.pathname.startsWith('/portal');

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `Hello ${user?.name?.split(' ')[0] || 'Friend'}! 👋 I'm **Shambhavi AI**, your intelligent water commerce and platform guide.\n\nI can help you:\n• 🌟 **Explore all services** & features of Shambhavi Water\n• 🧭 **Navigate to any page** (Products, Live Tracker, Hydration Tool, About Us)\n• 🧮 **Calculate water requirement** for your family or office\n• 📦 **Order water jars & bottles** with conversational Razorpay checkout\n• 💎 **Verify purity specs** (TDS 100-150 ppm, 8-Stage RO+UV)\n\nWhat would you like to explore today?`,
      type: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userText, type: 'text' }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: userText,
        sessionId,
      });

      if (!sessionId && data.sessionId) setSessionId(data.sessionId);

      if (data.type === 'PAYMENT_READY') {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: data.response,
          type: 'PAYMENT_READY',
          orderId: data.orderId,
          amount: data.amount,
          orderNumber: data.orderNumber,
          data: data.data,
          toolCalls: data.toolCalls,
          onSuccess: (orderData) => {
            const isCash = orderData?.paymentMethod === 'cash';
            setMessages(prev => [...prev, {
              role: 'ai',
              content: isCash
                ? '✅ **Order Confirmed!** You selected Cash on Delivery.\n\nYou can track your delivery vehicle in real-time in **Live Order Tracker**. Expect delivery within 2–4 hours. 💧'
                : '✅ **Payment successful!** Your water delivery is confirmed.\n\nYou can track your delivery vehicle in real-time in **Live Order Tracker**. Expect delivery within 2–4 hours. 💧',
              type: 'PAGE_NAVIGATION',
              data: {
                title: 'Live Order Tracker',
                route: '/track',
                badge: 'GPS Live',
                icon: '🚚',
                desc: 'Track your delivery van in real-time on live map with driver ETA',
                actionText: 'Track Order Now',
              },
            }]);
          },
          onFailure: (err) => {
            setMessages(prev => [...prev, {
              role: 'ai',
              content: `❌ **Payment was not completed.**\n\n_${err || 'Something went wrong.'}_\n\nYour order is saved. Would you like to **retry payment** or choose Cash on Delivery?`,
              type: 'text',
            }]);
          },
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: data.response,
          type: data.type || 'text',
          data: data.data,
          toolCalls: data.toolCalls,
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "I'm having a little trouble connecting right now. Please try again or tap one of the quick exploration buttons below. 🙏",
        type: 'text',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredDirectory = ALL_PLATFORM_SERVICES.filter(p =>
    p.title.toLowerCase().includes(directorySearch.toLowerCase()) ||
    p.desc.toLowerCase().includes(directorySearch.toLowerCase()) ||
    p.category.toLowerCase().includes(directorySearch.toLowerCase())
  );

  const chatContent = (
    <div className={`flex flex-col h-full w-full transition-colors duration-200 ${
      theme === 'light' ? 'bg-slate-50' : 'bg-slate-950/90'
    }`}>
      {/* Header */}
      <div className={`flex-shrink-0 border-b px-4 sm:px-6 py-3.5 ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'glass-dark border-white/5'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="relative animate-float">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <FaRobot size={20} className="text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-50 dark:border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className={`font-black text-sm uppercase tracking-wide flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                <span>Shambhavi AI</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-extrabold">2.0</span>
              </h1>
              <p className="text-green-500 text-xs flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                Online — Platform Guide & Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDirectoryModal(true)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-300 hover:bg-cyan-100'
                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
              }`}
            >
              <FiCompass size={13} className="text-cyan-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">Explore</span> All Services
            </button>
            <button
              onClick={() => {
                setMessages([
                  {
                    role: 'ai',
                    content: `Hello! 👋 How can I help you explore Shambhavi Water Services today?`,
                    type: 'text',
                  },
                ]);
              }}
              className={`p-2 rounded-xl border text-slate-400 hover:text-cyan-400 transition-all cursor-pointer ${
                theme === 'light' ? 'border-slate-200 bg-slate-100' : 'border-white/5 bg-white/5'
              }`}
              title="Reset Chat"
            >
              <FiRotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Top Quick Exploration Pills */}
      <div className={`flex-shrink-0 border-b px-4 py-2 overflow-x-auto no-scrollbar ${
        theme === 'light' ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-900/40 border-white/5'
      }`}>
        <div className="max-w-4xl mx-auto flex gap-2 items-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
            Quick Topics:
          </span>
          {QUICK_EXPLORATION_PILLS.map((pill, i) => (
            <button
              key={i}
              onClick={() => sendMessage(pill.prompt)}
              className={`text-xs px-3 py-1 rounded-lg border font-bold shrink-0 transition-all duration-150 cursor-pointer ${
                theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-600 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-400'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onProductClick={sendMessage} navigate={navigate} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className={`flex-shrink-0 border-t px-4 py-4 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'glass-dark border-white/5'
      }`}>
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              id="ai-chat-input"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything: 'Explore services', 'Calculate water for 4 people', 'Show products'..."
              disabled={loading}
              className={`w-full px-4 py-3 pr-12 rounded-2xl border text-sm resize-none focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-50 ${
                theme === 'light'
                  ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                  : 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:bg-white/8'
              }`}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            id="ai-send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0 hover:from-cyan-400 hover:to-teal-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
          >
            {loading ? <FiLoader size={16} className="text-white animate-spin" /> : <FiSend size={16} className="text-white" />}
          </button>
        </div>
        <p className={`text-center text-[11px] mt-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
          AI Assistant can navigate pages, calculate requirements, and process water deliveries across Lucknow.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {isPublicRoute ? (
        <div className="min-h-screen water-bg flex flex-col">
          <Navbar />
          <main className="flex-1 pt-24 pb-6 px-3 sm:px-6 flex flex-col max-w-5xl w-full mx-auto">
            <div className={`flex-1 flex flex-col rounded-3xl border shadow-2xl overflow-hidden min-h-[580px] h-[calc(100vh-120px)] ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-cyan-500/30'
            }`}>
              {chatContent}
            </div>
          </main>
        </div>
      ) : (
        <div className="h-[calc(100vh-64px)] w-full">
          {chatContent}
        </div>
      )}

      {/* Explore All Services Directory Modal */}
      {showDirectoryModal && (
        <div className="modal-overlay z-[70] p-4 flex items-center justify-center" onClick={() => setShowDirectoryModal(false)}>
          <div className={`modal-box max-w-2xl w-full max-h-[85vh] flex flex-col p-6 rounded-3xl ${
            theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white border border-cyan-500/30'
          }`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                  <FiCompass className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-wide">Platform Services Directory</h3>
                  <p className="text-xs text-slate-400">Explore all features & pages of Shambhavi Water Services</p>
                </div>
              </div>
              <button onClick={() => setShowDirectoryModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer">
                <FiX size={18} />
              </button>
            </div>

            {/* Search filter */}
            <div className="my-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FiSearch size={14} />
              </span>
              <input
                type="text"
                placeholder="Search services, tracking, water purity, subscriptions..."
                value={directorySearch}
                onChange={e => setDirectorySearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                  theme === 'light'
                    ? 'bg-slate-100 border-slate-200 text-slate-900 focus:bg-white focus:border-cyan-500'
                    : 'bg-slate-950/60 border-white/10 text-white focus:border-cyan-500'
                }`}
              />
            </div>

            {/* Grid of services */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredDirectory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all hover:border-cyan-500/50 hover:shadow-lg ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <h4 className="font-bold text-xs">{item.title}</h4>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowDirectoryModal(false);
                          navigate(item.route);
                        }}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Open Page</span>
                        <FiArrowRight size={10} />
                      </button>
                      <button
                        onClick={() => {
                          setShowDirectoryModal(false);
                          sendMessage(`Tell me everything about ${item.title}`);
                        }}
                        className="py-1.5 px-2.5 rounded-lg border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-bold text-[11px] hover:bg-cyan-500/10 cursor-pointer"
                      >
                        Ask AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </>
  );
}
