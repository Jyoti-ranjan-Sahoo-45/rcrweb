import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import { ForgotPasswordModal } from '../../components/ForgotPasswordModal';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { getStaffDefaultRoute } from '../../utils/staffRouting';

export const AdminLoginPage = () => {
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
      const data = await login(loginId, password);
      if (data?.user?.role === 'customer') {
        setErrorMsg('Access denied. Staff credentials required for Backoffice operations.');
        return;
      }
      const targetRoute = getStaffDefaultRoute(data?.user);
      navigate(targetRoute);
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Invalid staff credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-2">
          <BrandLogo size="lg" theme="dark" showText={false} />
          <h2 className="text-2xl font-black text-white tracking-tight pt-1">RCR Operations Portal</h2>
          <p className="text-xs text-slate-400">Authorized staff authentication & loan management desk</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 pl-9 font-medium"
                  required
                />
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full text-xs px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 pl-9 font-medium"
                  required
                />
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-98 mt-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Operations'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-slate-500">
            Internal NBFC Backoffice • Unauthorized access is strictly logged & monitored
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialLogin={loginId}
        theme="dark"
        onSuccess={(data) => {
          if (data?.token && data?.user) {
            setAuthSession(data.token, data.user);
            navigate(getStaffDefaultRoute(data.user));
          }
        }}
      />
    </div>
  );
};
