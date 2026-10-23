import React, { useRef } from 'react';
import { ShieldCheck, Upload, FileText, CheckCircle2, X, RefreshCw, AlertCircle } from 'lucide-react';

export const PaymentVerification = ({
  utrNumber = '',
  onChangeUtr,
  receiptFile = null,
  receiptPreview = null,
  onFileSelect,
  onFileRemove,
  submitting = false,
  payableAmount = 0,
  onSubmit,
}) => {
  const fileInputRef = useRef(null);

  const handleCustomUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-emerald-600" />
        <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
          Step 3: Payment Verification
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* 12-Digit Reference UTR Number Input */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            UPI / Bank Reference Number (UTR) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 423456789012"
            value={utrNumber}
            onChange={(e) => onChangeUtr(e.target.value)}
            className="w-full text-xs sm:text-sm font-mono font-bold px-3.5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
            required
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Found in your UPI app transaction details as "UPI Ref ID" or "UTR".
          </p>
        </div>

        {/* Custom Screenshot Upload UI */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Payment Screenshot <span className="text-slate-400 font-normal">(Optional for faster approval)</span>
          </label>

          {/* Hidden native input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,.pdf"
            onChange={onFileSelect}
            className="hidden"
          />

          {!receiptFile ? (
            <button
              type="button"
              onClick={handleCustomUploadClick}
              className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-600 transition active:scale-99 cursor-pointer"
            >
              <div className="p-2 rounded-full bg-blue-100/80 text-blue-600">
                <Upload size={18} />
              </div>
              <span className="text-xs font-bold text-slate-800">+ Upload Screenshot / Receipt</span>
              <span className="text-[10px] text-slate-400">PNG, JPG, PDF up to 5MB</span>
            </button>
          ) : (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {receiptPreview ? (
                  <img
                    src={receiptPreview}
                    alt="Receipt thumbnail"
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {receiptFile.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {(receiptFile.size / 1024).toFixed(1)} KB • Ready to submit
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCustomUploadClick}
                  className="px-2.5 py-1.5 text-[11px] font-bold text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl transition cursor-pointer"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={onFileRemove}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Submit CTA */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
        >
          {submitting ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Verifying & Submitting Proof...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              <span>Submit Payment ₹{Number(payableAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
