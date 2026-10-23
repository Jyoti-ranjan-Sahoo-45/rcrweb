import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  gatewayUrl,
  title = 'Digital Verification & Stamping'
}) => {
  const [iframeLoading, setIframeLoading] = useState(true);

  // Listen for Cashfree / Gateway success postMessage from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Validate payment success message
      if (event.data && event.data.type === 'RCR_PAYMENT_SUCCESS') {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if canvas-confetti fails
        }
        if (typeof onSuccess === 'function') {
          onSuccess(event.data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess]);

  // Reset loading state when url changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setIframeLoading(true);
      // Disable background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, gatewayUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden relative"
        style={{ height: 'min(760px, 92vh)' }}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{title}</span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  SSL Encrypted
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Official Cashfree Gateway Checkout
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Open in new tab fallback */}
            <a
              href={gatewayUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open full page"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <ExternalLink size={15} />
            </a>
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close payment window"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Iframe Viewport */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/95 text-white gap-3 p-6 text-center">
              <RefreshCw size={28} className="text-emerald-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Connecting to Secure Payment Desk...</p>
                <p className="text-[11px] text-slate-400">Loading Cashfree PG 256-Bit SSL Checkout</p>
              </div>
            </div>
          )}

          <iframe
            src={gatewayUrl}
            title="Secure Payment Desk"
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0"
            allow="payment; camera; microphone"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation"
          />
        </div>

        {/* Modal Bottom Security Notice */}
        <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1 text-slate-400">
            <Lock size={11} className="text-emerald-400" /> 256-Bit End-to-End Encryption
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Cancel / Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
