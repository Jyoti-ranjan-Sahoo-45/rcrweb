import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, FileText, Send, DollarSign, 
  ShieldCheck, Download, RefreshCw, ExternalLink, Image as ImageIcon, Sparkles, 
  Building, User, Briefcase, CreditCard, ChevronDown, Clock, Check, ArrowRight,
  Upload, Plus, Trash2, Home
} from 'lucide-react';

export const AdminApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Single Quick-Sanction Form State
  const [sanctionForm, setSanctionForm] = useState({
    approved_amount: 50000,
    approved_tenure_months: 24,
    interest_rate: 13.5,
    processing_fee: 1500,
    remarks: 'Approved as per standard credit criteria.',
  });

  // Payout Form State
  const [payoutReference, setPayoutReference] = useState('NEFT-RCR-' + Math.floor(100000 + Math.random() * 900000));
  
  // Info Request & Internal Notes
  const [infoMessage, setInfoMessage] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState(null);

  // Admin Document Upload & Reupload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docType, setDocType] = useState('pan_card');
  const [customDocType, setCustomDocType] = useState('');
  const [uploadDocFile, setUploadDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [liveState, setLiveState] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

  const fetchApp = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/staff/applications/${id}`);
      const data = res.data?.data;
      setApp(data);
      setLiveState(res.data?.customer_live_state);
      setLastRefreshedAt(new Date());

      if (data && !silent) {
        const reqAmt = Number(data.requested_amount || 50000);
        const reqTenure = Number(data.requested_tenure_months || 24);
        const defaultRate = Number(data.product?.default_interest_rate || 13.5);
        const defaultFeePct = Number(data.product?.processing_fee_pct || 1.5);
        const calculatedFee = Number((reqAmt * (defaultFeePct / 100)).toFixed(0));

        // Prepopulate with existing offer or approved amount if present
        setSanctionForm({
          approved_amount: Number(data.offer?.approved_amount || data.approved_amount || reqAmt),
          approved_tenure_months: Number(data.offer?.approved_tenure_months || data.approved_tenure_months || reqTenure),
          interest_rate: Number(data.offer?.interest_rate || data.approved_interest_rate || defaultRate),
          processing_fee: Number(data.offer?.processing_fee !== undefined ? data.offer.processing_fee : (calculatedFee > 0 ? calculatedFee : 352.82)),
          remarks: data.offer?.remarks || data.decision?.remarks || 'Approved as per standard credit criteria.',
        });
      }
    } catch (e) {
      console.error('Failed to load application detail', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApp();
  }, [id]);

  // Live Auto-Refresh Polling every 8 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchApp(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [id, autoRefresh]);

  // 1-Click Sanction & Send Approved Ready for Disbursement
  const handleQuickSanction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(`/staff/applications/${id}/quick-sanction-offer`, sanctionForm);
      alert(res.data?.message || 'Approved & Ready for Disbursement! Final loan terms updated for customer.');
      fetchApp();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update approved terms.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Verify Customer Processing Fee Payment
  const handleVerifyPayment = async (action = 'approve') => {
    setSubmitting(true);
    try {
      const res = await api.post(`/staff/applications/${id}/payment/verify`, {
        action: action,
        remarks: action === 'approve' ? 'Payment verified and approved by admin desk.' : 'Payment receipt rejected.',
      });
      alert(res.data?.message || 'Payment verified successfully! Application is ready for disbursement.');
      fetchApp();
    } catch (e) {
      alert(e.response?.data?.message || 'Payment verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Verify Payment & Disburse Money
  const handleQuickDisburse = async () => {
    if (!payoutReference.trim()) {
      alert('Please enter a bank payout reference / UTR number.');
      return;
    }
    if (!window.confirm(`Authorize payout and mark ₹${Number(app.approved_amount || app.requested_amount).toLocaleString('en-IN')} as disbursed?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/staff/applications/${id}/quick-verify-and-disburse`, {
        payout_reference: payoutReference.trim(),
      });
      alert(res.data?.message || 'Loan marked as successfully disbursed!');
      fetchApp();
    } catch (e) {
      alert(e.response?.data?.message || 'Disbursement failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Verify Single Document
  const handleVerifyDocument = async (docId, status, reason = '') => {
    try {
      await api.post(`/staff/documents/${docId}/verify`, { status, rejection_reason: reason });
      fetchApp();
    } catch (e) {
      alert(e.response?.data?.message || 'Verification update failed.');
    }
  };

  // Admin Upload New Document on Behalf of Customer
  const handleAdminUploadDoc = async (e) => {
    e.preventDefault();
    if (!uploadDocFile) {
      alert('Please select a document file to upload (PDF, JPG, PNG).');
      return;
    }
    const finalType = docType === 'other' ? (customDocType.trim().toLowerCase().replace(/\s+/g, '_') || 'other_document') : docType;
    
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('document_type', finalType);
      formData.append('file', uploadDocFile);

      const res = await api.post(`/staff/applications/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(res.data?.message || 'Document uploaded and verified successfully!');
      setShowUploadModal(false);
      setUploadDocFile(null);
      setCustomDocType('');
      fetchApp();
    } catch (e) {
      alert(e.response?.data?.message || 'Document upload failed.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Admin Re-upload / Replace Existing Document
  const handleAdminReuploadDoc = async (docId, file) => {
    if (!file) return;
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(`/staff/documents/${docId}/reupload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(res.data?.message || 'Document re-uploaded successfully!');
      fetchApp();
    } catch (e) {
      alert(e.response?.data?.message || 'Document re-upload failed.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Admin Delete Document
  const handleAdminDeleteDoc = async (docId, docName) => {
    if (!window.confirm(`Are you sure you want to delete "${docName}"?`)) return;
    try {
      const res = await api.delete(`/staff/documents/${docId}`);
      alert(res.data?.message || 'Document deleted successfully.');
      fetchApp();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete document.');
    }
  };

  // Transmit Info Request
  const handleSendInfoRequest = async (e) => {
    e.preventDefault();
    if (!infoMessage.trim()) return;
    try {
      await api.post(`/staff/applications/${id}/info-request`, { message: infoMessage });
      setInfoMessage('');
      fetchApp();
      alert('Information request sent to customer.');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send request.');
    }
  };

  // Add Internal Staff Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await api.post(`/staff/applications/${id}/notes`, { note: noteText });
      setNoteText('');
      fetchApp();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to add note.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
        <RefreshCw className="animate-spin text-blue-500" size={24} />
        <span className="text-xs font-medium">Loading application file...</span>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-400 text-xs">Application record not found.</p>
        <button onClick={() => navigate('/admin/applications')} className="text-xs text-blue-400 font-bold hover:underline">
          &larr; Back to Applications Queue
        </button>
      </div>
    );
  }

  // Safely map both camelCase and snake_case properties
  const payment = app.paymentRecord || app.payment_record;
  const disb = app.disbursementRecord || app.disbursement_record;
  const personal = app.personalDetails || app.personal_details;
  const employment = app.employmentDetails || app.employment_details;
  const financial = app.financialDetails || app.financial_details;
  const notes = app.internalNotes || app.internal_notes || [];

  // Calculate estimated monthly EMI for quick preview
  const P = Number(sanctionForm.approved_amount) || 0;
  const r = (Number(sanctionForm.interest_rate) || 0) / 12 / 100;
  const n = Number(sanctionForm.approved_tenure_months) || 1;
  const estimatedEmi = r > 0 ? Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : Math.round(P / n);

  const isOfferSent = app.offer && app.current_status !== 'draft' && app.current_status !== 'submitted';
  const hasPaymentProof = !!payment && (!!payment.receipt_path || !!payment.utr_number || payment.status === 'pending_verification' || payment.status === 'verified' || payment.status === 'completed');
  const isDisbursed = app.current_status === 'disbursed';

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* 1. Header Bar with Real-Time Sync Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-3xl border border-slate-800">
        <button 
          onClick={() => navigate('/admin/applications')} 
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to All Applications</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Sync Status & Manual Refresh */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px]">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${autoRefresh ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            </span>
            <span className="text-slate-300 font-semibold">
              {autoRefresh ? 'Live Sync Active (8s)' : 'Live Sync Paused'}
            </span>
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-[10px] text-blue-400 font-bold hover:underline ml-1"
            >
              {autoRefresh ? '[Pause]' : '[Resume]'}
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={() => fetchApp(false)}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition"
              title="Refresh now"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span className="text-[10px] font-bold">Sync Now</span>
            </button>
          </div>

          <span className="text-xs font-mono text-slate-400">ID: #{app.id}</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
            isDisbursed
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : hasPaymentProof
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              : isOfferSent
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          }`}>
            ● Status: {app.current_status?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* 2. Main Applicant Profile Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <span className="font-mono text-xs text-blue-400 font-bold block">{app.application_number}</span>
            <h1 className="text-2xl font-black text-white mt-1">{app.user?.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Product: <span className="text-slate-200 font-semibold">{app.product?.name}</span> &bull; Applied on: {new Date(app.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Requested Loan</span>
              <span className="text-xl font-bold text-white">₹{Number(app.requested_amount).toLocaleString('en-IN')}</span>
            </div>
            <div className="border-l border-slate-700 pl-4">
              <span className="text-slate-400 block text-[11px]">Requested Tenure</span>
              <span className="text-xl font-bold text-white">{app.requested_tenure_months} Mo</span>
            </div>
          </div>
        </div>

        {/* 4-Column Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Card A: Personal & KYC */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold border-b border-slate-800 pb-2">
              <User size={15} className="text-blue-400" />
              <span>1. Applicant KYC Details</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between"><span className="text-slate-500">Full Name:</span> <span className="font-bold text-white">{personal?.first_name} {personal?.last_name || app.user?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Father/Husband:</span> <span className="font-semibold text-slate-200">{personal?.father_husband_name || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">DOB & Gender:</span> <span className="text-slate-200">{personal?.dob ? new Date(personal.dob).toLocaleDateString() : 'N/A'} ({personal?.gender || 'N/A'})</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Marital Status:</span> <span className="text-slate-200">{personal?.marital_status || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phone:</span> <span className="font-mono font-bold text-white">{personal?.phone || app.user?.phone}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">PAN:</span> <span className="font-mono font-bold text-blue-400">{personal?.pan_number || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Aadhaar:</span> <span className="font-mono text-slate-200">{personal?.aadhaar_number || 'N/A'}</span></div>
            </div>
          </div>

          {/* Card B: Residential & Reference */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold border-b border-slate-800 pb-2">
              <Home size={15} className="text-indigo-400" />
              <span>2. Residential & Reference</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div><span className="text-slate-500 block">Current Address:</span> <span className="text-slate-200 text-[11px] block">{personal?.current_address_line1 || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">City & PIN:</span> <span className="text-slate-200">{personal?.current_city || 'N/A'}, {personal?.current_pincode || ''}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Residence:</span> <span className="text-slate-200">{personal?.residence_type || 'Own'} ({personal?.years_at_current_address ? `${personal.years_at_current_address} Yrs` : 'N/A'})</span></div>
              <div className="pt-1 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-1">6. Reference 1 Contact</span>
                <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-semibold text-white">{personal?.reference_name || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mobile:</span> <span className="font-mono text-blue-300">{personal?.reference_phone || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Relation:</span> <span className="text-slate-200">{personal?.reference_relationship || 'N/A'}</span></div>
              </div>
            </div>
          </div>

          {/* Card C: Income & Employment */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold border-b border-slate-800 pb-2">
              <Briefcase size={15} className="text-emerald-400" />
              <span>3. Income & Employment</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between"><span className="text-slate-500">Employment:</span> <span className="capitalize font-semibold text-white">{employment?.employment_type || 'Salaried'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Employer:</span> <span className="font-semibold text-slate-200 truncate max-w-[130px]">{employment?.employer_name || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Designation:</span> <span className="text-slate-200 truncate max-w-[130px]">{employment?.designation || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Monthly Income:</span> <span className="font-bold text-emerald-400 text-sm">₹{Number(employment?.monthly_income || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Experience:</span> <span className="text-slate-200">{employment?.work_experience_years ? `${employment.work_experience_years} Yrs` : 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Existing EMIs:</span> <span className="font-mono text-slate-300">₹{Number(financial?.existing_emi_obligations || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between pt-1 border-t border-slate-800/80"><span className="text-slate-500">Loan Purpose:</span> <span className="font-semibold text-amber-300 truncate max-w-[130px]">{app.purpose || 'Personal'}</span></div>
            </div>
          </div>

          {/* Card D: Payout Bank Account */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold border-b border-slate-800 pb-2">
              <Building size={15} className="text-amber-400" />
              <span>5. Bank & Declaration</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between"><span className="text-slate-500">Bank Name:</span> <span className="font-bold text-white truncate max-w-[130px]">{financial?.primary_bank_name || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Account No:</span> <span className="font-mono font-bold text-blue-300">{financial?.account_number || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">IFSC Code:</span> <span className="font-mono font-bold text-emerald-400">{financial?.ifsc_code || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Holder:</span> <span className="text-slate-200 truncate max-w-[130px]">{financial?.account_holder_name || app.user?.name}</span></div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  personal?.declaration_accepted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  <ShieldCheck size={12} />
                  <span>{personal?.declaration_accepted ? 'Declaration Verified & Accepted' : 'Declaration Pending'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Uploaded Documents Desk & Admin Document Manager */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-400" />
            <div>
              <h2 className="font-bold text-sm text-white">Customer Documents Desk ({app.documents?.length || 0})</h2>
              <p className="text-[11px] text-slate-400">View, approve, upload, or re-upload customer KYC & income documents</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUploadModal(!showUploadModal)}
            className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition self-start sm:self-auto"
          >
            <Upload size={14} />
            <span>{showUploadModal ? '✕ Close Upload' : '+ Upload Customer Doc'}</span>
          </button>
        </div>

        {/* Modal / Panel for Admin Uploading New Document */}
        {showUploadModal && (
          <div className="p-4 bg-slate-900 border-2 border-blue-500/50 rounded-2xl space-y-3 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Upload size={14} className="text-blue-400" />
                <span>Upload Document on Customer's Behalf</span>
              </span>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAdminUploadDoc} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] font-bold mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-white font-semibold"
                >
                  <option value="pan_card">PAN Card</option>
                  <option value="aadhaar_front">Aadhaar Card (Front)</option>
                  <option value="aadhaar_back">Aadhaar Card (Back)</option>
                  <option value="salary_slip">Salary Slip (Latest)</option>
                  <option value="bank_statement">Bank Statement (3-6 Mo)</option>
                  <option value="utility_bill">Address / Electricity Bill</option>
                  <option value="passport_photo">Applicant Photograph</option>
                  <option value="itr_file">ITR / Form 16</option>
                  <option value="other">Other / Custom Document</option>
                </select>
              </div>

              {docType === 'other' && (
                <div>
                  <label className="block text-slate-400 text-[11px] font-bold mb-1">Custom Doc Title</label>
                  <input
                    type="text"
                    placeholder="e.g. rent_agreement"
                    value={customDocType}
                    onChange={(e) => setCustomDocType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded-xl text-white font-semibold"
                    required
                  />
                </div>
              )}

              <div className={docType === 'other' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <label className="block text-slate-400 text-[11px] font-bold mb-1">Choose File (PDF, JPG, PNG)</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setUploadDocFile(e.target.files[0])}
                    className="flex-1 bg-slate-950 border border-slate-700 p-1.5 rounded-xl text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-blue-300"
                    required
                  />
                  <button
                    type="submit"
                    disabled={uploadingDoc}
                    className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
                  >
                    {uploadingDoc ? 'Uploading...' : 'Save & Verify'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Existing Documents List */}
        {app.documents?.length === 0 ? (
          <div className="text-slate-400 py-6 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60">
            <p>No documents uploaded yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">You can upload customer KYC documents directly using the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {app.documents?.map((doc) => (
              <div key={doc.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white capitalize block text-xs">{doc.document_type.replace(/_/g, ' ')}</span>
                      {doc.version > 1 && (
                        <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-bold">
                          v{doc.version}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">{doc.original_filename}</span>
                    <div className="pt-0.5">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        doc.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : (doc.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400')
                      }`}>
                        ● {doc.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={`/storage/${doc.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-[11px] transition"
                    >
                      Inspect
                    </a>
                    {doc.status !== 'verified' && (
                      <button
                        onClick={() => handleVerifyDocument(doc.id, 'verified')}
                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition"
                      >
                        Approve
                      </button>
                    )}
                    {doc.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason for customer:');
                          if (reason) handleVerifyDocument(doc.id, 'rejected', reason);
                        }}
                        className="py-1 px-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg font-bold text-[11px] transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Re-upload / Replace & Delete Toolbar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <label className="cursor-pointer text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition">
                    <RefreshCw size={12} className={uploadingDoc ? 'animate-spin' : ''} />
                    <span>Re-upload / Replace</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleAdminReuploadDoc(doc.id, file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleAdminDeleteDoc(doc.id, doc.original_filename || doc.document_type)}
                    className="text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Send Clarification Note */}
        <form onSubmit={handleSendInfoRequest} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Need additional document / clarification from customer? Type here..."
            value={infoMessage}
            onChange={(e) => setInfoMessage(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-white focus:outline-none focus:border-amber-500"
          />
          <button type="submit" className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition flex items-center gap-1.5">
            <Send size={13} />
            <span>Send Request</span>
          </button>
        </form>
      </div>

      {/* 3.5 📡 REAL-TIME CUSTOMER ACTION & ACCEPTANCE TRACKER */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-base text-white">Live Customer Action & Acceptance Tracker</h2>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Real-time telemetry of what the customer is seeing and executing on their device</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
              Last Synced: {lastRefreshedAt.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* 4 Multi-Dimensional Live Status Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Module 1: Offer Acceptance */}
          <div className={`p-4 rounded-2xl border space-y-2 transition ${
            app.offer?.status === 'accepted' || app.offer?.accepted_at
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
              : app.offer?.status === 'declined'
              ? 'bg-rose-950/30 border-rose-500/40'
              : app.offer?.status === 'issued'
              ? 'bg-amber-950/30 border-amber-500/40'
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">1. Offer Acceptance</span>
              {app.offer?.status === 'accepted' || app.offer?.accepted_at ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>ACCEPTED</span>
                </span>
              ) : app.offer?.status === 'declined' ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/40">
                  DECLINED
                </span>
              ) : app.offer?.status === 'issued' ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40 animate-pulse">
                  PENDING ACTION
                </span>
              ) : (
                <span className="text-slate-500 text-[10px]">NOT ISSUED</span>
              )}
            </div>

            {app.offer?.status === 'accepted' || app.offer?.accepted_at ? (
              <div className="space-y-1">
                <span className="text-sm font-black text-emerald-400 block">
                  Accepted ₹{Number(app.offer.approved_amount).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-300 block">
                  {app.offer.approved_tenure_months} Mo @ {app.offer.interest_rate}% &bull; ₹{Number(app.offer.emi_amount).toLocaleString('en-IN')}/mo
                </span>
                <span className="text-[10px] text-emerald-400/80 block font-mono">
                  ✓ Confirmed on {new Date(app.offer.accepted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ) : app.offer?.status === 'declined' ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-400 block">Customer Declined</span>
                <span className="text-[11px] text-slate-400 block truncate">{app.offer.decline_reason || 'No reason specified'}</span>
                <span className="text-[10px] text-rose-400/80 block">{new Date(app.offer.declined_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            ) : app.offer?.status === 'issued' ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300 block">Awaiting Customer</span>
                <span className="text-[11px] text-slate-400 block">Customer has not accepted yet</span>
                <span className="text-[10px] text-amber-400/80 block">Sent: {new Date(app.offer.issued_at || app.offer.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">Sanction terms below to send offer to customer.</p>
            )}
          </div>

          {/* Module 2: Agreement & Formalities */}
          <div className={`p-4 rounded-2xl border space-y-2 transition ${
            (app.formalities?.is_acknowledged || app.offer?.formality?.is_acknowledged)
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">2. Agreement E-Sign</span>
              {(app.formalities?.is_acknowledged || app.offer?.formality?.is_acknowledged) ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>SIGNED</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px]">
                  PENDING
                </span>
              )}
            </div>

            {(app.formalities?.is_acknowledged || app.offer?.formality?.is_acknowledged) ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400 block">KFS & Agreement Executed</span>
                <span className="text-[10px] text-slate-300 block font-mono">
                  IP: {app.formalities?.customer_ip || app.offer?.formality?.customer_ip || 'Captured'}
                </span>
                <span className="text-[10px] text-emerald-400/80 block">
                  Signed: {new Date(app.formalities?.customer_signed_at || app.offer?.formality?.customer_signed_at || app.updated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 block">Awaiting E-Signature</span>
                <p className="text-[11px] text-slate-500">Customer signs digitally upon accepting terms.</p>
              </div>
            )}
          </div>

          {/* Module 3: Stamp Duty & Fee Payment */}
          <div className={`p-4 rounded-2xl border space-y-2 transition ${
            payment?.status === 'verified' || payment?.status === 'completed'
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
              : hasPaymentProof
              ? 'bg-amber-950/40 border-amber-500/50 animate-pulse'
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">3. Stamping & Fee</span>
              {payment?.status === 'verified' || payment?.status === 'completed' ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>VERIFIED</span>
                </span>
              ) : hasPaymentProof ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40">
                  PROOF SUBMITTED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px]">
                  AWAITING
                </span>
              )}
            </div>

            {payment?.status === 'verified' || payment?.status === 'completed' ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400 block">₹{Number(payment.amount || 352.82).toFixed(2)} Paid & Verified</span>
                <span className="text-[10px] font-mono text-slate-300 block truncate">UTR: {payment.utr_number || 'Confirmed'}</span>
                <span className="text-[10px] text-emerald-400/80 block">Single Fee Rule: Cleared</span>
              </div>
            ) : hasPaymentProof ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300 block">Verify Receipt</span>
                <span className="text-[10px] font-mono text-slate-300 block truncate">UTR: {payment.utr_number}</span>
                <span className="text-[10px] text-amber-400/80 block">Action required in Box 2</span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 block">Fee: ₹352.82 (Fixed)</span>
                <p className="text-[11px] text-slate-500">Customer pays stamping fee upon offer acceptance.</p>
              </div>
            )}
          </div>

          {/* Module 4: Loan Disbursement */}
          <div className={`p-4 rounded-2xl border space-y-2 transition ${
            isDisbursed
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
              : app.current_status === 'ready_for_disbursement'
              ? 'bg-indigo-950/40 border-indigo-500/50'
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">4. Disbursement</span>
              {isDisbursed ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>DISBURSED</span>
                </span>
              ) : app.current_status === 'ready_for_disbursement' ? (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/40">
                  READY TO SEND
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px]">
                  IN PROCESS
                </span>
              )}
            </div>

            {isDisbursed ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400 block">
                  ₹{Number(disb?.amount || app.approved_amount || app.requested_amount).toLocaleString('en-IN')} Sent
                </span>
                <span className="text-[10px] text-slate-300 block truncate">Ref: {disb?.payout_reference || 'Completed'}</span>
                <span className="text-[10px] text-emerald-400/80 block">Active in Repayment Ledger</span>
              </div>
            ) : app.current_status === 'ready_for_disbursement' ? (
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-300 block">Ready for Payout</span>
                <p className="text-[11px] text-slate-400">Click "Verify & Send Money" in Box 2 to disburse.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 block">Awaiting Prerequisites</span>
                <p className="text-[11px] text-slate-500">Unlocks once terms are accepted and fee is verified.</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Stepper Indicator */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="font-semibold text-white">Live Customer Pipeline:</span>
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="text-emerald-400 font-bold">1. Applied ✓</span>
            <span className="text-slate-600">&rarr;</span>
            <span className={isOfferSent ? 'text-emerald-400 font-bold' : 'text-slate-500'}>2. Terms Sent {isOfferSent ? '✓' : ''}</span>
            <span className="text-slate-600">&rarr;</span>
            <span className={
              app.offer?.status === 'accepted'
                ? 'text-emerald-400 font-bold'
                : (app.offer?.status === 'declined' || app.current_status === 'offer_declined')
                ? 'text-rose-400 font-bold'
                : (isOfferSent ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-500')
            }>
              3. Customer {app.offer?.status === 'accepted' ? 'Accepted ✓' : ((app.offer?.status === 'declined' || app.current_status === 'offer_declined') ? 'Rejected ✕' : 'Reviewing...')}
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className={(app.formalities?.is_acknowledged || app.offer?.formality?.is_acknowledged) ? 'text-emerald-400 font-bold' : 'text-slate-500'}>4. E-Signed {(app.formalities?.is_acknowledged || app.offer?.formality?.is_acknowledged) ? '✓' : ''}</span>
            <span className="text-slate-600">&rarr;</span>
            <span className={payment?.status === 'verified' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>5. Fee Cleared {payment?.status === 'verified' ? '✓' : ''}</span>
            <span className="text-slate-600">&rarr;</span>
            <span className={isDisbursed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>6. Disbursed {isDisbursed ? '✓' : ''}</span>
          </div>
        </div>
      </div>

      {/* 4. ⚡ PRIMARY ADMIN BOX: Sanction Loan Terms & Final Approved Amount */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-blue-600/40 rounded-3xl p-6 shadow-2xl space-y-5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">1</div>
              <h2 className="font-extrabold text-base text-white">Sanction Loan Terms & Final Approved Amount</h2>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Review amount, adjust terms, and enter the final <strong>Approved Loan Amount</strong>, <strong>Tenure</strong>, and <strong>Interest Rate</strong>.
            </p>
          </div>

          {isOfferSent && (
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 w-fit border ${
              app.offer?.status === 'accepted'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : (app.offer?.status === 'declined' || app.current_status === 'offer_declined')
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              {app.offer?.status === 'accepted' ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>Customer Accepted</span>
                </>
              ) : (app.offer?.status === 'declined' || app.current_status === 'offer_declined') ? (
                <>
                  <XCircle size={13} />
                  <span>Customer Rejected Offer</span>
                </>
              ) : (
                <>
                  <Clock size={13} />
                  <span>Offer Active & Issued</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Real-time Customer Acceptance / Rejection Alert Banner inside Box 1 */}
        {app.offer?.status === 'accepted' || app.offer?.accepted_at ? (
          <div className="p-4 bg-gradient-to-r from-emerald-500/20 via-emerald-600/15 to-emerald-500/20 border-2 border-emerald-500/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-emerald-300 font-black text-xs uppercase tracking-wide block">
                  ✓ Customer Has Accepted The Final Sanctioned Amount!
                </span>
                <p className="text-xs text-white mt-0.5">
                  Customer agreed to <strong>₹{Number(app.offer.approved_amount).toLocaleString('en-IN')}</strong> for <strong>{app.offer.approved_tenure_months} Months</strong> @ <strong>{app.offer.interest_rate}% p.a.</strong> (Monthly EMI: <strong className="text-yellow-300">₹{Number(app.offer.emi_amount).toLocaleString('en-IN')}/mo</strong>).
                </p>
                <span className="text-[10px] text-emerald-300/80 font-mono block mt-0.5">
                  Accepted on: {new Date(app.offer.accepted_at).toLocaleString()}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/30 text-emerald-200 text-[11px] font-bold border border-emerald-400/40 shrink-0">
              Customer Accepted
            </span>
          </div>
        ) : (app.offer?.status === 'declined' || app.current_status === 'offer_declined') ? (
          <div className="p-4 bg-gradient-to-r from-rose-500/20 via-red-600/15 to-rose-500/20 border-2 border-rose-500/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black shrink-0 shadow-lg">
                <XCircle size={20} />
              </div>
              <div>
                <span className="text-rose-300 font-black text-xs uppercase tracking-wide block">
                  ⚠️ Customer Rejected / Declined Loan Offer
                </span>
                <p className="text-xs text-white mt-0.5">
                  Customer declined the loan offer of <strong>₹{Number(app.offer?.approved_amount || app.requested_amount).toLocaleString('en-IN')}</strong>. Reason: <strong className="text-rose-200">"{app.offer?.decline_reason || 'Terms not acceptable to customer'}"</strong>
                </p>
                <span className="text-[10px] text-rose-300/80 font-mono block mt-0.5">
                  Declined on: {app.offer?.declined_at ? new Date(app.offer.declined_at).toLocaleString() : 'Recently'} &bull; Adjust terms below and resend to renegotiate.
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-rose-500/30 text-rose-200 text-[11px] font-bold border border-rose-400/40 shrink-0">
              Customer Rejected
            </span>
          </div>
        ) : app.offer?.status === 'issued' ? (
          <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center gap-3 text-xs">
            <Clock size={18} className="text-amber-400 shrink-0 animate-spin" />
            <div>
              <span className="font-bold text-amber-300 block">Offer Issued — Awaiting Customer Acceptance</span>
              <p className="text-slate-300 text-[11px]">
                Sent ₹{Number(app.offer.approved_amount).toLocaleString('en-IN')} to the customer's portal. The customer has not accepted yet.
              </p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleQuickSanction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Approved Amount */}
            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">Approved Loan Amount (₹)</label>
              <input
                type="number"
                value={sanctionForm.approved_amount}
                onChange={(e) => setSanctionForm({ ...sanctionForm, approved_amount: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 p-2.5 rounded-xl text-white font-bold text-sm"
                required
              />
            </div>

            {/* Tenure */}
            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">Tenure (Months)</label>
              <input
                type="number"
                value={sanctionForm.approved_tenure_months}
                onChange={(e) => setSanctionForm({ ...sanctionForm, approved_tenure_months: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 p-2.5 rounded-xl text-white font-bold text-sm"
                required
              />
            </div>

            {/* Interest Rate */}
            <div className="space-y-1">
              <label className="block text-slate-300 font-bold">Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.1"
                value={sanctionForm.interest_rate}
                onChange={(e) => setSanctionForm({ ...sanctionForm, interest_rate: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 p-2.5 rounded-xl text-white font-bold text-sm"
                required
              />
            </div>

            {/* Manual Processing Fee */}
            <div className="space-y-1 bg-amber-500/10 p-2 rounded-2xl border border-amber-500/40">
              <label className="block text-amber-300 font-black flex items-center justify-between">
                <span>Stamping / Fee (₹)</span>
                <span className="text-[10px] uppercase bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">Required</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={sanctionForm.processing_fee}
                onChange={(e) => setSanctionForm({ ...sanctionForm, processing_fee: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-amber-500 p-2 rounded-xl text-amber-300 font-extrabold text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Quick Realtime Preview Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-500 text-[10px] block">Calculated Monthly EMI:</span>
                <span className="text-emerald-400 font-extrabold text-sm">₹{estimatedEmi.toLocaleString('en-IN')} /mo</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-slate-500 text-[10px] block">Fee to be Paid by Customer:</span>
                <span className="text-amber-300 font-bold text-sm">₹{Number(sanctionForm.processing_fee).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Optional remarks for applicant..."
                value={sanctionForm.remarks}
                onChange={(e) => setSanctionForm({ ...sanctionForm, remarks: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Single Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 text-white font-extrabold text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 active:scale-[0.99] ${
              app.offer?.status === 'declined' || app.current_status === 'offer_declined'
                ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:from-amber-500 hover:to-rose-500 shadow-amber-600/30'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
            }`}
          >
            <CheckCircle2 size={18} />
            <span>
              {submitting
                ? 'Updating Terms & Disbursal Status...'
                : (app.offer?.status === 'declined' || app.current_status === 'offer_declined')
                ? 'Re-negotiate & Resend Revised Loan Offer'
                : 'Send Approved - Ready for Disbursement'}
            </span>
          </button>
        </form>
      </div>

      {/* 5. 💸 STEP 2: Customer Payment Verification & Money Disbursement */}
      <div className={`rounded-3xl p-6 shadow-2xl space-y-5 text-xs border-2 ${
        isDisbursed
          ? 'bg-slate-950 border-emerald-500/40'
          : hasPaymentProof
          ? 'bg-slate-950 border-amber-500/50'
          : 'bg-slate-950 border-slate-800 opacity-90'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs ${isDisbursed ? 'bg-emerald-500 text-slate-950' : (payment?.status === 'verified' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950')}`}>2</div>
            <h2 className="font-extrabold text-base text-white">Payment Verification & Money Payout Desk</h2>
          </div>

          {isDisbursed ? (
            <span className="text-[11px] font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Funds Disbursed & Settled</span>
            </span>
          ) : payment?.status === 'verified' ? (
            <span className="text-[11px] font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Payment Verified & Confirmed</span>
            </span>
          ) : hasPaymentProof ? (
            <span className="text-[11px] font-bold px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1 animate-pulse">
              <Clock size={13} />
              <span>Payment Completed - Please Check</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Awaiting customer payment</span>
          )}
        </div>

        {/* ⚡ Prominent Alert: Payment Completed - Please Check */}
        {hasPaymentProof && payment?.status !== 'verified' && !isDisbursed && (
          <div className="p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-2 border-amber-500/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg">
                <Sparkles size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-amber-300 uppercase tracking-wide">⚡ Payment Completed - Please Check</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-bold border border-amber-400/40">Action Required</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Customer submitted <strong>₹{Number(payment.amount || 352.82).toFixed(2)}</strong> fee payment (UTR: <span className="font-mono text-amber-200 font-bold">{payment.utr_number || 'N/A'}</span>). Please verify screenshot and approve.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleVerifyPayment('approve')}
                disabled={submitting}
                className="flex-1 sm:flex-initial py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>Approve & Verify Payment</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reject this customer payment submission?')) {
                    handleVerifyPayment('reject');
                  }
                }}
                disabled={submitting}
                className="py-2.5 px-3 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-xl transition"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Payment Verification Box */}
        {payment ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block text-[10px]">Processing Fee Paid</span>
                <span className="font-bold text-white text-sm">₹{Number(payment.amount || app.offer?.processing_fee || 352.82).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Customer Submitted UTR</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{payment.utr_number || payment.gateway_reference || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Payment Status</span>
                <span className={`font-bold capitalize text-xs ${
                  payment.status === 'verified' || payment.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {payment.status?.replace(/_/g, ' ') || 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Submitted Date</span>
                <span className="text-slate-300">{payment.paid_at ? new Date(payment.paid_at).toLocaleString() : 'N/A'}</span>
              </div>
            </div>

            {/* Receipt Screenshot Preview */}
            {payment.receipt_path && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setSelectedReceiptUrl(`/storage/${payment.receipt_path}`)}
                    className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden cursor-pointer relative group shrink-0"
                  >
                    <img
                      src={`/storage/${payment.receipt_path}`}
                      alt="Receipt Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-110 transition"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                      View
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-white block">Customer Payment Receipt Screenshot</span>
                    <span className="text-[11px] text-slate-400 block">Click to inspect payment confirmation</span>
                  </div>
                </div>

                <a
                  href={`/storage/${payment.receipt_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-xl flex items-center gap-1.5 shrink-0"
                >
                  <ExternalLink size={13} />
                  <span>Open Full Size</span>
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 text-center py-4">
            Customer has not submitted processing fee payment yet. (They will pay once they receive your offer).
          </div>
        )}

        {/* 1-Click Payout Release Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Send Loan Amount to Customer</span>
              <span className="text-slate-400 text-[11px]">
                Target Bank: <strong>{financial?.primary_bank_name || 'Bank'}</strong> (A/C: {financial?.account_number || 'N/A'}, IFSC: {financial?.ifsc_code || 'N/A'})
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Amount to Send:</span>
              <span className="text-lg font-black text-emerald-400">
                ₹{Number(app.approved_amount || app.requested_amount || 50000).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-bold mb-1">Bank Payout Reference / UTR Number</label>
              <input
                type="text"
                value={payoutReference}
                onChange={(e) => setPayoutReference(e.target.value)}
                placeholder="e.g. NEFT-RCR-987654"
                className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono font-bold"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleQuickDisburse}
                disabled={submitting}
                className={`w-full py-2.5 px-4 font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg ${
                  isDisbursed
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                <ShieldCheck size={16} />
                <span>{isDisbursed ? 'Funds Already Disbursed' : 'Verify & Send Money (Disburse)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. 📊 STEP 3: Loan Repayments & EMI Schedule Ledger */}
      {(isDisbursed || app.current_status === 'closed' || (app.repaymentSchedules && app.repaymentSchedules.length > 0)) && (
        <div className="bg-slate-950 border-2 border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">3</div>
              <div>
                <h2 className="font-extrabold text-base text-white">Loan Repayment & EMI Schedule Ledger</h2>
                <p className="text-slate-400 text-[11px]">
                  Track incoming customer EMI payments, verify UTR/receipts, and monitor balance reconciliation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/applications/${app.id}/repay`}
                target="_blank"
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <ExternalLink size={13} />
                <span>Customer Repay View</span>
              </Link>
            </div>
          </div>

          {/* Pending Repayment Verifications */}
          {app.repaymentTransactions && app.repaymentTransactions.filter(t => t.status === 'pending_verification').length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Clock size={16} />
                <span>Customer Repayment Pending Verification</span>
              </div>

              {app.repaymentTransactions.filter(t => t.status === 'pending_verification').map((tx) => (
                <div key={tx.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">
                      ₹{Number(tx.amount).toLocaleString('en-IN')} &bull; {tx.repayment_type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      UTR: <strong className="text-blue-400">{tx.utr_number}</strong> &bull; Paid: {new Date(tx.paid_at || tx.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tx.receipt_path && (
                      <button
                        onClick={() => setSelectedReceiptUrl(`/storage/${tx.receipt_path}`)}
                        className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-xl text-xs"
                      >
                        View Proof
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await api.post(`/staff/repayments/${tx.id}/verify`, { status: 'verified' });
                          alert('Repayment verified & credited to loan ledger!');
                          fetchApp();
                        } catch (e) {
                          alert('Verification failed.');
                        }
                      }}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                    >
                      Verify & Credit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Month-by-Month Installments Ledger */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                  <th className="pb-3">EMI #</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Principal (₹)</th>
                  <th className="pb-3">Interest (₹)</th>
                  <th className="pb-3">EMI Amount (₹)</th>
                  <th className="pb-3">Remaining Balance (₹)</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Payment Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(app.repaymentSchedules || app.repayment_schedules || []).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 font-bold text-white">#{s.installment_number}</td>
                    <td className="py-2.5 text-slate-300 font-mono">
                      {new Date(s.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-2.5 text-slate-300">₹{Number(s.principal_component).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-slate-400">₹{Number(s.interest_component).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 font-bold text-white">₹{Number(s.emi_amount).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-slate-400 font-mono">₹{Number(s.remaining_principal).toLocaleString('en-IN')}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                        s.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : s.status === 'processing_verification'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {s.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-[10px] text-blue-400">
                      {s.utr_number ? `UTR: ${s.utr_number}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6.5 📜 LIVE CUSTOMER & SYSTEM ACTIVITY TIMELINE */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-400" />
            <h3 className="font-extrabold text-sm text-white">Live Customer & System Action Timeline</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {app.statusHistory?.length || 0} Recorded Milestones
          </span>
        </div>

        <div className="space-y-3">
          {(app.statusHistory || []).map((h, idx) => (
            <div key={h.id || idx} className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0 ring-4 ring-blue-500/10" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      {h.to_status?.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                      by {h.changedBy?.name || 'Customer / System'}
                    </span>
                  </div>
                  {h.reason && (
                    <p className="text-slate-300 text-[11px] mt-1">
                      {h.reason}
                    </p>
                  )}
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-400 shrink-0 self-end sm:self-auto">
                {new Date(h.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          ))}

          {(!app.statusHistory || app.statusHistory.length === 0) && (
            <p className="text-slate-500 text-center py-4">No status transition events logged yet.</p>
          )}
        </div>
      </div>

      {/* 7. Internal Staff Notes */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3 text-xs">
        <h3 className="font-bold text-sm text-white">Internal Staff Notes</h3>
        <form onSubmit={handleAddNote} className="flex gap-2">
          <input
            type="text"
            placeholder="Add internal confidential underwriter note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition">
            Post Note
          </button>
        </form>

        <div className="space-y-2 pt-1">
          {notes?.map((n) => (
            <div key={n.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
              <div className="flex justify-between text-[10px] text-slate-500 pb-1">
                <span className="font-bold text-blue-400">{n.author?.name}</span>
                <span>{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <p>{n.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Screenshot Modal */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedReceiptUrl(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-white font-bold text-xs">Payment Receipt Screenshot</span>
              <button onClick={() => setSelectedReceiptUrl(null)} className="text-slate-400 hover:text-white font-bold text-sm">&times; Close</button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/40 rounded-xl p-2">
              <img src={selectedReceiptUrl} alt="Full Receipt" className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
            <div className="text-right">
              <a
                href={selectedReceiptUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Download File</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

