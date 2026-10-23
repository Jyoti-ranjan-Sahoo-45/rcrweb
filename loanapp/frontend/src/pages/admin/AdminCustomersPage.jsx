import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Search,
  Filter,
  Eye,
  IndianRupee,
  FileCheck,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  X,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Bulk selection and delete state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/customers', { params: { search } });
      setCustomers(res.data.data || []);
    } catch (e) {
      console.error('Failed to load customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const viewCustomer360 = async (id) => {
    setSelectedCustomer(id);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/staff/customers/${id}`);
      setCustomerDetail(res.data.data);
    } catch (e) {
      console.error('Failed to fetch customer 360', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Selection handlers
  const allSelected = customers.length > 0 && customers.every((c) => selectedIds.includes(c.id));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map((c) => c.id));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsDeleting(true);
    setFeedback(null);
    try {
      const res = await api.post('/staff/customers/bulk-delete', { ids: selectedIds });
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || `Deleted ${selectedIds.length} customer(s) successfully.`,
        });
        setSelectedIds([]);
        setDeleteModalOpen(false);
        await fetchCustomers();
      } else {
        setFeedback({
          type: 'error',
          message: res.data?.message || 'Failed to delete customers.',
        });
      }
    } catch (err) {
      console.error('Delete error', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error deleting customers. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:text-white transition">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/30 mb-1">
            Portfolio & LMS
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Customer 360° Directory</h1>
          <p className="text-xs text-slate-400">
            Comprehensive borrower portfolio, KYC profiles, lifetime loan exposure, and credit history.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search borrower by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Total Registered Borrowers: <span className="text-white font-bold">{customers.length}</span>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/40 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-rose-950/20 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-200">
              <strong className="text-rose-400 font-extrabold text-sm mr-1">{selectedIds.length}</strong>
              customer{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[11px] text-slate-400 hover:text-white underline ml-2 transition cursor-pointer"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/40 transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Bulk Delete Customers ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Customer List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading Customer Portfolio...</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No customers found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleToggleSelectAll}
                      title="Select all customers"
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                    />
                  </th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Borrower Name</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Contact Details</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Total Applications</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Total Applied (₹)</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Disbursed (₹)</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Latest Status</th>
                  <th className="pb-3 text-right font-bold uppercase tracking-wider text-[10px]">Customer 360</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  return (
                    <tr key={c.id} className={`transition ${isSelected ? 'bg-blue-950/20' : 'hover:bg-slate-800/40'}`}>
                      <td className="py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(c.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                        />
                      </td>
                      <td className="py-3.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold">
                            {c.name?.charAt(0) || 'U'}
                          </div>
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="text-slate-300">{c.email}</div>
                        <div className="text-[10px] text-slate-400">{c.phone || 'Phone not set'}</div>
                      </td>
                      <td className="py-3.5 font-bold text-slate-200">{c.total_applications} Apps</td>
                      <td className="py-3.5 font-extrabold text-white">
                        ₹{Number(c.total_requested_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 font-extrabold text-emerald-400">
                        ₹{Number(c.total_disbursed_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-blue-400 border border-slate-700 capitalize">
                          {c.latest_status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => viewCustomer360(c.id)}
                          className="py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-400 font-bold rounded-xl text-xs transition border border-blue-500/30 inline-flex items-center gap-1.5"
                        >
                          <Eye size={12} />
                          <span>View 360°</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Customer Bulk Deletion</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-rose-400 font-extrabold">{selectedIds.length}</strong> selected
                  customer account(s)?
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-[11px] text-rose-300">
              <strong>Warning:</strong> Deleting these customer accounts will also permanently erase all of their
              loan applications, documents, agreements, payment histories, and authentication tokens. This action is irreversible.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={executeBulkDelete}
                className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-900/30 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete Customers</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer 360 Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-end p-4 sm:p-6">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl h-full max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-base">
                  {customerDetail?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{customerDetail?.name || 'Borrower'}</h3>
                  <p className="text-xs text-slate-400">{customerDetail?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-16 text-center text-xs text-slate-400">Loading Customer 360 Record...</div>
            ) : customerDetail ? (
              <div className="space-y-6 text-xs">
                {/* Profile Overview Card */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Contact</span>
                    <span className="text-slate-200 font-bold">{customerDetail.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Member Since</span>
                    <span className="text-slate-200 font-bold">
                      {new Date(customerDetail.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Account Status</span>
                    <span className="text-emerald-400 font-bold capitalize">{customerDetail.status || 'Active'}</span>
                  </div>
                </div>

                {/* Application History */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <FileCheck size={16} className="text-blue-400" />
                    <span>Lifetime Loan Applications ({customerDetail.applications?.length || 0})</span>
                  </h4>

                  <div className="space-y-3">
                    {customerDetail.applications?.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-400">{app.application_number}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                            {app.current_status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>{app.product?.name || 'Loan'}</span>
                          <span className="font-extrabold text-white">
                            ₹{Number(app.requested_amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            Applied on: {new Date(app.created_at).toLocaleDateString()}
                          </span>
                          <Link
                            to={`/admin/applications/${app.id}`}
                            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                          >
                            <span>Inspect File</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
