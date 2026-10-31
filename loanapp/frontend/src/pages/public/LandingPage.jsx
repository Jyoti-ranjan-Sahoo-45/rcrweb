import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';
import { CinematicHero } from '../../components/ui/CinematicHero';
import { FloatingActionWidget } from '../../components/ui/FloatingActionWidget';
import fintechHeroImg from '../../assets/fintech_hero.jpg';
import appMockupImg from '../../assets/rcr_smart_loan_dashboard.png';
import borrowerTrustImg from '../../assets/loan_approved_smile.png';
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Building2,
  Car,
  Home,
  Clock,
  Sparkles,
  CreditCard,
  Calendar,
  IndianRupee,
  Download,
  Smartphone,
  Lock,
  Check,
  Star,
  Award,
  FileCheck,
  TrendingUp,
  Percent,
  Menu,
  X,
  ExternalLink,
  Layers,
  PhoneCall,
  UserCheck,
  Banknote,
  ShieldAlert
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // EMI Calculator State
  const [calcAmount, setCalcAmount] = useState(250000);
  const [calcTenure, setCalcTenure] = useState(24);
  const [calcRate, setCalcRate] = useState(11.5);

  // Product Tabs State
  const [activeProductTab, setActiveProductTab] = useState('personal');

  // FAQ Open State
  const [openFaq, setOpenFaq] = useState(null);

  const calculateEmi = (p, rPct, n) => {
    const r = (rPct / 12) / 100;
    if (r === 0) return Math.round(p / n);
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const monthlyEmi = calculateEmi(calcAmount, calcRate, calcTenure);
  const totalPayable = monthlyEmi * calcTenure;
  const totalInterest = Math.max(0, totalPayable - calcAmount);
  const principalPercentage = Math.round((calcAmount / totalPayable) * 100) || 75;

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const loanProducts = [
    {
      id: 'personal',
      name: 'Personal Express Loan',
      badge: 'Most Popular',
      icon: Zap,
      tagline: 'Instant liquidity for medical, travel, wedding, or sudden lifestyle needs.',
      maxAmount: '₹5,00,000',
      rate: '11.5% - 16.5% p.a.',
      tenure: '3 to 36 Months',
      highlights: [
        'Instant bank credit within 15 mins',
        'Zero physical documentation',
        'No collateral or guarantor required',
        'Flexible part-prepayment with 0 penalty'
      ]
    },
    {
      id: 'business',
      name: 'MSME Business Growth',
      badge: 'High Limit',
      icon: Building2,
      tagline: 'Fuel inventory, manage working capital, or upgrade machinery.',
      maxAmount: '₹15,00,000',
      rate: '12.0% - 18.0% p.a.',
      tenure: '6 to 60 Months',
      highlights: [
        'Quick sanction based on GST / Bank statements',
        'Customized repayment schedule for seasonality',
        'Zero pre-closure charges after 6 EMIs',
        'Direct supplier payment facility'
      ]
    },
    {
      id: 'vehicle',
      name: 'Two-Wheeler & EV Finance',
      badge: 'Low Interest',
      icon: Car,
      tagline: 'Drive home your dream bike, scooter, or electric vehicle today.',
      maxAmount: '₹3,00,000',
      rate: '10.5% - 14.0% p.a.',
      tenure: '12 to 48 Months',
      highlights: [
        'Up to 100% on-road funding available',
        'Special subsidized rates for green EV models',
        'Paperless spot dealership approvals',
        'Affordable EMIs starting at ₹1,899/month'
      ]
    },
    {
      id: 'emergency',
      name: 'Instant Emergency Credit Line',
      badge: 'Revolving Line',
      icon: CreditCard,
      tagline: 'Pre-approved revolving credit for 24/7 peace of mind.',
      maxAmount: '₹1,50,000',
      rate: '1.25% per month',
      tenure: 'Revolving / Flexi',
      highlights: [
        'Withdraw anytime into UPI or Bank in 10 secs',
        'Pay interest only on the amount you withdraw',
        'Repay anytime and replenish your credit limit',
        'No usage fee when credit line sits unused'
      ]
    }
  ];

  const currentProduct = loanProducts.find((p) => p.id === activeProductTab) || loanProducts[0];

  const faqs = [
    {
      q: 'How fast will the loan amount be credited to my bank account?',
      a: 'Once your KYC documents (PAN & Aadhaar) are verified and you e-sign the digital sanction letter, funds are instantly transferred to your linked bank account via IMPS/NEFT within 10 to 15 minutes.'
    },
    {
      q: 'What are the minimum eligibility criteria to apply?',
      a: 'You should be an Indian citizen aged between 21 and 58 years, with a minimum monthly income of ₹15,000 (salaried) or active business operations (self-employed/MSME), and a valid PAN and Aadhaar linked with mobile for OTP.'
    },
    {
      q: 'Is my personal data and banking information safe?',
      a: 'Yes, absolutely. RCR Finance adheres strictly to RBI Digital Lending guidelines and ISO 27001 data security standards. All information transmitted through our platform is encrypted using 256-bit bank-grade SSL.'
    },
    {
      q: 'Are there any hidden charges or advance fees before loan approval?',
      a: 'No! We believe in 100% transparency. There are strictly ZERO upfront or advance fees required to process your application. All standard processing fees are deducted directly from the disbursed loan amount as per the sanction letter.'
    },
    {
      q: 'How do I repay my monthly EMI?',
      a: 'You can easily repay your EMIs through auto-debit (e-NACH), or manually on our customer portal / Android app via UPI (Google Pay, PhonePe, Paytm), Net Banking, or Debit Card with instant receipt generation.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 relative z-50">
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
          Festival Offer
        </span>
        <span>Instant Loan Approvals with 0% Processing Fee on Select MSME & Personal Loans!</span>
        <Link to="/register" className="font-bold underline hover:text-blue-100 hidden sm:inline transition-colors">
          Claim Now &rarr;
        </Link>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <BrandLogo size="md" theme="dark" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#products" className="hover:text-blue-400 transition-colors">Loan Products</a>
            <a href="#calculator" className="hover:text-blue-400 transition-colors">EMI Calculator</a>
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#why-us" className="hover:text-blue-400 transition-colors">Why RCR</a>
            <a href="#app-download" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-emerald-400">
              <Smartphone size={15} />
              <span>Android App</span>
            </a>
            <a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a>
            <Link to="/contact-us" className="hover:text-blue-400 transition-colors">Contact Us</Link>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/admin/login"
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl transition-colors"
            >
              Admin Desk
            </Link>
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-4 py-2.5 rounded-xl transition active:scale-95"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="shimmer-button text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Apply Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-slate-400 hover:text-white lg:hidden rounded-xl bg-slate-900 border border-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/95 border-b border-slate-800 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col space-y-3 font-medium text-slate-300">
              <a href="#products" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800/60">Loan Products</a>
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800/60">EMI Calculator</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800/60">How It Works</a>
              <a href="#why-us" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800/60">Why RCR Finance</a>
              <a href="#app-download" onClick={() => setMobileMenuOpen(false)} className="py-2 text-emerald-400 flex items-center gap-2">
                <Smartphone size={16} />
                <span>Download Android App</span>
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800/60">FAQ</a>
              <Link to="/contact-us" onClick={() => setMobileMenuOpen(false)} className="py-2 text-blue-400 font-semibold">Contact Us</Link>
            </div>
            <div className="pt-4 flex flex-col gap-2.5 border-t border-slate-800">
              <Link
                to="/login"
                className="w-full text-center py-3 text-sm font-bold bg-slate-800 text-white rounded-xl border border-slate-700"
              >
                Sign In to Account
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30"
              >
                Apply for Loan
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 21st.dev Cinematic 3D GSAP Scroll Hero Section */}
      <section className="relative w-full overflow-hidden">
        <CinematicHero
          brandName="RCR FINANCE"
          tagline1="Instant Digital Loans,"
          tagline2="Engineered for Ambition."
          cardHeading="Digital Lending, Redefined."
          cardDescription="Empowering individuals and Indian MSMEs with instant credit up to ₹15,00,000. 100% paperless verification, zero collateral, and real-time bank transfer in 15 minutes."
          metricValue={250000}
          metricLabel="Active Sanction (₹)"
          ctaHeading="Finance your next milestone."
          ctaDescription="Join 48,000+ borrowers across India with instant approvals and zero hidden fees."
        />
      </section>

      {/* Live Social Proof Stats Bar */}
      <section className="border-y border-slate-800/80 bg-slate-900/60 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1 group">
              <span className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent group-hover:scale-105 inline-block transition-transform">
                ₹180+ Cr
              </span>
              <p className="text-xs text-slate-400 font-medium">Loans Disbursed</p>
            </div>
            <div className="space-y-1 group">
              <span className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent group-hover:scale-105 inline-block transition-transform">
                48,000+
              </span>
              <p className="text-xs text-slate-400 font-medium">Happy Borrowers</p>
            </div>
            <div className="space-y-1 group">
              <span className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent group-hover:scale-105 inline-block transition-transform">
                15 Mins
              </span>
              <p className="text-xs text-slate-400 font-medium">Average Sanction Time</p>
            </div>
            <div className="space-y-1 group">
              <span className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent group-hover:scale-105 inline-block transition-transform">
                4.8 / 5 ★
              </span>
              <p className="text-xs text-slate-400 font-medium">Customer App Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Financial EMI Calculator Section */}
      <section id="calculator" className="py-20 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/80 px-3 py-1 rounded-full">
              Financial Transparency
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Interactive Loan EMI Calculator
            </h2>
            <p className="text-sm text-slate-400">
              Plan your monthly budget with precision. Adjust the loan amount, tenure, and interest rate to see real-time amortization and monthly installments.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl max-w-5xl mx-auto card-hover-lift">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Calculator Sliders Column */}
              <div className="lg:col-span-7 space-y-6">
                {/* Amount Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300">Loan Amount</label>
                    <span className="text-base font-black text-blue-400 font-mono bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-800/60 shadow-inner">
                      ₹{calcAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20000}
                    max={1500000}
                    step={10000}
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>₹20,000</span>
                    <span>₹7,50,000</span>
                    <span>₹15,00,000</span>
                  </div>
                </div>

                {/* Tenure Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300">Repayment Tenure</label>
                    <span className="text-base font-black text-indigo-400 font-mono bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-800/60 shadow-inner">
                      {calcTenure} Months ({Math.round(calcTenure / 12 * 10) / 10} Yrs)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={60}
                    step={3}
                    value={calcTenure}
                    onChange={(e) => setCalcTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-all"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>3 Months</span>
                    <span>30 Months</span>
                    <span>60 Months</span>
                  </div>
                </div>

                {/* Interest Rate Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300">Interest Rate (Annual %)</label>
                    <span className="text-base font-black text-emerald-400 font-mono bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800/60 shadow-inner">
                      {calcRate}% p.a.
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10.0}
                    max={24.0}
                    step={0.5}
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>10.0%</span>
                    <span>17.0%</span>
                    <span>24.0%</span>
                  </div>
                </div>
              </div>

              {/* Breakdown Card Column */}
              <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl p-6 border border-slate-800/90 space-y-5 shadow-inner">
                <div className="text-center pb-4 border-b border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Estimated Monthly EMI</span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                    ₹{monthlyEmi.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-slate-500">Per month for {calcTenure} installments</span>
                </div>

                {/* Ratio Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-blue-400">Principal ({principalPercentage}%)</span>
                    <span className="text-amber-400">Interest ({100 - principalPercentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${principalPercentage}%` }} />
                    <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${100 - principalPercentage}%` }} />
                  </div>
                </div>

                {/* Financial Summary Details */}
                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Principal Amount</span>
                    <span className="font-bold text-white font-mono">₹{calcAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Interest Payable</span>
                    <span className="font-bold text-amber-400 font-mono">₹{totalInterest.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                    <span className="font-bold">Total Amount Payable</span>
                    <span className="font-black text-white font-mono text-sm">₹{totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/register?amount=${calcAmount}&tenure=${calcTenure}`)}
                  className="shimmer-button w-full py-3.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <span>Apply for ₹{calcAmount.toLocaleString('en-IN')} Loan</span>
                  <ArrowRight size={15} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Loan Products Matrix */}
      <section id="products" className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
              Tailored Financial Solutions
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Curated Loan Products for Every Milestone
            </h2>
            <p className="text-sm text-slate-400">
              Transparent terms, zero hidden charges, and competitive interest rates crafted for salaried professionals, self-employed individuals, and MSMEs.
            </p>
          </div>

          {/* Product Selector Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
            {loanProducts.map((p) => {
              const Icon = p.icon;
              const isActive = activeProductTab === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProductTab(p.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 scale-105'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Product Detailed Card */}
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto card-hover-lift">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {currentProduct.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{currentProduct.name}</h3>
                </div>
                
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentProduct.tagline}
                </p>

                <div className="space-y-2 pt-2">
                  {currentProduct.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5 bg-slate-950/80 rounded-2xl p-6 border border-slate-800/80 space-y-4 text-center">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Max Loan Sanction</span>
                  <span className="text-3xl font-black text-white font-mono">{currentProduct.maxAmount}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Interest Rate</span>
                    <span className="font-bold text-emerald-400 font-mono">{currentProduct.rate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tenure</span>
                    <span className="font-bold text-slate-200">{currentProduct.tenure}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/register')}
                    className="shimmer-button w-full py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Apply for {currentProduct.name}</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3-Step Frictionless Application Flow */}
      <section id="how-it-works" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/80 px-3 py-1 rounded-full">
              Frictionless Experience
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Get Funded in 3 Simple Steps
            </h2>
            <p className="text-sm text-slate-400">
              No branch visits, no stacks of physical paperwork. Everything happens seamlessly on your phone or computer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-900/70 rounded-3xl p-6 sm:p-8 border border-slate-800 relative space-y-4 card-hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-lg border border-blue-500/30 shadow-md shadow-blue-500/10">
                01
              </div>
              <h3 className="text-lg font-bold text-white">Digital Application</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign up in 60 seconds, input basic identity details, and complete instant paperless Aadhaar OTP & PAN verification.
              </p>
              <div className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                <span>Takes ~2 Minutes</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/70 rounded-3xl p-6 sm:p-8 border border-slate-800 relative space-y-4 card-hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-lg border border-indigo-500/30 shadow-md shadow-indigo-500/10">
                02
              </div>
              <h3 className="text-lg font-bold text-white">Smart Underwriting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our algorithmic risk engine evaluates your credit score and generates a customized sanction letter with clear repayment terms.
              </p>
              <div className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
                <span>Instant Pre-Approval</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/70 rounded-3xl p-6 sm:p-8 border border-slate-800 relative space-y-4 card-hover-lift">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/30 shadow-md shadow-emerald-500/10">
                03
              </div>
              <h3 className="text-lg font-bold text-white">Direct Bank Disbursal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review your digital loan agreement, complete one-click e-sign, and receive funds directly into your verified bank account.
              </p>
              <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <span>Instant Bank IMPS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Comparison Matrix */}
      <section id="why-us" className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/80 px-3 py-1 rounded-full">
              The Digital Advantage
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              RCR Finance vs Traditional Lenders
            </h2>
            <p className="text-sm text-slate-400">
              See why over 48,000 borrowers across India choose our modern digital credit over legacy brick-and-mortar banks.
            </p>
          </div>

          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden max-w-4xl mx-auto shadow-2xl card-hover-lift">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="p-4 sm:p-5 font-bold text-slate-400">Feature Comparison</th>
                    <th className="p-4 sm:p-5 font-bold text-blue-400 bg-blue-950/40">RCR Finance (Digital NBFC)</th>
                    <th className="p-4 sm:p-5 font-bold text-slate-500">Traditional Banks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-slate-300">Disbursal Turnaround Time</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-blue-950/20">⚡ 15 Minutes</td>
                    <td className="p-4 sm:p-5 text-slate-400">7 to 14 Business Days</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-slate-300">Documentation Required</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-blue-950/20">100% Digital (Aadhaar & PAN)</td>
                    <td className="p-4 sm:p-5 text-slate-400">Physical files, salary slips, visits</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-slate-300">Collateral / Security</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-blue-950/20">Zero Collateral Required</td>
                    <td className="p-4 sm:p-5 text-slate-400">Asset pledge or guarantors</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-slate-300">Pre-closure & Part-Payment</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-blue-950/20">0% Penalty Charges</td>
                    <td className="p-4 sm:p-5 text-slate-400">3% to 5% Foreclosure penalty</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-slate-300">Credit Score Impact</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-blue-950/20">Helps Build CIBIL History</td>
                    <td className="p-4 sm:p-5 text-slate-400">Strict 750+ score prerequisite</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Real Borrower Testimonials & Trust Stories */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl card-hover-lift group">
                <img
                  src={borrowerTrustImg}
                  alt="Verified RCR Finance Borrower"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <UserCheck size={16} />
                    <span>Verified MSME Borrower</span>
                  </div>
                  <p className="text-white font-semibold">Pooja Sharma • Boutique Founder, Pune</p>
                  <p className="text-slate-400 text-[11px]">Sanctioned ₹1,50,000 for festive inventory in 20 mins</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
                Real Stories, Real Impact
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Trusted by Everyday Indians & Thriving Business Owners
              </h2>

              <div className="space-y-4">
                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2 card-hover-lift">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "When our family faced a sudden medical hospitalization, traditional banks asked for weeks of paperwork. RCR Finance approved and disbursed ₹2,00,000 straight to my account in 15 minutes. Pure lifesaver!"
                  </p>
                  <div className="text-[11px] font-bold text-slate-400">
                    — Rajesh Verma, Logistics Manager, Delhi
                  </div>
                </div>

                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-2 card-hover-lift">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "I needed urgent working capital to stock raw materials before the festive rush. Applied via the Android app with just my PAN and bank statement, and the funds arrived before noon!"
                  </p>
                  <div className="text-[11px] font-bold text-slate-400">
                    — Amit Hegde, Electronic Goods Retailer, Bengaluru
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Android Mobile App Download Section */}
      <section id="app-download" className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 rounded-3xl border border-blue-800/40 p-8 sm:p-12 shadow-2xl card-hover-lift">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Smartphone size={14} /> Android Mobile App
                </span>
                
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Carry Your Personal Digital NBFC in Your Pocket
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Download the official RCR Finance Android app for instant loan tracking, one-tap UPI EMI repayments, real-time push notifications, and exclusive pre-approved offers.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>One-Tap UPI Repayments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Instant Camera KYC Upload</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Live Sanction Status Tracker</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Download Loan NOC & Statements</span>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <a
                    href="/rcr_finance.apk"
                    download="rcr_finance.apk"
                    className="shimmer-button inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <Download size={18} />
                    <span>Download Android App (APK)</span>
                  </a>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition"
                  >
                    <span>Open Web Portal</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="animate-float max-w-sm rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl">
                  <img
                    src={appMockupImg}
                    alt="RCR Finance Mobile App Screenshot"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq" className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/80 px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400">
              Clear, transparent answers to help you make informed financial decisions.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden transition-all card-hover-lift"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-blue-400 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-slate-400 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final High-Converting CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 relative overflow-hidden text-center text-white">
        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Finance Your Dreams in 15 Minutes?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
            Join 48,000+ satisfied borrowers across India. Apply online now with zero paperwork and experience instant disbursal.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="shimmer-button px-8 py-4 rounded-2xl bg-white text-blue-700 font-black text-sm shadow-2xl hover:bg-blue-50 active:scale-95 transition-all"
            >
              Get Started Now &rarr;
            </Link>
            <Link
              to="/login"
              className="px-6 py-4 rounded-2xl bg-blue-900/60 text-white font-bold text-sm border border-white/20 hover:bg-blue-900 transition active:scale-95"
            >
              Existing Customer Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Comprehensive Enterprise FinTech Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Brand & Regulatory Column */}
            <div className="lg:col-span-2 space-y-4">
              <BrandLogo size="md" theme="dark" />
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                RCR Finance is a premier RBI-compliant digital lending platform providing instant personal credit and MSME business loans across India.
              </p>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>256-Bit SSL Encrypted & ISO 27001 Certified</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Loan Products</h4>
              <ul className="space-y-2">
                <li><a href="#products" className="hover:text-blue-400 transition">Personal Express Loan</a></li>
                <li><a href="#products" className="hover:text-blue-400 transition">MSME Business Credit</a></li>
                <li><a href="#products" className="hover:text-blue-400 transition">Two-Wheeler / EV Loan</a></li>
                <li><a href="#products" className="hover:text-blue-400 transition">Emergency Credit Line</a></li>
              </ul>
            </div>

            {/* Platform & Portals */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Portals & Policies</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-blue-400 transition">Customer Sign In</Link></li>
                <li><Link to="/register" className="hover:text-blue-400 transition">Apply for New Loan</Link></li>
                <li><a href="/rcr_finance.apk" download="rcr_finance.apk" className="hover:text-emerald-400 transition font-bold">Download Android APK</a></li>
                <li><Link to="/delete-account" className="hover:text-rose-400 transition">Delete Account & Data</Link></li>
                <li><Link to="/grievance" className="hover:text-amber-400 transition">Grievance Redressal</Link></li>
                <li><Link to="/contact-us" className="hover:text-emerald-400 transition font-bold">Contact Us & Support</Link></li>
                <li><Link to="/admin/login" className="hover:text-slate-400 transition">Admin / Staff Desk</Link></li>
              </ul>
            </div>

            {/* Support & Grievance */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Support & Helpdesk</h4>
              <ul className="space-y-2 text-[11px]">
                <li>Support Email: <a href="mailto:rcrcontactteam@gmail.com" className="text-blue-400 font-mono hover:underline">rcrcontactteam@gmail.com</a></li>
                <li>Helpdesk: <Link to="/contact-us" className="text-emerald-400 font-bold hover:underline">Raise Support Ticket &rarr;</Link></li>
                <li>Hours: Mon - Sat (9:00 AM - 7:00 PM)</li>
                <li>Grievance Officer: N. Ramanathan</li>
              </ul>
            </div>

          </div>

          {/* Statutory Disclosures */}
          <div className="pt-8 border-t border-slate-800/80 space-y-3 text-[11px] text-slate-500 leading-relaxed">
            <p>
              <strong className="text-slate-400">RBI Regulatory Disclosure:</strong> RCR Finance facilitates digital lending solutions in partnership with RBI-registered Non-Banking Financial Companies (NBFCs) and scheduled commercial banks. Loan sanction, APR determination, and disbursals are subject to credit underwriting and borrower eligibility criteria.
            </p>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5 pt-6 border-t border-slate-800/80">
              <p className="text-xs text-slate-500 text-center lg:text-left">
                &copy; {new Date().getFullYear()} RCR Finance NBFC Limited. All Rights Reserved.
              </p>

              {/* Eye-Catching Developer Badge */}
              <a
                href="https://serviceexhibition.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/50 hover:border-blue-400 text-xs shadow-lg shadow-indigo-500/20 hover:shadow-blue-500/35 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                title="Visit Service Exhibition - Software & Digital Studio"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>
                </span>
                <span className="text-slate-400 group-hover:text-slate-200 text-[11px] font-medium tracking-wide">Developed by</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 font-black tracking-wide text-xs group-hover:from-blue-300 group-hover:to-cyan-200">
                  Service Exhibition
                </span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform text-xs font-bold">&rarr;</span>
              </a>

              <div className="flex items-center gap-4 text-xs">
                <Link to="/privacy-policy" className="hover:underline text-slate-400 hover:text-white">Privacy Policy</Link>
                <Link to="/terms" className="hover:underline text-slate-400 hover:text-white">Terms</Link>
                <Link to="/delete-account" className="hover:underline text-slate-400 hover:text-white">Account Deletion</Link>
                <Link to="/grievance" className="hover:underline text-slate-400 hover:text-white">Grievance</Link>
                <Link to="/contact-us" className="hover:underline text-slate-400 hover:text-white">Contact Us</Link>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Action Widget */}
      <FloatingActionWidget />
    </div>
  );
};
