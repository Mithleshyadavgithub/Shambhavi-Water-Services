import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { FiGrid, FiShoppingCart, FiCreditCard, FiMessageSquare, FiLogOut, FiDroplet, FiSun, FiMoon, FiHome, FiSearch, FiX } from 'react-icons/fi';

const navItems = [
  { to: '/portal', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/portal/orders', icon: FiShoppingCart, label: 'My Orders' },
  { to: '/portal/payments', icon: FiCreditCard, label: 'Payments' },
  { to: '/portal/complaints', icon: FiMessageSquare, label: 'Complaints' },
];

const PRODUCTS_LIST = [
  { name: '1L Bottle', price: 10, desc: 'RO Purified Portable Bottle', img: '/shambhavi-bottle-1l.jpg' },
  { name: '2L Bottle', price: 20, desc: 'RO Purified Reusable Bottle', img: '/shambhavi-bottle-2l.jpg' },
  { name: '18L Can', price: 40, desc: 'Milton Style Orange Dispenser', img: '/shambhavi-dispenser-18l.jpg' },
  { name: '20L Can', price: 40, desc: 'Transparent Blue Returnable Can', img: '/shambhavi-can-20l.jpg' },
];

export default function CustomerLayout() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  // Header menu & search states
  const [showWebsiteMenu, setShowWebsiteMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  // Quick order states
  const [quickOrderProduct, setQuickOrderProduct] = useState(null);
  const [quickOrderQty, setQuickOrderQty] = useState(1);
  const [quickOrderSuccess, setQuickOrderSuccess] = useState(false);

  const searchRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowWebsiteMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = PRODUCTS_LIST.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductClick = (product) => {
    setQuickOrderProduct(product);
    setQuickOrderQty(1);
    setQuickOrderSuccess(false);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  return (
    <div className="min-h-screen water-bg">
      {/* Topbar */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 transition-colors"
        style={{ 
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10,22,40,0.9)', 
          backdropFilter: 'blur(20px)', 
          borderBottom: theme === 'light' ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(6,182,212,0.12)' 
        }}
      >
        
        {/* Left Side: BackButton, Logo & website pages dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <BackButton className="mr-1" />
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/portal')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <FiDroplet className="text-white text-sm" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className={`font-black text-xs sm:text-sm tracking-wider uppercase leading-none ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                Shambhavi
              </span>
              <span className={`text-[9px] font-extrabold uppercase tracking-widest leading-none mt-0.5 ${
                theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'
              }`}>
                Water Services
              </span>
            </div>
          </div>

          {/* Toggleable website options menu */}
          <div ref={menuRef} className="relative">
            <button 
              onClick={() => setShowWebsiteMenu(!showWebsiteMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                showWebsiteMenu 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <FiHome size={13} />
              <span>Home</span>
            </button>

            {showWebsiteMenu && (
              <div className={`absolute top-10 left-0 border rounded-xl overflow-hidden shadow-2xl z-50 p-1.5 w-40 animate-fade-in ${
                theme === 'light' 
                  ? 'bg-white border-slate-200' 
                  : 'bg-slate-900 border-cyan-500/25'
              }`}>
                <div className={`flex justify-between items-center px-2 py-1.5 border-b mb-1 ${
                  theme === 'light' ? 'border-slate-100' : 'border-white/5'
                }`}>
                  <span className="text-[9px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-widest">Navigate</span>
                  <button 
                    onClick={() => { setShowWebsiteMenu(false); navigate(-1); }} 
                    className={`p-0.5 rounded cursor-pointer transition-colors ${
                      theme === 'light' ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                    title="Go Back to Previous Page"
                  >
                    <FiX size={13} />
                  </button>
                </div>
                <Link to="/" onClick={() => setShowWebsiteMenu(false)} className={`block w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  theme === 'light' ? 'text-slate-700 hover:text-cyan-600 hover:bg-slate-100' : 'text-slate-300 hover:text-cyan-400 hover:bg-white/5'
                }`}>Home</Link>
                <Link to="/products" onClick={() => setShowWebsiteMenu(false)} className={`block w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  theme === 'light' ? 'text-slate-700 hover:text-cyan-600 hover:bg-slate-100' : 'text-slate-300 hover:text-cyan-400 hover:bg-white/5'
                }`}>Our Products</Link>
                <Link to="/about" onClick={() => setShowWebsiteMenu(false)} className={`block w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  theme === 'light' ? 'text-slate-700 hover:text-cyan-600 hover:bg-slate-100' : 'text-slate-300 hover:text-cyan-400 hover:bg-white/5'
                }`}>About Us</Link>
                <Link to="/contact" onClick={() => setShowWebsiteMenu(false)} className={`block w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  theme === 'light' ? 'text-slate-700 hover:text-cyan-600 hover:bg-slate-100' : 'text-slate-300 hover:text-cyan-400 hover:bg-white/5'
                }`}>Contact Us</Link>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div ref={searchRef} className="relative hidden md:block w-44 lg:w-52 xl:w-60 mx-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <FiSearch size={13} />
            </span>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full pl-8 pr-8 py-1.5 bg-slate-900/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-500 hover:text-white">
                <FiX size={13} />
              </button>
            )}
          </div>

          {showSearchDropdown && searchQuery.trim() !== '' && (
            <div className="absolute top-10 left-0 right-0 bg-[#0a1628] border border-cyan-500/25 rounded-xl overflow-hidden shadow-2xl z-50 p-1.5 animate-fade-in">
              {filteredProducts.length === 0 ? (
                <p className="text-[10px] text-slate-500 p-2 text-center">No products found</p>
              ) : (
                filteredProducts.map(p => (
                  <button 
                    key={p.name}
                    type="button"
                    onClick={() => handleProductClick(p)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors text-left cursor-pointer"
                  >
                    <img src={p.img} alt={p.name} className="w-8 h-8 object-contain bg-slate-950/40 border border-white/5 rounded-md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{p.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{p.desc}</p>
                    </div>
                    <span className="text-cyan-400 text-xs font-extrabold shrink-0">₹{p.price}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Portal Nav Links */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full">
          {navItems.map(({ to, icon: Icon, label, end, highlight }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  highlight
                    ? isActive
                      ? 'bg-gradient-to-r from-cyan-500/30 to-teal-500/30 text-cyan-300 border border-cyan-500/40'
                      : 'bg-gradient-to-r from-cyan-500/15 to-teal-500/15 text-cyan-400 border border-cyan-500/25 hover:border-cyan-500/50'
                    : isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }>
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
              {highlight && <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />}
            </NavLink>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={toggleTheme} 
            className="p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer text-slate-400 hover:text-cyan-400 shrink-0"
            style={{ 
              background: theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
              borderColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)',
              color: theme === 'light' ? '#334155' : ''
            }}
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? <FiMoon size={14} /> : <FiSun size={14} />}
          </button>
          
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors font-bold px-2 py-1.5 rounded-lg hover:bg-red-500/5 shrink-0 cursor-pointer">
            <FiLogOut size={14} /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 min-h-screen">
        <Outlet />
      </main>

      {/* Global Fixed Book Order Button */}
      <Link 
        to="/order" 
        className="hidden lg:flex fixed top-[85px] right-6 z-40 items-center gap-2 btn-outline py-2 px-5 rounded-full text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 font-black text-xs xl:text-sm tracking-wide whitespace-nowrap transition-colors shadow-lg shadow-cyan-500/5"
      >
        <FiDroplet size={14} /> Book Order
      </Link>

      {/* Quick Order Modal */}
      {quickOrderProduct && (
        <div className="modal-overlay z-[60]" onClick={() => setQuickOrderProduct(null)}>
          <div className="modal-box max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-white font-black text-base uppercase tracking-wide mb-5">Quick Order Product</h2>
            
            <div className="flex items-center gap-4 p-4 bg-slate-950/40 border border-cyan-500/10 rounded-2xl mb-5">
              <img src={quickOrderProduct.img} alt={quickOrderProduct.name} className="w-14 h-14 object-contain bg-slate-950/60 rounded-xl border border-white/5" />
              <div>
                <h3 className="text-white font-black text-sm">{quickOrderProduct.name}</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">{quickOrderProduct.desc}</p>
                <p className="text-cyan-400 font-extrabold text-xs mt-1">₹{quickOrderProduct.price} / unit</p>
              </div>
            </div>

            {quickOrderSuccess ? (
              <div className="text-center py-4 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-3">
                  ✓
                </div>
                <p className="text-white font-bold text-sm">Order Placed Successfully! 💧</p>
                <p className="text-slate-400 text-xs mt-1">Thank you. Delivery expected within 2-4 hours.</p>
                <button 
                  onClick={() => { setQuickOrderProduct(null); setQuickOrderSuccess(false); }} 
                  className="mt-5 btn-primary px-6 py-2 rounded-xl text-xs font-bold w-full"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="input-label text-xs">Quantity</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={20} 
                    className="input-field py-2 text-sm" 
                    value={quickOrderQty} 
                    onChange={e => setQuickOrderQty(Number(e.target.value))} 
                  />
                </div>
                <div className="glass-dark rounded-xl p-3.5 border border-cyan-500/15 text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{quickOrderQty} × {quickOrderProduct.name}</span>
                    <span>₹{quickOrderQty * quickOrderProduct.price}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 mb-2.5">
                    <span>Delivery Charge</span>
                    <span>₹20</span>
                  </div>
                  <div className="flex justify-between font-black text-white border-t border-white/10 pt-2 text-sm">
                    <span>Total</span>
                    <span className="text-cyan-400">₹{quickOrderQty * quickOrderProduct.price + 20}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button onClick={() => setQuickOrderProduct(null)} className="flex-1 btn-outline py-2.5 rounded-xl text-xs font-bold">Cancel</button>
                  <button 
                    onClick={() => setQuickOrderSuccess(true)} 
                    className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-bold"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
