import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Plus, Clock, User, Check, X, ShieldCheck } from 'lucide-react';
import { Appointment } from '../types';

export const AppointmentsView: React.FC = () => {
  const { businessId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newApt, setNewApt] = useState({
    customerName: '',
    customerPhone: '',
    serviceName: 'Haircut & Styling',
    date: '2026-09-26',
    time: '15:00',
    staffName: 'Priya Sharma',
    price: 300,
  });

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments', { headers: { 'x-business-id': businessId } });
      if (res.ok) setAppointments(await res.json());
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [businessId]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId,
      },
      body: JSON.stringify({
        ...newApt,
        customerId: `cust_manual_${Date.now()}`,
        serviceId: 'srv_manual',
        status: 'confirmed',
      }),
    });
    if (res.ok) {
      setShowAddModal(false);
      fetchAppointments();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <span>Appointment Bookings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Appointments automatically scheduled by AI via WhatsApp and walk-ins.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date & Slot</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Assigned Staff</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-extrabold text-slate-900">{apt.time}</span>
                        <p className="text-[11px] text-slate-500">{apt.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{apt.customerName}</p>
                    <p className="text-[11px] text-slate-500">{apt.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{apt.serviceName}</td>
                  <td className="py-3 px-4 text-slate-600">{apt.staffName}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">₹{apt.price}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'completed'
                          ? 'bg-slate-100 text-slate-700'
                          : apt.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                    {apt.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Schedule Appointment</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newApt.customerName}
                  onChange={(e) => setNewApt({ ...newApt, customerName: e.target.value })}
                  placeholder="e.g. Shalini"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newApt.customerPhone}
                  onChange={(e) => setNewApt({ ...newApt, customerPhone: e.target.value })}
                  placeholder="+91 98451 23456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newApt.date}
                    onChange={(e) => setNewApt({ ...newApt, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="time"
                    value={newApt.time}
                    onChange={(e) => setNewApt({ ...newApt, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service</label>
                  <input
                    type="text"
                    value={newApt.serviceName}
                    onChange={(e) => setNewApt({ ...newApt, serviceName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rate (₹ INR)</label>
                  <input
                    type="number"
                    value={newApt.price}
                    onChange={(e) => setNewApt({ ...newApt, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
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
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
