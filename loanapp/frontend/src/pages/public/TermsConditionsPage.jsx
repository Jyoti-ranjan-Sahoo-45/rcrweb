import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';
import { FileCheck, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

export const TermsConditionsPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo size="md" theme="dark" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 space-y-10">
        {/* Title Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-slate-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/60 border border-indigo-800/80 text-indigo-400">
            <FileCheck size={14} />
            <span>Borrower Agreement & Platform Terms</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Terms & Conditions
          </h1>
          <p className="text-sm text-slate-400">
            Effective Date: <strong>March 2026</strong> | RCR Finance NBFC Limited
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, registering on, or using the RCR Finance digital web platform or Android mobile application, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">2. Borrower Eligibility Criteria</h2>
            <p>
              To apply for loan products through RCR Finance, you must:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Be a citizen and resident of the Republic of India.</li>
              <li>Be at least 21 years of age and not exceed 58 years of age at the time of loan maturity.</li>
              <li>Possess a valid Permanent Account Number (PAN) and Aadhaar Card.</li>
              <li>Maintain an active, verifiable bank account in an Indian scheduled commercial bank.</li>
            </ul>
          </section>

          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">3. Key Loan Terms, Interest Rates & APR</h2>
            <p>
              All loan products (Personal Express Loans, MSME Business Loans, Two-Wheeler / EV Loans, and Emergency Credit Lines) are sanctioned with full statutory transparency:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Annual Percentage Rate (APR):</strong> Ranges from 10.5% to 24.0% p.a., determined by risk underwriting, credit score, and product category.</li>
              <li><strong>Repayment Tenure:</strong> Flexible options ranging from 3 months to 60 months.</li>
              <li><strong>Processing Fees:</strong> Up to 2% + applicable GST, clearly detailed in your digital Sanction Letter and deducted from the disbursed amount.</li>
              <li><strong>No Upfront Charges:</strong> RCR Finance strictly never asks for cash or advance fee payments prior to disbursal.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">4. Repayment Obligations & Auto-Debit</h2>
            <p>
              The borrower agrees to repay the monthly equated installments (EMIs) on or before the designated monthly due date via approved digital channels (e-NACH auto-debit, UPI, Debit Cards, Net Banking). Late repayments may attract nominal penal interest and will be reported to credit rating agencies (CIBIL/Experian) in accordance with RBI regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">5. Fair Practices Code & Ethical Recovery</h2>
            <p>
              RCR Finance adheres strictly to the RBI Fair Practices Code. We do not engage in any persistent calling, abusive language, public shaming, or contacting relatives/unrelated contacts. All recovery interactions are strictly conducted through verified digital reminders and registered communications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">6. Governing Law & Jurisdiction</h2>
            <p>
              These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};
