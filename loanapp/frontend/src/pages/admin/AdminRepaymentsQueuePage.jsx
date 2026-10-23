import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  IndianRupee,
  FileText,
  User,
  ShieldCheck,
  X
} from 'lucide-react';

export const AdminRepaymentsQueuePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({ total_collected_amount: 0, pending_verification_count: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Manual payment modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    application_id: '',
    repayment_type: 'single_emi',
    months_count: 1,
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    remarks: 'Offline cash collection',
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/repayments', {
        params: { status: statusFilter || undefined, search: search || undefined },
      });
      setTransactions(res.data.data || []);
      if (res.data.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (e) {
      console.error('Failed to load repayments queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, search]);

  const handleVerify = async (id, status) => {
    const remarks = prompt(status === 'verified' ? 'Optional verification remarks:' : 'Enter reason for rejection:');
    if (status === 'rejected' && !remarks) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/staff/repayments/${id}/verify`, {
        status,
        remarks: remarks || null,
      });
      alert(res.data?.message || 'Transaction updated successfully.');
      fetchTransactions();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to verify transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.application_id || !manualForm.amount || !manualForm.reference_number) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/staff/applications/${manualForm.application_id}/repayments/record-manual`, manualForm);
      alert(res.data?.message || 'Manual payment recorded successfully.');
      setShowManualModal(false);
      setManualForm({
        application_id: '',
        repayment_type: 'single_emi',
        months_count: 1,
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        remarks: 'Offline cash collection',
      });
      fetchTransactions();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to record manual payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-500/30 mb-1">
            Collections & LMS Ledger
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Loan Repayments & Collections Desk</h1>
          <p className="text-xs text-slate-400">
            Verify borrower EMI payments, advance multi-month installments, and full loan foreclosures.
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 w-fit"
        >
          <Plus size={16} />
          <span>Record Offline Collection</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Repayments Collected</span>
            <span className="text-2xl font-black text-emerald-400">
              ₹{Number(metrics.total_collected_amount || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Pending Verification Queue</span>
            <span className="text-2xl font-black text-amber-400">
              {metrics.pending_verification_count} Payments
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by UTR, Txn number, or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {['', 'pending_verification', 'verified', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition capitalize ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === '' ? 'All Repayments' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Repayments Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading Repayments Queue...</div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No repayment transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                  <th className="pb-3">Transaction</th>
                  <th className="pb-3">Borrower Details</th>
                  <th className="pb-3">Type & Installments</th>
                  <th className="pb-3">Amount (₹)</th>
                  <th className="pb-3">UTR Reference</th>
                  <th className="pb-3">Proof</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5">
                      <span className="font-mono font-bold text-blue-400 block">{tx.transaction_number}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(tx.paid_at || tx.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-white">{tx.application?.user?.name || 'Customer'}</div>
                      <Link
                        to={`/admin/applications/${tx.application_id}`}
                        className="text-[10px] font-mono text-blue-400 hover:underline"
                      >
                        #{tx.application?.application_number}
                      </Link>
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-white capitalize block">{tx.repayment_type?.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400">
                        {tx.months_count ? `${tx.months_count} Installment(s)` : 'Full Loan'}
                      </span>
                    </td>
                    <td className="py-3.5 font-extrabold text-emerald-400 text-sm">
                      ₹{Number(tx.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-slate-200">
                      {tx.utr_number}
                    </td>
                    <td className="py-3.5">
                      {tx.receipt_path ? (
                        <button
                          onClick={() => setSelectedReceipt(`/storage/${tx.receipt_path}`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg font-bold inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize border ${
                        tx.status === 'verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : tx.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {tx.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {tx.status === 'pending_verification' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleVerify(tx.id, 'verified')}
                            disabled={submitting}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
                          >
                            Verify & Credit
                          </button>
                          <button
                            onClick={() => handleVerify(tx.id, 'rejected')}
                            disabled={submitting}
                            className="px-2.5 py-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white font-bold rounded-lg transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Collection Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">Record Offline Repayment Collection</h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Application ID <span className="text-rose-400">*</span></label>
                <input
                  type="number"
                  placeholder="Enter Loan Application ID (e.g. 1)"
                  value={manualForm.application_id}
                  onChange={(e) => setManualForm({ ...manualForm, application_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Repayment Type</label>
                  <select
                    value={manualForm.repayment_type}
                    onChange={(e) => setManualForm({ ...manualForm, repayment_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="single_emi">1 Month EMI</option>
                    <option value="multi_emi">Multi-Month Advance</option>
                    <option value="foreclosure">Full Loan Foreclosure</option>
                    <option value="custom">Custom Partial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Payment Method</label>
                  <select
                    value={manualForm.payment_method}
                    onChange={(e) => setManualForm({ ...manualForm, payment_method: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                  >
                    <option value="cash">Cash Collection</option>
                    <option value="bank_wire">Direct Bank Wire / NEFT</option>
                    <option value="cheque">Cheque</option>
                    <option value="offline_pos">Branch POS</option>
                  </select>
                </div>
              </div>

              {manualForm.repayment_type === 'multi_emi' && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Number of Months Covered</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={manualForm.months_count}
                    onChange={(e) => setManualForm({ ...manualForm, months_count: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1">Amount Collected (₹) <span className="text-rose-400">*</span></label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={manualForm.amount}
                  onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Receipt / Cheque / Txn Ref Number <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. CASH-REC-1234 or CHQ-998877"
                  value={manualForm.reference_number}
                  onChange={(e) => setManualForm({ ...manualForm, reference_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-bold font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Remarks</label>
                <input
                  type="text"
                  value={manualForm.remarks}
                  onChange={(e) => setManualForm({ ...manualForm, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-emerald-600/30"
              >
                {submitting ? 'Recording...' : 'Record & Credit to Ledger'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedReceipt(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-white font-bold text-xs">Payment Receipt Screenshot</span>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-white font-bold">&times; Close</button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/40 rounded-xl p-2">
              <img src={selectedReceipt} alt="Full Receipt" className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
            <div className="text-right">
              <a
                href={selectedReceipt}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
              >
                <ExternalLink size={14} />
                <span>Open in New Tab</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
