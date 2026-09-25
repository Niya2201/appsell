import { DEFAULT_PLANS } from '../../data/plans';
import { Plan, PlanTier, Subscription, UsageStats } from '../../types';

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  requiredPlan?: PlanTier;
  currentPlan: PlanTier;
  feature: string;
}

export interface UsageLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  percentage: number;
  isApproachingLimit: boolean; // >= 80%
  isAtLimit: boolean;          // >= 100%
  metric: 'ai_conversations' | 'customers' | 'staff';
}

export class SubscriptionService {
  private plans: Record<string, Plan>;

  constructor(customPlans?: Record<string, Plan>) {
    this.plans = customPlans || DEFAULT_PLANS;
  }

  public getPlan(planId: string): Plan {
    return this.plans[planId] || this.plans.free;
  }

  public getAllPlans(): Plan[] {
    return Object.values(this.plans);
  }

  public canUseFeature(
    subscription: Subscription,
    featureKey: keyof Plan['limits']
  ): EntitlementCheckResult {
    const plan = this.getPlan(subscription.planId);
    const isTrial = subscription.status === 'trial';
    const isActive = subscription.status === 'active' || isTrial;

    // If cancelled or expired, fallback to free tier logic
    const effectivePlan = isActive ? plan : this.plans.free;

    const value = effectivePlan.limits[featureKey];

    if (typeof value === 'boolean') {
      if (value) {
        return {
          allowed: true,
          currentPlan: subscription.planId,
          feature: featureKey,
        };
      }
      // Determine what plan would unlock it
      let requiredPlan: PlanTier = 'growth';
      if (featureKey === 'voiceMessages' || featureKey === 'customAiInstructions') {
        requiredPlan = 'business';
      }
      return {
        allowed: false,
        reason: `Feature '${featureKey}' requires the ${requiredPlan.toUpperCase()} plan or higher.`,
        requiredPlan,
        currentPlan: subscription.planId,
        feature: featureKey,
      };
    }

    return {
      allowed: true,
      currentPlan: subscription.planId,
      feature: featureKey,
    };
  }

  public checkUsageLimit(
    subscription: Subscription,
    usage: UsageStats,
    metric: 'ai_conversations' | 'customers' | 'staff'
  ): UsageLimitResult {
    const plan = this.getPlan(subscription.planId);
    let current = 0;
    let limit = 0;

    switch (metric) {
      case 'ai_conversations':
        current = usage.aiConversationsUsed;
        limit = plan.limits.aiConversationsMonthly;
        break;
      case 'customers':
        current = usage.customersCount;
        limit = plan.limits.customerLimit;
        break;
      case 'staff':
        current = usage.staffCount;
        limit = plan.limits.staffLimit;
        break;
    }

    const percentage = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0;
    const isAtLimit = current >= limit;
    const isApproachingLimit = percentage >= 80 && !isAtLimit;

    return {
      allowed: !isAtLimit,
      current,
      limit,
      percentage,
      isApproachingLimit,
      isAtLimit,
      metric,
    };
  }

  public createTrial(businessId: string, days = 7): Subscription {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return {
      id: `sub_trial_${Date.now()}`,
      businessId,
      planId: 'growth',
      status: 'trial',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: trialEnd.toISOString(),
      trialEndsAt: trialEnd.toISOString(),
      cancelAtPeriodEnd: false,
    };
  }
}

export const subscriptionService = new SubscriptionService();
