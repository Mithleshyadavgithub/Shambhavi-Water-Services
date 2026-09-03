import { useState, useEffect } from 'react';
import { FiZap, FiLoader, FiRefreshCw, FiCheckCircle, FiPlay, FiClock, FiUsers, FiTrendingUp } from 'react-icons/fi';
import api from '../../services/api';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/20' },
  pending_approval: { label: 'Awaiting Approval', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/20' },
  approved: { label: 'Approved', color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/20' },
  executed: { label: 'Executed', color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/20' },
};

function CampaignCard({ campaign, onApprove, onExecute }) {
  const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
  const [approveLoading, setApproveLoading] = useState(false);
  const [executeLoading, setExecuteLoading] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-6 hover:border-cyan-500/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold text-base">{campaign.name}</h3>
            {campaign.aiGenerated && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">🤖 AI</span>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border ${status.bg} ${status.color} font-semibold`}>
            {status.label}
          </span>
        </div>
        {campaign.estimatedRevenue > 0 && (
          <div className="text-right">
            <p className="text-slate-500 text-xs">Est. Revenue</p>
            <p className="text-green-400 font-black text-lg">₹{campaign.estimatedRevenue.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* AI Reasoning */}
      {campaign.aiReasoning && (
        <div className="mb-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
          <p className="text-slate-400 text-xs leading-relaxed">
            <span className="text-cyan-400 font-bold">AI Reasoning: </span>
            {campaign.aiReasoning}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-xl bg-white/3">
          <p className="text-white font-bold text-lg">{campaign.targetCount || 0}</p>
          <p className="text-slate-500 text-xs">Customers</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-white/3">
          <p className="text-white font-bold text-lg">{campaign.discountPercent || 0}%</p>
          <p className="text-slate-500 text-xs">Discount</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-white/3">
          <p className="text-white font-bold text-lg">₹{(campaign.budget || 0).toLocaleString()}</p>
          <p className="text-slate-500 text-xs">Budget</p>
        </div>
      </div>

      {/* Offer */}
      {campaign.offerDescription && (
        <p className="text-slate-400 text-xs mb-4">📋 {campaign.offerDescription}</p>
      )}

      {/* Approval info */}
      {campaign.approvedBy && (
        <p className="text-green-400 text-xs mb-3">
          ✅ Approved by {campaign.approvedBy?.name || 'Admin'} on {new Date(campaign.approvedAt).toLocaleDateString('en-IN')}
        </p>
      )}

      {/* Execution results */}
      {campaign.status === 'executed' && campaign.results && (
        <div className="flex gap-4 mb-4">
          <div>
            <p className="text-slate-500 text-xs">Contacted</p>
            <p className="text-white font-bold">{campaign.results.contacted}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Executed</p>
            <p className="text-cyan-400 text-xs">{new Date(campaign.executedAt).toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {campaign.status === 'pending_approval' && (
          <button
            id={`approve-campaign-${campaign._id}`}
            onClick={async () => {
              setApproveLoading(true);
              await onApprove(campaign._id);
              setApproveLoading(false);
            }}
            disabled={approveLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500/80 to-teal-600/80 hover:from-green-500 hover:to-teal-600 text-white font-bold text-sm transition-all disabled:opacity-50">
            {approveLoading ? <FiLoader size={14} className="animate-spin" /> : <FiCheckCircle size={14} />}
            Approve Campaign
          </button>
        )}
        {campaign.status === 'approved' && (
          <button
            id={`execute-campaign-${campaign._id}`}
            onClick={async () => {
              setExecuteLoading(true);
              await onExecute(campaign._id);
              setExecuteLoading(false);
            }}
            disabled={executeLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-bold text-sm transition-all disabled:opacity-50">
            {executeLoading ? <FiLoader size={14} className="animate-spin" /> : <FiPlay size={14} />}
            Execute Now
          </button>
        )}
      </div>

      <p className="text-slate-600 text-xs mt-3">
        Created {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
      </p>
    </div>
  );
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get(`/campaigns${params}`);
      if (data.success) setCampaigns(data.data);
    } catch (err) {
      console.error('Campaigns error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCampaigns(); }, [filter]);

  const handleApprove = async (id) => {
    try {
      const { data } = await api.post(`/campaigns/${id}/approve`, { note: 'Approved via Admin Dashboard' });
      if (data.success) { showToast('✅ Campaign approved!'); loadCampaigns(); }
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Approval failed'));
    }
  };

  const handleExecute = async (id) => {
    try {
      const { data } = await api.post(`/campaigns/${id}/execute`);
      if (data.success) { showToast('🚀 Campaign executed!'); loadCampaigns(); }
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Execution failed'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-navy-800 border border-cyan-500/30 text-white text-sm shadow-2xl animate-slide-up">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FiZap className="text-cyan-400" /> Campaign Orchestrator
          </h1>
          <p className="text-slate-400 mt-1 text-sm">AI-generated campaigns — review, approve, and execute</p>
        </div>
        <button onClick={loadCampaigns} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm disabled:opacity-50">
          {loading ? <FiLoader size={14} className="animate-spin" /> : <FiRefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {/* Safety Banner */}
      <div className="glass-card rounded-2xl p-4 mb-6 border-l-4 border-amber-500 flex items-start gap-3">
        <span className="text-2xl">🛡️</span>
        <div>
          <p className="text-white font-bold text-sm">Approval Gate Active</p>
          <p className="text-slate-400 text-xs">All AI-generated campaigns require explicit admin approval before execution. No money action runs automatically.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending_approval', 'approved', 'executed', 'draft'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === s ? 'bg-cyan-500 text-white' : 'border border-white/10 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400'
            }`}>
            {s === '' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Campaign Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 h-64 animate-pulse bg-white/3" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <FiZap size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-semibold">No campaigns yet</p>
          <p className="text-sm mt-1">Go to <strong className="text-cyan-400">AI Growth</strong> to generate one with AI</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map(c => (
            <CampaignCard key={c._id} campaign={c} onApprove={handleApprove} onExecute={handleExecute} />
          ))}
        </div>
      )}
    </div>
  );
}
