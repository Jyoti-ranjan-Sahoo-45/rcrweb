import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckSquare, Square, ShieldCheck, FileCheck, ArrowRight, Download } from 'lucide-react';

export const FormalitiesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ackKfs, setAckKfs] = useState(false);
  const [ackAgreement, setAckAgreement] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        setApp(res.data?.data);
      } catch (e) {
        console.error('Failed to load formalities', e);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const handleSign = async () => {
    if (!ackKfs || !ackAgreement) {
      alert('Please check both checkboxes to acknowledge the Key Fact Statement and Loan Agreement.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/applications/${id}/formalities/sign`, {
        acknowledge_kfs: true,
        acknowledge_agreement: true,
      });

      confetti({ particleCount: 80, spread: 60 });
      if (res.data?.next_status === 'payment_pending' && !res.data?.fee_already_cleared) {
        navigate(`/applications/${id}/payment`);
      } else {
        navigate(`/applications/${id}`);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to sign formalities.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading formalities...</div>;
  }

  const offer = app?.offer;

  return (
    <div className="space-y-5 pb-6">
      <button onClick={() => navigate(`/applications/${id}`)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} />
        <span>Back to Application</span>
      </button>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-2">
        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Formalities & Compliance</span>
        <h2 className="text-lg font-extrabold text-slate-900">Key Fact Statement (KFS) & Agreement</h2>
        <p className="text-xs text-slate-500">
          Review the regulatory disclosures and click below to digitally execute the agreement.
        </p>
      </div>

      {/* Disclosures Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
          <span>Loan Disclosure Item</span>
          <span>Terms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Sanctioned Amount</span>
          <span className="font-bold text-slate-900">₹{Number(offer?.approved_amount).toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Annual Percentage Rate (APR)</span>
          <span className="font-bold text-slate-900">{offer?.interest_rate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Repayment Schedule</span>
          <span className="font-bold text-slate-900">{offer?.approved_tenure_months} Monthly Equated Installments (EMIs)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Monthly EMI Amount</span>
          <span className="font-bold text-blue-600">₹{Number(offer?.emi_amount).toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">One-Time Processing Fee</span>
          <span className="font-bold text-slate-900">₹{Number(offer?.processing_fee).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Checkboxes for Digital Execution */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
        <div
          onClick={() => setAckKfs(!ackKfs)}
          className="flex items-start gap-3 cursor-pointer select-none p-2 rounded-xl hover:bg-slate-50 transition"
        >
          {ackKfs ? <CheckSquare size={20} className="text-blue-600 shrink-0 mt-0.5" /> : <Square size={20} className="text-slate-400 shrink-0 mt-0.5" />}
          <p className="text-xs text-slate-700 leading-relaxed">
            I have read and acknowledged the <strong>Key Fact Statement (KFS)</strong> including APR, interest rate, and fees.
          </p>
        </div>

        <div
          onClick={() => setAckAgreement(!ackAgreement)}
          className="flex items-start gap-3 cursor-pointer select-none p-2 rounded-xl hover:bg-slate-50 transition"
        >
          {ackAgreement ? <CheckSquare size={20} className="text-blue-600 shrink-0 mt-0.5" /> : <Square size={20} className="text-slate-400 shrink-0 mt-0.5" />}
          <p className="text-xs text-slate-700 leading-relaxed">
            I agree to digitally execute the <strong>Loan Agreement</strong> and authorize debit for monthly installments as agreed.
          </p>
        </div>
      </div>

      <button
        onClick={handleSign}
        disabled={!ackKfs || !ackAgreement || submitting}
        className={`w-full py-3.5 text-xs font-bold text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 transition ${
          ackKfs && ackAgreement ? 'gradient-success shadow-emerald-500/20 active:scale-98' : 'bg-slate-300 cursor-not-allowed'
        }`}
      >
        <FileCheck size={16} />
        <span>{submitting ? 'Signing Digital Documents...' : 'Sign Agreement & Proceed'}</span>
      </button>
    </div>
  );
};
