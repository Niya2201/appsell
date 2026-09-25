import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { SubscriptionBadge, UsageLimitIndicator } from '../paywall/FeatureGate';
import { PaywallModal } from '../paywall/PaywallModal';
import { WhatsAppSimulator } from '../simulator/WhatsAppSimulator';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Target,
  ShoppingBag,
  Calendar,
  Zap,
  Package,
  BookOpen,
  BarChart3,
  Sliders,
  CreditCard,
  Settings,
  Shield,
  Smartphone,
  X,
  Menu,
  ChevronDown,
  Sparkles,
  Clock,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface AppLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentTab, setCurrentTab, children }) => {
  const { user, business, switchUser, isStaff } = useAuth();
  const { subscription, plan, openPaywall } = useSubscription();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'AI Inbox', icon: MessageSquare, badge: 'Live' },
    { id: 'customers', label: 'Customers CRM', icon: Users },
    { id: 'leads', label: 'Leads Pipeline', icon: Target },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'orders', label: 'Orders & Sales', icon: ShoppingBag },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'products', label: 'Products & Services', icon: Package },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai_settings', label: 'AI Settings', icon: Sliders },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'admin', label: 'Admin Platform', icon: Shield },
  ];

  const demoAccounts = [
    { label: 'Free Plan (Approaching Limit 48/50)', email: 'demo-free@example.com', badge: 'FREE' },
    { label: 'Growth Plan (7-Day Trial)', email: 'demo-trial@example.com', badge: 'TRIAL' },
    { label: 'Starter Plan (₹499/mo)', email: 'demo-starter@example.com', badge: 'STARTER' },
    { label: 'Glow Beauty Salon (Growth ₹999/mo)', email: 'demo-growth@example.com', badge: 'ACTIVE' },
    { label: 'Business Plan (₹1,999/mo)', email: 'demo-business@example.com', badge: 'ENTERPRISE' },
  ];

  const isTrial = subscription?.status === 'trial';
  const isFree = subscription?.status === 'free';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Paywall Modal Mounted Globally */}
      <PaywallModal />

      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white text-base">
            R
          </div>
          <div>
            <h1 className="font-extrabold text-sm leading-tight tracking-tight">ReplyFlow AI</h1>
            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{business?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSimulatorOpen(true)}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulator</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between z-40 transition-transform duration-200 ease-in-out border-r border-slate-800 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex flex-col h-full overflow-hidden">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white text-lg shadow-md shadow-emerald-500/20">
                R
              </div>
              <div>
                <h2 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  ReplyFlow <span className="text-emerald-400 text-xs font-bold px-1 py-0.2 bg-emerald-500/20 rounded">AI</span>
                </h2>
                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]">
                  {business?.name || 'Glow Salon'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Simulator Launch Button */}
          <div className="mt-4">
            <button
              onClick={() => setSimulatorOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4" />
              <span>WhatsApp Simulator</span>
            </button>
          </div>

          {/* Nav links */}
          <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Monthly AI Usage Meter */}
          <div className="pt-3 border-t border-slate-800">
            <UsageLimitIndicator />
          </div>

          {/* User Profile & Demo Switcher */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name?.substring(0, 1) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="capitalize">{user?.role}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold uppercase">{plan?.name}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
                title="Switch Demo User Role / Plan"
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {demoSwitchOpen && (
                <div className="absolute bottom-10 right-0 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                    Developer Demo Accounts:
                  </p>
                  <div className="space-y-1">
                    {demoAccounts.map((acc, idx) => (
                      <button
                        key={idx}
                        onClick={async () => {
                          await switchUser(acc.email);
                          setDemoSwitchOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          user?.email === acc.email
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate">{acc.label}</span>
                        <span className="text-[9px] bg-black/30 px-1.5 py-0.5 rounded ml-1 font-mono">
                          {acc.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Announcement Bar for Trial / Free Plan */}
        {isTrial && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                <strong>6 days remaining in your Growth Plan free trial.</strong> Enjoy unlimited customers, follow-ups, and 2,000 AI replies.
              </span>
            </div>
            <button
              onClick={() => openPaywall('trial', 'Lock in your Growth plan discount today.')}
              className="bg-white text-amber-900 font-bold px-3 py-1 rounded-md text-[11px] hover:bg-amber-50 transition-colors shadow-2xs"
            >
              Lock in Growth (₹999/mo)
            </button>
          </div>
        )}

        {isFree && (
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-sm border-b border-emerald-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>
                You are on the <strong>Free Plan</strong> (50 AI conversations/mo). Upgrade to Starter (₹499/mo) for 500 conversations and unlimited products.
              </span>
            </div>
            <button
              onClick={() => openPaywall('free', 'Upgrade to Starter to respond to all incoming customer WhatsApp inquiries automatically.')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded-md text-[11px] transition-colors shadow-2xs"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* Dynamic Page Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating / Pop-out WhatsApp Simulator Modal */}
      {simulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
            <button
              onClick={() => setSimulatorOpen(false)}
              className="absolute top-3 right-3 z-30 text-white hover:text-slate-200 bg-black/30 hover:bg-black/50 p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <WhatsAppSimulator />
          </div>
        </div>
      )}
    </div>
  );
};
