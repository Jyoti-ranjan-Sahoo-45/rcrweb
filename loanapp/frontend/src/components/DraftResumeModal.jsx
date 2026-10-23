import React, { useState } from 'react';
import { 
  FileText, ArrowRight, RotateCcw, X, Clock, CheckCircle2, 
  Sparkles, AlertCircle, Trash2 
} from 'lucide-react';

const STEP_NAMES = {
  1: 'Applicant & Loan Details',
  2: 'Residential Address & References',
  3: 'Employment & Income Details',
  4: 'Disbursement Bank Account',
  5: 'KYC Document Uploads',
  6: 'Declaration & Final Review',
};

export const DraftResumeModal = ({
  isOpen,
  onClose,
  draft,
  onResume,
  onStartNew,
}) => {
  const [discarding, setDiscarding] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (!isOpen || !draft) return null;

  const currentStep = Number(draft.current_step) || 1;
  const stepName = STEP_NAMES[currentStep] || 'Loan Details';
  const progressPercent = Math.min(100, Math.round(((currentStep - 1) / 5) * 100));
  const productName = draft.product?.name || 'Personal Loan';
  const amount = Number(draft.requested_amount) || 50000;

  const handleDiscardClick = async () => {
    if (!confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    setDiscarding(true);
    try {
      await onStartNew(draft.id);
    } finally {
      setDiscarding(false);
      setConfirmDiscard(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 space-y-5 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Top Badge & Header */}
        <div className="space-y-1.5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-100">
            <Clock size={12} className="text-blue-600 animate-pulse" />
            <span>Incomplete Application Found</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Resume Your Loan Application?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You have an in-progress application. You can pick up right where you stopped or start completely fresh.
          </p>
        </div>

        {/* Draft Overview Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4.5 space-y-3.5 shadow-lg border border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block">
                Selected Scheme
              </span>
              <h4 className="text-sm font-extrabold text-white mt-0.5">{productName}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Applied Amount
              </span>
              <span className="text-base font-black text-emerald-400 font-mono">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Progress Bar & Step Badge */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sparkles size={13} className="text-yellow-300" />
                <span>Step {currentStep} of 6: <strong>{stepName}</strong></span>
              </span>
              <span className="font-bold text-blue-400 text-[11px]">{progressPercent}% done</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(12, progressPercent)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span>All previously filled inputs and uploaded documents are preserved.</span>
          </div>
        </div>

        {/* Dual Actions */}
        <div className="space-y-2 pt-1">
          {/* Option 1: Resume */}
          <button
            type="button"
            onClick={() => onResume(draft)}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 cursor-pointer"
          >
            <span>Resume from Step {currentStep}</span>
            <ArrowRight size={15} />
          </button>

          {/* Option 2: Start New */}
          {!confirmDiscard ? (
            <button
              type="button"
              onClick={() => setConfirmDiscard(true)}
              className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <RotateCcw size={14} />
              <span>Start New Application</span>
            </button>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-center animate-fade-in">
              <p className="text-[11px] text-amber-800 font-semibold">
                Discard previous details and start fresh from Step 1?
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDiscard(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={discarding}
                  onClick={handleDiscardClick}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>{discarding ? 'Discarding...' : 'Yes, Discard & Start New'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
