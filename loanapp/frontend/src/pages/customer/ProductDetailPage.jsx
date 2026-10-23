import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle2, FileText, Percent, Clock, AlertCircle, ShieldAlert, ChevronRight } from 'lucide-react';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic eligibility calculator
  const [income, setIncome] = useState(35000);
  const [age, setAge] = useState(28);
  const [existingEmi, setExistingEmi] = useState(0);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data?.data);
      } catch (e) {
        console.error('Failed to load product', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleCheckEligibility = async (e) => {
    e?.preventDefault();
    if (!product) return;
    setChecking(true);
    try {
      const res = await api.post('/eligibility/check', {
        product_id: product.id,
        monthly_income: income,
        age: age,
        existing_emi: existingEmi,
      });
      setEligibilityResult(res.data?.data);
    } catch (e) {
      console.warn('Eligibility check error', e);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading details...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-slate-600 font-semibold">Product not found.</p>
        <button onClick={() => navigate('/')} className="text-xs text-blue-600 underline">Return Home</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Top Back Nav */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} />
        <span>Back to Loans</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{product.category?.name}</span>
        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{product.name}</h2>
        <p className="text-xs text-slate-500">{product.description}</p>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
          <div className="bg-slate-50 p-2.5 rounded-2xl">
            <span className="text-[10px] text-slate-400 block font-medium">Interest Rate</span>
            <span className="text-xs font-extrabold text-blue-600">{product.default_interest_rate}% p.a.</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-2xl">
            <span className="text-[10px] text-slate-400 block font-medium">Max Limit</span>
            <span className="text-xs font-extrabold text-slate-800">₹{Number(product.max_amount).toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-2xl">
            <span className="text-[10px] text-slate-400 block font-medium">Max Tenure</span>
            <span className="text-xs font-extrabold text-slate-800">{product.max_tenure_months} Mo</span>
          </div>
        </div>
      </div>

      {/* Instant Eligibility Check */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Instant Eligibility Check</h3>
          <p className="text-[11px] text-slate-400">Evaluate maximum loan amount and EMI eligibility</p>
        </div>

        <form onSubmit={handleCheckEligibility} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly In-Hand Income (₹)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Existing EMI / Month</label>
              <input
                type="number"
                value={existingEmi}
                onChange={(e) => setExistingEmi(Number(e.target.value))}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={checking}
            className="w-full py-2.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
          >
            {checking ? 'Evaluating Criteria...' : 'Check My Eligibility'}
          </button>
        </form>

        {eligibilityResult && (
          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            eligibilityResult.is_eligible ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {eligibilityResult.is_eligible ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-600" />}
              <span>{eligibilityResult.is_eligible ? 'You are Eligible!' : 'Eligibility Criteria Not Met'}</span>
            </div>

            {eligibilityResult.is_eligible ? (
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-emerald-700 block font-medium">Max Eligible Loan</span>
                  <span className="font-extrabold text-emerald-900 text-sm">₹{eligibilityResult.max_eligible_amount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-emerald-700 block font-medium">Estimated EMI</span>
                  <span className="font-extrabold text-emerald-900 text-sm">₹{eligibilityResult.estimated_monthly_emi.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            ) : (
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                {eligibilityResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Required Documents Checklist */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          <span>Required Documents</span>
        </h3>
        <div className="space-y-2">
          {product.document_requirements?.map((doc) => (
            <div key={doc.id} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">{doc.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Apply CTA */}
      <button
        onClick={() => navigate(user ? `/apply/${product.id}` : `/login?redirect=/apply/${product.id}`)}
        className="w-full py-3.5 text-center text-sm font-bold text-white btn-gradient rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-98 transition"
      >
        <span>Proceed to Digital Application</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
