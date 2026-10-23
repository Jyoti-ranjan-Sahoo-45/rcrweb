import React from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight, Home } from 'lucide-react';

export const PaymentSuccessState = ({
  amount = 0,
  utrNumber = '',
  onClose,
  onGoHome,
}) => {
  const currentDateTime = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center space-y-5 shadow-2xl border border-slate-100">
        {/* Animated Check Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Payment Proof Received
          </span>
          <h2 className="text-xl font-extrabold text-slate-900">
            Payment Submitted!
          </h2>
          <div className="text-2xl font-black text-slate-900 pt-1">
            ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500">
            Your payment reference has been recorded. Our operations desk will verify your payment and update your loan ledger shortly.
          </p>
        </div>

        {/* Reference & Timestamp Box */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-left">
          <div className="flex justify-between text-slate-500">
            <span>UTR / Reference:</span>
            <span className="font-mono font-bold text-slate-900">{utrNumber}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Submitted At:</span>
            <span className="font-medium text-slate-700">{currentDateTime}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Status:</span>
            <span className="font-bold text-amber-600">Verification in Progress</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition active:scale-98 cursor-pointer"
          >
            View Payment Status
          </button>
          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-2.5 text-slate-500 hover:text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
