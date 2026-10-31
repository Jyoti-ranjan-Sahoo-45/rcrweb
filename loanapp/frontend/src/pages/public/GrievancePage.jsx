import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';
import { ShieldCheck, PhoneCall, Mail, Building, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const GrievancePage = () => {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 space-y-10">
        <div className="space-y-3 text-center sm:text-left border-b border-slate-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
            <ShieldCheck size={14} />
            <span>RBI Statutory Disclosure & Customer Protection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Grievance Redressal Mechanism
          </h1>
          <p className="text-sm text-slate-400">
            RCR Finance is committed to resolving customer complaints and grievances promptly, fairly, and transparently in accordance with RBI guidelines.
          </p>
        </div>

        {/* Escalation Matrix */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-white">Grievance Escalation Matrix</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level 1 */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Level 1: Customer Helpdesk
              </span>
              <h3 className="text-base font-bold text-white">First Point of Contact</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                For standard queries regarding loan status, repayments, NOC, or portal technical support.
              </p>
              <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
                <p><strong>Support & Ticket Email:</strong> <a href="mailto:rcrcontactteam@gmail.com" className="text-blue-400 font-mono hover:underline">rcrcontactteam@gmail.com</a></p>
                <p><strong>Turnaround:</strong> 24 - 48 hours</p>
              </div>
            </div>

            {/* Level 2 */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Level 2: Grievance Officer
              </span>
              <h3 className="text-base font-bold text-white">Nodal Officer Escalation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If your complaint is not resolved within 7 business days or you are unsatisfied with the resolution.
              </p>
              <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
                <p><strong>Officer:</strong> N. Ramanathan</p>
                <p><strong>Email:</strong> grievance@rcrfinance.in</p>
                <p><strong>Turnaround:</strong> 3 - 5 business days</p>
              </div>
            </div>

            {/* Level 3 */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Level 3: RBI Ombudsman
              </span>
              <h3 className="text-base font-bold text-white">Reserve Bank of India</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If the grievance is not addressed within 30 days from registration of complaint.
              </p>
              <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
                <p><strong>Portal:</strong> cms.rbi.org.in</p>
                <p><strong>Toll-Free:</strong> 14448 (RBI Helpline)</p>
                <p><strong>Mode:</strong> Online CMS Portal</p>
              </div>
            </div>
          </div>

          {/* Corporate Office Address Details */}
          <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 space-y-2 text-xs sm:text-sm text-slate-300">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Building size={16} className="text-blue-400" />
              Registered Office & Nodal Officer Details
            </h3>
            <p><strong>Entity Name:</strong> RCR Finance NBFC Limited</p>
            <p><strong>Corporate Identification Number (CIN):</strong> U65923KA2021PTC148892</p>
            <p><strong>Office Address:</strong> Rcr finance 1032 JMD Tower shona road guargon Haryana PIN 122001</p>
            <p><strong>Working Hours:</strong> Monday through Saturday, 9:30 AM to 6:30 PM (Excluding public holidays).</p>
          </div>
        </div>
      </main>
    </div>
  );
};
