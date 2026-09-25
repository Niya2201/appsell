import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { PremiumFeature } from '../components/paywall/FeatureGate';
import { Zap, Clock, Bell, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { Automation } from '../types';

export const AutomationsView: React.FC = () => {
  const { businessId } = useAuth();
  const { canUseFeature, openPaywall } = useSubscription();
  const [automations, setAutomations] = useState<Automation[]>([]);

  const fetchAutomations = async () => {
    try {
      const res = await fetch('/api/automations', { headers: { 'x-business-id': businessId } });
      if (res.ok) setAutomations(await res.json());
    } catch (err) {
      console.error('Error fetching automations:', err);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [businessId]);

  const toggleAutomation = (id: string) => {
    if (!canUseFeature('automatedFollowups')) {
      openPaywall('automatedFollowups', 'Automated WhatsApp follow-ups require the Growth plan or higher.');
      return;
    }

    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600" />
            <span>Visual Automation Workflows</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated WhatsApp triggers: 24h appointment reminders, pending payment recovery, and 48h lead re-engagement.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Growth Plan Feature</span>
        </div>
      </div>

      <PremiumFeature
        feature="automatedFollowups"
        title="Unlock Automated WhatsApp Workflows"
        description="Save 15+ hours weekly and recover ₹10,000+ in pending payments with automated reminders, 24h appointment confirmations, and 48h lead re-engagement."
        requiredPlan="growth"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className={`bg-white rounded-2xl p-6 border transition-all ${
                auto.isEnabled
                  ? 'border-emerald-300 shadow-sm ring-2 ring-emerald-500/5'
                  : 'border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${auto.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{auto.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Trigger: <span className="font-mono text-emerald-700 font-semibold">{auto.triggerType}</span>
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auto.isEnabled}
                    onChange={() => toggleAutomation(auto.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Template Preview */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-mono leading-relaxed">
                "{auto.templateText}"
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Executed: <strong>{auto.executionCount}</strong> times</span>
                {auto.lastRunAt && (
                  <span>Last run: {new Date(auto.lastRunAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </PremiumFeature>
    </div>
  );
};
