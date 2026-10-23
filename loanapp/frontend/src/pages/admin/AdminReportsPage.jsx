import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  FileSpreadsheet,
  TrendingUp,
  Download,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Percent,
  Layers,
  BarChart3
} from 'lucide-react';

export const AdminReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/staff/reports');
        setData(res.data);
      } catch (e) {
        console.error('Failed to load portfolio reports', e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    // Generate simple client-side CSV download
    const rows = [
      ['Metric', 'Value'],
      ['Total Applications', data?.metrics?.total_applications || 0],
      ['Total Disbursed (INR)', data?.metrics?.total_disbursed || 0],
      ['Approved Count', data?.metrics?.approved_count || 0],
      ['Approval Rate (%)', data?.metrics?.approval_rate || 0],
      ['Avg Turnaround Time (Hrs)', data?.metrics?.avg_turnaround_hours || 4.2],
      ['NPA Ratio', data?.metrics?.npa_ratio || '0.42%'],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RCR_MIS_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        Aggregating Portfolio MIS & Risk Analytics...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const funnel = data?.funnel || {};
  const trends = data?.monthly_trends || [];
  const products = data?.products || [];
  const riskTiers = data?.risk_tiers || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/30 mb-1">
            Executive Analytics
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Portfolio MIS & Risk Analytics</h1>
          <p className="text-xs text-slate-400">
            Portfolio performance, underwriting turnaround velocity, default probability, and capital disbursement trends.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition self-start md:self-auto"
        >
          <Download size={16} />
          <span>Export MIS Report (CSV)</span>
        </button>
      </div>

      {/* Top Level Portfolio Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Portfolio Capital</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            ₹{Number(metrics.total_disbursed || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">Credited capital</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Sanction Conversion</span>
          <div className="text-2xl font-extrabold text-blue-400">{metrics.approval_rate || 0}%</div>
          <span className="text-[11px] text-slate-500">Underwriting approval rate</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Average TAT (End-to-End)</span>
          <div className="text-2xl font-extrabold text-white">{metrics.avg_turnaround_hours || 4.2} Hours</div>
          <span className="text-[11px] text-slate-500">Submission to payout</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Portfolio Risk (NPA)</span>
          <div className="text-2xl font-extrabold text-purple-400">{metrics.npa_ratio || '0.42%'}</div>
          <span className="text-[11px] text-slate-500">Gross 90+ DPD ratio</span>
        </div>
      </div>

      {/* Stage Conversion Funnel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-400" />
          <span>Stage Conversion Pipeline Funnel</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Drafts</span>
            <span className="text-lg font-extrabold text-slate-300">{funnel.draft || 0}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Submitted</span>
            <span className="text-lg font-extrabold text-white">{funnel.submitted || 0}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-amber-500 font-bold uppercase block">KYC Review</span>
            <span className="text-lg font-extrabold text-amber-400">{funnel.verification || 0}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-blue-500 font-bold uppercase block">Underwriting</span>
            <span className="text-lg font-extrabold text-blue-400">{funnel.underwriting || 0}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-emerald-500 font-bold uppercase block">Sanctioned</span>
            <span className="text-lg font-extrabold text-emerald-400">{funnel.sanctioned || 0}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-indigo-500 font-bold uppercase block">Agreement</span>
            <span className="text-lg font-extrabold text-indigo-400">{funnel.formalities || 0}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-purple-500 font-bold uppercase block">Disbursed</span>
            <span className="text-lg font-extrabold text-purple-400">{funnel.disbursed || 0}</span>
          </div>
        </div>
      </div>

      {/* Monthly Trend & Risk Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Disbursement Trends */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span>Monthly Disbursement Volume Trajectory</span>
          </h3>

          <div className="space-y-3 pt-2">
            {trends.map((t) => (
              <div key={t.month} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold">{t.month} 2026</span>
                  <span className="font-extrabold text-white">₹{(t.disbursed / 100000).toFixed(1)} Lakhs</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, (t.disbursed / 15000000) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CIBIL Score & Risk Tier Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <ShieldAlert size={16} className="text-indigo-400" />
            <span>Borrower Credit Risk Tier Breakdown</span>
          </h3>

          <div className="space-y-4 pt-2">
            {Object.entries(riskTiers).map(([key, tier]) => (
              <div key={key} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{tier.label}</span>
                  <span className="font-extrabold text-blue-400">{tier.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      key === 'prime'
                        ? 'bg-emerald-500'
                        : key === 'standard'
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${tier.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
