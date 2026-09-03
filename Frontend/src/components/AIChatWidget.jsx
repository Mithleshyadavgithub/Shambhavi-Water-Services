import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiSend, FiUser, FiShoppingCart, FiZap, FiDroplet, FiLoader, 
  FiX, FiMessageSquare, FiArrowRight, FiCompass, FiHelpCircle, FiRotateCcw,
  FiMaximize, FiMinimize
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import api from '../services/api';
import RazorpayCheckout from './RazorpayCheckout';

const SUGGESTED_PROMPTS = [
  '🌟 Explore services',
  '🧮 Water requirement calculator',
  '📦 Show product catalog',
  '🚚 Track my order delivery',
  '💎 Water purity & TDS level',
  '📍 Delivery areas in Lucknow',
];

function TypingIndicator({ theme }) {
  return (
    <div className="flex items-end gap-2.5 mb-3.5">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0 animate-pulse shadow-sm shadow-cyan-500/20">
        <FaRobot size={12} className="text-white" />
      </div>
      <div className={`rounded-xl rounded-bl-sm px-3.5 py-2.5 ${
        theme === 'light' ? 'bg-slate-200/70 border border-slate-300' : 'bg-slate-900/50 border border-cyan-500/20'
      }`}>
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-cyan-600' : 'bg-cyan-400'}`}
              style={{ animation: `bounce-widget 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageNavWidgetCard({ data, navigate, closeWidget }) {
  const { theme } = useAuth();
  if (!data) return null;

  return (
    <div className={`mt-2 p-3 rounded-xl border shadow-sm ${
      theme === 'light' ? 'bg-white border-cyan-500/30' : 'bg-slate-900/90 border-cyan-500/30'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{data.icon || '🚀'}</span>
        <h5 className={`font-black text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
          {data.title}
        </h5>
        {data.badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-500 ml-auto">
            {data.badge}
          </span>
        )}
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mb-2">
        {data.desc}
      </p>
      <button
        onClick={() => {
          if (closeWidget) closeWidget();
          navigate(data.route);
        }}
        className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer shadow-sm"
      >
        <span>{data.actionText || 'Open Page'}</span>
        <FiArrowRight size={10} />
      </button>
    </div>
  );
}

function ServiceExplorerWidgetCard({ data, navigate, closeWidget, onProductClick }) {
  const { theme } = useAuth();
  const services = data?.services?.slice(0, 4) || [];

  return (
    <div className="mt-2 space-y-1.5">
      {services.map((svc) => (
        <div
          key={svc.id}
          className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
            theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/60 border-white/5'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm shrink-0">{svc.icon}</span>
            <div className="min-w-0">
              <p className={`font-bold text-[11px] truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {svc.title}
              </p>
              <p className="text-[9px] text-slate-400 truncate">{svc.badge}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (closeWidget) closeWidget();
              navigate(svc.route);
            }}
            className="text-[10px] font-bold text-cyan-500 hover:underline shrink-0 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Open</span>
            <FiArrowRight size={9} />
          </button>
        </div>
      ))}
    </div>
  );
}

function WaterCalcWidgetCard({ data, navigate, closeWidget, onProductClick }) {
  const { theme } = useAuth();
  const c = data?.calculation;
  if (!c) return null;

  return (
    <div className={`mt-2 p-2.5 rounded-xl border ${
      theme === 'light' ? 'bg-cyan-50/70 border-cyan-500/25' : 'bg-cyan-950/30 border-cyan-500/25'
    }`}>
      <div className="flex justify-between text-[11px] font-bold mb-1">
        <span className="text-slate-500 dark:text-slate-400">Monthly Jars:</span>
        <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">{c.recommended20LJarsPerMonth} × 20L Jars</span>
      </div>
      <div className="flex justify-between text-[11px] mb-2">
        <span className="text-slate-500 dark:text-slate-400">Subscription Price:</span>
        <span className="text-green-600 dark:text-green-400 font-black">₹{c.estimatedCostSubscription}/mo (Save ₹{c.monthlySavings})</span>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => {
            if (closeWidget) closeWidget();
            navigate('/products');
          }}
          className="flex-1 py-1 rounded-lg bg-cyan-600 text-white text-[10px] font-bold text-center cursor-pointer"
        >
          View Plans
        </button>
        <button
          onClick={() => onProductClick(`I want to order ${c.recommended20LJarsPerMonth} jars of 20L water`)}
          className="flex-1 py-1 rounded-lg border border-cyan-500/30 text-cyan-500 text-[10px] font-bold text-center hover:bg-cyan-500/10 cursor-pointer"
        >
          Order Now
        </button>
      </div>
    </div>
  );
}

