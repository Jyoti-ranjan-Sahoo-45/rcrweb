import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Search, 
  Filter, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  X,
  CheckSquare,
  Square
} from 'lucide-react';

export const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Bulk selection and delete state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // null = bulk, or single { id, application_number, name }
  const [feedback, setFeedback] = useState(null);

  const navigate = useNavigate();

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/applications', {
        params: { search, status: statusFilter, page },
      });
      setApplications(res.data?.data?.data || []);
      setTotalPages(res.data?.data?.last_page || 1);
    } catch (e) {
      console.error('Failed to fetch applications queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApps();
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'approved':
      case 'offer_accepted':
      case 'disbursed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected':
      case 'offer_declined':
      case 'cancelled':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'additional_information_required':
      case 'payment_pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  // Selection handlers
  const allCurrentPageSelected = 
    applications.length > 0 && 
    applications.every((app) => selectedIds.includes(app.id));

  const handleToggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const currentPageIds = applications.map((a) => a.id);
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      const currentPageIds = applications.map((a) => a.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openBulkDeleteConfirm = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget(null);
    setDeleteModalOpen(true);
  };

  const openSingleDeleteConfirm = (app, e) => {
    e.stopPropagation();
    setDeleteTarget({
      id: app.id,
      application_number: app.application_number,
      name: app.user?.name || 'Applicant',
    });
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    const idsToDelete = deleteTarget ? [deleteTarget.id] : selectedIds;
    if (idsToDelete.length === 0) return;

    setIsDeleting(true);
    setFeedback(null);
    try {
      const res = await api.post('/staff/applications/bulk-delete', { ids: idsToDelete });
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || `Deleted ${idsToDelete.length} application(s) successfully.`,
        });
        setSelectedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
        setDeleteModalOpen(false);
        setDeleteTarget(null);
        await fetchApps();
      } else {
        setFeedback({
          type: 'error',
          message: res.data?.message || 'Failed to delete applications.',
        });
      }
    } catch (err) {
      console.error('Delete error', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error deleting applications. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
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
          <h1 className="text-xl font-bold text-white tracking-tight">Applications Queue & Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Filter, inspect, verify documents, assess credit, and process disbursements</p>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search by App #, Name, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 pl-9 focus:outline-none focus:border-blue-500 w-64"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="document_verification">Document Verification</option>
            <option value="additional_information_required">Info Required</option>
            <option value="credit_assessment">Credit Assessment</option>
            <option value="approved">Approved</option>
            <option value="offer_sent">Offer Sent</option>
            <option value="offer_accepted">Offer Accepted</option>
            <option value="offer_declined">Customer Declined / Rejected</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="ready_for_disbursement">Ready for Disbursement</option>
            <option value="disbursed">Disbursed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/40 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-rose-950/20 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-200">
              <strong className="text-rose-400 font-extrabold text-sm mr-1">{selectedIds.length}</strong>
              application{selectedIds.length > 1 ? 's' : ''} selected
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
              onClick={openBulkDeleteConfirm}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-900/40 transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Bulk Delete ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <th className="py-3.5 px-4 font-semibold w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={handleToggleSelectAll}
                    title="Select all applications on this page"
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                  />
                </th>
                <th className="py-3.5 px-4 font-semibold">Application Number</th>
                <th className="py-3.5 px-4 font-semibold">Applicant Profile</th>
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Requested Amount</th>
                <th className="py-3.5 px-4 font-semibold">Current Status</th>
                <th className="py-3.5 px-4 font-semibold">Applied At</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading queue...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">No applications matching current filters.</td>
                </tr>
              ) : (
                applications.map((app) => {
                  const isSelected = selectedIds.includes(app.id);
                  return (
                    <tr 
                      key={app.id} 
                      className={`transition ${isSelected ? 'bg-blue-950/20' : 'hover:bg-slate-900/40'}`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(app.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{app.application_number}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200">{app.user?.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{app.user?.phone} | {app.user?.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{app.product?.name}</td>
                      <td className="py-3.5 px-4 font-extrabold text-white">₹{Number(app.requested_amount).toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${getStatusColor(app.current_status)}`}>
                          {app.current_status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/applications/${app.id}`)}
                            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            Review
                          </button>
                          <button
                            onClick={(e) => openSingleDeleteConfirm(app, e)}
                            title="Delete this application"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {deleteTarget ? 'Delete Loan Application' : 'Confirm Bulk Deletion'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {deleteTarget ? (
                    <>
                      Are you sure you want to delete application{' '}
                      <strong className="text-white font-mono">{deleteTarget.application_number}</strong> for{' '}
                      <strong className="text-white">{deleteTarget.name}</strong>?
                    </>
                  ) : (
                    <>
                      Are you sure you want to permanently delete{' '}
                      <strong className="text-rose-400 font-extrabold">{selectedIds.length}</strong> selected
                      application(s)?
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-[11px] text-rose-300">
              <strong>Warning:</strong> This will permanently delete the application(s) and all cascaded data
              (documents, credit assessments, formal offers, payment records, and schedules). This action cannot be undone.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={executeDelete}
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
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
