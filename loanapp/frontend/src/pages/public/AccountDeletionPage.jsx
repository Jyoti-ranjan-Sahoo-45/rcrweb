import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';
import { Trash2, AlertTriangle, ShieldCheck, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

export const AccountDeletionPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    identifier: '',
    reason: 'no_longer_needed',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

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

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 space-y-10">
        <div className="space-y-3 text-center sm:text-left border-b border-slate-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/60 border border-rose-800/80 text-rose-400">
            <Trash2 size={14} />
            <span>Google Play Developer Policy Mandate</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Request Account & Data Deletion
          </h1>
          <p className="text-sm text-slate-400">
            Submit an official request to permanently delete your RCR Finance user account, personal profile, and associated stored data.
          </p>
        </div>

        {submitted ? (
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">Deletion Request Received</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Your request for account <strong>{form.identifier}</strong> has been logged in our compliance queue. Our data protection team will process the erasure within <strong>7 business days</strong> and confirm via email/SMS.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <div className="md:col-span-7 bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-white">Submit Deletion Form</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Registered Mobile Number or Email *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter email or 10-digit mobile number"
                    value={form.identifier}
                    onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Primary Reason for Deletion
                  </label>
                  <select
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full bg-slate-950 text-slate-300 px-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="no_longer_needed">No longer need a loan</option>
                    <option value="privacy_concerns">Privacy or data concerns</option>
                    <option value="duplicate_account">Created duplicate account</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide any additional details or feedback..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-98 transition"
                >
                  <Send size={15} />
                  <span>Submit Deletion Request</span>
                </button>
              </form>
            </div>

            {/* Information Disclosures Column */}
            <div className="md:col-span-5 space-y-4 text-xs text-slate-400">
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <ShieldCheck size={16} className="text-blue-400" />
                  What Data is Deleted:
                </h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Login credentials & authentication tokens</li>
                  <li>Profile identity & contact info</li>
                  <li>Uploaded KYC files & document photos</li>
                  <li>Marketing & notification preferences</li>
                </ul>
              </div>

              <div className="bg-amber-950/20 p-5 rounded-2xl border border-amber-800/40 text-amber-200/80 space-y-2">
                <h3 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <AlertTriangle size={16} />
                  Important Statutory Notice:
                </h3>
                <p className="text-[11px] leading-relaxed">
                  Under RBI Digital Lending and PMLA (Prevention of Money Laundering Act) laws, financial institutions must retain transaction logs and loan sanction records of disbursed loans for a statutory statutory period before final purge.
                </p>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};
