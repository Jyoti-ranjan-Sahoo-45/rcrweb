import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';
import { NeedHelpWidget } from '../../components/NeedHelpWidget';
import { 
  PhoneCall, Mail, MapPin, Clock, MessageSquare, ArrowLeft, 
  Send, CheckCircle2, ShieldCheck, Sparkles, Building2
} from 'lucide-react';

export const ContactUsPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const whatsappUrl = 'https://wa.me/919588746801?text=Hello%20RCR%20Finance%2C%20I%20have%20an%20inquiry.';

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
            <Sparkles size={14} />
            <span>Dedicated Customer Care & Relationship Desk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">RCR Finance</span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Have questions about your loan application, eligibility, digital documentation, or repayments? Our team is available 6 days a week to assist you.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* WhatsApp Support - Highlighted */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-600/40 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl shadow-emerald-950/20 group hover:border-emerald-500/60 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#25D366]/20 text-[#25D366] rounded-2xl flex items-center justify-center border border-[#25D366]/30">
                <MessageSquare size={24} className="fill-[#25D366]" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#25D366]/20 text-emerald-300 border border-[#25D366]/30 mb-1">
                  Fastest Support
                </span>
                <h3 className="text-lg font-bold text-white">WhatsApp Desk</h3>
                <p className="text-xs text-slate-400 mt-1">Instant digital assistance for document verification and application queries.</p>
              </div>
              <div className="pt-2">
                <span className="text-base font-bold text-white block">+91 95887 46801</span>
                <span className="text-[11px] text-emerald-400">Average response: &lt; 5 mins</span>
              </div>
            </div>

            <div className="pt-5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <span>Chat on WhatsApp</span>
                <MessageSquare size={14} className="fill-white" />
              </a>
            </div>
          </div>

          {/* Phone Hotline */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <PhoneCall size={22} />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-1">
                  Direct Line
                </span>
                <h3 className="text-lg font-bold text-white">Phone Support</h3>
                <p className="text-xs text-slate-400 mt-1">Speak directly with our loan operations & verification officers.</p>
              </div>
              <div className="pt-2">
                <a href="tel:+919588746801" className="text-base font-bold text-white hover:text-blue-400 transition block">
                  +91 95887 46801
                </a>
                <span className="text-[11px] text-slate-400">Mon - Sat: 9:00 AM - 7:00 PM IST</span>
              </div>
            </div>

            <div className="pt-5">
              <a
                href="tel:+919588746801"
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <span>Call Helpline</span>
                <PhoneCall size={14} />
              </a>
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
                <h3 className="text-lg font-bold text-white">Email Desk</h3>
                <p className="text-xs text-slate-400 mt-1">For formal queries, loan statement requests, or compliance escalations.</p>
              </div>
              <div className="pt-2">
                <a href="mailto:support@rcrfinance.in" className="text-sm font-bold text-white hover:text-indigo-400 transition block break-all">
                  support@rcrfinance.in
                </a>
                <span className="text-[11px] text-slate-400">Grievance: grievance@rcrfinance.com</span>
              </div>
            </div>

            <div className="pt-5">
              <a
                href="mailto:support@rcrfinance.in"
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <span>Send Email</span>
                <Mail size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Office & Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
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
                  <strong className="block text-white mb-0.5">Corporate Office</strong>
                  <span>Nobal Enclave, Near Tau Devi Lal Park, Gurugram, Haryana - 122001, India</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5">Operating Hours</strong>
                  <span>Monday – Saturday: 9:00 AM to 7:00 PM IST</span>
                  <span className="block text-slate-500 text-[11px] mt-0.5">Sunday: Emergency support & automated disbursal desk</span>
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

          {/* Interactive Contact Query Form */}
          <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-1">Send Us a Direct Message</h3>
            <p className="text-xs text-slate-400 mb-6">Fill in your inquiry details and our team will get back to you within 2 business hours.</p>

            {submitted ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-base font-bold text-white">Message Received!</h4>
                <p className="text-xs text-slate-300">
                  Thank you, <strong>{form.name}</strong>. Your query has been logged. Our relationship manager will reach out to you at <strong>{form.phone || form.email}</strong> shortly.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Send another query &rarr;
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
                    <label className="block font-semibold text-slate-300 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Query Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Application Status">Application Status</option>
                      <option value="KYC / Documents Verification">KYC / Documents Verification</option>
                      <option value="Repayment / EMI Schedule">Repayment / EMI Schedule</option>
                      <option value="Stamping / Processing Fee">Stamping / Processing Fee</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Message / Question *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question or how we can assist you..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Sending message...</span>
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Floating WhatsApp Action Widget - ONLY on this Contact Us page */}
      <NeedHelpWidget />
    </div>
  );
};
