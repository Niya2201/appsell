import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Bot,
  User as UserIcon,
  Send,
  AlertTriangle,
  CheckCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Calendar,
  IndianRupee,
  Tag,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { Conversation, Message, Customer } from '../types';

export const InboxView: React.FC = () => {
  const { businessId } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv_anu');
  const [messages, setMessages] = useState<Message[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [manualText, setManualText] = useState('');
  const [filter, setFilter] = useState<'all' | 'ai_handling' | 'human_required' | 'resolved' | 'follow_up'>('all');
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const [cRes, custRes] = await Promise.all([
        fetch('/api/conversations', { headers: { 'x-business-id': businessId } }),
        fetch('/api/customers', { headers: { 'x-business-id': businessId } }),
      ]);
      if (cRes.ok) {
        const convData: Conversation[] = await cRes.json();
        setConversations(convData);
        if (convData.length > 0 && !selectedConvId) {
          setSelectedConvId(convData[0].id);
        }
      }
      if (custRes.ok) {
        setCustomers(await custRes.json());
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        headers: { 'x-business-id': businessId },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [businessId]);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
      const conv = conversations.find((c) => c.id === selectedConvId);
      if (conv) {
        const cust = customers.find((c) => c.id === conv.customerId);
        setActiveCustomer(cust || null);
      }
    }
  }, [selectedConvId, conversations, customers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConv = conversations.find((c) => c.id === selectedConvId);

  const handleTakeOver = async () => {
    if (!selectedConvId) return;
    const res = await fetch(`/api/conversations/${selectedConvId}/takeover`, {
      method: 'POST',
      headers: { 'x-business-id': businessId },
    });
    if (res.ok) {
      fetchConversations();
    }
  };

  const handleResumeAI = async () => {
    if (!selectedConvId) return;
    const res = await fetch(`/api/conversations/${selectedConvId}/resume-ai`, {
      method: 'POST',
      headers: { 'x-business-id': businessId },
    });
    if (res.ok) {
      fetchConversations();
    }
  };

  const handleSendManualReply = async () => {
    if (!manualText.trim() || !selectedConvId) return;
    const text = manualText;
    setManualText('');

    const res = await fetch(`/api/conversations/${selectedConvId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId,
      },
      body: JSON.stringify({
        text,
        sender: 'agent',
      }),
    });

    if (res.ok) {
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      fetchConversations();
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      {/* 3-Column Inbox Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center justify-between">
              <span>Customer Conversations</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {conversations.length}
              </span>
            </h2>

            {/* Filter Pills */}
            <div className="mt-3 flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('ai_handling')}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  filter === 'ai_handling' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                AI Handling
              </button>
              <button
                onClick={() => setFilter('human_required')}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  filter === 'human_required' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                ⚠️ Attention
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  filter === 'resolved' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                    isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {conv.customerName.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{conv.customerName}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-1">{conv.lastMessage}</p>

                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          conv.status === 'human_required'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : conv.status === 'ai_handling'
                            ? 'bg-emerald-100 text-emerald-800'
                            : conv.status === 'resolved'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {conv.status.replace('_', ' ')}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Active Conversation */}
        <div className="flex-1 flex flex-col bg-slate-50/50">
          {activeConv ? (
            <>
              {/* Conversation Top Action Bar */}
              <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {activeConv.customerName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{activeConv.customerName}</h3>
                    <p className="text-xs text-slate-500">{activeConv.customerPhone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeConv.status === 'human_required' ? (
                    <button
                      onClick={handleResumeAI}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                    >
                      Return to AI
                    </button>
                  ) : (
                    <button
                      onClick={handleTakeOver}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                    >
                      Take Over
                    </button>
                  )}
                </div>
              </div>

              {/* Status Alert in chat view */}
              {activeConv.status === 'human_required' && (
                <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Human takeover active.</strong> The AI is paused for this chat. Send your response below, then click "Return to AI" when resolved.
                  </span>
                </div>
              )}

              {/* Message History Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((m) => {
                  const isCust = m.sender === 'customer';
                  const isAi = m.sender === 'ai';
                  return (
                    <div key={m.id} className={`flex ${isCust ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-sm shadow-xs ${
                          isCust
                            ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                            : isAi
                            ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-tr-none'
                            : 'bg-slate-900 text-white rounded-tr-none'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-bold mb-1 opacity-75">
                          {isCust ? (
                            <span>{activeConv.customerName}</span>
                          ) : isAi ? (
                            <span className="flex items-center gap-1 text-emerald-700">
                              <Sparkles className="w-3 h-3" /> ReplyFlow AI
                            </span>
                          ) : (
                            <span className="text-slate-300">Staff Agent</span>
                          )}
                        </div>

                        <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!isCust && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Manual Reply Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendManualReply()}
                  placeholder="Type official reply to WhatsApp customer..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSendManualReply}
                  disabled={!manualText.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Select a conversation from the left to view messages</p>
            </div>
          )}
        </div>

        {/* Right Column: Customer Information CRM */}
        {activeCustomer && (
          <div className="hidden lg:flex w-80 border-l border-slate-200 bg-white flex-col p-5 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Customer CRM Profile
            </h3>

            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xl mx-auto flex items-center justify-center shadow-inner">
                {activeCustomer.name.substring(0, 2).toUpperCase()}
              </div>
              <h4 className="font-extrabold text-base text-slate-900 mt-2">{activeCustomer.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{activeCustomer.phone}</p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1 justify-center">
                {activeCustomer.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Generated Customer Summary */}
            <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Profile Insight</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed italic">
                "{activeCustomer.aiSummary}"
              </p>
            </div>

            {/* Stats */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> Total Spend
                </span>
                <span className="font-bold text-slate-900">₹{activeCustomer.totalSpend.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Appointments
                </span>
                <span className="font-bold text-slate-900">{activeCustomer.appointmentsCount}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Pending Payment
                </span>
                <span className={activeCustomer.pendingPayment > 0 ? 'font-bold text-amber-700' : 'text-slate-500 font-bold'}>
                  ₹{activeCustomer.pendingPayment}
                </span>
              </div>
            </div>

            {/* Customer Notes */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900 mb-1">Owner / Staff Notes</p>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                {activeCustomer.notes || 'No special notes recorded.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
