import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiEdit3 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Profile() {
  const { user, updateUser, theme } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    area: 'General',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Fetch latest user data including customer profile
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          const u = res.data.user;
          const customerData = u.customerId || {};
          setFormData({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || customerData.phone || '',
            address: customerData.address || '',
            area: customerData.area || 'General',
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.put('/auth/me', formData);
      if (res.data.success) {
        updateUser(res.data.user);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setIsEditing(false);
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col items-start mb-8 gap-4">
        <div>
          <h1 className={`text-3xl font-black flex items-center gap-3 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            <FiUser className="text-cyan-500" /> My Profile
          </h1>
          <p className={`mt-2 mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>View and manage your account details and delivery address.</p>
        </div>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center gap-2 py-2.5 px-6 rounded-xl font-bold tracking-wide mt-2"
          >
            <FiEdit3 /> Edit Profile
          </button>
        )}
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className={`rounded-3xl p-6 md:p-8 border ${theme === 'light' ? 'bg-white border-cyan-500/20 shadow-xl shadow-cyan-500/5' : 'glass-card'}`}>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className={`text-sm font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                <FiUser className="text-cyan-500" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`w-full p-3 rounded-xl border transition-all ${
                  !isEditing 
                    ? (theme === 'light' ? 'bg-slate-100 border-transparent text-slate-500 cursor-not-allowed' : 'bg-slate-800/50 border-transparent text-slate-400 cursor-not-allowed')
                    : (theme === 'light' ? 'bg-white border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-slate-900' : 'bg-slate-900 border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white')
                }`}
              />
            </div>

            {/* Email (Read Only usually, but let's show it disabled) */}
            <div className="space-y-2">
              <label className={`text-sm font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                <FiMail className="text-cyan-500" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className={`w-full p-3 rounded-xl border transition-all cursor-not-allowed ${
                  theme === 'light' ? 'bg-slate-100 border-transparent text-slate-500' : 'bg-slate-800/50 border-transparent text-slate-400'
                }`}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className={`text-sm font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                <FiPhone className="text-cyan-500" /> Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`w-full p-3 rounded-xl border transition-all ${
                  !isEditing 
                    ? (theme === 'light' ? 'bg-slate-100 border-transparent text-slate-500 cursor-not-allowed' : 'bg-slate-800/50 border-transparent text-slate-400 cursor-not-allowed')
                    : (theme === 'light' ? 'bg-white border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-slate-900' : 'bg-slate-900 border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white')
                }`}
              />
            </div>

            {/* Area */}
            <div className="space-y-2">
              <label className={`text-sm font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                <FiMapPin className="text-cyan-500" /> Delivery Area
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-3 rounded-xl border transition-all ${
                  !isEditing 
                    ? (theme === 'light' ? 'bg-slate-100 border-transparent text-slate-500 cursor-not-allowed' : 'bg-slate-800/50 border-transparent text-slate-400 cursor-not-allowed')
                    : (theme === 'light' ? 'bg-white border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-slate-900' : 'bg-slate-900 border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white')
                }`}
              >
                <option value="General">General</option>
                <option value="Gomti Nagar">Gomti Nagar</option>
                <option value="Indira Nagar">Indira Nagar</option>
                <option value="Aliganj">Aliganj</option>
                <option value="Hazratganj">Hazratganj</option>
                <option value="Aminabad">Aminabad</option>
              </select>
            </div>
          </div>

          {/* Full Address */}
          <div className="space-y-2">
            <label className={`text-sm font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              <FiMapPin className="text-cyan-500" /> Complete Delivery Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              rows="3"
              required
              className={`w-full p-3 rounded-xl border transition-all ${
                !isEditing 
                  ? (theme === 'light' ? 'bg-slate-100 border-transparent text-slate-500 cursor-not-allowed' : 'bg-slate-800/50 border-transparent text-slate-400 cursor-not-allowed')
                  : (theme === 'light' ? 'bg-white border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-slate-900' : 'bg-slate-900 border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white')
              }`}
              placeholder="House/Flat No, Building Name, Street, Landmark"
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200/50">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary py-3 px-8 rounded-xl font-bold tracking-wide flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSave />
                )}
                Save Changes
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className={`btn-outline py-3 px-6 rounded-xl font-bold border transition-colors ${
                  theme === 'light' ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
