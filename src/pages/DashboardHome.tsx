import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { WhatsAppSimulator } from '../components/simulator/WhatsAppSimulator';
import {
  MessageSquare,
  Sparkles,
  Target,
  ShoppingBag,
  Calendar,
  IndianRupee,
  Cpu,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  UserCheck,
  Smartphone,
} from 'lucide-react';
import { Conversation, Appointment, Order } from '../types';

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const { business, businessId } = useAuth();
  const { subscription, plan, usage, openPaywall } = useSubscription();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    todayConversations: 128,
    aiResolutionRate: 91,
    newLeads: 24,
    ordersCount: 18,
    appointmentsCount: 13,
    pendingPaymentsAmount: 8420,
    aiUsageMonthly: 1280,
    aiMonthlyLimit: 2000,
  });

  const fetchData = async () => {
    try {
      const [convsRes, aptsRes, ordersRes, analRes] = await Promise.all([
        fetch('/api/conversations', { headers: { 'x-business-id': businessId } }),
        fetch('/api/appointments', { headers: { 'x-business-id': businessId } }),
        fetch('/api/orders', { headers: { 'x-business-id': businessId } }),
        fetch('/api/analytics', { headers: { 'x-business-id': businessId } }),
      ]);

      if (convsRes.ok) setConversations(await convsRes.json());
      if (aptsRes.ok) setAppointments(await aptsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (analRes.ok) setAnalytics(await analRes.json());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const urgentConversations = conversations.filter((c) => c.status === 'human_required');

  const usedAi = usage?.aiConversationsUsed || analytics.aiUsageMonthly;
  const limitAi = plan?.limits.aiConversationsMonthly || analytics.aiMonthlyLimit;
  const aiPct = Math.min(100, Math.round((usedAi / limitAi) * 100));

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome, {business?.name || 'Glow Beauty Salon'}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            WhatsApp Business AI Manager • Location: {business?.location}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('inbox')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Open AI Inbox</span>
          </button>
          <button
            onClick={() => onNavigate('billing')}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Plan: {plan?.name || 'Starter'}</span>
          </button>
        </div>
      </div>

      {/* Human Attention Alert Banner if any conversation requires takeover */}
      {urgentConversations.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                ⚠️ HUMAN ATTENTION REQUIRED ({urgentConversations.length} conversation)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                AI stopped auto-replying for customer <strong>{urgentConversations[0].customerName}</strong> due to custom discount inquiry or complaint.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inbox')}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
          >
            Take Over Now
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Today's Conversations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Conversations</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{analytics.todayConversations}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18% from yesterday</span>
            </p>
          </div>
        </div>

        {/* KPI 2: AI Resolved % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">AI Resolved Rate</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{analytics.aiResolutionRate}%</div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Auto-answered without human staff
            </p>
          </div>
        </div>

        {/* KPI 3: New Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">New Leads</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{analytics.newLeads}</div>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              Captured via WhatsApp
            </p>
          </div>
        </div>

        {/* KPI 4: Pending Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Payments</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">
              ₹{analytics.pendingPaymentsAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              Automated reminders active
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics & AI Usage Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Usage Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Monthly AI Usage</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {usedAi} / {limitAi}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                aiPct >= 100 ? 'bg-rose-500' : aiPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${aiPct}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">{usedAi} used • {Math.max(0, limitAi - usedAi)} remaining</span>
            <button
              onClick={() => openPaywall('aiConversations')}
              className="text-emerald-700 font-bold hover:underline"
            >
              Upgrade Limit
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">Orders Today</p>
              <p className="text-xl font-black text-slate-900 mt-1">{analytics.ordersCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Appointments</p>
              <p className="text-xl font-black text-slate-900 mt-1">{analytics.appointmentsCount}</p>
            </div>
          </div>
        </div>

        {/* Live Simulator Preview Launcher Box */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
              <Smartphone className="w-3.5 h-3.5" />
              Interactive WhatsApp Simulator
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Test AI Responses in Real-Time
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-lg leading-relaxed">
              Experience ReplyFlow AI from your customer's perspective. Send inquiries about hair services, pricing, appointments, or speak in Malayalam/Hindi.
            </p>
          </div>

          <div className="mt-6 relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('inbox')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              Open Full Conversation Manager
            </button>
            <button
              onClick={() => onNavigate('knowledge')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              Configure AI FAQs & Tone
            </button>
          </div>

          {/* Background decorative blob */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Recent Feed: Conversations & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Recent WhatsApp Chats</span>
            </h3>
            <button
              onClick={() => onNavigate('inbox')}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {conversations.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate('inbox')}
                className="p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{c.customerName}</p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                        c.status === 'human_required'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : c.status === 'ai_handling'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(c.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Upcoming Appointments</span>
            </h3>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Calendar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {appointments.slice(0, 4).map((apt) => (
              <div
                key={apt.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{apt.customerName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {apt.serviceName} • ₹{apt.price}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {apt.time} ({apt.date})
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 capitalize">{apt.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
