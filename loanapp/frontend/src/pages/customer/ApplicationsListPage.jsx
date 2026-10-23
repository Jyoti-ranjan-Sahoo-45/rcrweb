import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FileText, ChevronRight, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

export const ApplicationsListPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications');
        setApplications(res.data?.data?.data || []);
      } catch (e) {
        console.error('Failed to load applications', e);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
      case 'offer_accepted':
      case 'disbursed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'additional_information_required':
      case 'payment_pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">My Applications</h2>
          <p className="text-[11px] text-slate-400">Track all your active and past loan requests</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition flex items-center gap-1 text-xs font-bold"
        >
          <Plus size={16} />
          <span>New Loan</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-slate-200 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center space-y-3 border border-slate-100">
          <FileText size={40} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-sm text-slate-800">No applications yet</h3>
          <p className="text-xs text-slate-400">Apply for instant loans tailored to your requirements.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 py-2 px-4 text-xs font-bold text-white btn-gradient rounded-xl shadow"
          >
            Explore Loans
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link
              key={app.id}
              to={`/applications/${app.id}`}
              className="block bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:border-blue-200 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{app.application_number}</span>
                  <h4 className="font-bold text-slate-900 text-sm">{app.product?.name}</h4>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${getStatusBadge(app.current_status)}`}>
                  {app.current_status?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Requested Amount</span>
                  <span className="font-extrabold text-slate-800">₹{Number(app.requested_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Applied Date</span>
                  <span className="font-medium text-slate-600">{new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
