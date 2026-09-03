import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackButton from '../../components/BackButton';
import { FiPhone, FiMail, FiMapPin, FiSend, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Contact() {
  const navigate = useNavigate();
  const { theme } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

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
              CONTACT
            </div>
            <h1 className={`section-title mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Get In Touch
            </h1>
            <p className={`${theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-5">
              {[
                { icon: FiPhone, title: 'Phone & WhatsApp', info: '+91 73111 79993', sub: 'Mon–Sat 8AM–8PM • Instant WhatsApp Support', link: 'https://wa.me/917311179993?text=hi%20i%20saw%20your%20website%20i%20need%20water%20bottel' },
                { icon: FiMail, title: 'Email', info: 'my2387569@gmail.com', sub: 'We reply within 24 hours', link: 'mailto:my2387569@gmail.com' },
                { icon: FiMapPin, title: 'Address', info: '44 Radhapuram Colony, Matiyari', sub: 'Lucknow, Uttar Pradesh' },
              ].map(({ icon: Icon, title, info, sub, link }) => (
                <div key={title} className="glass-card rounded-2xl p-6 flex gap-5">
                  <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${
                    theme === 'light' ? 'bg-cyan-50 border border-cyan-300 text-cyan-700' : 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400'
                  }`}>
                    <Icon className={theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} size={20} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm uppercase tracking-wide ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{title}</p>
                    {link ? (
                      <a href={link} target="_blank" rel="noopener noreferrer" className={`text-sm mt-0.5 hover:underline flex items-center gap-1 font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        {info}
                      </a>
                    ) : (
                      <p className={`text-sm mt-0.5 ${theme === 'light' ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>{info}</p>
                    )}
                    <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-8">
              <h2 className={`font-black text-lg uppercase tracking-wide mb-6 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Send a Message
              </h2>
              {sent && (
                <div className="mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
                  ✅ Message sent! We'll get back to you soon.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Your Name</label>
                    <input id="contact-name" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Rahul Kumar" required />
                  </div>
                  <div>
                    <label className="input-label">Phone</label>
                    <input id="contact-phone" className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input id="contact-email" type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="input-label">Message</label>
                  <textarea id="contact-message" className="input-field resize-none" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Your message here..." required />
                </div>
                <button type="submit" id="contact-submit" className="btn-primary w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2">
                  <FiSend size={16} /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
