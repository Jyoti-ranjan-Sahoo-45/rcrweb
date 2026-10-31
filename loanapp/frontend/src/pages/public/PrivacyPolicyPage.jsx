import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export const PrivacyPolicyPage = () => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/60 border border-blue-800/80 text-blue-400">
            <ShieldCheck size={14} />
            <span>RBI Digital Lending & Google Play Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated & Effective Date: <strong>March 2026</strong> | RCR Finance NBFC Limited
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          
          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Eye size={18} className="text-blue-400" />
              1. Overview & Commitment to Privacy
            </h2>
            <p>
              RCR Finance ("we", "our", or "us") operates the digital lending web platform and Android mobile application. We are committed to safeguarding the privacy and confidential personal data of all users, loan applicants, and visitors.
            </p>
            <p>
              This Privacy Policy describes what information we collect, how it is processed and stored, who it may be shared with, and your rights regarding data access and account deletion in compliance with the <strong>Reserve Bank of India (RBI) Digital Lending Guidelines (2022/2023)</strong> and the <strong>Google Play Store Financial Services Policy</strong>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-blue-400" />
              2. Information We Collect
            </h2>
            <p>
              To process your digital credit application and comply with mandatory KYC (Know Your Customer) and AML (Anti-Money Laundering) laws, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong>Personal Identity Data:</strong> Full legal name, date of birth, gender, PAN number, Aadhaar number (via paperless OTP verification only), and current residential address.</li>
              <li><strong>Contact Information:</strong> Active mobile telephone number and valid email address for OTP authentications and loan notifications.</li>
              <li><strong>Financial & Employment Details:</strong> Income range, employment type (salaried/self-employed), bank account number, and IFSC code for disbursement.</li>
              <li><strong>Document Media:</strong> Digital copies of ID cards, salary slips, or bank statements explicitly uploaded by you using the camera or file picker.</li>
            </ul>
          </section>

          <section className="bg-blue-950/20 border border-blue-800/40 rounded-2xl p-6 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" />
              3. Strict Limitations on Mobile App Permissions
            </h2>
            <p className="text-slate-300">
              In strict accordance with RBI Digital Lending directives and Google Play Developer policies:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs"><strong>NO Contact List Access:</strong> We NEVER read, access, or harvest your phone contacts.</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="text-xs"><strong>NO Call Logs / SMS Access:</strong> We DO NOT read private SMS or call logs.</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="text-xs"><strong>NO Photo Gallery Harvesting:</strong> Camera/Storage is used purely for explicitly selected KYC documents.</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="text-xs"><strong>NO Background Location Tracking:</strong> We do not track continuous background GPS location.</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Lock size={18} className="text-emerald-400" />
              4. Data Storage, Security & Encryption
            </h2>
            <p>
              All user communication and sensitive data transmitted through our application and servers are protected with <strong>256-bit AES bank-grade encryption</strong> and secure SSL protocols.
            </p>
            <p>
              All data is hosted strictly on secure cloud servers located within the territory of India, in compliance with RBI data localization mandates.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle size={18} className="text-indigo-400" />
              5. Data Sharing & Third-Party Partners
            </h2>
            <p>
              We only share your data with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Regulated credit information bureaus (e.g. CIBIL, Experian, CRIF High Mark) for credit evaluation and reporting.</li>
              <li>Partnered RBI-registered NBFCs and scheduled commercial banks facilitating the loan sanction.</li>
              <li>Authorized payment gateway service providers for processing repayments and disbursements.</li>
              <li>Statutory government bodies upon receiving a lawful, legally binding subpoena or regulatory order.</li>
            </ul>
            <p className="font-semibold text-slate-200">
              We NEVER sell, trade, or rent your personal data to unauthorized third-party marketing brokers.
            </p>
          </section>

          <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-400" />
              6. Your Rights & Account / Data Deletion
            </h2>
            <p>
              You have the full right to review, update, or request the deletion of your account and personal data at any time.
            </p>
            <p>
              To initiate an account and data erasure request, you can visit our dedicated public portal at{' '}
              <Link to="/delete-account" className="text-blue-400 font-bold underline hover:text-blue-300">
                Account Deletion Portal
              </Link>{' '}
              or email us directly at <a href="mailto:privacy@rcrfinance.in" className="text-blue-400 font-bold">privacy@rcrfinance.in</a>. (Subject to statutory loan record retention mandated by RBI for closed loans).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white">
              7. Grievance Redressal Officer
            </h2>
            <p>
              In case of any queries, feedback, or grievances regarding your data privacy, you may contact our designated Grievance Redressal Officer:
            </p>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p><strong>Name:</strong> N. Ramanathan</p>
              <p><strong>Designation:</strong> Chief Grievance & Compliance Officer</p>
              <p><strong>Email:</strong> <a href="mailto:rcrcontactteam@gmail.com" className="text-blue-400 font-mono hover:underline">rcrcontactteam@gmail.com</a></p>
              <p><strong>Corporate Address:</strong> Rcr finance 1032 JMD Tower shona road guargon Haryana PIN 122001</p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};
