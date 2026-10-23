import React, { useState } from 'react';
import { History, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export const RecentPayments = ({ transactions = [] }) => {
  const [showAll, setShowAll] = useState(false);

  if (!transactions || transactions.length === 0) {
    return null;
  }

  const displayedTransactions = showAll ? transactions : transactions.slice(0, 3);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={11} /> Verified
          </span>
        );
      case 'pending':
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 animate-pulse">
            <Clock size={11} /> Under Verification
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
            <AlertCircle size={11} /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getRepaymentTypeLabel = (tx) => {
    if (tx.repayment_type === 'single_emi') return '1 Month EMI';
    if (tx.repayment_type === 'multi_emi') return `${tx.months_count || 2} Months Advance`;
    if (tx.repayment_type === 'foreclosure') return 'Full Foreclosure';
    if (tx.repayment_type === 'custom') return 'Custom Repayment';
    return 'Repayment';
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={18} className="text-blue-600" />
          <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
            Recent Payments
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          {transactions.length} Submissions
        </span>
      </div>

      <div className="space-y-2.5">
        {displayedTransactions.map((tx) => {
          const dateStr = tx.created_at
            ? new Date(tx.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '';

          return (
            <div
              key={tx.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">
                    ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {dateStr} • {getRepaymentTypeLabel(tx)}
                  </span>
                </div>
                <div>{getStatusBadge(tx.status)}</div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/50">
                <span className="font-mono">
                  UTR: {tx.utr_number ? `${tx.utr_number.slice(0, 4)}••••${tx.utr_number.slice(-4)}` : 'N/A'}
                </span>
                {tx.receipt_path && (
                  <a
                    href={`/storage/${tx.receipt_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    <FileText size={11} /> View Receipt
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {transactions.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2.5 text-center text-xs font-bold text-blue-600 hover:text-blue-700 transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>{showAll ? 'Show less' : `View all payments (${transactions.length}) →`}</span>
          {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </div>
  );
};
