import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FiDroplet, FiTruck, FiShield, FiStar, FiArrowRight, FiCheck, FiCheckCircle, FiZap, FiMessageSquare } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { value: '1,500+', label: 'Active Subscribers' },
  { value: '600+', label: 'Pristine Deliveries Daily' },
  { value: '5+ Years', label: 'Uncompromised Purity' },
  { value: '99.9%', label: 'Quality Rating' },
];

const features = [
  { icon: FiDroplet, title: 'Artisanal Purity', desc: 'RO and UV purified water verified across 40+ quality parameters. BIS & ISO certified.' },
  { icon: FiTruck, title: 'Precision Delivery', desc: 'Guaranteed scheduled deliveries. Track your hydration route in real-time.' },
  { icon: FiShield, title: 'Ultra-Hygienic Cans', desc: 'Sanitized at the source with medical-grade UV sterilizers and sealed securely.' },
  { icon: FiStar, title: 'Dedicated Concierge', desc: '24/7 priority user support. Fluid subscription models tailored to your wellness.' },
];

const plans = [
  { name: 'Shambhavi Pure 1L', price: '₹10', per: 'per bottle', qty: 'Min. 12 bottles', badge: null, img: '/shambhavi-bottle-1l.jpg' },
  { name: 'Shambhavi Pure 2L', price: '₹20', per: 'per bottle', qty: 'Min. 6 bottles', badge: null, img: '/shambhavi-bottle-2l.jpg' },
  { name: 'Elite 18L Dispenser', price: '₹40', per: 'per can', qty: 'Min. 3 cans', badge: null, img: '/shambhavi-dispenser-18l.jpg' },
  { name: 'Pure 20L Canister', price: '₹40', per: 'per can', qty: 'Standard Home/Office', badge: 'Most Popular', img: '/shambhavi-can-20l.jpg' },
];

const testimonials = [
  { name: 'Rahul Kumar', area: 'Gomti Nagar', text: 'An absolute game-changer for our household. The purity is unmatched, and the real-time tracking gives us complete peace of mind.', rating: 5 },
  { name: 'Priya Sharma', area: 'Indira Nagar', text: 'The subscription service is incredibly seamless. Shambhavi water has become a cornerstone of our family\'s daily wellness routine.', rating: 5 },
  { name: 'Amit Singh', area: 'Hazratganj', text: 'Exceptional service, immaculate quality, and highly responsive support. I cannot recommend Shambhavi enough for luxury hydration.', rating: 5 },
];

const CATEGORIES = [
  'Website Design & UI',
  'Water Quality',
  'Delivery Service',
  'Customer Support',
  'Other'
];

