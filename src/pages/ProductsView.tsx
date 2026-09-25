import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Sparkles, Tag, Clock, Check, X } from 'lucide-react';
import { ProductService } from '../types';

export const ProductsView: React.FC = () => {
  const { businessId } = useAuth();
  const [items, setItems] = useState<ProductService[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'service' as 'service' | 'product',
    description: '',
    price: 300,
    durationMinutes: 30,
    category: 'Hair Care',
    isAvailable: true,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/services', { headers: { 'x-business-id': businessId } });
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [businessId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId,
      },
      body: JSON.stringify(newItem),
    });

    if (res.ok) {
      setShowAddModal(false);
      setNewItem({
        name: '',
        type: 'service',
        description: '',
        price: 300,
        durationMinutes: 30,
        category: 'Hair Care',
        isAvailable: true,
      });
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Products & Services Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure services, menu prices, and durations that ReplyFlow AI uses to answer customer inquiries.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service / Product</span>
        </button>
      </div>

      {/* Grid of Catalog Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{item.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">₹{item.price}</span>
                  {item.durationMinutes && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.durationMinutes} mins</span>
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Available for AI Booking
              </span>
              <span className="capitalize text-slate-400 font-mono text-[10px]">{item.type}</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add Item to Catalog</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Keratin Hair Spa"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newItem.durationMinutes}
                    onChange={(e) => setNewItem({ ...newItem, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="Hair Care, Skin & Facial, Nails"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Details shown to customer on WhatsApp..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
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
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
