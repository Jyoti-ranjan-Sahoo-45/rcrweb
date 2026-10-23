import React from 'react';
import { Calendar, ChevronRight, Zap, CheckCircle2, Clock } from 'lucide-react';

export const UpcomingEmiList = ({
  schedules = [],
  paidCount = 0,
  onViewFullSchedule,
  onSelectEmi,
}) => {
  // Get upcoming pending installments (limit to max 3-4 on main page)
  const pendingSchedules = schedules
    .filter((s) => s.status !== 'paid')
    .slice(0, 4);

  if (pendingSchedules.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="text-sm font-bold text-slate-800">All Scheduled EMIs Paid!</h3>
        <p className="text-xs text-slate-500">
          You have no pending installments due. Thank you for your on-time repayments!
        </p>
        <button
          type="button"
          onClick={onViewFullSchedule}
          className="text-xs text-blue-600 font-bold hover:underline pt-1 inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View Full Repayment History</span>
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-blue-600" />
          <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
            Upcoming EMIs
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Next {pendingSchedules.length} Due</span>
      </div>

      <div className="space-y-2.5">
        {pendingSchedules.map((s, idx) => {
          const isDueNow = idx === 0;
          const isVerifying = s.status === 'processing_verification';

          const formattedDate = new Date(s.due_date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={s.id}
              className={`p-3.5 rounded-2xl border transition space-y-2 ${
                isDueNow
                  ? 'bg-blue-50/40 border-blue-400 ring-1 ring-blue-400/40 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      EMI #{s.installment_number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isVerifying
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : isDueNow
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isVerifying ? 'Verification Pending' : isDueNow ? 'Due Now' : 'Upcoming'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <Clock size={12} className="text-slate-400" />
                    <span>Due: {formattedDate}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">
                    ₹{Number(s.emi_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Bal: ₹{Number(s.remaining_principal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Secondary Micro Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-200/60 text-slate-500">
                <div>
                  Principal: <strong className="text-slate-700 font-bold">₹{Number(s.principal_component).toLocaleString('en-IN')}</strong>
                </div>
                <div className="text-right">
                  Interest: <strong className="text-slate-700 font-bold">₹{Number(s.interest_component).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button to Open Full Repayment Schedule Modal */}
      <button
        type="button"
        onClick={onViewFullSchedule}
        className="w-full py-3 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-99 cursor-pointer"
      >
        <span>View full repayment schedule ({schedules.length} installments)</span>
        <ChevronRight size={15} className="text-slate-400" />
      </button>
    </div>
  );
};
