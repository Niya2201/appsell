import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
  Users,
  Search,
  Plus,
  Tag,
  Phone,
  Calendar,
  IndianRupee,
  Sparkles,
  Filter,
  Download,
  X,
} from 'lucide-react';
import { Customer } from '../types';

export const CustomersView: React.FC = () => {
  const { businessId } = useAuth();
  const { usageLimits, openPaywall } = useSubscription();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    tags: 'Regular',
    notes: '',
  });

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', { headers: { 'x-business-id': businessId } });
      if (res.ok) setCustomers(await res.json());
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [businessId]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;

    // Check customer limit
    if (usageLimits.customers && !usageLimits.customers.allowed) {
      openPaywall('customerLimit', 'You have reached the customer limit for your current plan.');
      return;
    }

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId,
      },
      body: JSON.stringify({
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email || undefined,
        tags: newCustomer.tags.split(',').map((t) => t.trim()),
        firstContactedAt: new Date().toISOString(),
        lastContactedAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpend: 0,
        appointmentsCount: 0,
        pendingPayment: 0,
        notes: newCustomer.notes,
        aiSummary: `New customer added manually by salon staff.`,
      }),
    });

    if (res.ok) {
      setShowAddModal(false);
      setNewCustomer({ name: '', phone: '', email: '', tags: 'Regular', notes: '' });
      fetchCustomers();
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Customer CRM</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            All customer profiles, purchase history, and WhatsApp interaction insights.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, or tag..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredCustomers.length}</strong> of {customers.length} contacts
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4">Total Spend</th>
                <th className="py-3.5 px-4">Appointments</th>
                <th className="py-3.5 px-4">Pending Dues</th>
                <th className="py-3.5 px-4">AI Profile Summary</th>
                <th className="py-3.5 px-4">Last Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[11px] text-slate-500">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ₹{c.totalSpend.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">{c.appointmentsCount}</td>
                  <td className="py-3 px-4">
                    {c.pendingPayment > 0 ? (
                      <span className="font-bold text-amber-600">₹{c.pendingPayment}</span>
                    ) : (
                      <span className="text-slate-400">₹0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                      "{c.aiSummary}"
                    </p>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(c.lastContactedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone *</label>
                <input
                  type="text"
                  required
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newCustomer.tags}
                  onChange={(e) => setNewCustomer({ ...newCustomer, tags: e.target.value })}
                  placeholder="Regular, VIP, Haircut"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  placeholder="Preferences, allergy cautions, favorite stylist..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
