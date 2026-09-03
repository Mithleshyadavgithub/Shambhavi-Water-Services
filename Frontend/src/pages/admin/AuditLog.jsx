import { useState, useEffect } from 'react';
import { FiShield, FiLoader, FiRefreshCw, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import api from '../../services/api';

const ACTION_COLORS = {
  CREATE_RAZORPAY_ORDER: { color: 'cyan', icon: '💳' },
  VERIFY_PAYMENT: { color: 'green', icon: '✅' },
  PAYMENT_CAPTURED: { color: 'green', icon: '💰' },
  PAYMENT_FAILED: { color: 'red', icon: '❌' },
  CREATE_SUBSCRIPTION: { color: 'violet', icon: '🔄' },
  APPLY_DISCOUNT: { color: 'amber', icon: '🏷️' },
  CREATE_CAMPAIGN: { color: 'blue', icon: '📢' },
  APPROVE_CAMPAIGN: { color: 'green', icon: '✅' },
  EXECUTE_CAMPAIGN: { color: 'teal', icon: '🚀' },
  AI_RECOMMENDATION: { color: 'cyan', icon: '🤖' },
  POLICY_BLOCKED: { color: 'red', icon: '🛡️' },
};

const ACTOR_COLORS = {
  AI_AGENT: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  CUSTOMER: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  ADMIN: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  WEBHOOK: 'bg-green-500/15 text-green-400 border-green-500/20',
  SYSTEM: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

function AuditRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const meta = ACTION_COLORS[log.action] || { color: 'slate', icon: '📋' };
  const actorStyle = ACTOR_COLORS[log.actor] || ACTOR_COLORS.SYSTEM;

  return (
    <div className="glass-card rounded-xl mb-2 overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/2 transition-all"
        onClick={() => setExpanded(!expanded)}>
        <span className="text-xl w-8 text-center">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-mono text-xs font-bold">{log.action}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${actorStyle}`}>{log.actor}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              log.status === 'SUCCESS' ? 'bg-green-500/15 text-green-400' :
              log.status === 'FAILED' ? 'bg-red-500/15 text-red-400' :
              log.status === 'BLOCKED' ? 'bg-red-500/15 text-red-400' :
              'bg-amber-500/15 text-amber-400'
            }`}>{log.status}</span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{log.reason}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {log.amount && <p className="text-white font-bold text-sm">₹{log.amount.toLocaleString()}</p>}
          <p className="text-slate-500 text-xs">{new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-white/2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {log.customerId && (
              <div>
                <span className="text-slate-500">Customer:</span>
                <span className="text-white ml-2">{log.customerId?.name || log.customerId}</span>
              </div>
            )}
            {log.orderId && (
              <div>
                <span className="text-slate-500">Order:</span>
                <span className="text-white ml-2">{log.orderId?.orderId || log.orderId}</span>
              </div>
            )}
            {log.razorpayOrderId && (
              <div>
                <span className="text-slate-500">Razorpay Order:</span>
                <span className="text-cyan-400 ml-2 font-mono">{log.razorpayOrderId}</span>
              </div>
            )}
            {log.razorpayPaymentId && (
              <div>
                <span className="text-slate-500">Payment ID:</span>
                <span className="text-green-400 ml-2 font-mono">{log.razorpayPaymentId}</span>
              </div>
            )}
            {log.approval && (
              <div>
                <span className="text-slate-500">Approval Gate:</span>
                <span className="text-white ml-2">{log.approval}</span>
              </div>
            )}
            {log.errorMessage && (
              <div className="col-span-2">
                <span className="text-red-400">Error:</span>
                <span className="text-red-400/80 ml-2">{log.errorMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterActor, setFilterActor] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [policyLimits, setPolicyLimits] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterActor) params.set('actor', filterActor);
      if (filterAction) params.set('action', filterAction);
      const { data } = await api.get(`/growth/audit?${params}`);
      if (data.success) { setLogs(data.data); setTotal(data.total); }
    } catch (err) {
      console.error('Audit log error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPolicyLimits = async () => {
    try {
      const { data } = await api.get('/growth/policy-limits');
      if (data.success) setPolicyLimits(data.limits);
    } catch (_) {}
  };

  useEffect(() => { loadLogs(); }, [page, filterActor, filterAction]);
  useEffect(() => { loadPolicyLimits(); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FiShield className="text-cyan-400" /> AI Audit Trail
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Every AI money action — explainable, bounded, and logged</p>
        </div>
        <button onClick={loadLogs} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm disabled:opacity-50">
          {loading ? <FiLoader size={14} className="animate-spin" /> : <FiRefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {/* Policy Limits Card */}
      {policyLimits && (
        <div className="glass-card rounded-2xl p-5 mb-6 border-l-4 border-cyan-500">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <FiShield className="text-cyan-400" /> Active Policy Limits
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-slate-400 text-xs">Max Order Amount</p>
              <p className="text-white font-bold">₹{policyLimits.maxOrderAmount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Max Discount</p>
              <p className="text-white font-bold">{policyLimits.maxDiscountPercent}%</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Max Campaign Budget</p>
              <p className="text-white font-bold">₹{policyLimits.maxCampaignBudget?.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-green-400 text-xs mt-3 flex items-center gap-1">
            <FiCheckCircle size={12} /> All AI money actions require explicit human approval
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filterActor} onChange={e => setFilterActor(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
          <option value="">All Actors</option>
          <option value="AI_AGENT">🤖 AI Agent</option>
          <option value="CUSTOMER">👤 Customer</option>
          <option value="ADMIN">🔑 Admin</option>
          <option value="WEBHOOK">🔗 Webhook</option>
        </select>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
          <option value="">All Actions</option>
          <option value="CREATE_RAZORPAY_ORDER">Create Payment</option>
          <option value="PAYMENT_CAPTURED">Payment Captured</option>
          <option value="PAYMENT_FAILED">Payment Failed</option>
          <option value="POLICY_BLOCKED">Policy Blocked</option>
          <option value="CREATE_CAMPAIGN">Create Campaign</option>
        </select>
        <span className="ml-auto text-slate-500 text-sm self-center">{total} events</span>
      </div>

      {/* Log entries */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 h-16 animate-pulse bg-white/3" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FiShield size={40} className="mx-auto mb-3 opacity-30" />
          <p>No audit events yet. AI actions will appear here.</p>
        </div>
      ) : (
        <>
          {logs.map((log, i) => <AuditRow key={log._id || i} log={log} />)}
          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 disabled:opacity-30 transition-all text-sm">
                ← Prev
              </button>
              <span className="px-4 py-2 text-slate-400 text-sm">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 disabled:opacity-30 transition-all text-sm">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
