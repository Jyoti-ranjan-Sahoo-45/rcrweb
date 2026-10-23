import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, Clock, Check, ChevronDown } from 'lucide-react';

export const EmiScheduleModal = ({
  isOpen = false,
  onClose,
  schedules = [],
  summary = null,
}) => {
  const [tab, setTab] = useState('all'); // 'all', 'pending', 'paid'

  if (!isOpen) return null;

  const pendingSchedules = schedules.filter((s) => s.status !== 'paid');
  const paidSchedules = schedules.filter((s) => s.status === 'paid');
  const displayedSchedules = tab === 'pending' ? pendingSchedules : tab === 'paid' ? paidSchedules : schedules;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <h2 className="text-base font-extrabold text-slate-900">
                Full Repayment Schedule
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Complete {schedules.length} month amortization schedule
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Segmented Control */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`flex-1 py-1.5 rounded-xl transition cursor-pointer ${
                tab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              All ({schedules.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('pending')}
              className={`flex-1 py-1.5 rounded-xl transition cursor-pointer ${
                tab === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Pending ({pendingSchedules.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('paid')}
              className={`flex-1 py-1.5 rounded-xl transition cursor-pointer ${
                tab === 'paid' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Paid ({paidSchedules.length})
            </button>
          </div>
        </div>

        {/* Scrollable Installments List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 overscroll-contain">
          {displayedSchedules.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No installments in this view.
            </div>
          ) : (
            displayedSchedules.map((s) => {
              const isPaid = s.status === 'paid';
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
                    isPaid
                      ? 'bg-slate-50/50 border-slate-200'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          Installment #{s.installment_number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isVerifying
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isPaid ? '✓ Paid' : isVerifying ? 'Verifying' : 'Pending'}
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

                  {/* Micro Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 p-2 rounded-xl text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Principal</span>
                      <strong className="text-slate-800 font-bold">₹{Number(s.principal_component).toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Interest</span>
                      <strong className="text-slate-800 font-bold">₹{Number(s.interest_component).toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Balance</span>
                      <strong className="text-slate-800 font-bold font-mono">₹{Number(s.remaining_principal).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {isPaid && s.utr_number && (
                    <div className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Settled via UTR: {s.utr_number}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition cursor-pointer"
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
