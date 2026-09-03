import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import {
  FiGrid, FiUsers, FiShoppingCart, FiCreditCard,
  FiPackage, FiMessageSquare, FiLogOut, FiMenu, FiX,
  FiBell, FiDroplet, FiTrendingUp, FiZap, FiShield,
  FiSun, FiMoon
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/admin/customers', icon: FiUsers, label: 'Customers' },
  { to: '/admin/orders', icon: FiShoppingCart, label: 'Orders' },
  { to: '/admin/payments', icon: FiCreditCard, label: 'Payments' },
  { to: '/admin/inventory', icon: FiPackage, label: 'Inventory' },
  { to: '/admin/complaints', icon: FiMessageSquare, label: 'Complaints' },
];

const aiNavItems = [
  { to: '/admin/ai-growth', icon: FiTrendingUp, label: 'AI Growth Engine' },
  { to: '/admin/campaigns', icon: FiZap, label: 'Campaigns' },
  { to: '/admin/audit-log', icon: FiShield, label: 'Audit Trail' },
];

export default function AdminLayout() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-cyan-500/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-pulse-glow">
          <FaRobot className="text-white text-lg" />
        </div>
        <div>
          <p className={`font-black text-sm tracking-wider uppercase ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Shambhavi</p>
          <p className={`text-xs font-bold tracking-widest ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>Water Services</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* AI Section */}
        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-bold text-cyan-400/50 uppercase tracking-widest flex items-center gap-2">
            <FaRobot size={10} /> AI Commerce
          </p>
        </div>
        {aiNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-cyan-500/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-3">
          <div className="avatar">{user?.name?.[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-cyan-400/70 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20">
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)' }}>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col" style={{ background: 'linear-gradient(180deg,#0a1628,#0d1f3c)' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Topbar */}
      <header className="topbar hidden lg:flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-white font-bold text-lg tracking-wide">
            Admin Panel
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer text-slate-400 hover:text-cyan-400"
            style={{ 
              background: theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
              borderColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)',
              color: theme === 'light' ? '#334155' : ''
            }}
            title="Toggle Theme"
          >
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>
          
          <button className="relative p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
          </button>
          <div className="avatar">{user?.name?.[0]}</div>
          <span className="text-sm text-slate-300 font-medium">{user?.name}</span>
        </div>
      </header>

      {/* Mobile Topbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 flex items-center justify-between px-4 transition-colors"
        style={{ 
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10,22,40,0.95)', 
          borderBottom: theme === 'light' ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(6,182,212,0.12)' 
        }}>
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(true)} className={`p-1 ${theme === 'light' ? 'text-slate-700 hover:text-cyan-700' : 'text-slate-300 hover:text-cyan-400'}`}>
            <FiMenu size={24} />
          </button>
          <BackButton />
        </div>
        <div className="flex items-center gap-2">
          <FiDroplet className={theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'} />
          <span className={`font-bold text-xs sm:text-sm tracking-wider uppercase ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            SHAMBHAVI WATER SERVICES
          </span>
        </div>
        <div className="avatar">{user?.name?.[0]}</div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>

      {/* Global Fixed Book Order Button */}
      <Link 
        to="/order" 
        className="hidden lg:flex fixed top-[85px] right-6 z-40 items-center gap-2 btn-outline py-2 px-5 rounded-full text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 font-black text-xs xl:text-sm tracking-wide whitespace-nowrap transition-colors shadow-lg shadow-cyan-500/5"
      >
        <FiDroplet size={14} /> Book Order
      </Link>
    </div>
  );
}
