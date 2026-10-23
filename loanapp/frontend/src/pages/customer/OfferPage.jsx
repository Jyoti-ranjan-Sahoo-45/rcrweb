import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

export const OfferPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        setApp(res.data?.data);
      } catch (e) {
        console.error('Failed to load offer', e);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      await api.post(`/applications/${id}/offer/accept`);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        navigate(`/applications/${id}/formalities`);
      }, 1500);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to accept offer.');
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    const reason = prompt('Please enter reason for declining the offer (Optional):');
    setProcessing(true);
    try {
      await api.post(`/applications/${id}/offer/decline`, { decline_reason: reason });
      navigate(`/applications/${id}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to decline offer.');
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading offer details...</div>;
  }

  const offer = app?.offer;
  if (!offer) {
    return <div className="text-center py-12 text-xs text-slate-500">No active offer for this application.</div>;
  }

  const hasPaid = Boolean(app?.paymentRecord && (['verified', 'pending_verification', 'completed'].includes(app.paymentRecord.status) || Number(app.paymentRecord.amount) > 0)) || Number(offer.processing_fee) === 0;

  return (
    <div className="space-y-5 pb-6">
      <button onClick={() => navigate(`/applications/${id}`)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} />
        <span>Back to Application</span>
      </button>

      {/* Main Offer Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-blue-200">{offer.offer_number}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
            Approved Terms
          </span>
        </div>

        <div>
          <span className="text-xs text-blue-200 block">Sanctioned Loan Amount</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5">₹{Number(offer.approved_amount).toLocaleString('en-IN')}</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
            <span className="text-blue-200 block text-[10px]">Monthly EMI</span>
            <span className="text-base font-bold">₹{Number(offer.emi_amount).toLocaleString('en-IN')}/mo</span>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
            <span className="text-blue-200 block text-[10px]">Interest Rate</span>
            <span className="text-base font-bold">{offer.interest_rate}% p.a.</span>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
            <span className="text-blue-200 block text-[10px]">Tenure</span>
            <span className="text-base font-bold">{offer.approved_tenure_months} Months</span>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
            <span className="text-blue-200 block text-[10px]">Stamp & Paperwork</span>
            <span className={`text-base font-bold ${hasPaid ? 'text-emerald-300' : ''}`}>
              {hasPaid ? '₹0.00 (Paid)' : `₹${Math.ceil(Number(offer.processing_fee || 352.82))}`}
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Stamping & Paperwork Charge Note */}
      {hasPaid ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Processing Fee & Stamp Duty Already Cleared (₹{Math.ceil(Number(offer.processing_fee || 352.82))} Paid)</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            One application requires <strong>only one processing fee</strong>. Your statutory stamp duties and paper charges have already been recorded. <strong>No additional payment is required</strong> for these revised terms.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <ShieldCheck size={16} className="text-blue-600 shrink-0" />
            <span>Stamp Duties and Paper Charges (Fixed)</span>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            Statutory non-judicial digital stamp duty of <strong>₹299.00 + 18% GST (₹53.82) = Total ₹{Math.ceil(Number(offer.processing_fee || 352.82))}</strong> is required upon acceptance for legal e-agreement registration before final loan disbursement.
          </p>
        </div>
      )}

      {/* Terms breakdown */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3 text-xs">
        <h3 className="font-bold text-slate-900">Commercial Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Sanctioned Principal</span>
            <span className="font-semibold text-slate-900">₹{Number(offer.approved_amount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Total Interest Payable</span>
            <span className="font-semibold text-slate-900">₹{(offer.emi_amount * offer.approved_tenure_months - offer.approved_amount).toFixed(0)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Stamp Duties & Paperwork</span>
            <span className={`font-semibold ${hasPaid ? 'text-emerald-600 font-bold' : 'text-slate-900'}`}>
              {hasPaid ? '₹0.00 (Already Paid & Confirmed)' : `₹${Math.ceil(Number(offer.processing_fee || 352.82))}`}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Total Repayment Amount</span>
            <span className="font-bold text-blue-600">₹{Number(offer.total_payable).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <button
          onClick={handleAccept}
          disabled={processing}
          className="w-full py-3.5 text-xs font-bold text-white gradient-success rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-98 transition"
        >
          <CheckCircle2 size={16} />
          <span>{processing ? 'Processing Acceptance...' : (hasPaid ? 'Accept Revised Terms & Proceed' : 'Accept Loan Offer')}</span>
        </button>

        <button
          onClick={handleDecline}
          disabled={processing}
          className="w-full py-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-2xl transition"
        >
          Decline Offer
        </button>
      </div>
    </div>
  );
};
