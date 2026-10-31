import React, { useState } from 'react';
import { Zap, ShieldCheck, Lock } from 'lucide-react';
import { PaymentModal } from '../../../components/PaymentModal';

export const PaymentMethodSection = ({
  payableAmount = 0,
  applicationNumber = '',
  applicationId = '',
  customerName = 'Customer',
  customerEmail = 'rcrcontactteam@gmail.com',
  customerPhone = '',
  onPaymentSuccess,
}) => {
  const [showModal, setShowModal] = useState(false);
  const roundedAmount = Math.ceil(Number(payableAmount) || 0);

  const returnUrl = encodeURIComponent(window.location.href);
  const custName = encodeURIComponent(customerName || 'Customer');
  const custEmail = encodeURIComponent(customerEmail || 'rcrcontactteam@gmail.com');
  const custPhone = encodeURIComponent(customerPhone || '9999999999');
  const appNo = encodeURIComponent(applicationNumber || `APP-${applicationId}`);
  
  const gatewayUrl = `https://rcrgroups.shop/pay-desk.php?app_id=${applicationId}&app_no=${appNo}&amount=${roundedAmount}&name=${custName}&email=${custEmail}&phone=${custPhone}&return_url=${returnUrl}&modal=1`;

  const handleOpenGateway = () => {
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768 || window.AndroidBridge;
    if (isMobile) {
      window.location.href = gatewayUrl.replace('&modal=1', '');
    } else {
      setShowModal(true);
    }
  };

  const handleSuccess = (data) => {
    setShowModal(false);
    if (typeof onPaymentSuccess === 'function') {
      onPaymentSuccess(data);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20 border border-emerald-400/30 space-y-4">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wide text-emerald-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
          FAST &bull; AUTO-VERIFIED
        </span>
        <span className="text-xs text-emerald-200 font-bold">Official Payment Desk</span>
      </div>

      <div>
        <h3 className="text-lg font-black text-white">Pay Amount ₹{roundedAmount.toLocaleString('en-IN')}</h3>
        <p className="text-xs text-emerald-100/90 mt-1">
          Complete your payment securely with Google Pay, PhonePe, Paytm, UPI, Debit/Credit Card, or NetBanking. Once paid, your installment will automatically be marked as cleared.
        </p>
      </div>

      <button
        type="button"
        onClick={handleOpenGateway}
        className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-emerald-50 active:scale-[0.98] text-slate-900 font-black text-sm shadow-xl transition flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
            ⚡
          </div>
          <div className="text-left">
            <div className="text-sm font-black text-slate-900">Proceed to Secure Payment</div>
            <div className="text-[10px] text-slate-500 font-semibold">GPay &bull; PhonePe &bull; Paytm &bull; Cards &bull; NetBanking</div>
          </div>
        </div>
        <span className="text-xs bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold group-hover:bg-emerald-700 transition flex items-center gap-1">
          Pay ₹{roundedAmount} &rarr;
        </span>
      </button>

      <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-emerald-200">
        <span className="flex items-center gap-1">
          <Lock size={12} /> 256-Bit SSL Encrypted
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} /> Instant Automated Verification
        </span>
      </div>

      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        gatewayUrl={gatewayUrl}
        title={`EMI Payment (₹${roundedAmount})`}
      />
    </div>
  );
};

