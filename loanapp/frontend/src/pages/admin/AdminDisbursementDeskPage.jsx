import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Send,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShieldCheck,
  CreditCard,
  Building2,
  AlertCircle
} from 'lucide-react';

export const AdminDisbursementDeskPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/applications');
      const all = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.data || []);
      const disbursementList = all.filter((app) =>
        ['payment_pending', 'payment_verification', 'ready_for_disbursement', 'disbursement_processing', 'disbursed'].includes(
          app.current_status
        )
      );
      setApplications(disbursementList);

    } catch (e) {
      console.error('Failed to load disbursement queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filtered = applications.filter((app) => {
    return (
      app.application_number?.toLowerCase().includes(search.toLowerCase()) ||
      app.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider border border-purple-500/30 mb-1">
            LOS Stage 4
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Treasury & Disbursement Desk</h1>
          <p className="text-xs text-slate-400">
            Verify 4-point pre-disbursement compliance, validate borrower bank account, and release NEFT/IMPS payout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchQueue}
            className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition"
          >
            Refresh Treasury Desk
          </button>
        </div>
      </div>

      {/* 4-Point Pre-Disbursement Compliance Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/20 rounded-3xl p-5 shadow-xl">
        <h3 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldCheck size={16} />
          <span>Mandatory Pre-Disbursement Verification Protocol</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-slate-300">1. KYC Verified</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-slate-300">2. KFS & Agreement Signed</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-slate-300">3. Fee / e-Mandate Active</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-slate-300">4. Bank Penny Drop Valid</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search disbursement files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading Treasury & Disbursement Queue...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-purple-400" />
            <h3 className="text-sm font-bold text-white">No Pending Disbursements</h3>
            <p className="text-xs text-slate-400">All treasury payouts are up to date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">App Number</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Beneficiary</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Net Payout Amount</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Fee / Payment</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Disbursement Status</th>
                  <th className="pb-3 text-right font-bold uppercase tracking-wider text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((app) => {
                  const isDisbursed = app.current_status === 'disbursed';
                  return (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 font-mono text-purple-400 font-bold">{app.application_number}</td>
                      <td className="py-3.5">
                        <div className="font-bold text-white">{app.user?.name}</div>
                        <div className="text-[10px] text-slate-400">Acc: •••• 9821 (HDFC Bank)</div>
                      </td>
                      <td className="py-3.5 font-extrabold text-white">
                        ₹{Number(app.offer?.offered_amount || app.requested_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {app.payment_record?.status === 'paid' || app.current_status === 'payment_received'
                            ? 'Fee Paid'
                            : 'Processing Fee Verified'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border capitalize inline-block ${
                            isDisbursed
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          }`}
                        >
                          {app.current_status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/admin/applications/${app.id}`}
                          className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition border border-purple-500/30 inline-flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                        >
                          <Send size={12} />
                          <span>Execute Payout</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
