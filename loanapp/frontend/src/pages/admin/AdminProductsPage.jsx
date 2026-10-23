import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Sliders,
  Plus,
  CheckCircle2,
  XCircle,
  Edit2,
  Percent,
  Calendar,
  IndianRupee,
  Layers,
  X
} from 'lucide-react';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    short_description: '',
    min_amount: 10000,
    max_amount: 500000,
    min_tenure_months: 6,
    max_tenure_months: 36,
    interest_rate_min: 10.5,
    interest_rate_max: 18.0,
    interest_type: 'reducing',
    processing_fee_type: 'percentage',
    processing_fee_value: 2.0,
    is_active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/staff/products'),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data.data || []);
      if (catRes.data.data?.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: catRes.data.data[0].id }));
      }
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id) => {
    try {
      await api.post(`/staff/products/${id}/toggle`);
      fetchData();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      category_id: categories[0]?.id || '',
      name: '',
      short_description: '',
      min_amount: 10000,
      max_amount: 500000,
      min_tenure_months: 6,
      max_tenure_months: 36,
      interest_rate_min: 10.5,
      interest_rate_max: 18.0,
      interest_type: 'reducing',
      processing_fee_type: 'percentage',
      processing_fee_value: 2.0,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      category_id: prod.category_id,
      name: prod.name,
      short_description: prod.short_description || '',
      min_amount: prod.min_amount,
      max_amount: prod.max_amount,
      min_tenure_months: prod.min_tenure_months,
      max_tenure_months: prod.max_tenure_months,
      interest_rate_min: prod.interest_rate_min,
      interest_rate_max: prod.interest_rate_max,
      interest_type: prod.interest_type || 'reducing',
      processing_fee_type: prod.processing_fee_type || 'percentage',
      processing_fee_value: prod.processing_fee_value || 2.0,
      is_active: prod.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/staff/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/staff/products', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to save product: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/30 mb-1">
            Product Engine
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Loan Schemes & Product Catalog</h1>
          <p className="text-xs text-slate-400">
            Configure credit products, interest rate matrices, tenure bands, and processing fees.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Add New Loan Scheme</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Loading Product Catalog...</div>
        ) : (
          products.map((prod) => (
            <div
              key={prod.id}
              className={`bg-slate-900/90 border rounded-3xl p-6 space-y-4 shadow-xl relative transition ${
                prod.is_active ? 'border-slate-800' : 'border-slate-800/40 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    {prod.category?.name || 'Retail'}
                  </span>
                  <h3 className="font-extrabold text-base text-white">{prod.name}</h3>
                </div>
                <button
                  onClick={() => handleToggle(prod.id)}
                  title={prod.is_active ? 'Click to Deactivate' : 'Click to Activate'}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                    prod.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {prod.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">{prod.short_description}</p>

              {/* Product Attributes Matrix */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Ticket Size</span>
                  <span className="text-slate-200 font-bold">
                    ₹{Number(prod.min_amount).toLocaleString('en-IN')} - ₹{Number(prod.max_amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Interest Band</span>
                  <span className="text-emerald-400 font-bold">
                    {prod.interest_rate_min}% - {prod.interest_rate_max}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Tenure Band</span>
                  <span className="text-slate-200 font-bold">
                    {prod.min_tenure_months} - {prod.max_tenure_months} mos
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Processing Fee</span>
                  <span className="text-slate-200 font-bold">
                    {prod.processing_fee_value}% {prod.processing_fee_type}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {prod.applications_count || 0} Total Applications
                </span>
                <button
                  onClick={() => handleOpenEdit(prod)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1 text-xs font-bold"
                >
                  <Edit2 size={12} />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-extrabold text-white">
                {editingProduct ? 'Configure Loan Scheme' : 'Create New Loan Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Product Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    placeholder="e.g. Express Personal Loan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Short Description</label>
                <textarea
                  required
                  rows={2}
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  placeholder="Summary of terms, features, and eligibility..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Min Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Max Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Min Tenure (Months)</label>
                  <input
                    type="number"
                    required
                    value={formData.min_tenure_months}
                    onChange={(e) => setFormData({ ...formData, min_tenure_months: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Max Tenure (Months)</label>
                  <input
                    type="number"
                    required
                    value={formData.max_tenure_months}
                    onChange={(e) => setFormData({ ...formData, max_tenure_months: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Min Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.interest_rate_min}
                    onChange={(e) => setFormData({ ...formData, interest_rate_min: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Max Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.interest_rate_max}
                    onChange={(e) => setFormData({ ...formData, interest_rate_max: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30"
                >
                  {editingProduct ? 'Save Scheme Configuration' : 'Create Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
