import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { trackMetaEvent } from '../../utils/metaPixel';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/app';
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      sessionStorage.removeItem('rcr_draft_prompt_dismissed');
      await register(form);
      trackMetaEvent('CompleteRegistration', {
        content_name: 'Customer Registration',
        status: 'completed'
      });
      navigate(redirect);
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center space-y-5 pb-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <BrandLogo size="lg" showText={false} />
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Create Customer Account</h2>
        <p className="text-xs text-slate-500">Fast digital application in under 5 minutes</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="As per PAN Card"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 pl-9"
                required
              />
              <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 pl-9"
                required
              />
              <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="10 digit mobile"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 pl-9"
                required
              />
              <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 pl-9"
                required
              />
              <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs font-bold text-white btn-gradient rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <span>{loading ? 'Creating Account...' : 'Register & Continue'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
