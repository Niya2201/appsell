import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, Sparkles, MessageCircle, Globe, Shield, X, Check } from 'lucide-react';
import { FAQItem, AIPersonality, SupportedLanguage } from '../types';

export const KnowledgeBaseView: React.FC = () => {
  const { business, businessId, refreshAuth } = useAuth();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });

  // AI Tone and Language states
  const [tone, setTone] = useState<AIPersonality>(business?.aiPersonality || 'friendly');
  const [primaryLang, setPrimaryLang] = useState<SupportedLanguage>(business?.primaryLanguage || 'en');
  const [customPrompt, setCustomPrompt] = useState(business?.customAiInstructions || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/faqs', { headers: { 'x-business-id': businessId } });
      if (res.ok) setFaqs(await res.json());
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [businessId]);

  const handleSaveAISettings = async () => {
    const res = await fetch('/api/business', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId,
      },
      body: JSON.stringify({
        aiPersonality: tone,
        primaryLanguage: primaryLang,
        customAiInstructions: customPrompt,
      }),
    });

    if (res.ok) {
      setSavedSuccess(true);
      refreshAuth();
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/faqs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId,
      },
      body: JSON.stringify(newFaq),
    });

    if (res.ok) {
      setShowAddFaq(false);
      setNewFaq({ question: '', answer: '', category: 'General' });
      fetchFaqs();
    }
  };

  const toneOptions: Array<{ id: AIPersonality; label: string; desc: string }> = [
    { id: 'friendly', label: 'Friendly & Welcoming', desc: 'Warm, approachable tone with pleasant emojis (Best for salons, cafes, bakeries)' },
    { id: 'professional', label: 'Professional & Polished', desc: 'Structured, formal business tone (Best for dental clinics, consultancies)' },
    { id: 'casual', label: 'Casual & Modern', desc: 'Relaxed, conversational WhatsApp chat vibe (Best for youth brands & retail)' },
    { id: 'concise', label: 'Concise & Fast', desc: 'Brief, quick bullet points for busy customers' },
  ];

  const languageOptions: Array<{ code: SupportedLanguage; label: string; script: string }> = [
    { code: 'en', label: 'English', script: 'Hello, welcome!' },
    { code: 'ml', label: 'Malayalam', script: 'നമസ്കാരം, സ്വാഗതം!' },
    { code: 'hi', label: 'Hindi', script: 'नमस्ते, स्वागत है!' },
    { code: 'ta', label: 'Tamil', script: 'வணக்கம், நல்வரவு!' },
    { code: 'te', label: 'Telugu', script: 'నమస్కారం, స్వాగతం!' },
    { code: 'kn', label: 'Kannada', script: 'ನಮಸ್ಕಾರ, ಸುಸ್ವಾಗತ!' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>AI Knowledge Base & Personality</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Train your WhatsApp AI on business facts, opening hours, UPI payment methods, and multilingual tone.
          </p>
        </div>

        <button
          onClick={() => setShowAddFaq(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom FAQ</span>
        </button>
      </div>

      {/* AI Tone & Multilingual Settings Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">AI Personality & Language Behavior</h3>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved & Updated!
            </span>
          )}
        </div>

        {/* Tone Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
            Select Tone of Voice:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {toneOptions.map((t) => (
              <div
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  tone === t.id
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-bold text-slate-900">{t.label}</p>
                <p className="text-[11px] text-slate-500 mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Multilingual Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
            Multilingual Language Support:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {languageOptions.map((l) => (
              <div
                key={l.code}
                onClick={() => setPrimaryLang(l.code)}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  primaryLang === l.code
                    ? 'border-emerald-500 bg-emerald-50/60 font-bold text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs">{l.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{l.script}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            *ReplyFlow automatically recognizes input in Malayalam, Hindi, Tamil, Telugu, and Kannada, and responds in the same language.
          </p>
        </div>

        {/* Custom AI Instructions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
            Custom Business Prompts & Guidelines:
          </label>
          <textarea
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Always offer complimentary herbal tea. Recommend senior stylist Priya for bridal bookings..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveAISettings}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            Save AI Configuration
          </button>
        </div>
      </div>

      {/* Structured FAQs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">
          Configured Business FAQs ({faqs.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq) => (
            <div key={faq.id} className="py-3.5">
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {faq.category}
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-1.5">{faq.question}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add FAQ Modal */}
      {showAddFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add Business FAQ</h3>
              <button onClick={() => setShowAddFaq(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFaq} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Question *</label>
                <input
                  type="text"
                  required
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  placeholder="e.g. Do you have parking space?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">AI Answer Response *</label>
                <textarea
                  rows={3}
                  required
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="e.g. Yes! Free valet parking is available right in front of the salon."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newFaq.category}
                  onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                  placeholder="General, Location, Billing, Policy"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFaq(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
