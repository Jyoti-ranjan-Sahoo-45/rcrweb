import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Eye, 
  EyeOff, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

export const ForgotPasswordModal = ({ isOpen, onClose, onSuccess, initialLogin = '', theme = 'light' }) => {
  const isDark = theme === 'dark';

  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [loginInput, setLoginInput] = useState(initialLogin);
  const [targetEmail, setTargetEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (initialLogin) {
      setLoginInput(initialLogin);
    }
  }, [initialLogin]);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setStep(1);
    setOtp('');
    setPassword('');
    setPasswordConfirmation('');
    onClose();
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setErrorMsg('Please enter your registered email address or phone number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { login: loginInput.trim() });
      if (res.data?.success) {
        setTargetEmail(res.data.email);
        setMaskedEmail(res.data.masked_email || res.data.email);
        setStep(2);
        setResendTimer(60);
        setSuccessMsg(res.data.message || 'OTP sent successfully.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;

    setResending(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { login: targetEmail || loginInput.trim() });
      if (res.data?.success) {
        setResendTimer(60);
        setSuccessMsg('A new 6-digit OTP code has been sent to your email.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp || otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMsg('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: targetEmail,
        otp: otp.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Password reset successfully!');
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(res.data);
            handleClose();
          }, 1200);
        } else {
          setTimeout(() => {
            handleClose();
          }, 2000);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Password reset failed. Please verify the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl relative border ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-white' 
            : 'bg-white border-slate-100 text-slate-900'
        } space-y-5`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-5 right-5 p-1.5 rounded-xl transition ${
            isDark 
              ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
            <KeyRound size={22} />
          </div>
          <div>
            <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {step === 1 ? 'Reset Account Password' : 'Enter OTP & Set Password'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === 1 
                ? 'Receive a 6-digit verification code to your email' 
                : `Enter the verification code sent to ${maskedEmail || 'your email'}`
              }
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= STEP 1: REQUEST OTP ================= */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Registered Email or Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="e.g. name@example.com or 9876543210"
                  className={`w-full text-xs px-3.5 py-3 rounded-xl border pl-9 font-medium focus:outline-none focus:border-blue-500 transition ${
                    isDark 
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  autoFocus
                  required
                />
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                A 6-digit OTP code will be sent to the email registered with this account.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= STEP 2: VERIFY OTP & RESET ================= */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  6-Digit OTP Verification Code *
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || resending}
                  className="text-[11px] text-blue-500 hover:underline disabled:text-slate-500 disabled:no-underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={11} className={resending ? 'animate-spin' : ''} />
                  <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}</span>
                </button>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className={`w-full text-center text-lg font-mono font-black tracking-[8px] py-2.5 rounded-xl border focus:outline-none focus:border-blue-500 transition ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-blue-400' 
                    : 'bg-blue-50/50 border-blue-200 text-blue-600'
                }`}
                autoFocus
                required
              />
              <p className="text-[10px] text-slate-400 text-center mt-1">
                Valid for 15 minutes. Check inbox or spam folder.
              </p>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border pl-9 pr-9 font-medium focus:outline-none focus:border-blue-500 transition ${
                    isDark 
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
                <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Re-enter your new password"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border pl-9 font-medium focus:outline-none focus:border-blue-500 transition ${
                    isDark 
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
                <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`px-4 py-3 text-xs font-semibold rounded-xl border transition ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Set Password & Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
