import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import { 
  FiMail, 
  FiPhone, 
  FiCode, 
  FiCpu, 
  FiLayers, 
  FiSend
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Developer() {
  const { theme } = useAuth();

  return (
    <div className="water-bg min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <BackButton />
          </div>

          {/* Profile Card */}
          <div className={`rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl transition-all duration-300 ${
            theme === 'light' 
              ? 'bg-white/95 border border-slate-200 shadow-slate-200/60' 
              : 'glass-card border border-white/10'
          }`}>
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-600/10 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              
              {/* Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm ${
                  theme === 'light'
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                    : 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                }`}>
                  <FiCpu className={theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} size={14} />
                  Creator & Engineer
                </div>

                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Available for High-Impact Projects
                </div>
              </div>

              {/* Avatar & Title */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-1 shadow-xl shadow-cyan-500/20 shrink-0">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-3xl font-black text-white">
                    MK
                  </div>
                </div>

                <div>
                  <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-tight ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>
                    Mithlesh Kumar
                  </h1>
                  <p className={`text-sm sm:text-base font-bold mt-1 flex items-center gap-2 ${
                    theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'
                  }`}>
                    <FiCode size={16} /> Fullstack Developer & Platform Architect
                  </p>
                </div>
              </div>

              {/* Bio Block */}
              <div className={`rounded-2xl p-6 mb-10 border ${
                theme === 'light' 
                  ? 'bg-slate-50 border-slate-200' 
                  : 'bg-slate-900/50 border-white/5'
              }`}>
                <p className={`text-base sm:text-lg leading-relaxed font-normal ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  "I am a passionate Fullstack Developer dedicated to building high-performance, visually stunning web applications. I architected and developed the Shambhavi Water Services platform from the ground up."
                </p>
              </div>

              {/* Info Grid (Email, Role, Mobile) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                
                {/* Email Contact */}
                <div className={`rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm hover:border-cyan-400'
                    : 'bg-slate-950/40 border-white/5 hover:border-cyan-500/30'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <FiMail size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Email Contact</span>
                      <p className={`font-black text-xs uppercase ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Direct Inbox</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:my2387569@gmail.com"
                    className={`text-sm font-bold break-all hover:underline block ${
                      theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'
                    }`}
                  >
                    my2387569@gmail.com
                  </a>
                </div>

                {/* Role */}
                <div className={`rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm hover:border-cyan-400'
                    : 'bg-slate-950/40 border-white/5 hover:border-cyan-500/30'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <FiLayers size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Role</span>
                      <p className={`font-black text-xs uppercase ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Specialization</p>
                    </div>
                  </div>
                  <p className={`text-base font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Fullstack Developer
                  </p>
                </div>

                {/* Mobile */}
                <div className={`rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm hover:border-emerald-400'
                    : 'bg-slate-950/40 border-white/5 hover:border-emerald-500/30'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <FiPhone size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Mobile</span>
                      <p className={`font-black text-xs uppercase ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Phone & WhatsApp</p>
                    </div>
                  </div>
                  <a 
                    href="tel:+918757546826"
                    className="text-base font-black text-emerald-500 hover:underline block"
                  >
                    +91 8757546826
                  </a>
                </div>

              </div>

              {/* Technologies & Core Competencies */}
              <div className="mb-10">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-3">
                  Core Engineering Stack
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    'Fullstack Architecture',
                    'React.js',
                    'Node.js & Express',
                    'Tailwind CSS',
                    'MongoDB',
                    'REST APIs & Microservices',
                    'Performance Engineering',
                    'Responsive UI/UX'
                  ].map((skill) => (
                    <span 
                      key={skill}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border ${
                        theme === 'light'
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                <a 
                  href="mailto:my2387569@gmail.com" 
                  className="btn-primary flex items-center gap-2 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  <FiSend size={16} /> Send Email
                </a>
                <a 
                  href="https://wa.me/918757546826?text=Hi%20Mithlesh,%20I%20saw%20your%20work%20and%20would%20like%20to%20connect!" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-105"
                >
                  <FaWhatsapp size={18} /> WhatsApp Directly
                </a>
                <a 
                  href="tel:+918757546826" 
                  className={`flex items-center gap-2 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl border transition-all ${
                    theme === 'light'
                      ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                      : 'btn-outline'
                  }`}
                >
                  <FiPhone size={16} /> Call +91 8757546826
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
