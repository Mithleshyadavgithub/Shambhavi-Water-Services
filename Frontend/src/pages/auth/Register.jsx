import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import { FiDroplet, FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiX } from 'react-icons/fi';

const Field = ({ id, label, icon: Icon, type = 'text', placeholder, field, form, setForm }) => (
  <div>
    <label className="input-label text-white/70">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" size={16} />
      <input id={id} type={type} className="input-field pl-10 bg-white/10 border-white/20 placeholder-white/30 text-white focus:border-white/60 focus:bg-white/15"
        value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
        placeholder={placeholder} required />
    </div>
  </div>
);

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', area: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register({ ...form, role: 'customer' });
    if (result.success) navigate('/portal');
    else setError(result.message);
  };

  return (
    <div className="water-bg min-h-screen flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 animate-float"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
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

          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3 animate-pulse-glow">
              <FiDroplet className="text-white text-2xl" />
            </div>
            <h1 className="text-white font-black text-lg uppercase tracking-widest">Shambhavi</h1>
          </div>

          <h2 className="text-center text-2xl font-black text-white uppercase tracking-wide mb-1">Create Account</h2>
          <p className="text-center text-white/60 text-sm mb-7">Join thousands of happy customers</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field id="reg-name" label="Full Name" icon={FiUser} placeholder="Rahul Kumar" field="name" form={form} setForm={setForm} />
            <div className="grid grid-cols-2 gap-4">
              <Field id="reg-phone" label="Phone" icon={FiPhone} placeholder="9876543210" field="phone" form={form} setForm={setForm} />
              <Field id="reg-area" label="Area" icon={FiMapPin} placeholder="Gomti Nagar" field="area" form={form} setForm={setForm} />
            </div>
            <Field id="reg-email" label="Email" icon={FiMail} type="email" placeholder="you@email.com" field="email" form={form} setForm={setForm} />
            <Field id="reg-address" label="Address" icon={FiMapPin} placeholder="123, Your Street" field="address" form={form} setForm={setForm} />
            <Field id="reg-password" label="Password" icon={FiLock} type="password" placeholder="Min. 6 characters" field="password" form={form} setForm={setForm} />

            <button type="submit" id="reg-submit" disabled={loading}
              className="btn-primary w-full py-4 rounded-xl font-black text-base tracking-wide mt-2 disabled:opacity-60">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/40 text-xs">Already have an account?</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <Link to="/login" className="block w-full py-4 rounded-xl text-center font-black text-sm text-white border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all">
            Login Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
