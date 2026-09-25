import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building,
  Clock,
  Package,
  BookOpen,
  Sliders,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { AIPersonality, SupportedLanguage } from '../types';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { registerBusiness } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [account, setAccount] = useState({
    name: 'Rohan Sharma',
    email: 'rohan@sharmabakery.in',
    password: 'password123',
  });

  const [bizInfo, setBizInfo] = useState({
    businessName: 'Sharma Sweets & Bakery',
    category: 'Bakery & Sweets',
    description: 'Freshly baked artisanal cakes, Indian traditional sweets, snacks, and tea.',
    location: 'Connaught Place, New Delhi, India',
    phone: '+91 98101 23456',
    email: 'hello@sharmasweets.in',
    website: 'https://sharmasweets.in',
  });

  const [hours, setHours] = useState({
    open: '09:00',
    close: '21:30',
  });

  const [services, setServices] = useState([
    { name: 'Belgian Chocolate Truffle Cake (1kg)', price: 750, type: 'product' as const, category: 'Cakes', description: 'Rich dark chocolate ganache' },
    { name: 'Kaju Katli Gift Box (500g)', price: 450, type: 'product' as const, category: 'Sweets', description: 'Pure silver vark, cashew sweet' },
    { name: 'Custom Birthday Cake Consultation', price: 0, type: 'service' as const, category: 'Custom Orders', description: 'Design custom themed cakes with chef' },
  ]);

  const [faqs, setFaqs] = useState([
    { question: 'Do you deliver cakes?', answer: 'Yes! We deliver across Delhi NCR within 2 hours.', category: 'Delivery' },
    { question: 'Do you accept UPI / Google Pay?', answer: 'Yes, we accept all UPI apps and cards.', category: 'Billing' },
    { question: 'Where are you located?', answer: 'Block B, Connaught Place, New Delhi.', category: 'Location' },
  ]);

  const [aiPersonality, setAiPersonality] = useState<AIPersonality>('friendly');
  const [primaryLanguage, setPrimaryLanguage] = useState<SupportedLanguage>('en');

  const handleFinish = async () => {
    setLoading(true);
    try {
      await registerBusiness({
        ...bizInfo,
        hours: {
          monday: { open: hours.open, close: hours.close, closed: false },
          tuesday: { open: hours.open, close: hours.close, closed: false },
          wednesday: { open: hours.open, close: hours.close, closed: false },
          thursday: { open: hours.open, close: hours.close, closed: false },
          friday: { open: hours.open, close: hours.close, closed: false },
          saturday: { open: hours.open, close: hours.close, closed: false },
          sunday: { open: hours.open, close: hours.close, closed: false },
        },
        services,
        faqs,
        aiPersonality,
        primaryLanguage,
      });
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    'Account',
    'Business Info',
    'Hours',
    'Products/Services',
    'FAQs',
    'AI Tone',
    'Language',
    'Launch',
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Step {step} of 8: {steps[step - 1]}</span>
            <span>{Math.round((step / 8) * 100)}% Completed</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Account */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Create your ReplyFlow Account</h2>
            <p className="text-xs text-slate-400">Sign up to automate customer WhatsApp bookings, orders, and inquiries.</p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={account.name}
                  onChange={(e) => setAccount({ ...account, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={account.email}
                  onChange={(e) => setAccount({ ...account, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  value={account.password}
                  onChange={(e) => setAccount({ ...account, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Tell us about your business</h2>
            <p className="text-xs text-slate-400">Used by ReplyFlow AI to greet customers accurately.</p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Name *</label>
                <input
                  type="text"
                  value={bizInfo.businessName}
                  onChange={(e) => setBizInfo({ ...bizInfo, businessName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={bizInfo.category}
                    onChange={(e) => setBizInfo({ ...bizInfo, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp Phone *</label>
                  <input
                    type="text"
                    value={bizInfo.phone}
                    onChange={(e) => setBizInfo({ ...bizInfo, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store / Clinic Location *</label>
                <input
                  type="text"
                  value={bizInfo.location}
                  onChange={(e) => setBizInfo({ ...bizInfo, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  value={bizInfo.description}
                  onChange={(e) => setBizInfo({ ...bizInfo, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Hours */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Set your Business Hours</h2>
            <p className="text-xs text-slate-400">AI will automatically decline or hold bookings outside these operating hours.</p>

            <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <label className="block text-slate-400 font-semibold mb-2">Opening Time</label>
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => setHours({ ...hours, open: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-base font-bold"
                />
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <label className="block text-slate-400 font-semibold mb-2">Closing Time</label>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => setHours({ ...hours, close: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-base font-bold"
                />
              </div>
            </div>
            <p className="text-xs text-emerald-400 pt-2 font-medium">✓ Open Monday through Sunday</p>
          </div>
        )}

        {/* Step 4: Products / Services */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Add your top Products or Services</h2>
            <p className="text-xs text-slate-400">ReplyFlow AI recommends these services and rates to WhatsApp customers.</p>

            <div className="space-y-2 pt-2 text-xs">
              {services.map((s, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{s.name}</p>
                    <p className="text-slate-400 text-[11px]">{s.category} • {s.description}</p>
                  </div>
                  <span className="font-extrabold text-emerald-400 text-sm">₹{s.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: FAQs */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Common Customer Questions</h2>
            <p className="text-xs text-slate-400">Pre-trained answers for instant replies on WhatsApp.</p>

            <div className="space-y-2.5 pt-2 text-xs">
              {faqs.map((f, idx) => (
                <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="font-bold text-slate-200">Q: {f.question}</p>
                  <p className="text-slate-400 text-[11px] mt-1">A: {f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: AI Personality */}
        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Configure AI Personality</h2>
            <p className="text-xs text-slate-400">Choose how your AI communicates with your clientele.</p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              {[
                { id: 'friendly', name: 'Friendly & Warm', desc: 'Pleasant, enthusiastic, uses emojis' },
                { id: 'professional', name: 'Professional', desc: 'Direct, polite, structured' },
                { id: 'casual', name: 'Casual', desc: 'Modern WhatsApp conversational style' },
                { id: 'concise', name: 'Concise', desc: 'Brief, quick bullet points' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setAiPersonality(t.id as any)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    aiPersonality === t.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-white ring-2 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-sm text-white">{t.name}</p>
                  <p className="text-[11px] mt-1">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Language */}
        {step === 7 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Choose Default Language</h2>
            <p className="text-xs text-slate-400">ReplyFlow AI supports multi-language detection for Indian regional languages.</p>

            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              {[
                { code: 'en', name: 'English' },
                { code: 'hi', name: 'Hindi (हिंदी)' },
                { code: 'ml', name: 'Malayalam (മലയാളം)' },
                { code: 'ta', name: 'Tamil (தமிழ்)' },
                { code: 'te', name: 'Telugu (తెలుగు)' },
                { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
              ].map((l) => (
                <div
                  key={l.code}
                  onClick={() => setPrimaryLanguage(l.code as any)}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                    primaryLanguage === l.code
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <p>{l.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Ready! */}
        {step === 8 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight">
              Your AI Assistant is Ready! 🎉
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              We have provisioned a <strong>7-Day Free Growth Trial</strong> for <strong>{bizInfo.businessName}</strong>. You can now simulate customer conversations or connect WhatsApp Cloud API.
            </p>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 max-w-sm mx-auto text-left text-xs space-y-1.5 text-slate-300">
              <p>✓ 2,000 AI WhatsApp conversations enabled</p>
              <p>✓ Automated booking engine loaded</p>
              <p>✓ Multilingual intent engine ready</p>
              <p>✓ Simulator ready for immediate testing</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
          {step > 1 && step < 8 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 8 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
            >
              <span>{loading ? 'Setting Up AI Engine...' : 'Go to Business Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
