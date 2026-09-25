import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  CheckCheck,
  AlertTriangle,
  RefreshCw,
  Phone,
  Video,
  MoreVertical,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { Message } from '../../types';

interface WhatsAppSimulatorProps {
  onEventTriggered?: () => void;
  compact?: boolean;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({ onEventTriggered, compact = false }) => {
  const { business, businessId } = useAuth();
  const { openPaywall, usageLimits } = useSubscription();

  const [customerName, setCustomerName] = useState('Anu');
  const [customerPhone, setCustomerPhone] = useState('+91 98451 23456');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'sim_init_1',
      conversationId: 'sim_conv',
      sender: 'customer',
      text: 'Hi Glow Salon! Do you have any haircut slots tomorrow at 5 PM?',
      timestamp: '11:42 AM',
      status: 'read',
    },
    {
      id: 'sim_init_2',
      conversationId: 'sim_conv',
      sender: 'ai',
      text: `Hello Anu! ✨ Yes, we have 5:00 PM and 6:00 PM available tomorrow at *${business?.name || 'Glow Beauty Salon'}*. Would you like to reserve the Precision Haircut (₹300) with Priya?`,
      timestamp: '11:42 AM',
      status: 'read',
      metadata: {
        intent: 'appointment_booking',
        confidence: 0.98,
        actionTaken: 'checked_slot_availability',
        requiresHuman: false,
      },
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [requiresHuman, setRequiresHuman] = useState(false);
  const [activeIntent, setActiveIntent] = useState<string | null>('appointment_booking');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    { label: 'Haircut Tomorrow 5 PM', text: 'Can I book a haircut appointment tomorrow at 5 PM?' },
    { label: 'Price List', text: 'What are your popular services and prices?' },
    { label: 'UPI / Payment FAQ', text: 'Do you accept Google Pay / UPI?' },
    { label: 'Malayalam 🌴', text: 'നാളെ 5 മണിക്ക് appointment ഉണ്ടോ? Facial റേറ്റ് എത്രയാണ്?' },
    { label: 'Hindi 🇮🇳', text: 'क्या कल शाम 5 बजे हेयरकट के लिए स्लॉट खाली है?' },
    { label: 'Human Agent Request ⚠️', text: 'I have a complaint about my billing and want to speak with the manager directly.' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    // Check if free user is already at limit
    if (usageLimits.ai?.isAtLimit) {
      openPaywall('aiConversations', 'You have reached the monthly AI conversation limit of 50 messages on the Free plan.');
      return;
    }

    const newCustomerMsg: Message = {
      id: `msg_cust_${Date.now()}`,
      conversationId: 'sim_conv',
      sender: 'customer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    setMessages((prev) => [...prev, newCustomerMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/simulator/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId,
        },
        body: JSON.stringify({
          customerMessage: text,
          customerName,
          customerPhone,
          conversationId: 'sim_conv',
        }),
      });

      if (res.status === 403) {
        const errorData = await res.json();
        openPaywall('aiConversations', errorData.message);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: data.aiMessage?.id || `msg_ai_${Date.now()}`,
          conversationId: 'sim_conv',
          sender: 'ai',
          text: data.aiResult?.responseText || 'Hello! Thank you for reaching out to us.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          metadata: data.aiResult,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setActiveIntent(data.aiResult?.intent || null);
        if (data.aiResult?.requiresHuman) {
          setRequiresHuman(true);
        }
        if (onEventTriggered) onEventTriggered();
      }
    } catch (err) {
      console.error('Simulator error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `sim_reset_${Date.now()}`,
        conversationId: 'sim_conv',
        sender: 'ai',
        text: `Namaste! Welcome to *${business?.name || 'Glow Beauty Salon'}*. How can I help you today? Ask about services, bookings, or opening times! ✨`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      },
    ]);
    setRequiresHuman(false);
    setActiveIntent(null);
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden ${compact ? 'max-w-md mx-auto' : ''}`}>
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-700 border-2 border-emerald-400 flex items-center justify-center font-bold text-sm text-white">
              {business?.name?.substring(0, 2).toUpperCase() || 'RF'}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-sm leading-tight text-white">{business?.name || 'Glow Beauty Salon'}</h4>
              <span className="bg-emerald-500 text-[10px] text-white font-bold px-1.5 py-0.2 rounded-full">
                AI Active
              </span>
            </div>
            <p className="text-[11px] text-emerald-200">
              {requiresHuman ? '⚠️ Human Attention Required' : 'Replies instantly • Official Business'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-emerald-100">
          <button onClick={handleReset} title="Reset Chat" className="p-1 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Phone className="w-4 h-4 opacity-70 cursor-not-allowed" />
          <Video className="w-4 h-4 opacity-70 cursor-not-allowed" />
          <MoreVertical className="w-4 h-4 opacity-70 cursor-not-allowed" />
        </div>
      </div>

      {/* Simulator Meta Info Bar */}
      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">
            Simulating Customer: <strong>{customerName}</strong> ({customerPhone})
          </span>
        </div>
        {activeIntent && (
          <span className="bg-emerald-200/70 text-emerald-900 font-mono text-[10px] px-2 py-0.5 rounded-md">
            Intent: {activeIntent}
          </span>
        )}
      </div>

      {/* WhatsApp Chat Area */}
      <div className="flex-1 whatsapp-bg-pattern p-4 overflow-y-auto space-y-3 min-h-[350px] max-h-[500px]">
        {/* Date separator */}
        <div className="flex justify-center my-2">
          <span className="bg-[#FFF4E4] text-slate-700 text-[11px] px-3 py-1 rounded-lg shadow-sm font-medium border border-amber-200/50">
            TODAY • SIMULATED WHATSAPP WEB CONVERSATION
          </span>
        </div>

        {/* Human Attention Alert inside chat if triggered */}
        {requiresHuman && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shadow-sm animate-pulse">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Human Attention Required</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                AI detected an escalation or sensitive topic. An alert was placed on your main SaaS inbox for the owner/staff to take over.
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const isCustomer = msg.sender === 'customer';
          return (
            <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-sm text-xs sm:text-sm leading-relaxed ${
                  isCustomer
                    ? 'bg-[#E7FFDB] text-slate-900 rounded-tr-none'
                    : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                }`}
              >
                {!isCustomer && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>ReplyFlow AI Engine</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {isCustomer ? (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-medium text-emerald-800">ReplyFlow AI thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="bg-slate-100 p-2 border-t border-slate-200">
        <p className="text-[10px] uppercase font-bold text-slate-500 px-1 mb-1.5">
          One-Click Test Queries (Indian Small Business & Multilingual):
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              disabled={loading}
              className="shrink-0 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-medium transition-all"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-[#F0F2F5] p-3 border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type message as customer..."
          disabled={loading}
          className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || loading}
          className="bg-[#00a884] hover:bg-[#008f70] disabled:bg-slate-300 text-white p-2.5 rounded-full shadow-md active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
