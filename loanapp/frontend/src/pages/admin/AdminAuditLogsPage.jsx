import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Activity,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Eye,
  X,
  FileCode
} from 'lucide-react';

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/audit-logs', { params: { search } });
      setLogs(res.data.data || []);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/30 mb-1">
            Governance & Compliance
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Compliance & System Audit Trail</h1>
          <p className="text-xs text-slate-400">
            Immutable log of state transitions, underwriting approvals, staff overrides, and payout transactions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition"
        >
          Refresh Audit Trail
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by action, entity, user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading System Audit Logs...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No audit events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Timestamp</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Action Performed</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Entity Type & ID</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Actor / Officer</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">IP Address</th>
                  <th className="pb-3 text-right font-bold uppercase tracking-wider text-[10px]">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 font-mono text-slate-400">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                        {l.action?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-200">
                      {l.entity_type} #{l.entity_id}
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-white">{l.user?.name || 'System Auto-Engine'}</div>
                      <div className="text-[10px] text-slate-400">{l.user?.email || 'System'}</div>
                    </td>
                    <td className="py-3.5 font-mono text-slate-400">{l.ip_address || '127.0.0.1'}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(l)}
                        className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition border border-slate-700 inline-flex items-center gap-1"
                      >
                        <FileCode size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Audit Event Raw Payload #{selectedLog.id}</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Action</span>
                  <span className="text-white font-bold">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Entity</span>
                  <span className="text-white font-bold">
                    {selectedLog.entity_type} #{selectedLog.entity_id}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">State Modification Details / Diff</span>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto">
                  {JSON.stringify(
                    {
                      old_values: selectedLog.old_values,
                      new_values: selectedLog.new_values,
                      details: selectedLog.details,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
