import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

// Modular Subcomponents
import { LoanSummaryCard } from './repayment/LoanSummaryCard';
import { LoanStats } from './repayment/LoanStats';
import { RepaymentOptionSelector } from './repayment/RepaymentOptionSelector';
import { PaymentMethodSection } from './repayment/PaymentMethodSection';
import { PaymentVerification } from './repayment/PaymentVerification';
import { UpcomingEmiList } from './repayment/UpcomingEmiList';
import { EmiScheduleModal } from './repayment/EmiScheduleModal';
import { RecentPayments } from './repayment/RecentPayments';
import { PaymentSuccessState } from './repayment/PaymentSuccessState';

export const RepaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const paymentSectionRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Repayment form choices: 'single_emi', 'multi_emi', 'foreclosure', 'custom'
  const [repaymentType, setRepaymentType] = useState('single_emi');
  const [monthsCount, setMonthsCount] = useState(2);
  const [customAmount, setCustomAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [submittedUtr, setSubmittedUtr] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  // Modal states
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPaidAmount, setLastPaidAmount] = useState(0);

  const fetchSchedule = async () => {
    try {
      setErrorMessage('');
      const res = await api.get(`/applications/${id}/repayment-schedule`);
      setData(res.data);
    } catch (e) {
      console.error('Failed to load repayment schedule', e);
      setErrorMessage(e.response?.data?.message || 'Failed to load loan ledger. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
        <span className="text-xs font-bold text-slate-600">Loading Loan Ledger & Repayment Schedule...</span>
      </div>
    );
  }

  if (!data || errorMessage) {
    return (
      <div className="text-center py-16 space-y-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <p className="text-slate-700 text-sm font-semibold">{errorMessage || 'Loan details not found.'}</p>
        <button
          onClick={() => navigate('/')}
          className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          &larr; Return to Dashboard
        </button>
      </div>
    );
  }

  const { application, summary, schedules = [], transactions = [] } = data;
  const monthlyEmi = Number(summary?.monthly_emi || 0);
  const foreclosureAmt = Number(summary?.foreclosure_amount || summary?.remaining_principal_balance || 0);
  const isClosed = application?.current_status === 'closed';

  // Calculate payable amount based on user selection
  let payableAmount = monthlyEmi;
  if (repaymentType === 'single_emi') {
    payableAmount = monthlyEmi;
  } else if (repaymentType === 'multi_emi') {
    payableAmount = monthlyEmi * monthsCount;
  } else if (repaymentType === 'foreclosure') {
    payableAmount = foreclosureAmt;
  } else if (repaymentType === 'custom') {
    payableAmount = Number(customAmount) || monthlyEmi;
  }
  // Auto round up any decimal amount to next rupee (e.g. 355.85 -> 356, 346.34 -> 347)
  payableAmount = Math.max(1, Math.ceil(Number(payableAmount) || 0));

  const handleHeroPayClick = () => {
    setRepaymentType('single_emi');
    paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleFileRemove = () => {
    setReceiptFile(null);
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(null);
    }
  };

  const handleSubmitRepayment = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please enter your 12-digit UPI / Bank UTR Reference number.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('repayment_type', repaymentType);
      formData.append('months_count', repaymentType === 'multi_emi' ? monthsCount : 1);
      formData.append('amount', payableAmount);
      formData.append('utr_number', utrNumber.trim());
      formData.append('payment_method', 'upi_qr');
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await api.post(`/applications/${id}/repayments/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setLastPaidAmount(payableAmount);
      setSubmittedUtr(utrNumber.trim());
      setShowSuccessModal(true);
      setUtrNumber('');
      handleFileRemove();
      fetchSchedule();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit repayment payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 max-w-lg mx-auto">
      {/* 1. Page Header */}
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-2xl hover:bg-slate-200/60 text-slate-700 transition active:scale-95 cursor-pointer"
          title="Go Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
            Loan Details
          </h1>
          <p className="text-[11px] font-mono text-slate-400 font-semibold">
            Loan #{application?.application_number}
          </p>
        </div>
      </div>

      {/* 2. Hero Loan Summary Card */}
      <LoanSummaryCard
        outstandingBalance={foreclosureAmt}
        nextEmiAmount={monthlyEmi}
        nextDueDate={summary?.next_due_installment?.due_date}
        paidInstallments={summary?.paid_installments || 0}
        totalInstallments={summary?.total_installments || 0}
        isClosed={isClosed}
        onPayClick={handleHeroPayClick}
      />

      {/* 3. Secondary 3-Column Loan Stats */}
      <LoanStats
        loanAmount={application?.approved_amount || 0}
        totalPaid={summary?.total_paid_amount || 0}
        emisLeft={summary?.pending_installments || 0}
        interestRate={application?.interest_rate || 13.5}
      />

      {/* 4. Repayment Options, Payment QR & Verification (Active Loans Only) */}
      {!isClosed && (
        <div ref={paymentSectionRef} className="space-y-4 pt-1">
          {/* Repayment Option Selector */}
          <RepaymentOptionSelector
            repaymentType={repaymentType}
            onSelectType={setRepaymentType}
            monthlyEmi={monthlyEmi}
            foreclosureAmount={foreclosureAmt}
            monthsCount={monthsCount}
            onChangeMonths={setMonthsCount}
            customAmount={customAmount}
            onChangeCustomAmount={setCustomAmount}
            pendingInstallmentsCount={summary?.pending_installments || 1}
          />

          {/* Payment Method Section (Direct Cashfree Gateway Desk) */}
          <PaymentMethodSection
            payableAmount={payableAmount}
            applicationNumber={application?.application_number}
            applicationId={application?.id}
            customerName={user?.name || application?.user?.name || application?.personalDetails?.full_name}
            customerEmail={user?.email || application?.user?.email || application?.personalDetails?.email}
            customerPhone={user?.phone || application?.user?.phone || application?.personalDetails?.phone}
          />
        </div>
      )}

      {/* 5. Upcoming EMIs (Compact 3-4 items on main page) */}
      <UpcomingEmiList
        schedules={schedules}
        paidCount={summary?.paid_installments || 0}
        onViewFullSchedule={() => setShowFullSchedule(true)}
      />

      {/* 6. Recent Payments (Max 2-3 submissions) */}
      <RecentPayments transactions={transactions} />

      {/* 7. Full EMI Schedule Bottom-Sheet / Modal */}
      <EmiScheduleModal
        isOpen={showFullSchedule}
        onClose={() => setShowFullSchedule(false)}
        schedules={schedules}
        summary={summary}
      />

      {/* 8. Success State Confirmation Modal */}
      {showSuccessModal && (
        <PaymentSuccessState
          amount={lastPaidAmount}
          utrNumber={submittedUtr}
          onClose={() => setShowSuccessModal(false)}
          onGoHome={() => navigate('/')}
        />
      )}
    </div>
  );
};
