import React, { useState } from 'react';
import { WhatsAppSimulator } from '../components/simulator/WhatsAppSimulator';
import {
  MessageSquare,
  Sparkles,
  Zap,
  Check,
  CheckCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Globe,
  Smartphone,
  Users,
} from 'lucide-react';
import { DEFAULT_PLANS } from '../data/plans';

interface LandingPageProps {
  onStartFree: () => void;
  onEnterDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartFree, onEnterDashboard }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const faqs = [
    {
      q: 'Do I need a WhatsApp Business API account to test ReplyFlow?',
      a: 'No! ReplyFlow comes with a realistic WhatsApp Simulator that lets you test AI responses, multilingual replies, and booking flows immediately without waiting for Meta account approvals.',
    },
    {
      q: 'How does ReplyFlow handle appointments & services?',
      a: 'You enter your services, prices, and operating hours. When a customer asks for a slot, our AI checks availability and books it directly into your calendar.',
    },
    {
      q: 'What languages does the AI understand?',
      a: 'ReplyFlow natively understands English, Hindi, Malayalam, Tamil, Telugu, and Kannada, replying in the customer’s language or colloquial phrasing.',
    },
    {
      q: 'Can I take over the conversation manually?',
      a: 'Yes. With one click on [Take Over], AI pauses instantly so you or your staff can chat directly with the customer. You can return control to AI anytime.',
    },
    {
      q: 'What payment options do you support?',
      a: 'We support Indian UPI (Google Pay, PhonePe, Paytm), credit/debit cards, and NetBanking in INR (₹). Global accounts can also connect via RevenueCat.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white text-base shadow-md shadow-emerald-500/20">
              R
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              ReplyFlow <span className="text-emerald-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterDashboard}
              className="text-xs text-slate-300 hover:text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Demo Dashboard
            </button>
            <button
              onClick={onStartFree}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI WhatsApp Business Manager for Small Businesses
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Turn WhatsApp Messages <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Into Paying Customers
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AI-powered customer communication for salons, clinics, retail shops, and bakeries. Automate appointment bookings, answer pricing FAQs in regional languages, and recover pending payments 24/7.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStartFree}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
            >
              <span>Start Free (No Credit Card)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onEnterDashboard}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-bold px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Explore Live Dashboard</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Free plan includes 50 AI conversations/month • Setup in 3 minutes
          </p>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Live Interactive Demo
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Test How ReplyFlow AI Responds to Real Customers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Click the sample prompts below to simulate booking haircut slots, asking about fruit facials, or speaking in Malayalam or Hindi.
            </p>
          </div>

          <div className="max-w-lg mx-auto shadow-2xl rounded-2xl overflow-hidden border border-slate-800">
            <WhatsAppSimulator compact />
          </div>
        </div>
      </section>

      {/* Problem & Solution Feature Cards */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Built for the Daily Challenges of Indian Businesses
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Small business owners lose up to 40% of potential leads because they cannot reply to WhatsApp inquiries while cutting hair, baking, or attending clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant 24/7 Response</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Customers book at 11 PM or during rush hours. ReplyFlow AI answers within 2 seconds with accurate pricing and available time slots.
              </p>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-6">Never miss a walk-in booking</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Multilingual Fluency</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Speaks Malayalam, Hindi, Tamil, Telugu, Kannada, and English. Understands colloquial WhatsApp phrasing without confusing customers.
              </p>
            </div>
            <p className="text-[11px] text-teal-400 font-semibold mt-6">Zero language barriers</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Safe Human Handoff</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                When a customer asks for custom discounts, complains, or needs a human manager, AI stops and alerts you on the dashboard to take over.
              </p>
            </div>
            <p className="text-[11px] text-blue-400 font-semibold mt-6">Zero AI hallucinations</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Simple & Transparent Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              Start Free, Scale as You Grow
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              No hidden fees. Configured specifically in Indian Rupees (₹) for local shop owners.
            </p>

            {/* Toggle */}
            <div className="mt-6 inline-flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                }`}
              >
                Yearly <span className="bg-emerald-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.values(DEFAULT_PLANS).map((p) => {
              const price = billingCycle === 'yearly' ? Math.round(p.priceYearly / 12) : p.priceMonthly;
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                    p.popular
                      ? 'bg-slate-900 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/10'
                      : 'bg-slate-900/60 border border-slate-800'
                  }`}
                >
                  <div>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.description}</p>

                    <div className="mt-5 pb-4 border-b border-slate-800">
                      <span className="text-3xl font-black text-white">₹{price}</span>
                      <span className="text-xs text-slate-400 ml-1">/ month</span>
                    </div>

                    <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <button
                      onClick={onStartFree}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        p.popular
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {p.id === 'free' ? 'Get Started Free' : `Choose ${p.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-black text-center text-white mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-white">{f.q}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 text-center border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to Automate Customer Bookings?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Join hundreds of local salons, clinics, and businesses saving 15+ hours weekly with ReplyFlow AI.
          </p>
          <div className="mt-6">
            <button
              onClick={onStartFree}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black px-8 py-3 rounded-2xl transition-all shadow-lg active:scale-95"
            >
              Start Free 7-Day Growth Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 ReplyFlow AI. All rights reserved. Built for Indian Small Businesses.</p>
      </footer>
    </div>
  );
};
