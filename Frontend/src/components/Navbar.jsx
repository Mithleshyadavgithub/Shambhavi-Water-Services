import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiDroplet, FiMenu, FiX, FiSun, FiMoon, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import BackButton from './BackButton';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Universal Back Button when not on home */}
          <BackButton className="mr-1" />

          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform animate-pulse-glow shadow-md shadow-cyan-500/20 shrink-0">
              <FiDroplet className="text-white text-lg" />
            </div>
            <div className="flex flex-col">
              <span className={`font-black text-sm sm:text-base tracking-wider uppercase leading-none transition-colors whitespace-nowrap ${
                theme === 'light' ? 'text-slate-900 drop-shadow-xs' : 'text-white'
              }`}>
                Shambhavi
              </span>
              <span className={`text-[10px] sm:text-xs tracking-widest font-extrabold uppercase transition-colors whitespace-nowrap mt-0.5 ${
                theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'
              }`}>
                Water Services
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 ml-4 xl:ml-8">
          {[
            { path: '/', label: 'Home' },
            { path: '/about', label: 'About' },
            { path: '/products', label: 'Products' },
            { path: '/my-orders', label: 'My Orders' },
            { path: '/tracker', label: 'Water Tracker' },
            { path: '/contact', label: 'Contact' },
            { path: '/feedback', label: 'Rate Us' },
          ].map(({ path, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link 
                key={path} 
                to={path} 
                className={`text-xs xl:text-sm font-bold tracking-wide transition-all px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-full border ${
                  isActive
                    ? (theme === 'light' 
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-300 shadow-xs' 
                        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-xs')
                    : (theme === 'light'
                        ? 'text-slate-700 hover:text-cyan-700 border-transparent hover:bg-slate-100/80'
                        : 'text-slate-300 hover:text-cyan-400 border-transparent hover:bg-white/5')
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
          <button 
            onClick={toggleTheme} 
            className={`p-2 xl:p-2.5 rounded-full transition-colors cursor-pointer ${
              theme === 'light' ? 'hover:bg-slate-100 text-slate-700 hover:text-cyan-700' : 'hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400'
            }`}
            title="Toggle Theme"
          >
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/portal/profile" 
                className={`p-2 xl:p-2.5 rounded-full transition-colors flex items-center justify-center ${
                  theme === 'light' ? 'hover:bg-slate-100 text-slate-700 hover:text-cyan-700' : 'hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400'
                }`}
                title="My Profile"
              >
                <FiUser size={18} />
              </Link>
              <Link to={user.role === 'customer' ? '/portal' : '/admin'} className="btn-primary py-2 px-4 xl:px-5 rounded-full font-bold text-xs xl:text-sm tracking-wide border border-cyan-500/30">
                Dashboard
              </Link>
              <button onClick={logout} className="btn-outline py-2 px-4 rounded-full text-red-500 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-xs xl:text-sm transition-colors cursor-pointer">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className={`font-bold text-xs xl:text-sm transition-colors px-2 ${
                theme === 'light' ? 'text-slate-700 hover:text-cyan-700' : 'text-slate-300 hover:text-cyan-400'
              }`}>Login</Link>
              <Link to="/register" className="btn-primary py-2 px-4 xl:px-5 rounded-full font-bold text-xs xl:text-sm tracking-wide shadow-lg shadow-cyan-500/25 border border-cyan-500/30">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Global Fixed Book Order Button (Below Logout) */}
        <Link 
          to="/order" 
          className={`hidden lg:flex fixed top-[85px] right-6 z-40 items-center gap-2 py-2 px-5 rounded-full font-black text-xs xl:text-sm tracking-wide whitespace-nowrap transition-all shadow-md ${
            theme === 'light'
              ? 'bg-white/90 text-cyan-800 border border-cyan-500/40 hover:bg-cyan-50 hover:border-cyan-600 shadow-slate-200/60'
              : 'btn-outline text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 shadow-cyan-500/5'
          }`}
        >
          <FiDroplet size={14} className={theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'} /> Book Order
        </Link>

        {/* Mobile Toggle */}
        <button 
          className={`lg:hidden p-2 rounded-lg transition-colors cursor-pointer ${
            theme === 'light' ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-white/5'
          }`} 
          onClick={() => setMobileOpen(!mobileOpen)} 
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div 
          className="lg:hidden border-t"
          style={{ 
            background: theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(10,22,40,0.98)', 
            borderColor: theme === 'light' ? 'rgba(226, 232, 240, 0.9)' : 'rgba(6,182,212,0.15)' 
          }}
        >
          <div className="px-6 py-4 space-y-2">
            {[
              { path: '/', label: 'Home' },
              { path: '/about', label: 'About' },
              { path: '/products', label: 'Products' },
              { path: '/my-orders', label: 'My Orders' },
              { path: '/tracker', label: 'Water Tracker' },
              { path: '/contact', label: 'Contact' },
              { path: '/feedback', label: 'Rate Us' },
            ].map(({ path, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link 
                  key={path} 
                  to={path} 
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2.5 px-4 font-bold rounded-xl transition-colors ${
                    isActive
                      ? (theme === 'light' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30')
                      : (theme === 'light' ? 'text-slate-700 hover:text-cyan-700 hover:bg-slate-50' : 'text-slate-300 hover:text-cyan-400 hover:bg-white/5')
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-2">
              <Link 
                to="/order" 
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 btn-primary py-3 px-4 rounded-xl font-black text-sm tracking-wide mb-1"
              >
                <FiDroplet size={18} /> Book Order Now
              </Link>
              
              <button 
                onClick={() => { toggleTheme(); setMobileOpen(false); }} 
                className="btn-outline text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  color: theme === 'light' ? '#334155' : '',
                  borderColor: theme === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'
                }}
              >
                {theme === 'light' ? <><FiMoon size={16} /> Dark Mode</> : <><FiSun size={16} /> Light Mode</>}
              </button>
              {user ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link 
                    to={user.role === 'customer' ? '/portal' : '/admin'} 
                    onClick={() => setMobileOpen(false)} 
                    className="btn-primary text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-bold whitespace-nowrap"
                  >
                    <FiUser size={16} /> Dashboard
                  </Link>
                  <button 
                    onClick={() => { logout(); setMobileOpen(false); }} 
                    className="btn-outline text-sm py-2.5 px-3 rounded-xl flex items-center justify-center font-bold text-red-400 border-red-500/30 hover:bg-red-500/10 cursor-pointer whitespace-nowrap"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline text-sm py-2.5 px-4 rounded-xl text-center font-bold">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm py-2.5 px-4 rounded-xl text-center font-bold">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
