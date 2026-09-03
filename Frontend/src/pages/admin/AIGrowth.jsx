import { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiZap, FiRefreshCw, FiLoader, FiTarget, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const SEGMENT_OPTIONS = [
  { value: 'non-subscribers', label: '🎯 Convert Frequent Buyers → Subscription', desc: 'Customers ordering 3+/month with no plan' },
  { value: 'lapsed', label: '🔄 Win Back Lapsed Customers', desc: 'Haven\'t ordered in 30-90 days' },
  { value: 'high-value', label: '⭐ Upsell High-Value Customers', desc: 'Top spenders — offer premium products' },
  { value: 'office-customers', label: '🏢 Office Monthly Plan Campaign', desc: 'Target office customers with bulk offer' },
];

function MetricCard({ icon: Icon, label, value, sub, trend, trendUp, color = 'cyan' }) {
  return (
    <div className="glass-card rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/15 border border-${color}-500/20 flex items-center justify-center`}>
          <Icon size={18} className={`text-${color}-400`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-black text-2xl">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function InsightPanel({ summary }) {
  if (!summary) return null;
  return (
    <div className="glass-card rounded-2xl p-6 border-l-4 border-cyan-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center">
          <FiZap size={18} className="text-cyan-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">AI Growth Insights</h3>
          <p className="text-slate-500 text-xs">Generated just now</p>
        </div>
      </div>
      <div className="space-y-2">
        {summary.split('\n').filter(Boolean).map((line, i) => (
          <p key={i} className="text-slate-300 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AIGrowth() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignResult, setCampaignResult] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('non-subscribers');
  const [discount, setDiscount] = useState(10);
  const [error, setError] = useState('');

  const loadInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/growth/insights');
      if (data.success) setInsights(data.insights);
    } catch (err) {
      setError('Could not load insights. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInsights(); }, []);

  const createCampaign = async () => {
    setCampaignLoading(true);
    setCampaignResult(null);
    try {
      const { data } = await api.post('/campaigns/draft', {
        targetSegment: selectedSegment,
        discountPercent: discount,
        offerType: 'subscription-discount',
      });
      if (data.success) setCampaignResult({ success: true, campaign: data.data, message: data.message });
      else setCampaignResult({ success: false, message: data.message });
    } catch (err) {
      setCampaignResult({ success: false, message: err.response?.data?.message || 'Campaign creation failed' });
    } finally {
      setCampaignLoading(false);
    }
  };

  const ins = insights;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FiTrendingUp className="text-cyan-400" /> AI Growth Engine
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Revenue analysis, upsell opportunities, and campaign orchestration</p>
        </div>
        <button onClick={loadInsights} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm disabled:opacity-50">
          {loading ? <FiLoader size={14} className="animate-spin" /> : <FiRefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Metrics */}
      {loading && !ins ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-28 bg-white/5" />
          ))}
        </div>
      ) : ins ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard icon={FiDollarSign} label="Monthly Revenue" value={`₹${(ins.revenue.current || 0).toLocaleString()}`} sub={ins.revenue.growthLabel} trend={ins.revenue.growth} trendUp={ins.revenue.growth >= 0} color="cyan" />
            <MetricCard icon={FiUsers} label="Active Customers" value={(ins.customers.total || 0).toLocaleString()} sub={`${ins.customers.activeSubscriptions} subscriptions`} color="violet" />
            <MetricCard icon={FiTarget} label="Upsell Targets" value={ins.opportunities.frequentBuyersWithoutSubscription || 0} sub="Frequent buyers, no subscription" color="amber" />
            <MetricCard icon={FiTrendingUp} label="Revenue Potential" value={`₹${((ins.opportunities.potentialMonthlyGain) || 0).toLocaleString()}`} sub="From subscription conversions" color="green" />
          </div>

          {/* AI Insight Summary */}
          <div className="mb-8">
            <InsightPanel summary={ins.summary} />
          </div>

          {/* Subscription Conversion Opportunity */}
          {ins.opportunities.frequentBuyersWithoutSubscription > 0 && (
            <div className="glass-card rounded-2xl p-6 mb-8">
              <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                <FiTarget className="text-amber-400" /> Top Conversion Opportunity
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                <strong className="text-amber-400">{ins.opportunities.frequentBuyersWithoutSubscription} customers</strong> are ordering 3+ times/month without a subscription.
                Converting them could add <strong className="text-green-400">₹{(ins.opportunities.potentialMonthlyGain || 0).toLocaleString()}/month</strong> in recurring revenue.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ins.opportunities.frequentBuyers?.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-white text-sm font-semibold">{c.name || 'Customer'}</p>
                      <p className="text-slate-500 text-xs">{c.area || 'N/A'} • {c.orderCount} orders/month</p>
                    </div>
                    <span className="text-amber-400 font-bold text-xs">₹{(c.totalSpend || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Campaign Orchestrator */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
          <FiZap className="text-cyan-400" /> Campaign Orchestrator
        </h3>
        <p className="text-slate-400 text-sm mb-6">Let AI create a targeted campaign. You approve before it runs.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 block">Target Segment</label>
            <div className="space-y-2">
              {SEGMENT_OPTIONS.map(opt => (
                <label key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedSegment === opt.value
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-white/5 hover:border-white/10 bg-white/3'
                  }`}>
                  <input type="radio" name="segment" value={opt.value}
                    checked={selectedSegment === opt.value}
                    onChange={() => setSelectedSegment(opt.value)}
                    className="mt-0.5 accent-cyan-500" />
                  <div>
                    <p className="text-white text-sm font-semibold">{opt.label}</p>
                    <p className="text-slate-500 text-xs">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 block">
              Discount Offer: {discount}%
            </label>
            <input type="range" min={5} max={15} value={discount} onChange={e => setDiscount(Number(e.target.value))}
              className="w-full accent-cyan-500 mb-2" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>5% (minimum)</span>
              <span>15% (maximum)</span>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-cyan-400 font-bold text-sm">Policy Limits</p>
              <p className="text-slate-400 text-xs mt-1">Max discount: 15% • Max budget: ₹2,000</p>
              <p className="text-slate-400 text-xs">Requires admin approval before execution ✅</p>
            </div>
          </div>
        </div>

        <button id="create-campaign-btn" onClick={createCampaign} disabled={campaignLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
          {campaignLoading ? <FiLoader size={16} className="animate-spin" /> : <FiZap size={16} />}
          {campaignLoading ? 'AI is analyzing...' : 'Generate Campaign with AI'}
        </button>

        {campaignResult && (
          <div className={`mt-4 p-4 rounded-xl border ${campaignResult.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            {campaignResult.success ? (
              <>
                <p className="text-green-400 font-bold text-sm mb-2">✅ {campaignResult.message}</p>
                <p className="text-slate-400 text-xs">Campaign: <strong className="text-white">{campaignResult.campaign?.name}</strong></p>
                <p className="text-slate-400 text-xs">Targets: <strong className="text-white">{campaignResult.campaign?.targetCount} customers</strong></p>
                <p className="text-slate-400 text-xs">Est. Revenue: <strong className="text-green-400">₹{(campaignResult.campaign?.estimatedRevenue || 0).toLocaleString()}</strong></p>
                <p className="text-slate-400 text-xs mt-2">Go to <strong className="text-cyan-400">Campaigns</strong> to approve and execute it.</p>
              </>
            ) : (
              <p className="text-red-400 text-sm">❌ {campaignResult.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
