import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';
import { 
  Mail, MapPin, Clock, ArrowLeft, 
  Send, CheckCircle2, ShieldCheck, Sparkles, Building2,
  Ticket, HelpCircle, FileText
} from 'lucide-react';

export const ContactUsPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    appNo: '',
    subject: 'Application Status',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Generate random support ticket ID
    const generatedId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(generatedId);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  const scrollToForm = () => {
    const el = document.getElementById('ticket-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white pb-24 relative">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo size="md" theme="dark" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition hover:border-slate-700"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 space-y-12">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-950/60 border border-blue-800/80 text-blue-400">
            <Sparkles size={14} />
            <span>Dedicated Customer Care & Relationship Desk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">RCR Finance</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Have questions about your loan application, eligibility, digital documentation, or repayments? Raise a support ticket with our relationship team for prompt resolution.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Raise Support Ticket - Highlighted Primary */}
          <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border-2 border-blue-600/40 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl shadow-blue-950/20 group hover:border-blue-500/60 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Ticket size={24} />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-1">
                  Primary Helpdesk
                </span>
                <h3 className="text-lg font-bold text-white">Raise Support Ticket</h3>
                <p className="text-xs text-slate-400 mt-1">Submit an online ticket for application tracking, verification, or repayment support.</p>
              </div>
              <div className="pt-2">
                <span className="text-sm font-bold text-blue-400 block font-mono">rcrcontactteam@gmail.com</span>
                <span className="text-[11px] text-slate-400">Average ticket response: &lt; 2 business hours</span>
              </div>
            </div>

            <div className="pt-5">
              <button
                type="button"
                onClick={scrollToForm}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
              >
                <span>Raise Ticket Now</span>
                <Ticket size={14} />
              </button>
            </div>
          </div>

          {/* Email Support */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                <Mail size={22} />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
                  Official Email
                </span>
                <h3 className="text-lg font-bold text-white">Email Support Desk</h3>
                <p className="text-xs text-slate-400 mt-1">Direct inquiries for documentation, NOC issuance, statement requests, or compliance.</p>
              </div>
              <div className="pt-2">
                <a href="mailto:rcrcontactteam@gmail.com" className="text-sm font-bold text-white hover:text-indigo-400 transition block break-all font-mono">
                  rcrcontactteam@gmail.com
                </a>
                <span className="text-[11px] text-slate-400">Mon - Sat: 9:00 AM - 7:00 PM IST</span>
              </div>
            </div>

            <div className="pt-5">
              <a
                href="mailto:rcrcontactteam@gmail.com"
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <span>Send Email</span>
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Corporate Office Location */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <Building2 size={22} />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                  Corporate HQ
                </span>
                <h3 className="text-lg font-bold text-white">Office Address</h3>
                <p className="text-xs text-slate-400 mt-1">Visit our administrative and digital lending operations desk in person.</p>
              </div>
              <div className="pt-2 text-xs text-slate-300">
                <span className="font-semibold text-white block">Rcr finance</span>
                <span>1032 JMD Tower shona road guargon Haryana PIN 122001</span>
              </div>
            </div>

            <div className="pt-5">
              <button
                type="button"
                onClick={scrollToForm}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
              >
                <span>Inquire With Office</span>
                <HelpCircle size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Office & Form Section */}
        <div id="ticket-form-section" className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Office Address & Operating Hours */}
          <div className="lg:col-span-2 space-y-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-7">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 size={18} className="text-blue-400" />
                <span>Registered Headquarters</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Official corporate location of RCR Finance</p>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5">Office Address:</strong>
                  <span className="leading-relaxed">Rcr finance 1032 JMD Tower shona road guargon Haryana PIN 122001</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5">Support Desk Email</strong>
                  <a href="mailto:rcrcontactteam@gmail.com" className="text-blue-400 hover:underline font-mono">
                    rcrcontactteam@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5">Operating Hours</strong>
                  <span>Monday – Saturday: 9:00 AM to 7:00 PM IST</span>
                  <span className="block text-slate-500 text-[11px] mt-0.5">Sunday: Automated digital application processing</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5">RBI Compliance & Security</strong>
                  <span>256-Bit SSL Encrypted • ISO 27001 Certified • RBI Fair Practices Code Compliant</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <Link
                to="/grievance"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center justify-between group"
              >
                <span>RBI Grievance Escalation Redressal</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Interactive Raise Support Ticket Form */}
          <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="text-blue-400" size={20} />
              <h3 className="text-xl font-bold text-white">Raise a Support Ticket</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Submit your inquiry below. All tickets are logged and synchronized directly with our support desk at <strong className="text-slate-300 font-mono">rcrcontactteam@gmail.com</strong>.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-base font-bold text-white">Support Ticket Created Successfully!</h4>
                <div className="inline-block bg-slate-900 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-emerald-300">
                  Ticket Reference: {ticketId}
                </div>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{form.name}</strong>. Your ticket has been logged and forwarded to <strong className="text-white">rcrcontactteam@gmail.com</strong>. Our relationship officer will review your query and reply to <strong className="text-white">{form.email}</strong> within 2 business hours.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', appNo: '', subject: 'Application Status', message: '' });
                    }}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Raise another ticket &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Verma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="anand@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Application Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. APP-20261028-XXXX"
                      value={form.appNo}
                      onChange={(e) => setForm({ ...form, appNo: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Ticket Category *</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="Application Status">Loan Application Status</option>
                      <option value="KYC / Documents Verification">KYC & Document Verification</option>
                      <option value="Disbursement Status">Disbursement Status</option>
                      <option value="Repayment / EMI Schedule">Repayment & EMI Schedule</option>
                      <option value="Stamping / Processing Fee">Stamping & Processing Fee</option>
                      <option value="General Inquiry">General Helpdesk Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Inquiry Details / Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your issue, loan query, or request in detail..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Registering Ticket...</span>
                  ) : (
                    <>
                      <span>Submit Support Ticket</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