function TrackOrderWidgetCard({ data, navigate, closeWidget }) {
  const { theme } = useAuth();
  const o = data?.order;
  if (!o) return null;

  return (
    <div className={`mt-2 p-2.5 rounded-xl border ${
      theme === 'light' ? 'bg-white border-cyan-500/30' : 'bg-slate-900/80 border-cyan-500/30'
    }`}>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="font-mono font-bold text-cyan-500">{o.orderNumber}</span>
        <span className="font-bold text-green-500 uppercase">{o.status}</span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">ETA: <strong className="text-white">{o.eta}</strong></p>
      <button
        onClick={() => {
          if (closeWidget) closeWidget();
          navigate(data.route || `/track/${o.orderNumber}`);
        }}
        className="w-full py-1 rounded-lg bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
      >
        <span>Open GPS Live Tracker</span>
        <FiArrowRight size={9} />
      </button>
    </div>
  );
}

function MessageBubble({ msg, theme, onProductClick, navigate, closeWidget }) {
  const isAI = msg.role === 'ai';

  if (msg.type === 'PAYMENT_READY') {
    return (
      <div className="flex items-start gap-2.5 sm:gap-3 mb-4 animate-fade-in w-full">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-500/20">
          <FaRobot size={14} className="text-white" />
        </div>
        <div className="flex-1 w-full max-w-md sm:max-w-lg md:max-w-xl">
          <div className={`rounded-2xl rounded-bl-sm p-4 sm:p-5 border ${
            theme === 'light' 
              ? 'bg-white border-cyan-500/40 shadow-md' 
              : 'bg-slate-900/90 border-cyan-500/30 shadow-lg'
          }`}>
            <p className={`text-xs sm:text-sm font-medium mb-3 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{msg.content}</p>
            <div className={`border rounded-xl p-3 mb-3 ${
              theme === 'light' 
                ? 'bg-cyan-50/50 border-cyan-500/25' 
                : 'bg-cyan-950/30 border-cyan-500/20'
            }`}>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400 font-medium'}>Order Total</span>
                <span className={`font-black text-sm sm:text-base ${theme === 'light' ? 'text-slate-900' : 'text-cyan-400'}`}>₹{msg.amount}</span>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px]">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Order Number</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">{msg.orderNumber || msg.orderId}</span>
              </div>
            </div>
            <RazorpayCheckout orderId={msg.orderId} amount={msg.amount} onSuccess={msg.onSuccess} onFailure={msg.onFailure} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2.5 mb-3.5 ${isAI ? '' : 'flex-row-reverse'} animate-fade-in w-full`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
        isAI
          ? 'bg-gradient-to-br from-cyan-500 to-teal-600 shadow-sm shadow-cyan-500/20'
          : 'bg-gradient-to-br from-violet-500 to-purple-600'
      }`}>
        {isAI ? <FaRobot size={12} className="text-white" /> : <FiUser size={12} className="text-white" />}
      </div>
      
      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
        isAI
          ? theme === 'light'
            ? 'bg-slate-200/80 border border-slate-300 text-slate-800 rounded-bl-sm shadow-sm'
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
                className={`pl-2.5 my-1.5 py-0.5 border-l-2 border-cyan-500/30 text-[11px] font-semibold leading-relaxed rounded-r-xl transition-all cursor-pointer group ${
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

        {/* Structured cards in widget */}
        {msg.type === 'PAGE_NAVIGATION' && (
          <PageNavWidgetCard data={msg.data} navigate={navigate} closeWidget={closeWidget} />
        )}
        {msg.type === 'SERVICE_EXPLORER' && (
          <ServiceExplorerWidgetCard data={msg.data} navigate={navigate} closeWidget={closeWidget} onProductClick={onProductClick} />
        )}
        {msg.type === 'WATER_CALCULATOR_RESULT' && (
          <WaterCalcWidgetCard data={msg.data} navigate={navigate} closeWidget={closeWidget} onProductClick={onProductClick} />
        )}
        {msg.type === 'TRACK_ORDER_RESULT' && (
          <TrackOrderWidgetCard data={msg.data} navigate={navigate} closeWidget={closeWidget} />
        )}

        {msg.toolCalls?.length > 0 && (
          <div className={`mt-1.5 pt-1.5 border-t flex flex-wrap gap-0.5 ${theme === 'light' ? 'border-slate-300' : 'border-white/10'}`}>
            {msg.toolCalls.map((t, i) => (
              <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                t.success 
                  ? theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-400' 
                  : theme === 'light' ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400'
              }`}>
                ⚡ {t.tool}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIChatWidget() {
  const { user, theme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [input, setInput] = useState('');
  const [showGreeting, setShowGreeting] = useState(() => {
    return !sessionStorage.getItem('sws_ai_greeting_dismissed');
  });

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `Hi ${user?.name?.split(' ')[0] || 'Friend'}! 👋 I'm **Shambhavi AI**, your virtual guide.\n\nAsk me anything about water delivery, subscriptions, purity specs, live tracking, or tap below to explore! 💧`,
      type: 'text',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) {
      document.body.classList.add('ai-widget-open');
    } else {
      document.body.classList.remove('ai-widget-open');
    }
    return () => document.body.classList.remove('ai-widget-open');
  }, [open]);

  useEffect(() => {
    const handleOpenWidget = () => {
      setOpen(true);
      setShowGreeting(false);
    };
    window.addEventListener('open-ai-widget', handleOpenWidget);
    return () => window.removeEventListener('open-ai-widget', handleOpenWidget);
  }, []);

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
                ? '✅ **Order Confirmed!** You selected Cash on Delivery. Your water delivery is scheduled within 2–4 hours. 💧' 
                : '✅ **Payment successful!** Your water delivery is confirmed within 2–4 hours. 💧',
              type: 'text',
            }]);
          },
          onFailure: (err) => {
            setMessages(prev => [...prev, {
              role: 'ai',
              content: `❌ **Payment failed.** _${err || 'Retry payment?'}_`,
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
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "I'm having a little trouble connecting right now. Please try again. 🙏",
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

  const dismissGreeting = (e) => {
    e.stopPropagation();
    setShowGreeting(false);
    sessionStorage.setItem('sws_ai_greeting_dismissed', 'true');
  };

  if (location.pathname === '/portal/ai-chat' || location.pathname === '/ai-assistant') {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes bounce-widget {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>

      {/* Floating Action Button (Circle AI Logo at Right Bottom ONLY) */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-auto">
          {/* Floating Greeting Bubble */}
          {showGreeting && (
            <div 
              onClick={() => setOpen(true)}
              className={`mb-3 w-64 p-3 rounded-2xl shadow-xl border cursor-pointer hover:scale-102 transition-transform duration-200 flex gap-2 items-start animate-fade-in ${
                theme === 'light' 
                  ? 'bg-white border-cyan-400 text-slate-800' 
                  : 'bg-slate-950 border-cyan-500/30 text-white'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 mt-0.5 shrink-0">
                <FaRobot size={11} className="animate-bounce" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-500">Shambhavi AI Guide</p>
                <p className="text-xs font-semibold leading-snug mt-0.5">Explore our water services, track orders, or calculate water intake! 💧</p>
              </div>
              <button 
                onClick={dismissGreeting}
                className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
              >
                <FiX size={12} />
              </button>
            </div>
          )}

          {/* Circular AI Logo Button */}
          <button
            onClick={() => { setOpen(true); setShowGreeting(false); }}
            className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center shadow-[0_8px_32px_rgba(6,182,212,0.6)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.85)] cursor-pointer transform hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white animate-pulse-glow"
            title="Ask Shambhavi AI"
            aria-label="Open Shambhavi AI"
          >
            {/* Pulsing online status indicator */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>

            <div className="flex flex-col items-center justify-center pointer-events-none">
              <FaRobot size={22} className="animate-float text-white" />
              <span className="text-[9px] font-black uppercase tracking-wider -mt-0.5 text-white">AI</span>
            </div>

            {/* Hover Tooltip */}
            <div className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-cyan-500/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Chat with Shambhavi AI
            </div>
          </button>
        </div>
      )}

      {/* Chat Drawer Overlay: RENDERED IN DOM ONLY WHEN OPEN */}
      {open && (
        <div 
          className={`fixed z-[10000] ${
            isFullScreen 
              ? 'inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6' 
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6'
          }`}
          onClick={() => { if (isFullScreen) { setOpen(false); setIsFullScreen(false); } }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className={`flex flex-col shadow-2xl overflow-hidden animate-fade-in ${
              isFullScreen
                ? 'w-full max-w-4xl h-[92vh] rounded-3xl border shadow-[0_0_80px_rgba(0,0,0,0.8)]'
                : 'w-[calc(100vw-2rem)] sm:w-[440px] h-[85vh] sm:h-[600px] max-h-[calc(100vh-4rem)] rounded-3xl border shadow-2xl'
            } ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-cyan-500/30'
            }`}
          >
        {/* Drawer Header */}
        <div className={`p-3.5 sm:p-4 border-b flex-shrink-0 ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-white/5'
        }`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-cyan-500/20">
                <FaRobot size={15} />
              </div>
              <div>
                <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                  <span>Shambhavi AI</span>
                  <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">2.0</span>
                </h3>
                <p className="text-[10px] text-green-500 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                  Online platform assistant
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="text-slate-400 hover:text-cyan-400 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title={isFullScreen ? "Minimize Window" : "Full Screen Window"}
              >
                {isFullScreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
              </button>
              <button 
                onClick={() => {
                  setOpen(false);
                  setIsFullScreen(false);
                }}
                className="text-slate-400 hover:text-red-400 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Close Assistant"
              >
                <FiX size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable messages list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto w-full space-y-2">
            {messages.map((msg, i) => (
              <MessageBubble 
                key={i} 
                msg={msg} 
                theme={theme} 
                onProductClick={sendMessage} 
                navigate={navigate} 
                closeWidget={() => setOpen(false)} 
              />
            ))}
            {loading && <TypingIndicator theme={theme} />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestion Prompts */}
        {messages.length <= 2 && !loading && (
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="max-w-4xl mx-auto w-full flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button 
                  key={i} 
                  onClick={() => sendMessage(prompt)}
                  className={`text-[11px] text-left px-2.5 py-1.5 rounded-xl border font-bold transition-all duration-200 cursor-pointer ${
                    theme === 'light' 
                      ? 'border-cyan-500/35 text-cyan-700 hover:bg-cyan-50' 
                      : 'border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/10'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <div className={`p-3 sm:p-4 border-t flex-shrink-0 ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-white/5'
        }`}>
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex gap-2.5 items-end">
              <textarea
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Explore services or ask anything..."
                disabled={loading}
                className={`flex-1 px-4 py-2.5 sm:py-3 pr-2 rounded-2xl border text-xs sm:text-sm resize-none focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-50 ${
                  theme === 'light'
                    ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    : 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:bg-white/8'
                }`}
                style={{ minHeight: '40px', maxHeight: '100px' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0 text-white hover:from-cyan-400 hover:to-teal-500 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-cyan-500/20"
              >
                {loading ? <FiLoader size={14} className="animate-spin" /> : <FiSend size={15} />}
              </button>
            </div>
            <p className={`text-center text-[10px] mt-2 leading-none ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
              Shambhavi Water 24/7 AI Platform Assistant
            </p>
          </div>
        </div>

      </div>
    </div>
  )}
</>
);
}
