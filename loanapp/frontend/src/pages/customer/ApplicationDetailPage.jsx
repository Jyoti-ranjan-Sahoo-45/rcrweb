import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, FileText, Sparkles, ChevronRight, MessageSquare, Send, ShieldCheck, ArrowUpRight, CreditCard } from 'lucide-react';

export const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const [countdownSeconds, setCountdownSeconds] = useState(60);

  const fetchApp = async (triggerAuto = false) => {
    try {
      const url = triggerAuto ? `/applications/${id}?auto_approve=1` : `/applications/${id}`;
      const res = await api.get(url);
      const appData = res.data?.data;
      setApp(appData);
      if (typeof res.data?.countdown_remaining_seconds === 'number') {
        setCountdownSeconds(res.data.countdown_remaining_seconds);
      }
    } catch (e) {
      console.error('Failed to load application', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApp();
  }, [id]);

  // Automatic 60-second countdown and automatic approval reveal
  useEffect(() => {
    if (!app) return;
    const isPreApproval = ['submitted', 'initial_review', 'document_verification', 'eligibility_review', 'credit_assessment', 'approval_pending'].includes(app.current_status) && (!app.offer || app.offer.status !== 'issued');

    if (!isPreApproval) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          // Time is up! Automatically fetch and reveal approved loan amount without user clicking
          fetchApp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [id, app?.current_status, app?.offer]);

  const handleRespondInfo = async (requestId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await api.post(`/applications/${id}/info-requests/${requestId}/respond`, {
        response_text: replyText,
      });
      setReplyText('');
      fetchApp();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit response.');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading application timeline...</div>;
  }

  if (!app) {
    return <div className="text-center py-12 text-xs text-slate-500">Application not found.</div>;
  }

  const hasPaid = Boolean(app?.paymentRecord && (['verified', 'pending_verification', 'completed'].includes(app?.paymentRecord?.status) || Number(app?.paymentRecord?.amount) > 0)) || Number(app?.offer?.processing_fee) === 0;

  return (
    <div className="space-y-5 pb-6">
      {/* Back Button */}
      <button onClick={() => navigate('/applications')} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} />
        <span>All Applications</span>
      </button>

      {/* Header Summary Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">{app.application_number}</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
            {app.current_status?.replace(/_/g, ' ')}
          </span>
        </div>

        <h2 className="text-lg font-extrabold text-slate-900">{app.product?.name}</h2>

        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl">
          <div>
            <span className="text-slate-400 block text-[10px]">Applied Amount</span>
            <span className="font-extrabold text-slate-800">₹{Number(app.requested_amount).toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Tenure</span>
            <span className="font-extrabold text-slate-800">{app.requested_tenure_months} Months</span>
          </div>
        </div>
      </div>

      {/* 60-Second Algorithmic Approval Countdown Banner */}
      {(!app.offer || app.offer.status !== 'issued') && ['submitted', 'initial_review', 'document_verification', 'eligibility_review', 'credit_assessment', 'approval_pending'].includes(app.current_status) && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-3.5 border border-blue-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="font-bold text-sm">AI Credit Underwriting In Progress</h3>
            </div>
            <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              60-Sec Auto Sanction
            </span>
          </div>

          <p className="text-xs text-blue-100 leading-relaxed">
            Your application is being verified in real time. Your approved loan amount and sanctioned limit will <strong>automatically appear on this screen in {countdownSeconds}s</strong> without having to click.
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${Math.max(5, Math.min(100, ((60 - countdownSeconds) / 60) * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock size={14} className="animate-spin text-emerald-400" />
              <span>Auto-Revealing in: 00:{String(countdownSeconds).padStart(2, '0')}</span>
            </div>
            <button
              onClick={() => {
                fetchApp(true);
              }}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1"
            >
              <span>Reveal Now</span>
              <Sparkles size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Action Banner for Approved Offer */}
      {app.offer && app.offer.status === 'issued' && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-5 shadow-2xl space-y-3 border border-emerald-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-300 animate-pulse" />
              <h3 className="font-black text-sm sm:text-base">🎉 Loan Approved!</h3>
            </div>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
              Offer Ready
            </span>
          </div>
          
          <div className="bg-black/20 p-3 rounded-2xl text-xs space-y-1">
            <div className="flex justify-between text-emerald-100 text-[11px]">
              <span>Applied Amount:</span>
              <span className="line-through">₹{Number(app.requested_amount).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold text-white text-sm pt-0.5 border-t border-white/10">
              <span>Sanctioned Limit:</span>
              <span className="text-yellow-300 text-base font-black">₹{Number(app.offer.approved_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <p className="text-[11px] text-emerald-100 leading-relaxed">
            {hasPaid
              ? '✓ Processing fee already paid & verified. Review terms and accept to authorize direct disbursement.'
              : 'Fixed statutory stamp duties and paper charges: ₹352.82 (₹299 + 18% GST). Review terms and execute your digital loan agreement.'}
          </p>

          <button
            onClick={() => navigate(`/applications/${app.id}/offer`)}
            className="w-full py-3 bg-white text-emerald-900 font-extrabold text-xs rounded-xl shadow-lg hover:bg-emerald-50 active:scale-98 transition flex items-center justify-center gap-1.5"
          >
            <span>Review & Accept Loan Offer</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Action Banner for Formalities */}
      {(app.current_status === 'offer_accepted' || app.current_status === 'agreement_pending') && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="font-bold text-sm">Sign Agreement & Key Fact Statement</h3>
          <p className="text-xs text-blue-100">
            Please review and digitally execute the loan agreement to proceed to disbursement.
          </p>
          <button
            onClick={() => navigate(`/applications/${app.id}/formalities`)}
            className="w-full py-2.5 bg-white text-blue-700 font-bold text-xs rounded-xl shadow hover:bg-blue-50 transition"
          >
            Sign Documents &rarr;
          </button>
        </div>
      )}

      {/* Action Banner for Payment - Only show if not already paid */}
      {app.current_status === 'payment_pending' && !hasPaid && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="font-bold text-sm">Processing Fee Payment Pending</h3>
          <p className="text-xs text-amber-100">
            Pay nominal processing fee of ₹{Math.ceil(Number(app.offer?.processing_fee || 352.82))} via QR / UPI to release funds.
          </p>
          <button
            onClick={() => navigate(`/applications/${app.id}/payment`)}
            className="w-full py-2.5 bg-white text-amber-800 font-bold text-xs rounded-xl shadow hover:bg-amber-50 transition"
          >
            Pay Processing Fee &rarr;
          </button>
        </div>
      )}

      {/* Banner for Payment Verification (24 - 48 Hours) */}
      {app.current_status === 'payment_verification' && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-amber-400 shrink-0" />
            <h3 className="font-bold text-sm">Payment Receipt Under Verification</h3>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            Thank you! Your payment receipt has been submitted. Our operations team is currently verifying the transaction with the bank. <strong>Please allow up to 24-48 hours</strong> for verification and direct loan disbursement to your bank account.
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-blue-200">
            <span className="font-semibold">Submitted UTR:</span>
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">{app.paymentRecord?.utr_number || 'Under Review'}</span>
          </div>
        </div>
      )}

      {/* Banner for Ready for Disbursement / Payment Confirmed & Loan Under Processing */}
      {(app.current_status === 'ready_for_disbursement' || (app.paymentRecord && app.paymentRecord.status === 'verified')) && app.current_status !== 'disbursed' && app.current_status !== 'closed' && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl space-y-4 border-2 border-emerald-500/40">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-4 ring-emerald-500/10">
                <ShieldCheck size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Payment Verified & Approved</span>
                <h3 className="font-black text-base text-white">Payment Confirmed & Loan Under Processing</h3>
              </div>
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1.5">
              <Clock size={12} className="animate-spin" />
              <span>Disbursement In Process</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/40 p-4 rounded-2xl border border-white/10">
            <div>
              <span className="text-slate-400 block text-[11px]">Disbursement Amount</span>
              <span className="text-xl font-black text-emerald-400">
                ₹{Number(app.approved_amount || app.offer?.approved_amount || app.requested_amount).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="sm:border-l border-white/10 sm:pl-3">
              <span className="text-slate-400 block text-[11px]">Monthly EMI</span>
              <span className="text-xl font-black text-yellow-300">
                ₹{Number(app.offer?.emi_amount || Math.round((Number(app.approved_amount || app.requested_amount) * (12.5/12/100) * Math.pow(1 + 12.5/12/100, Number(app.approved_tenure_months || 24))) / (Math.pow(1 + 12.5/12/100, Number(app.approved_tenure_months || 24)) - 1))).toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/mo</span>
              </span>
            </div>
            <div className="sm:border-l border-white/10 sm:pl-3">
              <span className="text-slate-400 block text-[11px]">Tenure & Interest</span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {app.approved_tenure_months || app.offer?.approved_tenure_months || app.requested_tenure_months} Months @ {app.approved_interest_rate || app.offer?.interest_rate || 12.5}% p.a.
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your processing fee / stamp paper charges payment of <strong>₹352.82</strong> has been confirmed and verified. Your loan amount is under final verification approval. Amount will be disbursed within 5 to 7 working days into your registered bank account ({app.financialDetails?.primary_bank_name || 'Bank Account'}, A/C: {app.financialDetails?.account_number || '••••••••'}).
          </p>
        </div>
      )}

      {/* Banner for Disbursed */}
      {app.current_status === 'disbursed' && (
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-300 shrink-0" />
              <h3 className="font-bold text-sm">Loan Disbursed Successfully! 🎉</h3>
            </div>
            <Link
              to={`/applications/${app.id}/repay`}
              className="py-2 px-4 bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs rounded-xl shadow-lg transition inline-flex items-center gap-1.5"
            >
              <CreditCard size={14} />
              <span>Pay EMI / Repay Loan &rarr;</span>
            </Link>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Congratulations! Your loan funds of <strong>₹{Number(app.disbursementRecord?.amount || app.approved_amount || app.requested_amount).toLocaleString('en-IN')}</strong> have been transferred to your registered bank account. You can now manage monthly EMI repayments, advance payments, or full loan foreclosure.
          </p>
          {app.disbursementRecord?.transaction_reference && (
            <div className="text-[11px] text-emerald-200 pt-1">
              Bank Ref / UTR: <span className="font-mono font-bold text-white">{app.disbursementRecord.transaction_reference}</span>
            </div>
          )}
        </div>
      )}

      {/* Banner for Closed Loan */}
      {app.current_status === 'closed' && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-xl space-y-3 border border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
              <h3 className="font-bold text-sm">Loan 100% Repaid & Closed!</h3>
            </div>
            <Link
              to={`/applications/${app.id}/repay`}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 transition"
            >
              View Full Repayment Ledger
            </Link>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All installments have been cleared in full. No outstanding balance remains on this loan.
          </p>
        </div>
      )}


      {/* Open Information Requests (if any) */}
      {app.information_requests?.filter((r) => r.status === 'open').map((req) => (
        <div key={req.id} className="bg-amber-50 border border-amber-200 rounded-3xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <MessageSquare size={16} className="text-amber-600" />
            <span>Staff Information Request</span>
          </div>
          <p className="text-xs text-amber-800">{req.message}</p>

          <div className="space-y-2">
            <textarea
              rows={3}
              placeholder="Enter your response / clarification..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 bg-white"
            />
            <button
              onClick={() => handleRespondInfo(req.id)}
              disabled={submittingReply}
              className="py-2 px-4 bg-amber-600 text-white text-xs font-bold rounded-xl shadow hover:bg-amber-700 transition flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>{submittingReply ? 'Submitting...' : 'Submit Clarification'}</span>
            </button>
          </div>
        </div>
      ))}

      {/* Status History Timeline */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Application Timeline</h3>

        <div className="space-y-4 pl-2 border-l-2 border-slate-100 relative">
          {app.status_history?.map((hist, idx) => (
            <div key={hist.id || idx} className="relative pl-4 space-y-0.5">
              <div className="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-50"></div>
              <h4 className="text-xs font-bold text-slate-800 capitalize">{hist.to_status?.replace(/_/g, ' ')}</h4>
              {hist.remarks && <p className="text-[11px] text-slate-500">{hist.remarks}</p>}
              <span className="text-[10px] text-slate-400 block">{new Date(hist.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
