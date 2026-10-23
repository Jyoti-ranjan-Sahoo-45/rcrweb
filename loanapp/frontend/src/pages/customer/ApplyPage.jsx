import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, Check, ChevronRight, UploadCloud, AlertCircle, FileText, 
  CheckCircle2, ShieldCheck, User, Home, Briefcase, Landmark, Camera, 
  FileCheck, Sparkles, Phone, Mail, CreditCard, Users, HeartHandshake,
  RotateCcw, Clock
} from 'lucide-react';
import { DraftResumeModal } from '../../components/DraftResumeModal';

export const ApplyPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [product, setProduct] = useState(null);
  const [applicationId, setApplicationId] = useState(draftId || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [detectedDraft, setDetectedDraft] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);

  // 4. Loan Requirement
  const [requestedAmount, setRequestedAmount] = useState(100000);
  const [requestedTenure, setRequestedTenure] = useState(24);
  const [purpose, setPurpose] = useState('Personal Expenses');
  const [customPurpose, setCustomPurpose] = useState('');

  // 1. Applicant Details & 2. Residential Address & 6. References & 8. Declaration
  const [personal, setPersonal] = useState({
    full_name: user?.name || '',
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    father_husband_name: '',
    dob: '1995-05-15',
    gender: 'Male',
    marital_status: 'Married',
    phone: user?.phone || '',
    email: user?.email || '',
    pan_number: '',
    aadhaar_number: '',
    current_address_line1: '',
    current_city: '',
    current_state: '',
    current_pincode: '',
    residence_type: 'Own',
    years_at_current_address: '3',
    reference_name: '',
    reference_phone: '',
    reference_relationship: 'Father',
    declaration_accepted: false,
  });

  const handleFullNameChange = (val) => {
    const parts = val.trim().split(/\s+/);
    const fName = parts[0] || val;
    const lName = parts.slice(1).join(' ') || '';
    setPersonal((prev) => ({
      ...prev,
      full_name: val,
      first_name: fName,
      last_name: lName,
    }));
  };

  // 3. Employment / Income Details
  const [employment, setEmployment] = useState({
    employment_type: 'Salaried',
    employer_name: '',
    designation: '',
    office_address: '',
    monthly_income: 45000,
    work_experience_years: 3,
  });

  // 5. Bank Details
  const [financial, setFinancial] = useState({
    monthly_expenses: 15000,
    existing_emi_obligations: 0,
    primary_bank_name: 'State Bank of India',
    account_holder_name: user?.name || '',
    account_number: '',
    confirm_account_number: '',
    ifsc_code: '',
    account_type: 'savings',
  });

  // 7. Documents Submitted
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadingDocType, setUploadingDocType] = useState(null);

  const loadDraftData = (app, targetStep = null) => {
    if (!app) return;
    setApplicationId(app.id);
    if (app.requested_amount) setRequestedAmount(Number(app.requested_amount));
    if (app.requested_tenure_months) setRequestedTenure(Number(app.requested_tenure_months));
    if (app.purpose) {
      const standardPurposes = ['Personal Expenses', 'Medical', 'Education', 'Marriage', 'Home Improvement', 'Debt Consolidation'];
      if (standardPurposes.includes(app.purpose)) {
        setPurpose(app.purpose);
      } else {
        setPurpose('Other');
        setCustomPurpose(app.purpose);
      }
    }
    if (app.personalDetails) {
      setPersonal((prev) => ({
        ...prev,
        ...app.personalDetails,
        declaration_accepted: !!app.personalDetails.declaration_accepted,
      }));
    }
    if (app.employmentDetails) setEmployment((prev) => ({ ...prev, ...app.employmentDetails }));
    if (app.financialDetails) {
      setFinancial((prev) => ({
        ...prev,
        ...app.financialDetails,
        confirm_account_number: app.financialDetails.account_number || '',
      }));
    }
    if (app.documents) setUploadedDocs(app.documents);

    const stepToSet = targetStep !== null ? targetStep : (Number(app.current_step) || 1);
    setStep(Math.max(1, Math.min(6, stepToSet)));
  };

  const handleResumeDraft = (draftToResume) => {
    loadDraftData(draftToResume);
    setShowDraftModal(false);
  };

  const handleStartNew = async (draftIdToDiscard) => {
    const idToDelete = draftIdToDiscard || applicationId || detectedDraft?.id;
    if (idToDelete) {
      try {
        await api.delete(`/applications/draft/${idToDelete}`);
      } catch (e) {
        console.warn('Failed to discard draft on server', e);
      }
    }
    setApplicationId(null);
    setDetectedDraft(null);
    setShowDraftModal(false);
    setStep(1);
    setUploadedDocs([]);
    setPersonal({
      full_name: user?.name || '',
      first_name: user?.name?.split(' ')[0] || '',
      last_name: user?.name?.split(' ').slice(1).join(' ') || '',
      father_husband_name: '',
      dob: '1995-05-15',
      gender: 'Male',
      marital_status: 'Married',
      phone: user?.phone || '',
      email: user?.email || '',
      pan_number: '',
      aadhaar_number: '',
      current_address_line1: '',
      current_city: '',
      current_state: '',
      current_pincode: '',
      residence_type: 'Own',
      years_at_current_address: '3',
      reference_name: '',
      reference_phone: '',
      reference_relationship: 'Father',
      declaration_accepted: false,
    });
    setEmployment({
      employment_type: 'Salaried',
      employer_name: '',
      designation: '',
      office_address: '',
      monthly_income: 45000,
      work_experience_years: 3,
    });
    setFinancial({
      monthly_expenses: 15000,
      existing_emi_obligations: 0,
      primary_bank_name: 'State Bank of India',
      account_holder_name: user?.name || '',
      account_number: '',
      confirm_account_number: '',
      ifsc_code: '',
      account_type: 'savings',
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const prodRes = await api.get('/products');
        const found = prodRes.data?.data?.find((p) => p.id === Number(productId));
        if (found) {
          setProduct(found);
          setRequestedAmount(Number(found.min_amount) * 2 || 100000);
          setRequestedTenure(found.default_tenure_months || 24);
        }

        if (draftId) {
          const appRes = await api.get(`/applications/${draftId}`);
          const app = appRes.data?.data;
          if (app) {
            const stepFromUrl = searchParams.get('step');
            loadDraftData(app, stepFromUrl ? Number(stepFromUrl) : null);
          }
        } else {
          // Automatically check if user has an unfinished draft application
          try {
            const draftRes = await api.get('/applications/active-draft');
            if (draftRes.data?.has_draft && draftRes.data?.data) {
              setDetectedDraft(draftRes.data.data);
              setShowDraftModal(true);
            }
          } catch (err) {
            console.warn('Draft auto-detection error', err);
          }
        }
      } catch (e) {
        console.error('Failed to init apply form', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [productId, draftId]);

  const effectivePurpose = purpose === 'Other' ? (customPurpose || 'Other') : purpose;

  const handleSaveStep = async (nextStep) => {
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        application_id: applicationId,
        product_id: product?.id || 1,
        requested_amount: Number(requestedAmount) || Number(product?.min_amount) || 10000,
        requested_tenure_months: Number(requestedTenure) || 24,
        purpose: effectivePurpose,
        current_step: nextStep,
        personal,
        employment,
        financial,
      };

      const res = await api.post('/applications/draft', payload);
      if (res.data?.data?.id) {
        setApplicationId(res.data.data.id);
      }
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Failed to save application draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, docType, reqId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDocType(docType);
    setErrorMsg('');

    try {
      let currentAppId = applicationId;
      if (!currentAppId) {
        const draftRes = await api.post('/applications/draft', {
          product_id: product?.id || 1,
          requested_amount: Number(requestedAmount) || Number(product?.min_amount) || 10000,
          requested_tenure_months: Number(requestedTenure) || 24,
          purpose: effectivePurpose,
          personal,
          employment,
          financial,
        });
        currentAppId = draftRes.data?.data?.id;
        setApplicationId(currentAppId);
      }

      const formData = new FormData();
      formData.append('document_type', docType);
      if (reqId) formData.append('requirement_id', reqId);
      formData.append('file', file);

      const res = await api.post(`/applications/${currentAppId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data) {
        setUploadedDocs((prev) => [
          ...prev.filter((d) => d.document_type !== docType),
          res.data.data,
        ]);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Document upload failed. Allowed formats: JPG, PNG, PDF (Max 10MB).');
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleSubmitApplication = async () => {
    if (!personal.declaration_accepted) {
      setErrorMsg('Please read and agree to the Applicant Declaration before submitting.');
      return;
    }
    if (!personal.pan_number || !personal.aadhaar_number) {
      setErrorMsg('PAN Card Number and Aadhaar Number are mandatory.');
      return;
    }
    if (!personal.current_address_line1 || !personal.current_city || !personal.current_pincode) {
      setErrorMsg('Current Residential Address, City, and PIN code are mandatory.');
      return;
    }
    if (!financial.account_number || !financial.ifsc_code) {
      setErrorMsg('Disbursement bank account number and IFSC code are required.');
      return;
    }
    if (financial.account_number !== financial.confirm_account_number) {
      setErrorMsg('Bank Account Number and Confirmation do not match.');
      return;
    }

    // STRICT CHECK: All 4 KYC documents must be uploaded
    const missingDocs = standardDocuments.filter(
      (doc) => !uploadedDocs.some((d) => d.document_type === doc.type)
    );
    if (missingDocs.length > 0) {
      setErrorMsg(`All 4 KYC documents are strictly mandatory. Missing: ${missingDocs.map((d) => d.label).join(', ')}`);
      setStep(5);
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      // First save latest data
      await api.post('/applications/draft', {
        application_id: applicationId,
        product_id: product?.id || 1,
        requested_amount: Number(requestedAmount) || Number(product?.min_amount) || 10000,
        requested_tenure_months: Number(requestedTenure) || 24,
        purpose: effectivePurpose,
        personal: { ...personal, declaration_accepted: true },
        employment,
        financial,
      });

      // Submit application
      await api.post(`/applications/${applicationId}/submit`);
      navigate(`/applications/${applicationId}`);
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Submission failed. Please verify mandatory details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 text-xs text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading loan application...</span>
      </div>
    );
  }

  const stepsList = [
    'Applicant & Loan',
    'Residential & Reference',
    'Employment & Income',
    'Disbursement Bank',
    'Upload Documents',
    'Declaration & Review',
  ];

  const standardDocuments = [
    { type: 'pan_card', label: 'PAN Card Photo', desc: 'Clear front photo / scan of PAN Card', icon: '🪪' },
    { type: 'aadhaar_front', label: 'Aadhaar Card (Front Photo)', desc: 'Front photo with photo and name', icon: '🆔' },
    { type: 'aadhaar_back', label: 'Aadhaar Card (Back Photo)', desc: 'Back photo showing full address & QR', icon: '📄' },
    { type: 'selfie', label: 'Applicant Selfie Photo', desc: 'Clear live photo / selfie of applicant', icon: '🤳' },
  ];

  return (
    <div className="space-y-5 pb-10 max-w-2xl mx-auto">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          {applicationId && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to discard this draft and start a fresh application? All unsaved progress will be cleared.')) {
                  handleStartNew(applicationId);
                }
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-full transition"
              title="Discard draft and start fresh"
            >
              <RotateCcw size={12} />
              <span>Start Over</span>
            </button>
          )}
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
            {product?.name || 'Loan Application'}
          </span>
        </div>
      </div>

      {/* Progress Header */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">
              {step}
            </span>
            <span>Step {step} of 6: {stepsList[step - 1]}</span>
          </div>
          <span className="text-blue-600 font-extrabold">{Math.round((step / 6) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 rounded-full" 
            style={{ width: `${(step / 6) * 100}%` }}
          ></div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2.5 shadow-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================
          STEP 1: 1. Applicant Details & 4. Loan Requirement
      ========================================================= */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <User size={18} className="text-blue-600" />
              <span>1. Applicant Details & Loan Requirement</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Please provide primary applicant identification details.</p>
          </div>

          <div className="space-y-4">
            {/* Loan Amount & Tenure */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">4. Loan Requirement</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Loan Amount Required (₹) *</label>
                  <input
                    type="number"
                    value={requestedAmount === '' ? '' : requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600"
                    placeholder="e.g. 50000"
                    min={product?.min_amount || 1000}
                    max={product?.max_amount || 5000000}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Preferred Loan Tenure (Months) *</label>
                  <select
                    value={requestedTenure}
                    onChange={(e) => setRequestedTenure(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600"
                  >
                    {[3, 6, 12, 18, 24, 36, 48, 60, 84].map((m) => (
                      <option key={m} value={m}>{m} Months</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Purpose of Loan */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Purpose of Loan *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    'Personal Expenses',
                    'Medical',
                    'Education',
                    'Marriage',
                    'Home Improvement',
                    'Debt Consolidation',
                    'Other',
                  ].map((pOption) => (
                    <button
                      key={pOption}
                      type="button"
                      onClick={() => setPurpose(pOption)}
                      className={`p-2 rounded-xl text-left font-medium border text-[11px] transition ${
                        purpose === pOption
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {purpose === pOption ? '✓ ' : '☐ '} {pOption}
                    </button>
                  ))}
                </div>
                {purpose === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify other purpose..."
                    value={customPurpose}
                    onChange={(e) => setCustomPurpose(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white mt-2 focus:outline-none focus:border-blue-600"
                  />
                )}
              </div>
            </div>

            {/* Applicant Full Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="Enter full legal name as per PAN / Aadhaar (e.g. Rahul Sharma)"
                value={personal.full_name !== undefined ? personal.full_name : `${personal.first_name || ''} ${personal.last_name || ''}`.trim()}
                onChange={(e) => handleFullNameChange(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                required
              />
            </div>

            {/* Father / Husband Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Father / Husband Name *</label>
              <input
                type="text"
                placeholder="Enter father or husband full name"
                value={personal.father_husband_name || ''}
                onChange={(e) => setPersonal({ ...personal, father_husband_name: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={personal.dob ? String(personal.dob).slice(0, 10) : ''}
                  onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender *</label>
                <div className="flex gap-2 text-xs">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPersonal({ ...personal, gender: g })}
                      className={`flex-1 py-2 px-3 rounded-xl border text-center text-xs font-semibold transition ${
                        personal.gender === g
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {personal.gender === g ? '☑' : '☐'} {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Marital Status *</label>
              <div className="flex gap-2 text-xs">
                {['Married', 'Unmarried'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPersonal({ ...personal, marital_status: m })}
                    className={`flex-1 py-2 px-3 rounded-xl border text-center text-xs font-semibold transition ${
                      personal.marital_status === m
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {personal.marital_status === m ? '☑' : '☐'} {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile No. *</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={personal.phone}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email ID *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="yourname@domain.com"
                    value={personal.email}
                    onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>
            </div>

            {/* PAN & Aadhaar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">PAN No. *</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={personal.pan_number}
                  onChange={(e) => setPersonal({ ...personal, pan_number: e.target.value.toUpperCase() })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono uppercase font-bold focus:outline-none focus:border-blue-600"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Aadhaar / KYC ID *</label>
                <input
                  type="text"
                  placeholder="12-digit Aadhaar number"
                  value={personal.aadhaar_number}
                  onChange={(e) => setPersonal({ ...personal, aadhaar_number: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-blue-600"
                  maxLength={12}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (!personal.first_name || !personal.pan_number || !personal.aadhaar_number || !personal.father_husband_name) {
                setErrorMsg('Please fill in mandatory fields (Full Name, Father/Husband Name, PAN, Aadhaar).');
                return;
              }
              handleSaveStep(2);
            }}
            className="w-full py-3.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <span>Next: Residential & Reference Details</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* =========================================================
          STEP 2: 2. Residential Address & 6. References
      ========================================================= */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Home size={18} className="text-blue-600" />
              <span>2. Residential Address & Reference Details</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Please provide your current living residence and reference contact.</p>
          </div>

          <div className="space-y-4">
            {/* Current Address */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Current Address *</label>
              <textarea
                rows={2}
                placeholder="House / Flat No, Street, Landmark, Area"
                value={personal.current_address_line1}
                onChange={(e) => setPersonal({ ...personal, current_address_line1: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* City, State, PIN */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  placeholder="City"
                  value={personal.current_city}
                  onChange={(e) => setPersonal({ ...personal, current_city: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  placeholder="State"
                  value={personal.current_state}
                  onChange={(e) => setPersonal({ ...personal, current_state: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">PIN Code *</label>
                <input
                  type="text"
                  placeholder="PIN"
                  value={personal.current_pincode}
                  onChange={(e) => setPersonal({ ...personal, current_pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-blue-600"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {/* Residence Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Residence Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['Own', 'Rented', 'Family', 'Other'].map((resType) => (
                  <button
                    key={resType}
                    type="button"
                    onClick={() => setPersonal({ ...personal, residence_type: resType })}
                    className={`py-2 px-2.5 rounded-xl border text-center text-xs font-semibold transition ${
                      personal.residence_type === resType
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {personal.residence_type === resType ? '☑' : '☐'} {resType}
                  </button>
                ))}
              </div>
            </div>

            {/* Years at Current Address */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Years at Current Address *</label>
              <input
                type="text"
                placeholder="e.g. 3 Years"
                value={personal.years_at_current_address || ''}
                onChange={(e) => setPersonal({ ...personal, years_at_current_address: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Reference 1 Section */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Users size={15} className="text-blue-600" />
                <span>6. Reference 1 Contact</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reference 1 Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name of reference person"
                  value={personal.reference_name || ''}
                  onChange={(e) => setPersonal({ ...personal, reference_name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="Reference mobile number"
                    value={personal.reference_phone || ''}
                    onChange={(e) => setPersonal({ ...personal, reference_phone: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Relationship *</label>
                  <select
                    value={personal.reference_relationship || 'Father'}
                    onChange={(e) => setPersonal({ ...personal, reference_relationship: e.target.value })}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Relative">Relative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Back
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                if (!personal.current_address_line1 || !personal.current_city || !personal.current_state || !personal.current_pincode) {
                  setErrorMsg('Please fill in Current Address, City, State, and 6-digit PIN code.');
                  return;
                }
                if (!personal.reference_name || !personal.reference_phone) {
                  setErrorMsg('Reference Person Name and Mobile Number are required.');
                  return;
                }
                setErrorMsg('');
                handleSaveStep(3);
              }}
              className="flex-1 py-3 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>Next: Employment & Income</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 3: 3. Employment / Income Details
      ========================================================= */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Briefcase size={18} className="text-blue-600" />
                <span>3. Employment / Income Details</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Please provide your profession and income details.</p>
          </div>

          <div className="space-y-4">
            {/* Employment Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Employment Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['Salaried', 'Self Employed', 'Business', 'Other'].map((empType) => (
                  <button
                    key={empType}
                    type="button"
                    onClick={() => setEmployment({ ...employment, employment_type: empType })}
                    className={`py-2 px-2.5 rounded-xl border text-center text-xs font-semibold transition ${
                      employment.employment_type === empType
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {employment.employment_type === empType ? '☑' : '☐'} {empType}
                  </button>
                ))}
              </div>
            </div>

            {/* Company / Business Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Company / Business Name *</label>
              <input
                type="text"
                placeholder="e.g. Tata Consultancy Services / Freelancer / Shop Name"
                value={employment.employer_name}
                onChange={(e) => setEmployment({ ...employment, employer_name: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Designation / Business Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Designation / Business Type *</label>
              <input
                type="text"
                placeholder="e.g. Senior Executive / Manager / Retailer"
                value={employment.designation}
                onChange={(e) => setEmployment({ ...employment, designation: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Work Address */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Work Address *</label>
              <input
                type="text"
                placeholder="Office or business location"
                value={employment.office_address}
                onChange={(e) => setEmployment({ ...employment, office_address: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Monthly Net Income & Total Work Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Monthly Net Income (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={employment.monthly_income === '' ? '' : employment.monthly_income}
                  onChange={(e) => setEmployment({ ...employment, monthly_income: e.target.value === '' ? '' : Number(e.target.value) })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Work Experience (Years) *</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={employment.work_experience_years === '' ? '' : employment.work_experience_years}
                  onChange={(e) => setEmployment({ ...employment, work_experience_years: e.target.value === '' ? '' : Number(e.target.value) })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Existing EMI */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Existing EMI (₹)</label>
              <input
                type="number"
                placeholder="e.g. 0 or existing monthly EMI payments"
                value={financial.existing_emi_obligations === '' ? '' : financial.existing_emi_obligations}
                onChange={(e) => setFinancial({ ...financial, existing_emi_obligations: e.target.value === '' ? '' : Number(e.target.value) })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-3 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Back
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                if (!employment.employer_name || !employment.designation || !employment.monthly_income || Number(employment.monthly_income) <= 0) {
                  setErrorMsg('Please specify Company / Business name, Designation, and valid Monthly Income.');
                  return;
                }
                setErrorMsg('');
                handleSaveStep(4);
              }}
              className="flex-1 py-3 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>Next: Bank Details</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 4: 5. Bank Details
      ========================================================= */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Landmark size={18} className="text-blue-600" />
              <span>5. Bank Details (Disbursement Account)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Please specify the bank account where loan funds will be disbursed.</p>
          </div>

          <div className="space-y-4">
            {/* Bank Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bank Name *</label>
              <input
                type="text"
                placeholder="e.g. State Bank of India, HDFC Bank, ICICI Bank"
                value={financial.primary_bank_name}
                onChange={(e) => setFinancial({ ...financial, primary_bank_name: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Account Holder Name *</label>
              <input
                type="text"
                placeholder="Name as printed in passbook / cheque"
                value={financial.account_holder_name}
                onChange={(e) => setFinancial({ ...financial, account_holder_name: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* Account No & Confirm Account No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Account No. *</label>
                <input
                  type="text"
                  placeholder="Enter bank account number"
                  value={financial.account_number}
                  onChange={(e) => setFinancial({ ...financial, account_number: e.target.value.trim() })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Confirm Account No. *</label>
                <input
                  type="text"
                  placeholder="Re-enter bank account number"
                  value={financial.confirm_account_number || ''}
                  onChange={(e) => setFinancial({ ...financial, confirm_account_number: e.target.value.trim() })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">IFSC Code *</label>
              <input
                type="text"
                placeholder="e.g. SBIN0001234 / HDFC0000123"
                value={financial.ifsc_code}
                onChange={(e) => setFinancial({ ...financial, ifsc_code: e.target.value.toUpperCase().trim() })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold uppercase focus:outline-none focus:border-blue-600"
                maxLength={11}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="py-3 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Back
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                if (!financial.primary_bank_name || !financial.account_number || !financial.ifsc_code) {
                  setErrorMsg('Please complete mandatory bank account details.');
                  return;
                }
                if (financial.confirm_account_number && financial.account_number !== financial.confirm_account_number) {
                  setErrorMsg('Bank Account Number and Confirm Account Number do not match.');
                  return;
                }
                handleSaveStep(5);
              }}
              className="flex-1 py-3 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>Next: Documents Submitted</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 5: 7. Documents Submitted
      ========================================================= */}
      {step === 5 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Camera size={18} className="text-blue-600" />
                <span>Mandatory KYC Documents (Photo Uploads)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All 4 documents are strictly mandatory. Applications cannot be processed without them.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 self-start sm:self-auto">
              <span>Uploaded:</span>
              <strong className={
                standardDocuments.every((d) => uploadedDocs.some((u) => u.document_type === d.type))
                  ? 'text-emerald-600 font-extrabold'
                  : 'text-rose-600 font-extrabold'
              }>
                {standardDocuments.filter((d) => uploadedDocs.some((u) => u.document_type === d.type)).length} / {standardDocuments.length}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {standardDocuments.map((doc) => {
              const existing = uploadedDocs.find((d) => d.document_type === doc.type);
              const isUploading = uploadingDocType === doc.type;

              return (
                <div 
                  key={doc.type} 
                  className={`p-4 rounded-2xl border transition ${
                    existing 
                      ? 'bg-emerald-50/50 border-emerald-300' 
                      : 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                  } space-y-3 flex flex-col justify-between`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{doc.icon}</span>
                      {existing ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          <Check size={12} /> Uploaded (v{existing.version})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          ⚠️ Strictly Required
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{doc.label} *</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">{doc.desc}</p>
                  </div>

                  <label className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                    existing
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm'
                  }`}>
                    <UploadCloud size={15} />
                    <span>{isUploading ? 'Uploading Photo...' : (existing ? 'Change / Re-upload' : 'Upload Required Photo *')}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      capture="environment"
                      onChange={(e) => handleFileUpload(e, doc.type)}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="py-3 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                const missing = standardDocuments.filter(
                  (doc) => !uploadedDocs.some((d) => d.document_type === doc.type)
                );
                if (missing.length > 0) {
                  setErrorMsg(`All 4 KYC documents are strictly mandatory. Missing: ${missing.map((d) => d.label).join(', ')}`);
                  return;
                }
                setErrorMsg('');
                setStep(6);
              }}
              className="flex-1 py-3 text-xs font-bold text-white btn-gradient rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>Next: Declaration & Review</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          STEP 6: 8. Applicant Declaration & Final Review
      ========================================================= */}
      {step === 6 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FileCheck size={18} className="text-blue-600" />
              <span>8. Applicant Declaration & Review</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Please review your application summary and confirm the official declaration.</p>
          </div>

          {/* Application Summary Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Loan Product</span>
              <span className="font-bold text-slate-900">{product?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Loan Amount & Tenure</span>
              <span className="font-bold text-blue-600">₹{requestedAmount.toLocaleString('en-IN')} &bull; {requestedTenure} Months</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Loan Purpose</span>
              <span className="font-semibold text-slate-800">{effectivePurpose}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Applicant Full Name</span>
              <span className="font-bold text-slate-900">{personal.full_name || `${personal.first_name || ''} ${personal.last_name || ''}`.trim() || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Father / Husband Name</span>
              <span className="font-semibold text-slate-800">{personal.father_husband_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">PAN & Aadhaar</span>
              <span className="font-mono font-bold text-slate-800">{personal.pan_number || 'N/A'} &bull; {personal.aadhaar_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Current Address</span>
              <span className="font-medium text-slate-700 text-right max-w-[220px] truncate">{personal.current_address_line1}, {personal.current_city} ({personal.residence_type})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Employment & Income</span>
              <span className="font-semibold text-slate-800">{employment.employment_type} (₹{employment.monthly_income?.toLocaleString('en-IN')}/mo)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Disbursement Account</span>
              <span className="font-mono font-bold text-slate-900">{financial.primary_bank_name} (A/C: {financial.account_number || 'N/A'})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Reference 1</span>
              <span className="font-semibold text-slate-800">{personal.reference_name || 'N/A'} ({personal.reference_relationship || 'Contact'})</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-500">Documents Attached</span>
              <span className="font-bold text-emerald-700">✓ All 4 Mandatory KYC Photos Attached</span>
            </div>
          </div>

          {/* 8. Official Applicant Declaration Box */}
          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
              <ShieldCheck size={17} className="text-blue-600 shrink-0" />
              <span>8. Applicant Declaration</span>
            </div>
            <p className="text-[11px] text-blue-950 leading-relaxed bg-white p-3 rounded-xl border border-blue-100 font-serif italic">
              "I/We declare that the information provided in this application is true and complete to the best of my/our knowledge. I/We understand that submission of this application does not guarantee sanction or disbursement of the loan. The loan shall be subject to eligibility assessment, verification, applicable terms and conditions, and final approval by the competent authority."
            </p>
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={personal.declaration_accepted}
                onChange={(e) => setPersonal({ ...personal, declaration_accepted: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-900">
                I hereby accept and confirm the declaration above.
              </span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="py-3 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Back
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmitApplication}
              className="flex-1 py-3.5 text-xs font-bold text-white gradient-success rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50"
            >
              <CheckCircle2 size={17} />
              <span>{saving ? 'Submitting Application...' : 'Submit Loan Application Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Auto-detected Draft Resume Modal */}
      <DraftResumeModal
        isOpen={showDraftModal}
        draft={detectedDraft}
        onResume={handleResumeDraft}
        onStartNew={handleStartNew}
        onClose={() => setShowDraftModal(false)}
      />
    </div>
  );
};
