import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Calculator,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  Sliders,
  DollarSign,
  Activity
} from 'lucide-react';

export const AdminUnderwritingPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/applications');
      const all = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.data || []);
      const underwritingList = all.filter((app) =>
        ['eligibility_review', 'credit_assessment', 'approval_pending'].includes(app.current_status)
      );
      setApplications(underwritingList);

    } catch (e) {
      console.error('Failed to load underwriting queue', e);
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/30 mb-1">
            LOS Stage 2
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Credit Underwriting & CAM Assessment Desk
          </h1>
          <p className="text-xs text-slate-400">
            Analyze borrower debt-to-income (FOIR/DTI), risk score tiers, disposable income, and sanction parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchQueue}
            className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition"
          >
            Refresh Desk
          </button>
        </div>
      </div>

      {/* Underwriting Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Underwriting Backlog</span>
          <div className="text-2xl font-extrabold text-blue-400">{applications.length} Files</div>
          <span className="text-[11px] text-slate-400">Awaiting credit decision</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Avg CAM Processing Time</span>
          <div className="text-2xl font-extrabold text-white">3.4 hrs</div>
          <span className="text-[11px] text-slate-400">Benchmark: &lt; 6 hrs</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Target Approval Ratio</span>
          <div className="text-2xl font-extrabold text-emerald-400">74.5%</div>
          <span className="text-[11px] text-slate-400">Optimal risk envelope</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search underwriting files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading Underwriting Queue...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Underwriting Desk is Clean!</h3>
            <p className="text-xs text-slate-400">All credit assessments are up to date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">App Number</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Applicant & Income</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Product Scheme</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Requested Limit</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Stage</th>
                  <th className="pb-3 text-right font-bold uppercase tracking-wider text-[10px]">Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 font-mono text-blue-400 font-bold">{app.application_number}</td>
                    <td className="py-3.5">
                      <div className="font-bold text-white">{app.user?.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Income: ₹{Number(app.monthly_income || 50000).toLocaleString('en-IN')}/mo
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-300 font-medium">{app.product?.name}</td>
                    <td className="py-3.5 font-extrabold text-white">
                      ₹{Number(app.requested_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-300 border border-blue-500/20 capitalize inline-block">
                        {app.current_status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition border border-blue-500/30 inline-flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                      >
                        <Calculator size={12} />
                        <span>Perform CAM</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
