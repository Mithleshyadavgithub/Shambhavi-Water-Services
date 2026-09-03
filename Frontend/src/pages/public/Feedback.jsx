import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackButton from '../../components/BackButton';
import { FiStar, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'Website Design & UI',
  'Water Quality',
  'Delivery Service',
  'Customer Support',
  'Other'
];

const DEFAULT_FEEDBACK = [
  {
    id: 1,
    name: 'Mithlesh kumar',
    rating: 5,
    category: 'Website Design & UI',
    comment: 'The new dark mode UI is incredibly smooth and easy to use. Great work!',
    date: 'August 24, 2026'
  },
  {
    id: 2,
    name: 'Ravi Yadav',
    rating: 4,
    category: 'Delivery Service',
    comment: 'Real-time order tracking works well. Water delivery is always on time.',
    date: 'August 22, 2026'
  },
  {
    id: 3,
    name: 'Aditya Yadav',
    rating: 5,
    category: 'Water Quality',
    comment: 'Immaculate purity and taste. The subscription refill is very convenient.',
    date: 'August 20, 2026'
  }
];

export default function Feedback() {
  const { theme } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('shambhavi_feedbacks');
    if (saved) {
      setFeedbacks(JSON.parse(saved));
    } else {
      setFeedbacks(DEFAULT_FEEDBACK);
      localStorage.setItem('shambhavi_feedbacks', JSON.stringify(DEFAULT_FEEDBACK));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newFeedback = {
      id: Date.now(),
      name,
      email,
      rating,
      category,
      comment,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem('shambhavi_feedbacks', JSON.stringify(updated));

    // Reset Form
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

      {/* Floating Bubbles Backdrop */}
      <div className="bubble-container">
        <div className="bubble-decor large slow" style={{ top: '10%', left: '5%', width: '100px', height: '100px' }}></div>
        <div className="bubble-decor" style={{ top: '50%', right: '10%', width: '80px', height: '80px' }}></div>
        <div className="bubble-decor slow" style={{ top: '80%', left: '8%', width: '60px', height: '60px' }}></div>
      </div>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${theme === 'light' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-400'
            }`}>
            Feedback
          </div>
          <h1 className={`text-4xl md:text-5xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
            Rate Your Experience
          </h1>
          <p className={`max-w-lg mx-auto ${theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            Your reviews help us refine our service and deliver uncompromised purity. Share your thoughts with us!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Feedback Form Card */}
          <div className="lg:col-span-5 glass-card rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl">
            <h2 className={`text-xl font-bold mb-6 uppercase tracking-wider flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
              <FiMessageSquare className={theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'} /> Share Review
            </h2>

            {submitted ? (
              <div className="text-center py-10 space-y-4 animate-fade-in">
                <FiCheckCircle className="text-emerald-500 mx-auto" size={56} />
                <h3 className={`font-bold text-lg uppercase ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Thank You!</h3>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Your feedback has been recorded successfully.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Rating selection */}
                <div>
                  <label className="input-label mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <FiStar
                          size={28}
                          className={`${star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : (theme === 'light' ? 'text-slate-300' : 'text-slate-600')
                            } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name-input" className="input-label">Full Name</label>
                  <input
                    id="name-input"
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
                  <label htmlFor="email-input" className="input-label">Email (Optional)</label>
                  <input
                    id="email-input"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category-select" className="input-label">Category</label>
                  <select
                    id="category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-navy-900 text-white'}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comment */}
                <div>
                  <label htmlFor="comment-input" className="input-label">Review Comment</label>
                  <textarea
                    id="comment-input"
                    required
                    rows="4"
                    placeholder="What did you think of our service?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-field resize-none"
                  />
                </div>

                {/* Submit button */}
                <button type="submit" className="w-full btn-primary py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm cursor-pointer">
                  Submit Feedback
                </button>
              </form>
            )}
          </div>

          {/* Feedback Feed Column */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className={`text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
              ⭐ Recent Reviews ({feedbacks.length})
            </h2>

            {feedbacks.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center border-white/5">
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>No reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {feedbacks.map((f) => (
                  <div key={f.id} className="glass-card rounded-2xl p-5 border-white/5 hover:border-cyan-500/20 transition-all flex flex-col justify-between gap-4 animate-slide-up">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="avatar">{f.name[0]}</div>
                        <div>
                          <p className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{f.name}</p>
                          <p className={`text-[10px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{f.date}</p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className={`flex gap-1 px-2 py-1 rounded-lg border ${theme === 'light' ? 'bg-amber-50 border-amber-200' : 'bg-cyan-950/30 border-cyan-500/10'
                        }`}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <FiStar
                            key={j}
                            size={12}
                            className={
                              j < f.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : (theme === 'light' ? 'text-slate-300' : 'text-slate-700')
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${theme === 'light' ? 'bg-cyan-100 text-cyan-800 border-cyan-200' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                        {f.category}
                      </div>
                      <p className={`text-sm leading-relaxed font-light italic ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                        "{f.comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
