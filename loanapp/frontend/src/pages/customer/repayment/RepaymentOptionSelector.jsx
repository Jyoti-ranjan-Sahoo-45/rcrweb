import React from 'react';
import { CheckCircle2, Circle, Sparkles, Zap, ShieldAlert, ArrowRight } from 'lucide-react';

export const RepaymentOptionSelector = ({
  repaymentType = 'single_emi',
  onSelectType,
  monthlyEmi = 0,
  foreclosureAmount = 0,
  monthsCount = 2,
  onChangeMonths,
  customAmount = '',
  onChangeCustomAmount,
  pendingInstallmentsCount = 1,
}) => {
  const advanceAmount = monthlyEmi * monthsCount;

  const maxMonths = Math.min(6, Math.max(2, pendingInstallmentsCount));
  const availableMonths = [2, 3, 4, 6].filter((m) => m <= Math.max(2, pendingInstallmentsCount));

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue-600" />
          <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
            How much do you want to pay?
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">4 Flexible Options</span>
      </div>

      <div className="space-y-2.5">
        {/* Option 1: Current EMI */}
        <div
          onClick={() => onSelectType('single_emi')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer select-none ${
            repaymentType === 'single_emi'
              ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/30 shadow-xs text-slate-900'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 shrink-0">
                {repaymentType === 'single_emi' ? (
                  <CheckCircle2 size={20} className="fill-blue-600 text-white" />
                ) : (
                  <Circle size={20} className="text-slate-300" />
                )}
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                  Current EMI
                </span>
                <span className="text-[11px] text-slate-500">
                  Due this month
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-black text-blue-600">
                ₹{Number(monthlyEmi).toLocaleString('en-IN')}
              </span>
              {repaymentType === 'single_emi' && (
                <span className="text-[10px] font-bold text-blue-700 block uppercase tracking-wider">
                  Selected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Option 2: Advance EMI */}
        <div
          onClick={() => onSelectType('multi_emi')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer select-none space-y-3 ${
            repaymentType === 'multi_emi'
              ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/30 shadow-xs text-slate-900'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 shrink-0">
                {repaymentType === 'multi_emi' ? (
                  <CheckCircle2 size={20} className="fill-blue-600 text-white" />
                ) : (
                  <Circle size={20} className="text-slate-300" />
                )}
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                  Advance EMI
                </span>
                <span className="text-[11px] text-slate-500">
                  Pay {monthsCount} months in advance
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-black text-blue-600">
                ₹{Number(advanceAmount).toLocaleString('en-IN')}
              </span>
              {repaymentType === 'multi_emi' && (
                <span className="text-[10px] font-bold text-blue-700 block uppercase tracking-wider">
                  Selected
                </span>
              )}
            </div>
          </div>

          {/* Expanded Multi-Month Chips when Selected */}
          {repaymentType === 'multi_emi' && (
            <div className="pt-2 border-t border-blue-200/60 flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600">Choose months:</span>
              <div className="flex items-center gap-1.5">
                {(availableMonths.length > 0 ? availableMonths : [2, 3]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeMonths(m);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      monthsCount === m
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m} Mos (₹{(monthlyEmi * m).toLocaleString('en-IN')})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Option 3: Close Loan (Foreclosure) */}
        <div
          onClick={() => onSelectType('foreclosure')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer select-none space-y-2 ${
            repaymentType === 'foreclosure'
              ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/30 shadow-xs text-slate-900'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-emerald-600 shrink-0">
                {repaymentType === 'foreclosure' ? (
                  <CheckCircle2 size={20} className="fill-emerald-600 text-white" />
                ) : (
                  <Circle size={20} className="text-slate-300" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                    Close Loan
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Save Interest
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Full closure / Pre-closure
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-black text-emerald-600">
                ₹{Number(foreclosureAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {repaymentType === 'foreclosure' && (
                <span className="text-[10px] font-bold text-emerald-700 block uppercase tracking-wider">
                  Selected
                </span>
              )}
            </div>
          </div>

          {repaymentType === 'foreclosure' && (
            <p className="text-[11px] text-emerald-700 font-medium pt-1 border-t border-emerald-200/60">
              ✓ Pay off the exact principal balance today. All future monthly interest charges are waived immediately.
            </p>
          )}
        </div>

        {/* Option 4: Custom Partial Amount */}
        <div
          onClick={() => onSelectType('custom')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer select-none space-y-2.5 ${
            repaymentType === 'custom'
              ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/30 shadow-xs text-slate-900'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 shrink-0">
                {repaymentType === 'custom' ? (
                  <CheckCircle2 size={20} className="fill-blue-600 text-white" />
                ) : (
                  <Circle size={20} className="text-slate-300" />
                )}
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                  Custom Amount
                </span>
                <span className="text-[11px] text-slate-500">
                  Enter partial or custom prepayment
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-black text-slate-800">
                {customAmount ? `₹${Number(customAmount).toLocaleString('en-IN')}` : 'Enter amount'}
              </span>
            </div>
          </div>

          {/* Expanded Input Field */}
          {repaymentType === 'custom' && (
            <div className="pt-2 border-t border-blue-200/60 space-y-2" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="Enter custom amount in ₹"
                  value={customAmount}
                  onChange={(e) => onChangeCustomAmount(e.target.value)}
                  className="w-full text-xs sm:text-sm font-bold pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => onChangeCustomAmount(amt.toString())}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  >
                    +₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
