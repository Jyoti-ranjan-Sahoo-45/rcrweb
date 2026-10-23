import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Zap, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, User, Building2, Car, Home, Clock, Sparkles, CreditCard, Calendar, IndianRupee, RotateCcw } from 'lucide-react';
import { DraftResumeModal } from '../../components/DraftResumeModal';

const iconMap = {
  User,
  Building2,
  Car,
  Home,
  Zap,
};

export const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDraftModal, setShowDraftModal] = useState(false);

  // Instant Calculator State
  const [calcAmount, setCalcAmount] = useState(100000);
  const [calcTenure, setCalcTenure] = useState(24);
  const [calcRate, setCalcRate] = useState(13.5);

  const calculateEmi = (p, rPct, n) => {
    const r = (rPct / 12) / 100;
    if (r === 0) return Math.round(p / n);
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data?.data || []);

        if (user) {
          const dashRes = await api.get('/customer/dashboard');
          setDashboardData(dashRes.data);

          if (dashRes.data?.next_action?.is_draft && !sessionStorage.getItem('rcr_draft_prompt_dismissed')) {
            setShowDraftModal(true);
          }
        }
      } catch (e) {
        console.warn('Error fetching homepage data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleResumeDraft = (draft) => {
    sessionStorage.setItem('rcr_draft_prompt_dismissed', 'true');
    setShowDraftModal(false);
    if (dashboardData?.next_action?.action_url) {
      navigate(dashboardData.next_action.action_url);
    } else {
      navigate(`/apply?draft=${draft?.id || dashboardData?.next_action?.draft_id}`);
    }
  };

  const handleStartNew = async (draftId) => {
    const idToDelete = draftId || dashboardData?.next_action?.draft_id;
    if (idToDelete) {
      try {
        await api.delete(`/applications/draft/${idToDelete}`);
      } catch (e) {
        console.warn('Failed to discard draft', e);
      }
    }
    setShowDraftModal(false);
    sessionStorage.removeItem('rcr_draft_prompt_dismissed');
    try {
      const dashRes = await api.get('/customer/dashboard');
      setDashboardData(dashRes.data);
    } catch (e) {
      console.warn('Failed to refresh dashboard', e);
    }
  };

  const handleCloseModal = () => {
    sessionStorage.setItem('rcr_draft_prompt_dismissed', 'true');
    setShowDraftModal(false);
  };

  const emi = calculateEmi(calcAmount, calcRate, calcTenure);

  return (
    <div className="space-y-6 pb-6">
      {/* Active Application Action Banner (if active & not repayment) */}
      {dashboardData?.next_action && !dashboardData?.next_action?.is_repayment && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shrink-0">
              <Sparkles size={22} className="text-yellow-300" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-200">
                {dashboardData.next_action.is_draft ? 'Application Incomplete' : 'Action Required'}
              </span>
              <h3 className="font-bold text-base leading-snug">{dashboardData.next_action.title}</h3>
              <p className="text-xs text-blue-100 mt-1">{dashboardData.next_action.description}</p>
              
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate(dashboardData.next_action.action_url)}
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-xs px-4 py-2 rounded-xl shadow-md hover:bg-blue-50 transition active:scale-95"
                >
                  <span>{dashboardData.next_action.button_text}</span>
                  <ArrowRight size={14} />
                </button>

                {dashboardData.next_action.is_draft && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to discard this draft and start a fresh application?')) {
                        handleStartNew(dashboardData.next_action.draft_id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition active:scale-95"
                  >
                    <RotateCcw size={13} />
                    <span>Start New Application</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Disbursed Loan Repayment Card */}
      {dashboardData?.active_loan_repayment && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
          
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Active Loan Disbursed
              </span>
              <h3 className="text-base font-extrabold text-white mt-1">
                {dashboardData.active_loan_repayment.product_name}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Loan Ref: #{dashboardData.active_loan_repayment.application_number}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Next EMI Amount</span>
              <span className="text-lg font-black text-emerald-400">
                ₹{Number(dashboardData.active_loan_repayment.monthly_emi || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Progress & EMI Stats */}
          <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/60 space-y-2.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Repayment Progress</span>
              <span className="text-white font-bold">
                {dashboardData.active_loan_repayment.paid_installments} of {dashboardData.active_loan_repayment.total_installments} EMIs Paid
              </span>
            </div>
            
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.max(5, (dashboardData.active_loan_repayment.paid_installments / Math.max(1, dashboardData.active_loan_repayment.total_installments)) * 100)}%` 
                }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-700/60">
              <div>
                <span className="text-slate-400 block">Next Due Date:</span>
                <span className="font-bold text-slate-200">
                  {dashboardData.active_loan_repayment.next_due_date 
                    ? new Date(dashboardData.active_loan_repayment.next_due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'All Paid'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Remaining Principal:</span>
                <span className="font-bold text-amber-400 font-mono">
                  ₹{Number(dashboardData.active_loan_repayment.remaining_balance || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Repayment CTA Button */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => navigate(dashboardData.active_loan_repayment.repay_url)}
              className="flex-1 py-3 text-center text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <CreditCard size={15} />
              <span>Pay Next EMI (₹{Number(dashboardData.active_loan_repayment.monthly_emi || 0).toLocaleString('en-IN')})</span>
            </button>
            <button
              onClick={() => navigate(dashboardData.active_loan_repayment.repay_url)}
              className="px-3.5 py-3 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
              title="View Full Schedule"
            >
              <Calendar size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Zap size={14} className="text-blue-600 fill-blue-600" /> Fast Digital Approvals
          </span>
          <span className="text-xs font-medium text-slate-400">100% Paperless</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
          Instant Financial Solutions for Every Need
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Apply online in 5 minutes with minimal documentation and get disbursed directly to your bank account.
        </p>
      </div>

      {/* Interactive EMI Calculator Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Quick EMI Calculator</h3>
            <p className="text-[11px] text-slate-400">Estimate your monthly installment</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Monthly EMI</span>
            <span className="text-lg font-extrabold text-blue-600">₹{emi.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Amount Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Loan Amount</span>
            <span className="text-slate-900">₹{calcAmount.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min={20000}
            max={1500000}
            step={10000}
            value={calcAmount}
            onChange={(e) => setCalcAmount(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>₹20,000</span>
            <span>₹15,00,000</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Tenure</span>
            <span className="text-slate-900">{calcTenure} Months</span>
          </div>
          <input
            type="range"
            min={6}
            max={60}
            step={6}
            value={calcTenure}
            onChange={(e) => setCalcTenure(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>6 Mos</span>
            <span>60 Mos</span>
          </div>
        </div>
      </div>

      {/* Categories & Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Available Loan Products</h3>
          <span className="text-xs text-blue-600 font-semibold">{categories.length} Categories</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-slate-200 animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => {
              const IconComp = iconMap[cat.icon] || Zap;
              return (
                <div key={cat.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 px-1">
                    <IconComp size={16} className="text-blue-600" />
                    <span>{cat.name}</span>
                  </div>

                  <div className="space-y-2.5">
                    {cat.products?.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:border-blue-200 transition space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{prod.name}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{prod.description}</p>
                          </div>
                          <span className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            {prod.default_interest_rate}% p.a.
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-2xl">
                          <div>
                            <span className="text-slate-400 block">Max Amount</span>
                            <span className="font-bold text-slate-700">₹{Number(prod.max_amount).toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Max Tenure</span>
                            <span className="font-bold text-slate-700">{prod.max_tenure_months} Months</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => navigate(`/product/${prod.slug}`)}
                            className="flex-1 py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                          >
                            Details & Eligibility
                          </button>
                          <button
                            onClick={() => navigate(user ? `/apply/${prod.id}` : `/login?redirect=/apply/${prod.id}`)}
                            className="flex-1 py-2.5 text-center text-xs font-bold text-white btn-gradient rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
                          >
                            <span>Apply Now</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust & Compliance Features */}
      <div className="bg-slate-100 rounded-3xl p-4 flex items-center gap-3">
        <ShieldCheck size={28} className="text-emerald-600 shrink-0" />
        <div className="text-xs">
          <p className="font-bold text-slate-800">Bank-Grade 256-bit Security</p>
          <p className="text-[11px] text-slate-500">Your documents and personal information are strictly encrypted.</p>
        </div>
      </div>

      {/* Draft Resume / New Prompt Modal */}
      {dashboardData?.next_action?.is_draft && (
        <DraftResumeModal
          isOpen={showDraftModal}
          draft={{
            id: dashboardData.next_action.draft_id,
            current_step: dashboardData.next_action.current_step,
            requested_amount: dashboardData.next_action.requested_amount,
            product: { name: dashboardData.next_action.product_name },
          }}
          onResume={handleResumeDraft}
          onStartNew={handleStartNew}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
