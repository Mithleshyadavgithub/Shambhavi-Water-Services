import { Link } from 'react-router-dom';
import { FiDroplet, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{ background: 'rgba(10,22,40,0.95)', borderTop: '1px solid rgba(6,182,212,0.1)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <FiDroplet className="text-white text-lg" />
              </div>
              <div>
                <p className="text-white font-black tracking-wider uppercase">Shambhavi</p>
                <p className="text-cyan-400 text-xs tracking-widest uppercase">Water Services</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Providing pure, safe drinking water to thousands of homes and businesses. 
              Reliable delivery, trusted quality, every day.
            </p>
            <div className="flex gap-4 mt-6">
              {[
                { s: 'FB', link: '#' },
                { s: 'TW', link: '#' },
                { s: 'IG', link: '#' },
                { s: 'WA', link: 'https://wa.me/917311179993?text=hi%20i%20saw%20your%20website%20i%20need%20water%20bottel' },
              ].map(({ s, link }) => (
                <a 
                  key={s} 
                  href={link} 
                  target={link !== '#' ? '_blank' : undefined} 
                  rel={link !== '#' ? 'noopener noreferrer' : undefined}
                  className="w-9 h-9 rounded-lg border border-cyan-500/20 flex items-center justify-center text-xs text-cyan-400 hover:bg-cyan-500/10 cursor-pointer transition-colors font-bold"
                  title={s === 'WA' ? 'WhatsApp Us: 7311179993' : s}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[['/', 'Home'], ['/about', 'About Us'], ['/products', 'Products'], ['/contact', 'Contact']].map(([path, label]) => (
                <li key={path}>
                  <Link to={path} className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">{label}</Link>
                </li>
              ))}
              <li><Link to="/login" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Customer Login</Link></li>
              <li>
                <Link 
                  to="/developer" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-colors inline-flex items-center gap-1 mt-1"
                >
                  ⚡ Developed By Mithlesh Kumar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-cyan-400 mt-0.5 shrink-0" size={15} />
                <span className="text-slate-400 text-sm">44 Radhapuram Colony, Matiyari, Lucknow, Uttar Pradesh</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-cyan-400 shrink-0" size={15} />
                <a href="tel:+917311179993" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors font-medium">+91 73111 79993</a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-cyan-400 shrink-0" size={15} />
                <a href="mailto:shambhavi73@gmail.com" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">shambhavi73@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 Shambhavi Water Services. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link 
              to="/developer" 
              target="_blank" 
              rel="noopener noreferrer"
              id="footer-developed-by"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white hover:border-transparent transition-all duration-300 shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/30 hover:scale-105 group cursor-pointer"
            >
              <span className="text-cyan-400 group-hover:text-white transition-colors">⚡ Developed by</span>
              <span className="font-extrabold text-white underline decoration-cyan-400/50 group-hover:no-underline">Mithlesh Kumar</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
