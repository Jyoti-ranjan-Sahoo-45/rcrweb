import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, Clock, Sparkles, PhoneCall, Phone, MessageSquare } from 'lucide-react';
import { PaymentModal } from '../../components/PaymentModal';

export const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchApp = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setApp(res.data?.data);
    } catch (e) {
      console.error('Failed to load payment info', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApp();
  }, [id]);

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading payment desk...</div>;
  }

  if (!app) {
    return <div className="text-center py-12 text-xs text-slate-500">Application record not found.</div>;
  }

  const rawFee = Number(app?.offer?.processing_fee || 352.82);
  const fee = Math.ceil(rawFee);
  const approvedAmt = Number(app?.offer?.approved_amount || app?.approved_amount || app?.requested_amount || 50000);

  // If payment is already verified and ready for disbursement
  if (app.current_status === 'ready_for_disbursement' || app.paymentRecord?.status === 'verified') {
    const finalDisbAmt = Number(app?.approved_amount || app?.offer?.approved_amount || app?.requested_amount || 50000);
    const finalTenure = Number(app?.approved_tenure_months || app?.offer?.approved_tenure_months || app?.requested_tenure_months || 24);
    const finalRate = Number(app?.approved_interest_rate || app?.offer?.interest_rate || 12.5);
    const rM = finalRate / 12 / 100;
    const finalEmi = app?.offer?.emi_amount ? Number(app.offer.emi_amount) : (rM > 0 ? Math.round((finalDisbAmt * rM * Math.pow(1 + rM, finalTenure)) / (Math.pow(1 + rM, finalTenure) - 1)) : Math.round(finalDisbAmt / finalTenure));

    return (
      <div className="space-y-6 max-w-lg mx-auto py-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles size={13} className="text-emerald-500" />
              <span>Digital Agreement Stamped & Executed</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-2">Stamp Duty Payment Verified!</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your non-judicial digital stamp paper and agreement filing fee of <strong>₹{fee}</strong> has been confirmed.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 text-left space-y-3 shadow-md">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Disbursement Amount</span>
              <span className="text-lg font-black text-emerald-400">₹{finalDisbAmt.toLocaleString('en-IN')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">Monthly EMI</span>
                <span className="font-bold text-white">₹{finalEmi.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Tenure</span>
                <span className="font-bold text-white">{finalTenure} Months</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-left flex gap-2.5 items-start">
            <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold block">Status: Your Loan Amount Final Approval After Verification</span>
              <span className="text-[11px] text-amber-800">
                Amount of ₹{finalDisbAmt.toLocaleString('en-IN')} will be disbursed in 5 to 7 working days to your verified bank account.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/customer/applications/${id}`)}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Go to Application Overview
          </button>
        </div>
      </div>
    );
  }

  const realName = (
    user?.name ||
    app?.user?.name ||
    app?.personalDetails?.full_name ||
    (app?.personalDetails?.first_name ? `${app.personalDetails.first_name} ${app.personalDetails.last_name || ''}`.trim() : '') ||
    'Customer'
  );

  const realEmail = (
    user?.email ||
    app?.user?.email ||
    app?.personalDetails?.email ||
    'service@rcrgroups.shop'
  );

  const realPhone = (
    user?.phone ||
    app?.user?.phone ||
    app?.personalDetails?.phone ||
    ''
  );

  const custName = encodeURIComponent(realName);
  const custEmail = encodeURIComponent(realEmail);
  const custPhone = encodeURIComponent(realPhone);
  const appNo = encodeURIComponent(app?.application_number || `APP-${app.id}`);
  const returnUrl = encodeURIComponent(window.location.href);

  const gatewayUrl = `https://rcrgroups.shop/pay-desk.php?app_id=${app.id}&app_no=${appNo}&amount=${fee}&name=${custName}&email=${custEmail}&phone=${custPhone}&return_url=${returnUrl}&modal=1`;

  // On phone/mobile or Android WebView: direct navigation so Cashfree opens native UPI apps (PhonePe, GPay) directly with NO scanner
  const handleOpenGateway = () => {
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768 || window.AndroidBridge;
    if (isMobile) {
      window.location.href = gatewayUrl.replace('&modal=1', '');
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async (data) => {
    setShowPaymentModal(false);
    await fetchApp();
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-12 pt-2">
      {/* Top Navigation */}
      <button
        type="button"
        onClick={() => navigate(`/customer/applications/${id}`)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Back to Application</span>
      </button>

      {/* Mandatory Top Note: Stamp Duties and Paper Charges */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-blue-400/30 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
          <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
          <span>Note: Stamp Duties and Paper Charges</span>
        </div>
        <p className="text-xs text-blue-100 leading-relaxed">
          As per statutory guidelines under the Indian Stamp Act, non-judicial digital stamp paper procurement, legal documentation, and state revenue stamping total <strong>₹{fee}</strong> (fixed statutory charge).
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-blue-200 bg-white/5 p-2 rounded-xl border border-white/10">
          <span>Non-Judicial E-Stamp: <strong>₹299.00</strong></span>
          <span>•</span>
          <span>GST @ 18%: <strong>₹53.82</strong></span>
          <span>•</span>
          <span className="text-yellow-300 font-black">Total Payable: ₹{fee}</span>
        </div>
      </div>

      {/* Comprehensive Loan & Fee Breakdown Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Approved Loan Terms</span>
            <h2 className="text-lg font-bold text-white">{app.product?.name}</h2>
          </div>
          <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/30">
            {app.application_number}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3.5 rounded-2xl border border-white/10">
          <div>
            <span className="text-slate-400 text-[10px] block">Sanctioned Amount</span>
            <span className="font-extrabold text-white text-sm">₹{approvedAmt.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Tenure & Rate</span>
            <span className="font-extrabold text-white text-sm">{app.offer?.approved_tenure_months || 24} Mo @ {app.offer?.interest_rate || 13.5}%</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Monthly EMI</span>
            <span className="font-bold text-emerald-400 text-xs">₹{Number(app.offer?.emi_amount || 0).toLocaleString('en-IN')} /mo</span>
          </div>
          <div>
            <span className="text-amber-400 font-bold text-[10px] block">Stamp Duties & Paperwork</span>
            <span className="font-extrabold text-amber-300 text-sm">₹{fee}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 italic">
          * Pay the fixed stamp duties and paper charges of ₹{fee} to execute the digital agreement and authorize disbursement of ₹{approvedAmt.toLocaleString('en-IN')} to your bank account.
        </p>
      </div>

      {/* AUTOMATED PAYMENT GATEWAY CHECKOUT (NO SCANNER, NO MANUAL UTR) */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20 border border-emerald-400/30 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wide text-emerald-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            FAST &bull; AUTO-VERIFIED
          </span>
          <span className="text-xs text-emerald-200 font-bold">Official Payment Desk</span>
        </div>

        <div>
          <h3 className="text-lg font-black text-white">Pay Stamping Fee ₹{fee}</h3>
          <p className="text-xs text-emerald-100/90 mt-1">
            Complete your fee payment securely with Google Pay, PhonePe, Paytm, UPI, Debit/Credit Card, or NetBanking. Once paid, your loan status will automatically unlock for disbursement.
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
            Pay ₹{fee} &rarr;
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
      </div>

      {/* Need Help with Payment Support Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <PhoneCall size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-tight">Need Help with Payment?</h4>
              <p className="text-[10px] text-slate-500 font-medium">Direct Support &bull; Loan Desk</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Online Now
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed">
          If you have any difficulty completing payment or have questions regarding stamping, reach out directly on WhatsApp:
        </p>

        <a
          href="https://wa.me/919588746801?text=Hello%20RCR%20Finance%2C%20I%20need%20help%20with%20my%20loan%20stamping%20fee%20payment."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl text-center text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer"
        >
          <MessageSquare size={16} className="fill-white" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>

      {/* In-App Masked Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          fetchApp();
        }}
        onSuccess={handlePaymentSuccess}
        gatewayUrl={gatewayUrl}
        title={`Stamping Fee Payment (₹${fee})`}
      />
    </div>
  );
};

export default PaymentPage;
