import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { PremiumFeature } from '../components/paywall/FeatureGate';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  IndianRupee,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { businessId } = useAuth();
  const { subscription, plan, openPaywall } = useSubscription();
  const [data, setData] = useState<any>({
    todayConversations: 128,
    aiResolutionRate: 91,
    newLeads: 24,
    ordersCount: 18,
    appointmentsCount: 13,
    pendingPaymentsAmount: 8420,
    aiUsageMonthly: 1280,
    aiMonthlyLimit: 2000,
    customerGrowthRate: 18.4,
    averageResponseTimeSeconds: 2.1,
  });

  useEffect(() => {
    fetch('/api/analytics', { headers: { 'x-business-id': businessId } })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, [businessId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Business Performance & AI Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time conversion metrics, customer acquisition rates, and AI speed benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Average AI Speed: {data.averageResponseTimeSeconds}s</span>
        </div>
      </div>

      {/* Basic Metrics Always Visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">AI Resolution Rate</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{data.aiResolutionRate}%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">9 out of 10 chats handled without staff</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">Customer Growth</p>
          <p className="text-3xl font-black text-slate-900 mt-2">+{data.customerGrowthRate}%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Month-over-month new customers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">Avg Reply Time</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{data.averageResponseTimeSeconds}s</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Instant 24/7 WhatsApp response</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold">Lead Conversion Rate</p>
          <p className="text-3xl font-black text-slate-900 mt-2">68.2%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">WhatsApp chat to booked appointment</p>
        </div>
      </div>

      {/* Advanced Analytics - Feature Gated for Growth / Business */}
      <PremiumFeature
        feature="advancedAnalytics"
        title="Unlock Advanced Analytics & Revenue Trends"
        description="Understand response time bottlenecks, AI resolution rates by service category, hourly conversation peaks, and repeat booking trends."
        requiredPlan="growth"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Weekly WhatsApp Revenue Impact</span>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Total: ₹42,500
              </span>
            </h3>

            <div className="space-y-3">
              {[
                { label: 'Precision Haircuts & Styling', amount: 14200, pct: 33 },
                { label: 'Moroccan Hair Spa', amount: 12600, pct: 29 },
                { label: 'Organic Fruit Facials', amount: 9600, pct: 23 },
                { label: 'Bridal Package Inquiries', amount: 6100, pct: 15 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-900">₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Traffic Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Peak Inbound Hours (AI Auto-Replies)</span>
              <span className="text-xs text-slate-500 font-medium">Busiest: 6 PM - 9 PM</span>
            </h3>

            <div className="h-44 flex items-end gap-2 pt-6">
              {[
                { time: '10 AM', val: 35 },
                { time: '12 PM', val: 55 },
                { time: '2 PM', val: 40 },
                { time: '4 PM', val: 75 },
                { time: '6 PM', val: 100 },
                { time: '8 PM', val: 85 },
                { time: '10 PM', val: 50 },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all"
                    style={{ height: `${bar.val}%` }}
                  />
                  <span className="text-[10px] text-slate-400 font-medium">{bar.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PremiumFeature>
    </div>
  );
};
