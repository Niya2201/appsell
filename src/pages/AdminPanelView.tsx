import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
  Shield,
  Building,
  Users,
  IndianRupee,
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { PlanTier } from '../types';

export const AdminPanelView: React.FC = () => {
  const { user, business, switchUser } = useAuth();
  const { demoSetState, subscription, refreshSubscription } = useSubscription();

  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview');
      if (res.ok) setAdminData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleSetState = async (planId: PlanTier, status: any, maxOut = false) => {
    await demoSetState({ planId, status, maxOutUsage: maxOut });
    setNotification(`Successfully switched subscription state to [${planId.toUpperCase()} - ${status}]`);
    await fetchOverview();
    setTimeout(() => setNotification(null), 3500);
  };

  const handleResetUsage = async () => {
    await demoSetState({ resetUsage: true });
    setNotification('AI conversation usage reset to 0.');
    await fetchOverview();
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            <span>Platform Admin & SaaS Simulation Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Overview of multi-tenant accounts, Monthly Recurring Revenue (MRR), and instant developer state simulator.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Developer Demo Simulator Control Deck */}
      <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h3 className="font-extrabold text-base text-white">
            Demo Mode Subscription State Switcher
          </h3>
        </div>
        <p className="text-xs text-emerald-200 max-w-2xl leading-relaxed mb-5">
          Simulate any subscription tier or force paywalls instantly without real payment credentials. This allows you to verify feature gating and test the user experience under different entitlement limits.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => handleSetState('free', 'free', false)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left border border-white/10 transition-all"
          >
            <p className="text-xs font-bold text-emerald-300">FREE Plan</p>
            <p className="text-[10px] text-slate-300 mt-0.5">50 AI msgs limit</p>
          </button>

          <button
            onClick={() => handleSetState('free', 'free', true)}
            className="p-3 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl text-left border border-rose-500/40 transition-all"
          >
            <p className="text-xs font-bold text-rose-300">MAX OUT Free (50/50)</p>
            <p className="text-[10px] text-rose-200 mt-0.5">Triggers Paywall!</p>
          </button>

          <button
            onClick={() => handleSetState('growth', 'trial', false)}
            className="p-3 bg-amber-500/20 hover:bg-amber-500/30 rounded-xl text-left border border-amber-500/40 transition-all"
          >
            <p className="text-xs font-bold text-amber-300">GROWTH Trial</p>
            <p className="text-[10px] text-amber-200 mt-0.5">6 Days Left</p>
          </button>

          <button
            onClick={() => handleSetState('starter', 'active', false)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left border border-white/10 transition-all"
          >
            <p className="text-xs font-bold text-emerald-300">STARTER Active</p>
            <p className="text-[10px] text-slate-300 mt-0.5">₹499/mo (500 msgs)</p>
          </button>

          <button
            onClick={() => handleSetState('growth', 'active', false)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left border border-white/10 transition-all"
          >
            <p className="text-xs font-bold text-emerald-300">GROWTH Active</p>
            <p className="text-[10px] text-slate-300 mt-0.5">₹999/mo (Follow-ups)</p>
          </button>

          <button
            onClick={() => handleSetState('business', 'active', false)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left border border-white/10 transition-all"
          >
            <p className="text-xs font-bold text-emerald-300">BUSINESS Tier</p>
            <p className="text-[10px] text-slate-300 mt-0.5">₹1,999/mo (10k msgs)</p>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Current active tenant state: <strong>{subscription?.planId.toUpperCase()} ({subscription?.status})</strong></span>
          <button
            onClick={handleResetUsage}
            className="text-emerald-400 hover:text-emerald-300 underline font-bold"
          >
            Reset Usage Count to 0
          </button>
        </div>
      </div>

      {/* Platform SaaS Metrics */}
      {adminData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-semibold">Total Businesses</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{adminData.totalBusinesses}</p>
            <p className="text-[11px] text-slate-400 mt-1">Multi-tenant tenants</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-semibold">Platform MRR</p>
            <p className="text-3xl font-black text-emerald-700 mt-2">
              ₹{adminData.totalMRR.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Monthly Recurring Revenue</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-semibold">Active Paid Subscribers</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{adminData.activeSubscribers}</p>
            <p className="text-[11px] text-slate-400 mt-1">Converted businesses</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-semibold">Free / Trial Users</p>
            <p className="text-3xl font-black text-amber-600 mt-2">
              {adminData.trialSubscribers + adminData.freeUsers}
            </p>
            <p className="text-[11px] text-amber-700 mt-1">In upgrade funnel</p>
          </div>
        </div>
      )}

      {/* Multi-Tenant Business Isolation Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900">
            Registered Businesses (Tenant Isolation Enforced)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin can manage plans and switch perspectives without accessing private customer message content.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Business Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Subscription Status</th>
                <th className="py-3 px-4">AI Monthly Usage</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminData?.businesses?.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{b.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{b.id}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{b.category}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 uppercase">{b.planId}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        b.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'trial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {b.aiConversationsUsed} msgs
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={async () => {
                        const email = b.id === 'biz_glow_salon' ? 'demo-growth@example.com' : `contact@${b.id}.com`;
                        await switchUser(email);
                      }}
                      className="text-xs text-emerald-700 font-bold hover:underline"
                    >
                      Log in as Tenant
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
