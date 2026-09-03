import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackButton from '../../components/BackButton';
import { Link, useNavigate } from 'react-router-dom';
import { FiDroplet, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const products = [
  { name: '1L Bottle', price: '₹10', img: '/shambhavi-bottle-1l.jpg', features: ['RO Purified', 'Portable', 'BIS Certified', 'Single use friendly'] },
  { name: '2L Bottle', price: '₹20', img: '/shambhavi-bottle-2l.jpg', features: ['RO Purified', 'Reusable', 'BIS Certified', 'Ideal for small families'] },
  { name: '18L Can', price: '₹40', img: '/shambhavi-dispenser-18l.jpg', features: ['RO Purified', 'Heavy Duty', 'BIS Certified', 'Medium families'] },
  { name: '20L Can', price: '₹40', img: '/shambhavi-can-20l.jpg', features: ['RO Purified', 'UV Sterilized', 'BIS Certified', 'Offices & large families'], popular: true },
];

export default function Products() {
  const { user, theme } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="water-bg min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <BackButton />
          </div>
          <div className="text-center mb-16">
            <div className={`label-tag rounded-full text-xs mb-6 inline-block font-bold ${
              theme === 'light' ? 'border-cyan-500/40 text-cyan-700 bg-cyan-50/80' : 'border-cyan-400/40 text-cyan-400'
            }`}>
              OUR PRODUCTS
            </div>
            <h1 className={`section-title mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Pure Water Products
            </h1>
            <p className={`max-w-xl mx-auto ${theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Choose the right water solution for your home or office.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <div 
                key={i} 
                className={`rounded-2xl p-7 relative flex flex-col transition-all hover:-translate-y-1 ${
                  p.popular 
                    ? (theme === 'light' ? 'teal-panel border-2 border-cyan-500 shadow-xl' : 'teal-panel border border-cyan-400/40') 
                    : 'glass-card'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-black px-4 py-1 rounded-full whitespace-nowrap shadow-md uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="w-full h-44 mx-auto mb-5 relative flex items-center justify-center bg-[#070f1e] rounded-xl overflow-hidden border border-cyan-500/20 shadow-md group">
                  <img 
                    src={p.img} 
                    alt={p.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap">
                    Shambhavi Water
                  </div>
                </div>
                <h3 className={`font-black text-xl uppercase tracking-wide text-center ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {p.name}
                </h3>
                <p className={`text-4xl font-black text-center mt-2 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {p.price}
                </p>
                <p className={`text-xs text-center mb-5 font-bold ${
                  theme === 'light' ? 'text-cyan-700' : 'text-cyan-400/80'
                }`}>
                  per unit
                </p>
                <ul className="space-y-2 flex-1">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-xs ${
                      theme === 'light' ? 'text-slate-700 font-medium' : 'text-slate-300'
                    }`}>
                      <FiCheck className={theme === 'light' ? 'text-cyan-600 shrink-0 font-bold' : 'text-cyan-400 shrink-0'} size={14} /> 
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/order" className="block mt-6 btn-primary text-sm py-3 rounded-xl text-center font-black uppercase tracking-wider">
                  Order Now
                </Link>
              </div>
            ))}
          </div>

          {/* Subscription Info */}
          <div className="mt-16 teal-panel rounded-2xl p-10 text-center shadow-lg">
            <h2 className={`text-2xl font-black uppercase tracking-wide mb-3 ${
              theme === 'light' ? 'text-cyan-950' : 'text-white'
            }`}>
              Subscribe & Save
            </h2>
            <p className={`mb-8 max-w-xl mx-auto ${
              theme === 'light' ? 'text-cyan-900 font-medium' : 'text-white/80'
            }`}>
              Choose daily, alternate-day, weekly or monthly plans. We auto-schedule deliveries so you never run out.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Daily', 'Alternate Day', 'Weekly', 'Monthly'].map(plan => (
                <div 
                  key={plan} 
                  className={`rounded-xl px-6 py-3 font-bold text-sm border shadow-xs ${
                    theme === 'light' 
                      ? 'bg-white text-slate-900 border-cyan-300' 
                      : 'glass-dark text-white border-cyan-500/20'
                  }`}
                >
                  {plan}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
