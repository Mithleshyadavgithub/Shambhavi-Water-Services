import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function BackButton({ label = 'Back', className = '', fallback = '/' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useAuth();

  // If on home page, no need to show back button
  if (location.pathname === '/') return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs group backdrop-blur-md ${
        theme === 'light'
          ? 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-cyan-700 border-slate-300/80'
          : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyan-400 border-white/10 hover:border-cyan-500/40'
      } ${className}`}
      title="Go Back"
    >
      <FiArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </button>
  );
}

