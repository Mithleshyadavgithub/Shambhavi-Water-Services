import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackButton from '../../components/BackButton';
import { FiDroplet, FiUsers, FiAward, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function About() {
  const navigate = useNavigate();
  const { theme } = useAuth();

  return (
    <div className="water-bg min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <BackButton />
          </div>
          <div className="text-center mb-16">
            <div className={`label-tag rounded-full text-xs mb-6 inline-block font-bold ${
              theme === 'light' ? 'border-cyan-500/40 text-cyan-700 bg-cyan-50/80' : 'border-cyan-400/40 text-cyan-400'
            }`}>
              ABOUT US
            </div>
            <h1 className={`section-title mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              About Shambhavi
            </h1>
            <p className={`max-w-2xl mx-auto leading-relaxed ${theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Shambhavi Water System has been delivering pure, safe drinking water to homes and businesses in Lucknow since 2021.
              Our mission is simple — ensure every family has access to clean, affordable water.
            </p>
          </div>

          {/* Teal Panel */}
          <div className="teal-panel rounded-2xl p-10 mb-12 text-center shadow-lg">
            <h2 className={`text-3xl font-black uppercase tracking-wide mb-3 ${theme === 'light' ? 'text-cyan-950' : 'text-white'}`}>
              Our Mission
            </h2>
            <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${theme === 'light' ? 'text-cyan-900 font-medium' : 'text-white/80'}`}>
              "Pure Water. Reliable Delivery. Trusted Service." — We believe clean water is a right, not a privilege.
              We bring it to your doorstep every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: FiDroplet, title: 'Quality Assurance', desc: 'Every batch is tested for 40+ parameters. RO purified, UV sterilized, BIS certified.' },
              { icon: FiTruck, title: 'Reliable Delivery', desc: 'Our fleet covers all major areas of Lucknow with same-day and subscription delivery.' },
              { icon: FiUsers, title: 'Customer First', desc: '24/7 support, easy complaints, and fast resolutions. Your satisfaction is our priority.' },
              { icon: FiAward, title: 'Certified Excellence', desc: 'ISO certified processes, government approved. Trusted by 1,250+ households.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="glass-card rounded-2xl p-7 flex gap-5">
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
                  theme === 'light' 
                    ? 'bg-cyan-50 border border-cyan-300 text-cyan-700' 
                    : 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400'
                }`}>
                  <Icon className={theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} size={22} />
                </div>
                <div>
                  <h3 className={`font-bold mb-2 uppercase tracking-wide text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-8 text-center">
            <FiHeart className={`${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'} mx-auto mb-3`} size={32} />
            <h3 className={`font-black text-xl uppercase tracking-wide mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Built with Love for Lucknow
            </h3>
            <p className={`text-sm max-w-lg mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              We are a locally owned and operated business. Every rupee you spend with us stays in our community and helps us serve you better.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function FiTruck({ className, size }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}