export default function Home() {
  const { user, theme } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('shambhavi_feedbacks');
    if (saved) {
      setFeedbacks(JSON.parse(saved));
    } else {
      const initial = testimonials.map((t, i) => ({
        id: i,
        name: t.name,
        comment: t.text,
        rating: t.rating,
        category: 'Customer Support',
        area: t.area,
        date: 'August 24, 2026'
      }));
      setFeedbacks(initial);
      localStorage.setItem('shambhavi_feedbacks', JSON.stringify(initial));
    }
  }, []);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newFeedback = {
      id: Date.now(),
      name,
      email,
      rating,
      category,
      comment,
      area: 'Verified Buyer',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem('shambhavi_feedbacks', JSON.stringify(updated));

    setName('');
    setEmail('');
    setRating(5);
    setCategory(CATEGORIES[0]);
    setComment('');
    setSubmitted(true);

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="water-bg min-h-screen overflow-x-hidden relative">
      <Navbar />

      {/* Floating Bubbles Background Decoration */}
      <div className="bubble-container">
        <div className="bubble-decor large slow" style={{ top: '15%', left: '10%', width: '120px', height: '120px' }}></div>
        <div className="bubble-decor" style={{ top: '45%', right: '8%', width: '80px', height: '80px' }}></div>
        <div className="bubble-decor slow" style={{ top: '70%', left: '5%', width: '100px', height: '100px' }}></div>
        <div className="bubble-decor" style={{ top: '25%', right: '15%', width: '60px', height: '60px' }}></div>
        <div className="bubble-decor large" style={{ top: '85%', right: '12%', width: '140px', height: '140px' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-16 z-10">
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <div className="text-left space-y-6 sm:space-y-8 animate-fade-in max-w-3xl">
            {/* Tag */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-colors ${theme === 'light'
                ? 'bg-cyan-100/90 border border-cyan-400/50 text-cyan-800 shadow-sm'
                : 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-400'
              }`}>
              <span className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-cyan-600' : 'bg-cyan-400'} animate-pulse`}></span>
              AI-Powered Hydration Concierge
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight uppercase hero-title-premium">
              Shambhavi <br />
              <span className="gradient-text">Water Services</span> <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-cyan-400 block mt-1">Smart Water Service</span>
            </h1>

            <p className={`text-base sm:text-lg lg:text-xl tracking-wide max-w-2xl leading-relaxed ${theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-300 font-light'}`}>
              Experience the ultimate hydration with Shambhavi's premium spring water. Curated sourcing, advanced multi-stage purification, and elegant sustainable packaging, delivered seamlessly to your doorstep.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-3 sm:pt-4 items-center">
              <Link to="/order" id="cta-order-water" className="btn-primary flex items-center gap-2 justify-center font-bold text-sm px-7 py-3.5 rounded-full shadow-lg shadow-cyan-500/25">
                <FiDroplet size={17} /> Order Your First Bottle
              </Link>
              <Link to="/tracker" id="cta-try-tracker" className="btn-outline flex items-center gap-2 justify-center font-bold text-sm px-7 py-3.5 rounded-full">
                Discover the Source <FiArrowRight size={17} />
              </Link>
              <a 
                href="https://wa.me/917311179993?text=hi%20i%20saw%20your%20website%20i%20need%20water%20bottel"
                target="_blank"
                rel="noopener noreferrer"
                id="cta-whatsapp"
                className="flex items-center gap-2.5 justify-center font-bold text-sm px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <FaWhatsapp size={20} className="text-white shrink-0" />
                <span>WhatsApp Us</span>
              </a>
            </div>

            {/* Date Tag */}
            <div className={`text-xs font-semibold tracking-widest uppercase pt-2 ${theme === 'light' ? 'text-slate-500 font-bold' : 'text-slate-400/80'}`}>
              ESTABLISHED 2021 • LUCKNOW, UP
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((s, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 text-center shadow-xl transition-all hover:-translate-y-1 ${theme === 'light'
                    ? 'bg-white/95 border border-slate-200 shadow-slate-200/60 hover:border-cyan-500/40'
                    : 'glass-card border-white/5 hover:border-cyan-500/35'
                  }`}
              >
                <p className={`text-4xl font-extrabold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{s.value}</p>
                <p className={`text-xs font-bold tracking-wider uppercase mt-2 ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400/90'}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
              WHY CHOOSE US
            </div>
            <h2 className="section-title text-white">Hydration Made Pristine</h2>
            <p className="text-slate-400 mt-2 max-w-xl mx-auto">We combine natural elegance with medical-grade purification to deliver wellness in every drop.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="glass-card rounded-3xl p-8 text-center group border-white/5 hover:border-cyan-500/30 hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="text-cyan-400 animate-float" size={28} />
                </div>
                <h3 className="text-white font-bold text-base mb-3 uppercase tracking-wider">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
              COLLECTIONS
            </div>
            <h2 className="section-title text-white">Our Premium Offerings</h2>
            <p className="text-slate-400 mt-2">Purity sized for every lifestyle and hydration demand</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-3xl p-8 relative transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] flex flex-col justify-between ${plan.badge ? 'teal-panel border border-cyan-400/40' : 'glass-card border-white/5'
                }`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold tracking-wider px-4 py-1.5 rounded-full shadow-lg uppercase">
                    {plan.badge}
                  </div>
                )}
                <div>
                  <div className="w-full h-48 mb-6 relative flex items-center justify-center bg-[#070f1e] rounded-2xl overflow-hidden border border-cyan-500/20 shadow-lg group">
                    <img
                      src={plan.img}
                      alt={plan.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap">
                      Shambhavi Water
                    </div>
                  </div>
                  <h3 className={`font-black text-lg uppercase tracking-wide ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{plan.name}</h3>
                  <div className="mt-3 mb-2 flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{plan.price}</span>
                    <span className={`text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>/ {plan.per.replace('per ', '')}</span>
                  </div>
                  <p className={`text-xs font-bold tracking-wide ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400/80'}`}>{plan.qty}</p>
                  <ul className={`mt-6 space-y-3 border-t pt-5 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
                    {['RO & UV Purified', 'Contactless Delivery', 'ISO & BIS Certified'].map(f => (
                      <li key={f} className={`flex items-center gap-2.5 text-xs ${theme === 'light' ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                        <FiCheck className={theme === 'light' ? 'text-cyan-600 shrink-0 font-bold' : 'text-cyan-400 shrink-0'} size={14} /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/order" className="block mt-8 btn-primary text-sm py-3.5 rounded-xl text-center font-black uppercase tracking-wider shadow-md">
                  Order Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
              PROCESS
            </div>
            <h2 className="section-title text-white">How It Works</h2>
            <p className="text-slate-400 mt-2">A seamless pipeline from purification to subscription</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { step: '01', title: 'Register Account', desc: 'Securely create your hydration profile' },
              { step: '02', title: 'Pick Your Plan', desc: 'Choose the ideal size & custom refills' },
              { step: '03', title: 'Smart Delivery', desc: 'Fresh batches arrive at your scheduling' },
              { step: '04', title: 'Continuous Wellness', desc: 'Seamless subscription management' },
            ].map((s, i) => (
              <div key={i} className="glass-card rounded-3xl p-8 text-center relative border-white/5 hover:border-cyan-500/30 transition-all duration-300">
                <div className="text-6xl font-black gradient-text opacity-25 mb-4 leading-none">{s.step}</div>
                <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-3">{s.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
                {i < 3 && <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-cyan-500 z-10 text-xl font-bold animate-pulse">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
              REVIEWS
            </div>
            <h2 className="section-title text-white">What Our Clientelle Says</h2>
            <p className="text-slate-400 mt-2">Highly rated experiences from homes and premium spaces</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.isArray(feedbacks) && feedbacks.slice(0, 6).map((t, i) => (
              <div key={t?.id || i} className="glass-card rounded-3xl p-8 border-white/5 hover:border-cyan-500/35 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1.5 mb-5">
                    {Array.from({ length: t?.rating || 5 }).map((_, j) => (
                      <FiStar key={j} className="text-yellow-400 fill-yellow-400" size={15} />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{t?.comment || 'Great service!'}"</p>
                </div>
                <div className="flex items-center gap-3.5 border-t border-white/5 pt-4">
                  <div className="avatar">{t?.name ? t.name.charAt(0) : 'U'}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t?.name || 'Anonymous'}</p>
                    <p className="text-cyan-400/80 text-xs">{t?.area || 'Verified Buyer'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit a Review Form */}
          <div className="mt-16 glass-card rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center justify-center gap-2">
              ⭐ Share Your Hydration Experience
            </h3>

            {submitted ? (
              <div className="text-center py-6 space-y-3 animate-fade-in">
                <FiCheckCircle className="text-emerald-400 mx-auto" size={48} />
                <h4 className="text-white font-bold uppercase text-sm">Review Submitted!</h4>
                <p className="text-slate-400 text-xs">
                  Thank you for rating Shambhavi. Your feedback has been posted.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="reviewer-name" className="input-label">Full Name</label>
                    <input
                      id="reviewer-name"
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <label htmlFor="reviewer-email" className="input-label">Email (Optional)</label>
                    <input
                      id="reviewer-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label htmlFor="reviewer-category" className="input-label">Category</label>
                    <select
                      id="reviewer-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-field cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-navy-900 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Rating */}
                  <div>
                    <label className="input-label mb-2">Rating</label>
                    <div className="flex gap-2 pt-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                          onClick={() => setRating(star)}
                        >
                          <FiStar
                            size={24}
                            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label htmlFor="reviewer-comment" className="input-label">Your Comment</label>
                  <textarea
                    id="reviewer-comment"
                    required
                    rows="3"
                    placeholder="Share your thoughts about our website, water quality, or delivery service..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-field resize-none"
                  />
                </div>

                <button type="submit" className="w-full btn-primary py-3 rounded-xl font-bold uppercase tracking-wider text-xs">
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="teal-panel rounded-[40px] px-10 py-16 text-center border-cyan-400/40 shadow-2xl relative overflow-hidden group">
            {/* Inner background blobs */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                Embrace Superior <br className="sm:hidden" /><span className="gradient-text bg-gradient-to-r from-white via-cyan-200 to-white">Hydration Today</span>
              </h2>
              <p className="text-white/80 text-lg max-w-lg mx-auto font-light leading-relaxed">
                Join over 1,500+ satisfied clients. Schedule your first pristine shipment in under two minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register" className="btn-primary text-base px-8 py-4 rounded-full inline-flex items-center gap-2 justify-center font-bold">
                  <FiDroplet /> Begin Delivery
                </Link>
                <Link to="/contact" className="btn-outline text-base px-8 py-4 rounded-full inline-flex items-center gap-2 justify-center font-bold">
                  Contact Concierge
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
