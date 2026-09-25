import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { Lock, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Plan, PlanTier } from '../../types';

interface PremiumFeatureProps {
  feature: keyof Plan['limits'];
  title?: string;
  description?: string;
  requiredPlan?: PlanTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  feature,
  title,
  description,
  requiredPlan = 'growth',
  children,
  fallback,
}) => {
  const { canUseFeature, openPaywall } = useSubscription();

  const isAllowed = canUseFeature(feature);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-emerald-300 bg-gradient-to-b from-emerald-50/50 to-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
        <Lock className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title || `Unlock ${String(feature).replace(/([A-Z])/g, ' $1').trim()}`}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        {description ||
          `This high-conversion capability requires the ${requiredPlan.toUpperCase()} plan. Upgrade now to automate more customer conversations.`}
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => openPaywall(String(feature), description, requiredPlan)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Upgrade to {requiredPlan.toUpperCase()}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export const SubscriptionBadge: React.FC = () => {
  const { subscription, plan, openPaywall } = useSubscription();
  if (!subscription || !plan) return null;

  const isFree = subscription.status === 'free';
  const isTrial = subscription.status === 'trial';

  return (
    <div
      onClick={isFree ? () => openPaywall() : undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase transition-all ${
        isTrial
          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
          : isFree
          ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 cursor-pointer'
          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{isTrial ? 'Trial: Growth' : plan.name}</span>
      {isFree && <span className="text-[10px] text-emerald-600 font-extrabold ml-0.5">Upgrade</span>}
    </div>
  );
};

export const UsageLimitIndicator: React.FC = () => {
  const { usage, plan, openPaywall } = useSubscription();
  if (!usage || !plan) return null;

  const used = usage.aiConversationsUsed;
  const limit = plan.limits.aiConversationsMonthly;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  const isNear = pct >= 80 && pct < 100;
  const isMax = pct >= 100;

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-600">AI Monthly Conversations</span>
        <span className={isMax ? 'text-rose-600 font-bold' : isNear ? 'text-amber-600' : 'text-slate-900'}>
          {used} / {limit.toLocaleString()}
        </span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isMax ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {(isNear || isMax) && (
        <div className="mt-2.5 flex items-center justify-between">
          <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {isMax ? 'Limit reached! AI replies paused.' : 'Approaching monthly limit.'}
          </p>
          <button
            onClick={() => openPaywall('aiConversations', 'You have reached or are approaching your monthly limit.')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
          >
            Upgrade
          </button>
        </div>
      )}
    </div>
  );
};
