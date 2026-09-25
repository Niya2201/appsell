import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plan, PlanTier, Subscription, UsageStats } from '../types';
import { useAuth } from './AuthContext';

interface PaywallTriggerState {
  isOpen: boolean;
  feature?: string;
  reason?: string;
  requiredPlan?: PlanTier;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  plan: Plan | null;
  allPlans: Plan[];
  usage: UsageStats | null;
  usageLimits: {
    ai?: { allowed: boolean; current: number; limit: number; percentage: number; isApproachingLimit: boolean; isAtLimit: boolean };
    customers?: { allowed: boolean; current: number; limit: number; percentage: number };
    staff?: { allowed: boolean; current: number; limit: number; percentage: number };
  };
  paywallState: PaywallTriggerState;
  openPaywall: (feature?: string, reason?: string, requiredPlan?: PlanTier) => void;
  closePaywall: () => void;
  canUseFeature: (featureKey: keyof Plan['limits']) => boolean;
  upgradePlan: (planId: PlanTier, cycle?: 'monthly' | 'yearly') => Promise<void>;
  cancelSubscription: () => Promise<string>;
  demoSetState: (options: { planId?: PlanTier; status?: Subscription['status']; maxOutUsage?: boolean; resetUsage?: boolean }) => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { businessId } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [usageLimits, setUsageLimits] = useState<any>({});
  const [paywallState, setPaywallState] = useState<PaywallTriggerState>({ isOpen: false });

  const fetchSubscriptionData = async () => {
    if (!businessId) return;
    try {
      const [subRes, plansRes, usageRes] = await Promise.all([
        fetch('/api/subscription', { headers: { 'x-business-id': businessId } }),
        fetch('/api/subscription/plans'),
        fetch('/api/subscription/usage', { headers: { 'x-business-id': businessId } }),
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData.subscription);
        setPlan(subData.plan);
      }
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setAllPlans(plansData);
      }
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData.usage);
        setUsageLimits(usageData.limits || {});
      }
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [businessId]);

  const openPaywall = (feature?: string, reason?: string, requiredPlan: PlanTier = 'starter') => {
    // Log paywall_viewed event for conversion analytics
    console.log('[Analytics Event] paywall_viewed:', { feature, reason, requiredPlan });
    setPaywallState({
      isOpen: true,
      feature,
      reason,
      requiredPlan,
    });
  };

  const closePaywall = () => {
    setPaywallState({ isOpen: false });
  };

  const canUseFeature = (featureKey: keyof Plan['limits']): boolean => {
    if (!subscription || !plan) return false;
    const isTrial = subscription.status === 'trial';
    const isActive = subscription.status === 'active' || isTrial;

    if (!isActive) return false;

    const val = plan.limits[featureKey];
    if (typeof val === 'boolean') {
      return val;
    }
    return true;
  };

  const upgradePlan = async (planId: PlanTier, cycle: 'monthly' | 'yearly' = 'monthly') => {
    console.log('[Analytics Event] upgrade_clicked:', { planId, cycle });
    const res = await fetch('/api/subscription/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId,
      },
      body: JSON.stringify({ planId, billingCycle: cycle }),
    });

    if (res.ok) {
      console.log('[Analytics Event] purchase_completed:', { planId });
      await fetchSubscriptionData();
      closePaywall();
    }
  };

  const cancelSubscription = async (): Promise<string> => {
    console.log('[Analytics Event] subscription_cancelled');
    const res = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: { 'x-business-id': businessId },
    });
    if (res.ok) {
      const data = await res.json();
      await fetchSubscriptionData();
      return data.message;
    }
    throw new Error('Cancellation failed');
  };

  const demoSetState = async (options: { planId?: PlanTier; status?: Subscription['status']; maxOutUsage?: boolean; resetUsage?: boolean }) => {
    await fetch('/api/subscription/demo-set-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId,
      },
      body: JSON.stringify(options),
    });
    await fetchSubscriptionData();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plan,
        allPlans,
        usage,
        usageLimits,
        paywallState,
        openPaywall,
        closePaywall,
        canUseFeature,
        upgradePlan,
        cancelSubscription,
        demoSetState,
        refreshSubscription: fetchSubscriptionData,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
};
