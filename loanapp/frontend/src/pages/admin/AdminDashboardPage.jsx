import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  ArrowRight,
  ShieldCheck,
  Activity,
  Calculator,
  Send,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Sliders,
  Sparkles
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/staff/dashboard');
        setData(res.data);
      } catch (e) {
        console.error('Failed to load admin dashboard', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold">Initializing RCR Operations Command Hub...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/30">
            <Sparkles size={12} />
            Operations Overview
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Loan Origination & Portfolio Hub</h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time pipeline monitoring, underwriting queues, compliance audit trail, and treasury disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate('/admin/applications')}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
          >
            All Applications ({metrics.total_applications || 0})
          </button>
          <button
            onClick={() => navigate('/admin/queue/verification')}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
          >
            <span>Action Required</span>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-extrabold">
              {(metrics.verification_queue || 0) + (metrics.underwriting_queue || 0)}
            </span>
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Pipeline</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">
              ₹{Number(metrics.pipeline_value || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">In-flight applications</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Disbursed</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <IndianRupee size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-400">
              ₹{Number(metrics.disbursed_total || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Credited capital to date</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sanctioned Loans</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{metrics.approved_count || 0}</div>
            <span className="text-[11px] text-slate-400 font-medium">Approved / Active</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Customer Base</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <Users size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{metrics.active_borrowers || 0}</div>
            <span className="text-[11px] text-slate-400 font-medium">Registered Borrowers</span>
          </div>
        </div>
      </div>

      {/* Interactive LOS Stage Velocity Queues */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <span>Loan Origination Stage Velocity & Operational Queues</span>
            </h2>
            <p className="text-xs text-slate-400">Direct 1-click access to active stages needing staff intervention</p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Real-time sync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Queue 1: KYC & Doc */}
          <Link
            to="/admin/queue/verification"
            className="p-4 bg-slate-950/70 hover:bg-slate-900 border border-amber-500/20 hover:border-amber-500/50 rounded-2xl transition space-y-3 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <FileCheck size={14} />
                <span>1. KYC & Docs</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {metrics.verification_queue || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Review applicant ID proof, address, PAN, and bank statement uploads.
            </p>
            <div className="text-[11px] text-amber-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              <span>Open Desk &rarr;</span>
            </div>
          </Link>

          {/* Queue 2: Underwriting */}
          <Link
            to="/admin/queue/underwriting"
            className="p-4 bg-slate-950/70 hover:bg-slate-900 border border-blue-500/20 hover:border-blue-500/50 rounded-2xl transition space-y-3 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Calculator size={14} />
                <span>2. Underwriting CAM</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {metrics.underwriting_queue || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Evaluate credit score, FOIR/DTI ratio, and set sanction limits.
            </p>
            <div className="text-[11px] text-blue-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              <span>Open Desk &rarr;</span>
            </div>
          </Link>

          {/* Queue 3: Sanction & Offer */}
          <Link
            to="/admin/queue/sanctions"
            className="p-4 bg-slate-950/70 hover:bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl transition space-y-3 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>3. Sanctions & Offers</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {metrics.sanction_queue || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Generate loan sanction letters, issue offers, and monitor agreement signing.
            </p>
            <div className="text-[11px] text-emerald-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              <span>Open Desk &rarr;</span>
            </div>
          </Link>

          {/* Queue 4: Disbursement */}
          <Link
            to="/admin/queue/disbursement"
            className="p-4 bg-slate-950/70 hover:bg-slate-900 border border-purple-500/20 hover:border-purple-500/50 rounded-2xl transition space-y-3 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Send size={14} />
                <span>4. Disbursement Desk</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {metrics.disbursement_queue || 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Verify pre-disbursement checklist, fee confirmation, and execute payout.
            </p>
            <div className="text-[11px] text-purple-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              <span>Open Desk &rarr;</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Live Applications Table & Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Master Applications Queue */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <FileCheck size={16} className="text-blue-400" />
                <span>Recent Loan Applications</span>
              </h3>
              <p className="text-xs text-slate-400">Latest submissions across all product schemes</p>
            </div>
            <Link
              to="/admin/applications"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
            >
              <span>View All Applications ({metrics.total_applications})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">App Number</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Borrower</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Loan Scheme</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="pb-3 text-right font-bold uppercase tracking-wider text-[10px]">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.recent_applications?.length > 0 ? (
                  data.recent_applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 font-mono text-slate-300 font-bold">{app.application_number}</td>
                      <td className="py-3.5">
                        <div className="font-bold text-white">{app.user?.name || 'Applicant'}</div>
                        <div className="text-[10px] text-slate-400">{app.user?.email}</div>
                      </td>
                      <td className="py-3.5 text-slate-300 font-medium">{app.product?.name || 'Loan Product'}</td>
                      <td className="py-3.5 font-extrabold text-white">
                        ₹{Number(app.requested_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-800 text-blue-400 border border-slate-700 capitalize inline-block">
                          {app.current_status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/admin/applications/${app.id}`}
                          className="py-1.5 px-3 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition inline-block border border-blue-500/30"
                        >
                          Inspect &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No applications currently in queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Live Audit Log & System Activity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                <span>Live Audit Activity</span>
              </h3>
              <Link to="/admin/audit-logs" className="text-xs text-blue-400 hover:underline">
                Full Log &rarr;
              </Link>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {data?.recent_audit?.length > 0 ? (
                data.recent_audit.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-xs space-y-1 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-400 capitalize">{log.action?.replace(/_/g, ' ')}</span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {log.entity_type} #{log.entity_id}
                    </p>
                    <span className="text-[10px] text-slate-500 block">
                      Actor: {log.user?.name || 'System Auto-Engine'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No recent audit logs.</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <Link
              to="/admin/reports"
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              <FileSpreadsheet size={14} />
              <span>View Full MIS & Portfolio Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
