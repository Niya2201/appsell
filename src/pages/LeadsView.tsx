import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, TrendingUp, IndianRupee, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { Lead } from '../types';

export const LeadsView: React.FC = () => {
  const { businessId } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads', { headers: { 'x-business-id': businessId } });
      if (res.ok) setLeads(await res.json());
    } catch (err) {
      console.error('Error loading leads:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [businessId]);

  const stages: Array<{ id: Lead['status']; title: string; color: string }> = [
    { id: 'new', title: 'New Leads', color: 'border-blue-500' },
    { id: 'contacted', title: 'AI Contacted', color: 'border-amber-500' },
    { id: 'qualified', title: 'Qualified Opportunity', color: 'border-purple-500' },
    { id: 'converted', title: 'Converted to Customer', color: 'border-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-600" />
            <span>WhatsApp Lead Capture Pipeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track inquiries captured by AI on WhatsApp and conversion to paying salon appointments.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Average Conversion: 68.2%</span>
        </div>
      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.id);
          const totalVal = stageLeads.reduce((sum, l) => sum + l.estimatedValue, 0);

          return (
            <div key={stage.id} className="bg-slate-100/70 rounded-2xl p-4 flex flex-col">
              <div className={`border-t-4 ${stage.color} pt-2 pb-3 flex items-center justify-between`}>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {stage.title}
                </h3>
                <span className="text-xs font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full shadow-2xs">
                  {stageLeads.length}
                </span>
              </div>

              <div className="text-[11px] font-semibold text-slate-500 mb-3">
                Value: ₹{totalVal.toLocaleString('en-IN')}
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{lead.name}</h4>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                        ₹{lead.estimatedValue}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{lead.phone}</span>
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 truncate max-w-[130px] font-medium">{lead.interest}</span>
                      <span className="text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-xl bg-white/40">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
