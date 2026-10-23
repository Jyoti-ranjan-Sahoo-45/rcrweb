import React from 'react';

export const LoanStats = ({
  loanAmount = 0,
  totalPaid = 0,
  emisLeft = 0,
  interestRate = 13.5,
}) => {
  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs grid grid-cols-3 divide-x divide-slate-100 text-center">
      <div className="px-2">
        <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
          Loan Amount
        </span>
        <span className="text-xs sm:text-sm font-black text-slate-800 mt-1 block">
          ₹{Number(loanAmount).toLocaleString('en-IN')}
        </span>
        <span className="text-[10px] text-slate-400 block mt-0.5">
          {interestRate}% p.a.
        </span>
      </div>

      <div className="px-2">
        <span className="text-[11px] font-semibold text-emerald-600 block uppercase tracking-wider">
          Total Paid
        </span>
        <span className="text-xs sm:text-sm font-black text-emerald-700 mt-1 block">
          ₹{Number(totalPaid).toLocaleString('en-IN')}
        </span>
        <span className="text-[10px] text-emerald-600 block mt-0.5">
          Settled
        </span>
      </div>

      <div className="px-2">
        <span className="text-[11px] font-semibold text-amber-600 block uppercase tracking-wider">
          EMIs Left
        </span>
        <span className="text-xs sm:text-sm font-black text-amber-700 mt-1 block">
          {emisLeft}
        </span>
        <span className="text-[10px] text-amber-600 block mt-0.5">
          Remaining
        </span>
      </div>
    </div>
  );
};
