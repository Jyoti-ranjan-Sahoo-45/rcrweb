import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  ShieldAlert,
  ArrowRightLeft,
  FileSpreadsheet,
  Settings,
  Layers,
  CheckSquare,
  Calculator,
  Gift,
  Send,
  LogOut,
  ChevronRight,
  Search,
  Shield,
  Activity,
  Sliders,
  Award,
  CreditCard,
  UserCheck
} from 'lucide-react';

import { getStaffDefaultRoute } from '../utils/staffRouting';

export const AdminLayout = () => {
  const { user, logout, hasPermission, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    verification: 0,
    underwriting: 0,
    sanctions: 0,
    disbursement: 0,
  });

  // Auto-redirect if employee lands on /admin without mis_analytics permission
  useEffect(() => {
    if (user && user.role !== 'super_admin' && location.pathname === '/admin') {
      const perms = Array.isArray(user.effective_permissions) ? user.effective_permissions : [];
      if (!perms.includes('mis_analytics')) {
        const dest = getStaffDefaultRoute(user);
        if (dest && dest !== '/admin') {
          navigate(dest, { replace: true });
        }
      }
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    const fetchQuickCounts = async () => {
      try {
        const res = await api.get('/staff/dashboard');
        if (res.data?.metrics) {
          setCounts({
            verification: res.data.metrics.verification_queue || 0,
            underwriting: res.data.metrics.underwriting_queue || 0,
            sanctions: res.data.metrics.sanction_queue || 0,
            disbursement: res.data.metrics.disbursement_queue || 0,
          });
        }
      } catch (e) {
        // silent fail on count poll
      }
    };
    fetchQuickCounts();
    const interval = setInterval(fetchQuickCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const rawNavSections = [
    {
      title: 'EXECUTIVE & MIS',
      items: [
        { label: 'Operations Command', path: '/admin', icon: LayoutDashboard, exact: true, permission: 'mis_analytics' },
        { label: 'Portfolio Analytics', path: '/admin/reports', icon: FileSpreadsheet, permission: 'reports_view' },
      ],
    },
    {
      title: 'LOAN ORIGINATION (LOS)',
      items: [
        { label: 'All Applications Queue', path: '/admin/applications', icon: Layers, permission: 'applications_view' },
        {
          label: '1. KYC & Doc Verification',
          path: '/admin/queue/verification',
          icon: FileCheck,
          permission: 'kyc_verification',
          badge: counts.verification,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        },
        {
          label: '2. Credit Underwriting',
          path: '/admin/queue/underwriting',
          icon: Calculator,
          permission: 'underwriting_assess',
          badge: counts.underwriting,
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        },
        {
          label: '3. Sanction & Offers',
          path: '/admin/queue/sanctions',
          icon: Gift,
          permission: 'sanctions_approve',
          badge: counts.sanctions,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        },
        {
          label: '4. Disbursement Desk',
          path: '/admin/queue/disbursement',
          icon: Send,
          permission: 'disbursement_process',
          badge: counts.disbursement,
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        },
        {
          label: '5. Repayments & Collections',
          path: '/admin/queue/repayments',
          icon: CreditCard,
          permission: 'repayments_manage',
        },
      ],
    },
    {
      title: 'PORTFOLIO & CUSTOMERS',
      items: [
        { label: 'Customer 360 Directory', path: '/admin/customers', icon: Users, permission: 'customers_view' },
        { label: 'Loan Schemes & Products', path: '/admin/products', icon: Sliders, permission: 'products_manage' },
      ],
    },
    {
      title: 'GOVERNANCE & TEAM',
      items: [
        { label: 'Compliance & Audit Trail', path: '/admin/audit-logs', icon: Activity, permission: 'audit_view' },
        { label: 'Operations Staff Team', path: '/admin/team', icon: UserCheck, permission: 'staff_manage' },
      ],
    },
  ];

  const navSections = rawNavSections.map((sec) => {
    const visibleItems = sec.items.filter((item) => {
      if (!user) return false;
      if (user.role === 'super_admin') return true;
      if (!item.permission) return true;
      const perms = Array.isArray(user.effective_permissions) ? user.effective_permissions : [];
      return perms.includes(item.permission);
    });
    return { ...sec, items: visibleItems };
  }).filter((sec) => sec.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 shadow-2xl">
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Brand Header */}
          <div className="px-2 py-3 border-b border-slate-800">
            <BrandLogo size="md" theme="dark" />
          </div>

          {/* Nav Sections */}
          <nav className="space-y-5">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {sec.title}
                </p>
                <div className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? location.pathname === item.path
                      : location.pathname === item.path ||
                        (item.path !== '/admin' && location.pathname.startsWith(item.path));

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Staff User'}</p>
                <p className="text-[10px] text-slate-400 capitalize truncate">
                  {user?.role_record?.display_name || user?.role?.replace(/_/g, ' ') || 'Officer'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout Session"
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Operational Header */}
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">RCR Operations</span>
            <ChevronRight size={14} />
            <span className="text-blue-400 font-bold capitalize">
              {location.pathname.replace('/admin', '').replace('/queue/', 'Queue: ').replace('/', '') || 'Operations Command'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">NBFC Core Engine Online</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
