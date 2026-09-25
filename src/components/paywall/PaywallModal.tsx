import React, { useState } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { Check, X, Zap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { PlanTier } from '../../types';

export const PaywallModal: React.FC = () => {
  const { paywallState, closePaywall, allPlans, subscription, upgradePlan } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!paywallState.isOpen) return null;

  const currentPlanId = subscription?.planId || 'free';
  const targetPlanId = paywallState.requiredPlan || 'growth';

  const handleUpgrade = async (planId: PlanTier) => {
    setIsUpgrading(true);
    try {
      await upgradePlan(planId, billingCycle);
    } finally {
      setIsUpgrading(false);
    }
  };

  const getFeatureHeadline = () => {
    if (paywallState.feature === 'advancedAnalytics') {
      return {
        title: 'Unlock Advanced Business Analytics',
        desc: 'Gain deep visibility into your customer conversion, AI resolution speed, revenue trends, and repeat booking analytics.',
      };
    }
    if (paywallState.feature === 'automatedFollowups') {
      return {
        title: 'Supercharge Revenue with Automated Follow-ups',
        desc: 'Automatically re-engage idle leads after 48 hours and send 24-hour appointment confirmations on WhatsApp without lifting a finger.',
      };
    }
    if (paywallState.feature === 'paymentReminders') {
      return {
        title: 'Collect Pending Bills with Smart UPI Reminders',
        desc: 'Eliminate unpaid salon & store dues with automated WhatsApp payment links and QR codes sent directly to customers.',
      };
    }
    if (paywallState.feature === 'multilingualAi') {
      return {
        title: 'Speak Every Customer’s Language',
        desc: 'Engage customers effortlessly in Malayalam, Hindi, Tamil, Telugu, Kannada, and English with auto-language detection.',
      };
    }
    return {
      title: "Don't Miss Another Paying Customer",
      desc: paywallState.reason || 'Upgrade your ReplyFlow plan to continue automated WhatsApp customer conversations, lead capture, and appointment bookings.',
    };
  };

  const headline = getFeatureHeadline();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8">
          <button
            onClick={closePaywall}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent SaaS Upgrade
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {headline.title}
          </h2>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            {headline.desc}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 inline-flex items-center p-1 bg-white/10 rounded-xl backdrop-blur border border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allPlans
              .filter((p) => p.id !== 'free')
              .map((p) => {
                const isSelected = p.id === targetPlanId || (targetPlanId === 'starter' && p.id === 'growth');
                const isCurrent = currentPlanId === p.id;
                const price = billingCycle === 'yearly' ? Math.round(p.priceYearly / 12) : p.priceMonthly;

                return (
                  <div
                    key={p.id}
                    className={`relative rounded-xl flex flex-col justify-between p-6 transition-all duration-200 ${
                      p.popular
                        ? 'bg-white border-2 border-emerald-600 shadow-lg ring-4 ring-emerald-500/10'
                        : 'bg-white border border-slate-200 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    {p.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-0.5 rounded-full shadow-sm">
                        Most Popular
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                        {isCurrent && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            Current Plan
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.description}</p>

                      <div className="mt-4 pb-4 border-b border-slate-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-slate-900">₹{price}</span>
                          <span className="text-xs text-slate-500 font-medium">/ month</span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                            Billed annually (₹{p.priceYearly}/yr)
                          </p>
                        )}
                      </div>

                      <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
                        {p.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleUpgrade(p.id)}
                        disabled={isCurrent || isUpgrading}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isCurrent
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : p.popular
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98]'
                            : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.98]'
                        }`}
                      >
                        {isCurrent ? (
                          'Active Plan'
                        ) : (
                          <>
                            <span>Upgrade to {p.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Guarantee & Clear Terms */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cancel anytime with 1-click. All customer contacts & conversations are preserved forever.</span>
            </div>
            <button
              onClick={closePaywall}
              className="text-slate-600 hover:text-slate-900 font-medium underline"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
