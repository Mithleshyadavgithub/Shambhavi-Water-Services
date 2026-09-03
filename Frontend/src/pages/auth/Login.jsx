import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import { FiDroplet, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiX } from 'react-icons/fi';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(result.user.role === 'customer' ? '/portal' : '/admin');
    } else {
      setError(result.message);
    }
  };

  // Demo logins
  const demoLogins = [
    { label: 'Admin', email: 'admin@shambhavi.com', password: 'admin123' },
    { label: 'Manager', email: 'manager@shambhavi.com', password: 'manager123' },
  ];

  return (
    <div className="water-bg min-h-screen flex items-center justify-center px-4 py-10">
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full opacity-10 animate-float"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full opacity-8 animate-float"
          style={{ background: 'radial-gradient(circle, #0891b2, transparent)', animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Glass Panel */}
        <div className="teal-panel rounded-3xl px-8 py-10 relative">
          {/* Back button */}
          <div className="absolute top-4 left-4">
            <BackButton />
          </div>

          {/* Close button */}
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer"
            title="Go to Homepage"
          >
            <FiX size={20} />
          </button>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 animate-pulse-glow">
              <FiDroplet className="text-white text-3xl" />
            </div>
            <h1 className="text-white font-black text-xl uppercase tracking-widest">Shambhavi</h1>
            <p className="text-white/60 text-xs tracking-widest">Water System</p>
          </div>

          <h2 className="text-center text-2xl font-black text-white uppercase tracking-wide mb-2">Welcome Back</h2>
          <p className="text-center text-white/60 text-sm mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label text-white/70">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" size={16} />
                <input id="login-email" type="email" className="input-field pl-10 bg-white/10 border-white/20 placeholder-white/30 text-white focus:border-white/60 focus:bg-white/15"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com" required />
              </div>
            </div>
            <div>
              <label className="input-label text-white/70">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" size={16} />
                <input id="login-password" type={showPw ? 'text' : 'password'} className="input-field pl-10 pr-10 bg-white/10 border-white/20 placeholder-white/30 text-white focus:border-white/60 focus:bg-white/15"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" id="login-submit" disabled={loading}
              className="btn-primary w-full py-4 rounded-xl font-black text-base tracking-wide flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Signing in...' : <><span>Login</span> <FiArrowRight /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/40 text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <Link to="/register" id="login-register-link"
            className="block w-full py-4 rounded-xl text-center font-black text-sm tracking-wide text-white border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all">
            Register as Customer
          </Link>

          <p className="text-center text-white/40 text-xs mt-6">
            <Link to="/" className="hover:text-white transition-colors">← Back to Website</Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 rounded-xl bg-black/20 border border-white/10">
            <p className="text-white/50 text-xs text-center mb-3 font-semibold uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-2">
              {demoLogins.map(d => (
                <button key={d.label} onClick={() => setForm({ email: d.email, password: d.password })}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-cyan-400 font-bold text-xs">{d.label}:</span>
                  <span className="text-white/60 text-xs ml-2">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
