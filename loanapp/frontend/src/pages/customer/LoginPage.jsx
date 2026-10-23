import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import { ForgotPasswordModal } from '../../components/ForgotPasswordModal';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/app';
  const navigate = useNavigate();
  const { login, setAuthSession } = useAuth();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      sessionStorage.removeItem('rcr_draft_prompt_dismissed');
      await login(loginId, password);
      navigate(redirect);
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center space-y-6 pb-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <BrandLogo size="lg" showText={false} />
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-500 max-w-xs">
          Sign in to your RCR account to track loans, upload documents, and receive disbursements.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email or Mobile Number</label>
            <div className="relative">
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter your registered email or phone"
                className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 pl-9 font-medium"
                required
              />
              <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 pl-9 font-medium"
                required
              />
              <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-98 transition mt-2 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-blue-600 hover:underline">
              Create Free Account &rarr;
            </Link>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>256-Bit SSL Encrypted & RBI Regulatory Compliant</span>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialLogin={loginId}
        theme="light"
        onSuccess={(data) => {
          if (data?.token && data?.user) {
            setAuthSession(data.token, data.user);
            navigate(redirect);
          }
        }}
      />
    </div>
  );
};
