import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  FileText,
  UserCheck
} from 'lucide-react';

export const AdminVerificationQueuePage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/applications');
      // Extract array from paginator or plain array
      const all = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.data || []);
      const verificationList = all.filter((app) =>
        ['draft', 'submitted', 'initial_review', 'documents_pending', 'document_verification', 'additional_information_required'].includes(
          app.current_status
        )
      );
      setApplications(verificationList);

    } catch (e) {
      console.error('Failed to load verification queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.application_number?.toLowerCase().includes(search.toLowerCase()) ||
      app.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || app.current_status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/30 mb-1">
            LOS Stage 1
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">KYC & Document Verification Desk</h1>
          <p className="text-xs text-slate-400">
            Inspect applicant identity, address proofs, income documents, and bank statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchQueue}
            className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition"
          >
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by app #, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Status Filter:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Verification Stages ({applications.length})</option>
            <option value="submitted">Submitted</option>
            <option value="initial_review">Initial Review</option>
            <option value="document_verification">Document Verification</option>
            <option value="additional_info_required">Info Required</option>
          </select>
        </div>
      </div>

      {/* Verification Applications Grid / List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading KYC Verification Queue...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Verification Queue is Clear!</h3>
            <p className="text-xs text-slate-400">All submitted KYC documents have been reviewed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">App Number</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Borrower Profile</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Scheme</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Requested</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">KYC Status</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Documents</th>
                  <th className="pb-3 text-right font-bold uppercase tracking-wider text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((app) => {
                  const docCount = app.documents?.length || 0;
                  const verifiedCount = app.documents?.filter((d) => d.status === 'verified').length || 0;

                  return (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 font-mono text-amber-400 font-bold">{app.application_number}</td>
                      <td className="py-3.5">
                        <div className="font-bold text-white">{app.user?.name || 'Applicant'}</div>
                        <div className="text-[10px] text-slate-400">{app.user?.phone || app.user?.email}</div>
                      </td>
                      <td className="py-3.5 text-slate-300 font-medium">{app.product?.name}</td>
                      <td className="py-3.5 font-extrabold text-white">
                        ₹{Number(app.requested_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/20 capitalize inline-block">
                          {app.current_status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          <FileText size={14} className="text-slate-400" />
                          <span className="text-slate-200 font-semibold">
                            {verifiedCount}/{docCount || 3} Verified
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/admin/applications/${app.id}`}
                          className="py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold rounded-xl text-xs transition border border-amber-500/30 inline-flex items-center gap-1.5"
                        >
                          <Eye size={12} />
                          <span>Inspect KYC</span>
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
