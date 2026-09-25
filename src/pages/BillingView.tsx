import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
  CreditCard,
  Check,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Download,
  X,
} from 'lucide-react';
import { PlanTier } from '../types';

export const BillingView: React.FC = () => {
  const { business } = useAuth();
  const {
    subscription,
    plan,
    allPlans,
    usage,
    upgradePlan,
    cancelSubscription,
    openPaywall,
  } = useSubscription();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isTrial = subscription?.status === 'trial';
  const isFree = subscription?.status === 'free';
  const isCancelled = subscription?.cancelAtPeriodEnd;

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const msg = await cancelSubscription();
      setCancelMessage(msg);
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectPlan = async (targetPlanId: PlanTier) => {
    setActionLoading(true);
    try {
      await upgradePlan(targetPlanId, billingCycle);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>Billing & Subscription Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your plan, check monthly entitlements, view invoices, or change subscription tier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFree && (
            <button
              onClick={() => openPaywall()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Cancellation Notice Banner */}
      {cancelMessage && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{cancelMessage}</span>
          </div>
          <button onClick={() => setCancelMessage(null)} className="text-amber-700 hover:text-amber-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current Active Plan Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Current Subscription
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl font-black text-slate-900">{plan?.name} Plan</h2>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  isTrial
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : isFree
                    ? 'bg-slate-100 text-slate-700'
                    : isCancelled
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isTrial ? 'Trial Active' : isCancelled ? 'Cancels at Period End' : subscription?.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isTrial
                ? '6 days left in your Growth trial • Full premium features unlocked.'
                : isFree
                ? 'Free plan with 50 AI conversations/month. Upgrade anytime for higher volume.'
                : `Next billing date: ${subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Next month'}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isFree && !isCancelled && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors border border-rose-200"
              >
                Cancel Subscription
              </button>
            )}
            <button
              onClick={() => openPaywall()}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              Change Tier
            </button>
          </div>
        </div>

        {/* Usage Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold">AI Conversations Used</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              {usage?.aiConversationsUsed} / {plan?.limits.aiConversationsMonthly.toLocaleString()}
            </p>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round(((usage?.aiConversationsUsed || 0) / (plan?.limits.aiConversationsMonthly || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold">Customer Records</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              {usage?.customersCount} / {(plan?.limits.customerLimit ?? 50) > 9999 ? 'Unlimited' : plan?.limits.customerLimit}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">Never auto-deleted upon plan change</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold">Staff Accounts</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              {usage?.staffCount} / {plan?.limits.staffLimit}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">Owner + Assigned Team Members</p>
          </div>
        </div>
      </div>

      {/* Plan Selection Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900">Available Plans</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent, non-binding pricing crafted for Indian small businesses.
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {allPlans.map((p) => {
            const isCurrent = subscription?.planId === p.id;
            const price = billingCycle === 'yearly' ? Math.round(p.priceYearly / 12) : p.priceMonthly;

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-base text-slate-900">{p.name}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.description}</p>

                  <div className="mt-4 pb-3 border-b border-slate-100">
                    <span className="text-2xl font-black text-slate-900">₹{price}</span>
                    <span className="text-xs text-slate-500 ml-1">/ mo</span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-slate-600">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleSelectPlan(p.id)}
                    disabled={isCurrent || actionLoading}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : `Switch to ${p.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices & Payment History */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">
          Billing Invoices & Receipts
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {[
            { id: 'INV-2026-009', date: 'Sep 01, 2026', amount: '₹999', plan: 'Growth Plan Monthly', status: 'Paid' },
            { id: 'INV-2026-008', date: 'Aug 01, 2026', amount: '₹999', plan: 'Growth Plan Monthly', status: 'Paid' },
          ].map((inv) => (
            <div key={inv.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-slate-900">{inv.id}</span>
                <p className="text-slate-500 text-[11px] mt-0.5">{inv.plan} • {inv.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900">{inv.amount}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {inv.status}
                </span>
                <button className="text-slate-400 hover:text-slate-700" title="Download Invoice PDF">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">Cancel Your Subscription?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure? Your plan will stay active until the end of your billing cycle. After that, you will be smoothly downgraded to the <strong>FREE</strong> plan.
            </p>
            <p className="text-xs text-emerald-700 font-semibold mt-2">
              ✓ All your customer profiles, appointments, and conversation histories are safe and will never be deleted.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Keep My Plan
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
