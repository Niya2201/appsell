import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Plus, IndianRupee, Check, AlertCircle, Clock, X } from 'lucide-react';
import { Order } from '../types';

export const OrdersView: React.FC = () => {
  const { businessId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerPhone: '',
    itemName: 'Argan Oil Serum',
    quantity: 1,
    totalAmount: 650,
    paymentStatus: 'paid' as const,
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { headers: { 'x-business-id': businessId } });
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [businessId]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId,
      },
      body: JSON.stringify({
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        customerId: `cust_ord_${Date.now()}`,
        items: [
          {
            id: `item_${Date.now()}`,
            productId: 'prod_custom',
            name: newOrder.itemName,
            quantity: newOrder.quantity,
            price: newOrder.totalAmount,
          },
        ],
        totalAmount: newOrder.totalAmount,
        paymentStatus: newOrder.paymentStatus,
        orderStatus: 'received',
      }),
    });

    if (res.ok) {
      setShowAddModal(false);
      fetchOrders();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <span>Orders & Sales</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Retail product orders and service billing invoices generated via WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{ord.customerName}</p>
                    <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4">
                    {ord.items.map((i) => (
                      <span key={i.id} className="block text-slate-700">
                        {i.name} (x{i.quantity})
                      </span>
                    ))}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900 text-sm">
                    ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ord.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(ord.createdAt).toLocaleDateString()}
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
              <h3 className="font-extrabold text-base text-slate-900">Create Order</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                  placeholder="e.g. Rahul Varma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Phone *</label>
                <input
                  type="text"
                  required
                  value={newOrder.customerPhone}
                  onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                  placeholder="+91 98862 34567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item / Service</label>
                  <input
                    type="text"
                    value={newOrder.itemName}
                    onChange={(e) => setNewOrder({ ...newOrder, itemName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total (₹ INR)</label>
                  <input
                    type="number"
                    value={newOrder.totalAmount}
                    onChange={(e) => setNewOrder({ ...newOrder, totalAmount: Number(e.target.value) })}
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
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
