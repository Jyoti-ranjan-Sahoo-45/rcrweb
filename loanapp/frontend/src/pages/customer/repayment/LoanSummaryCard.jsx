import React from 'react';
import { Calendar, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export const LoanSummaryCard = ({
  outstandingBalance = 0,
  nextEmiAmount = 0,
  nextDueDate = null,
  paidInstallments = 0,
  totalInstallments = 0,
  isClosed = false,
  onPayClick,
}) => {
  const progressPercent = totalInstallments > 0
    ? Math.min(100, Math.round((paidInstallments / totalInstallments) * 100))
    : 0;

  const formattedDueDate = nextDueDate
    ? new Date(nextDueDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'All EMIs Settled';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden border border-slate-700/50">
      {/* Subtle Ambient Decorative Glows */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-28 h-28 rounded-full bg-emerald-500/15 blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Outstanding Balance (Dominant visual anchor) */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
              Outstanding Balance
            </span>
            {isClosed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={12} /> Loan Closed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Zap size={12} className="text-blue-400 fill-blue-400" /> Active Loan
              </span>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            ₹{Number(outstandingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Next EMI & Due Date Split Row */}
        {!isClosed && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-300 block">Next Monthly EMI</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block mt-0.5">
                ₹{Number(nextEmiAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-300 block">Due Date</span>
              <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-white mt-0.5 justify-end">
                <Calendar size={14} className="text-blue-400" />
                <span>{formattedDueDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar & Repayment Counter */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Repayment Progress</span>
            <span className="font-bold text-white">
              {paidInstallments} of {totalInstallments} EMIs Paid ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden p-0.5 border border-slate-600/50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Primary Hero Action CTA */}
        {!isClosed && onPayClick && (
          <button
            onClick={onPayClick}
            type="button"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
          >
            <span>Pay Next EMI (₹{Number(nextEmiAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
