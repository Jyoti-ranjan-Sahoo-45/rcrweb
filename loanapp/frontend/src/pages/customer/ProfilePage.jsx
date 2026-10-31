import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Building2,
  FileText,
  Lock,
  LogOut,
  ChevronRight,
  HelpCircle,
  Headphones,
  Award,
  Sparkles,
  Info,
  CheckCircle2,
  Camera,
  Upload,
  Edit2,
  Check,
  MessageSquare,
  Ticket,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get('/customer/dashboard');
        setDashboardData(res.data);
      } catch (e) {
        console.error('Failed to load profile dashboard metrics', e);
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setSuccessMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result;
        try {
          const res = await api.post('/user/avatar', {
            avatar_base64: base64Data,
          });

          if (res.data?.user) {
            updateUser(res.data.user);
            setSuccessMsg('Profile picture updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
          }
        } catch (err) {
          console.error('Avatar upload failed', err);
          alert('Failed to upload profile picture: ' + (err.response?.data?.message || err.message));
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      alert('Error reading image file');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await api.post('/user/profile', formData);
      if (res.data?.user) {
        updateUser(res.data.user);
        setIsEditing(false);
        setSuccessMsg('Profile details updated!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to save profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaveLoading(false);
    }
  };

  const profileSummary = dashboardData?.profile_summary || {
    credit_score: 750,
    has_evaluated_score: false,
    credit_score_label: 'Prime Estimate',
    account_tier: 'New Borrower',
    kyc_status: 'Pending',
    total_applications: 0,
    total_borrowed: 0,
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-500 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center overflow-hidden shadow-xl">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>

            {/* Clickable Camera Trigger */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Upload Profile Photo"
              className="absolute -bottom-1 -right-1 p-2 bg-white hover:bg-slate-100 text-blue-600 rounded-2xl shadow-lg border border-white/80 transition active:scale-95"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin text-blue-600" />
              ) : (
                <Camera size={14} />
              )}
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <h1 className="text-lg font-extrabold tracking-tight truncate">
                  {user?.name || 'Borrower'}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                    profileSummary.kyc_status === 'Verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  }`}
                >
                  <ShieldCheck size={11} />
                  <span>{profileSummary.kyc_status}</span>
                </span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 bg-white/15 hover:bg-white/25 rounded-xl transition text-white"
                title="Edit Details"
              >
                <Edit2 size={13} />
              </button>
            </div>

            <p className="text-xs text-blue-100 font-medium truncate mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-blue-200/90 font-mono mt-0.5">{user?.phone || '+91 98765 43210'}</p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-white/90 hover:text-white underline decoration-blue-300/60"
            >
              <Upload size={11} />
              <span>Change Profile Photo</span>
            </button>
          </div>
        </div>

        {/* Dynamic Account Highlights (Pulled from Live Application & Assessment Data) */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/15 text-center text-xs">
          <div>
            <span className="text-[10px] text-blue-200 block font-medium">Credit Score</span>
            <span className="text-sm font-extrabold text-white flex items-center justify-center gap-1 mt-0.5">
              <Award size={13} className="text-amber-300" />
              {profileSummary.credit_score}
            </span>
            <span className="text-[9px] text-blue-200/80 block mt-0.5">
              {profileSummary.credit_score_label}
            </span>
          </div>

          <div className="border-x border-white/15">
            <span className="text-[10px] text-blue-200 block font-medium">Account Tier</span>
            <span
              className={`text-sm font-extrabold mt-0.5 block ${
                profileSummary.account_tier === 'Prime'
                  ? 'text-emerald-300'
                  : profileSummary.account_tier === 'Standard'
                  ? 'text-blue-200'
                  : 'text-amber-200'
              }`}
            >
              {profileSummary.account_tier}
            </span>
            <span className="text-[9px] text-blue-200/80 block mt-0.5">
              {profileSummary.total_applications} Loans
            </span>
          </div>

          <div>
            <span className="text-[10px] text-blue-200 block font-medium">KYC Status</span>
            <span className="text-sm font-extrabold text-white flex items-center justify-center gap-1 mt-0.5">
              {profileSummary.kyc_status === 'Verified' ? (
                <CheckCircle2 size={13} className="text-emerald-300" />
              ) : (
                <AlertCircle size={13} className="text-amber-300" />
              )}
              {profileSummary.kyc_status}
            </span>
            <span className="text-[9px] text-blue-200/80 block mt-0.5">
              {profileSummary.kyc_status === 'Verified' ? 'Approved' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form Drawer */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-3xl p-5 shadow-sm border border-blue-100 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Edit Personal Profile
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Mobile Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              {saveLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Options Menu */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-1">
        <h3 className="px-3 py-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          Account & Documents
        </h3>

        <Link
          to="/applications"
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">My Loan Applications</p>
              <p className="text-[10px] text-slate-400">
                {profileSummary.total_applications} applications on record
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 transition" />
        </Link>

        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">KYC & Identity Proofs</p>
              <p className="text-[10px] text-slate-400">Aadhaar XML, PAN Card & Address Documents</p>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              profileSummary.kyc_status === 'Verified'
                ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                : 'text-amber-600 bg-amber-50 border-amber-200'
            }`}
          >
            {profileSummary.kyc_status}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Linked Bank & e-Mandate</p>
              <p className="text-[10px] text-slate-400">Disbursement & auto-debit account</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 transition" />
        </div>
      </div>

      {/* Security & Support Menu */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-1">
        <h3 className="px-3 py-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          Security & Support
        </h3>

        <button
          onClick={() => setShowSupportModal(true)}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Headphones size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">24x7 Customer Support</p>
              <p className="text-[10px] text-slate-400">Loan officer helpline & grievance officer</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 transition" />
        </button>

        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Security & Privacy</p>
              <p className="text-[10px] text-slate-400">256-bit SSL encryption, App lock & 2FA</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-700 transition" />
        </div>
      </div>

      {/* Regulatory NBFC & App Version Badge */}
      <div className="bg-slate-100/80 rounded-2xl p-4 text-center space-y-1 text-slate-500">
        <p className="text-[11px] font-bold text-slate-700">RCR Digital Lending Platform</p>
        <p className="text-[10px]">
          Regulated by Reserve Bank of India (RBI) Fair Practices Code
        </p>
        <p className="text-[9px] font-mono text-slate-400 pt-1">App Version 1.2.4 (Enterprise Native)</p>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-2xl border border-red-200/60 flex items-center justify-center gap-2 transition shadow-sm"
      >
        <LogOut size={16} />
        <span>Log Out of My Account</span>
      </button>

      {/* Support Helpline Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Headphones size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Customer Grievance & Support</h3>
                <p className="text-[10px] text-slate-500">RCR Lending Solutions Helpdesk</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              {/* Raise Support Ticket Button */}
              <Link
                to="/contact-us"
                onClick={() => setShowSupportModal(false)}
                className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl flex items-center justify-between font-bold text-xs transition active:scale-98 shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Ticket size={18} />
                  <div>
                    <span className="block font-black text-sm">Raise Support Ticket</span>
                    <span className="text-[10px] text-blue-100 font-normal">Fast ticket resolution & assistance</span>
                  </div>
                </div>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg">&rarr;</span>
              </Link>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Email Support</span>
                <p className="font-bold text-slate-800 font-mono">rcrcontactteam@gmail.com</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Grievance Redressal Officer</span>
                <p className="font-bold text-slate-800">Mr. Anand Verma</p>
                <p className="text-[10px] text-slate-500">grievance@rcrfinance.com</p>
              </div>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
