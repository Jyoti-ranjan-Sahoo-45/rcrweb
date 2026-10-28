import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SplashScreen } from './components/SplashScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MetaPixelTracker } from './components/MetaPixelTracker';

// Public Pages & Play Store Compliance
import { LandingPage } from './pages/public/LandingPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsConditionsPage } from './pages/public/TermsConditionsPage';
import { AccountDeletionPage } from './pages/public/AccountDeletionPage';
import { GrievancePage } from './pages/public/GrievancePage';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { ApplyPage } from './pages/customer/ApplyPage';
import { ApplicationDetailPage } from './pages/customer/ApplicationDetailPage';
import { OfferPage } from './pages/customer/OfferPage';
import { FormalitiesPage } from './pages/customer/FormalitiesPage';
import { PaymentPage } from './pages/customer/PaymentPage';
import { RepaymentPage } from './pages/customer/RepaymentPage';
import { ApplicationsListPage } from './pages/customer/ApplicationsListPage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';
import { ProfilePage } from './pages/customer/ProfilePage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminApplicationDetailPage } from './pages/admin/AdminApplicationDetailPage';
import { AdminVerificationQueuePage } from './pages/admin/AdminVerificationQueuePage';
import { AdminUnderwritingPage } from './pages/admin/AdminUnderwritingPage';
import { AdminSanctionsOffersPage } from './pages/admin/AdminSanctionsOffersPage';
import { AdminDisbursementDeskPage } from './pages/admin/AdminDisbursementDeskPage';
import { AdminRepaymentsQueuePage } from './pages/admin/AdminRepaymentsQueuePage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminTeamPage } from './pages/admin/AdminTeamPage';

// Smart Root Route: Directs Android app users to Login/Dashboard, and web visitors to Landing Page
const RootRoute = () => {
  const { user, loading } = useAuth();

  const isAndroidApp = typeof window !== 'undefined' && (
    window.AndroidBridge !== undefined ||
    navigator.userAgent.includes('RCRFinanceApp') ||
    new URLSearchParams(window.location.search).get('source') === 'android'
  );

  if (isAndroidApp) {
    if (loading) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 text-xs gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading RCR Finance App...</span>
        </div>
      );
    }
    if (user) {
      return <Navigate to="/app" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Regular website visitors see the Public Landing Page
  return <LandingPage />;
};

// Protected Route wrappers
const ProtectedCustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading, isStaff } = useAuth();
  if (loading) return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading...</div>;
  if (!user || !isStaff) return <Navigate to="/admin/login" replace />;
  return children;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only on Android app initial launch or reload
    const isAndroid = typeof window !== 'undefined' && (
      window.AndroidBridge !== undefined ||
      navigator.userAgent.includes('RCRFinanceApp') ||
      new URLSearchParams(window.location.search).get('source') === 'android'
    );
    if (!isAndroid) return false;
    return !sessionStorage.getItem('rcr_splash_shown');
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('rcr_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <BrowserRouter>
          <MetaPixelTracker />
          <Routes>
            {/* Public Root & Policy Routes */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
            <Route path="/terms" element={<TermsConditionsPage />} />
            <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
            <Route path="/delete-account" element={<AccountDeletionPage />} />
            <Route path="/account-deletion" element={<Navigate to="/delete-account" replace />} />
            <Route path="/grievance" element={<GrievancePage />} />

            {/* Customer Routes (Mobile & Web In-App Layout) */}
            <Route element={<CustomerLayout />}>
              <Route path="/app" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/app" replace />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Customer Flows */}
              <Route path="/apply/:productId" element={<ProtectedCustomerRoute><ApplyPage /></ProtectedCustomerRoute>} />
              <Route path="/applications" element={<ProtectedCustomerRoute><ApplicationsListPage /></ProtectedCustomerRoute>} />
              <Route path="/applications/:id" element={<ProtectedCustomerRoute><ApplicationDetailPage /></ProtectedCustomerRoute>} />
              <Route path="/applications/:id/offer" element={<ProtectedCustomerRoute><OfferPage /></ProtectedCustomerRoute>} />
              <Route path="/applications/:id/formalities" element={<ProtectedCustomerRoute><FormalitiesPage /></ProtectedCustomerRoute>} />
              <Route path="/applications/:id/payment" element={<ProtectedCustomerRoute><PaymentPage /></ProtectedCustomerRoute>} />
              <Route path="/applications/:id/repay" element={<ProtectedCustomerRoute><RepaymentPage /></ProtectedCustomerRoute>} />
              <Route path="/profile" element={<ProtectedCustomerRoute><ProfilePage /></ProtectedCustomerRoute>} />
            </Route>

            {/* Admin & Staff Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/staff/login" element={<AdminLoginPage />} />
            <Route path="/staff" element={<Navigate to="/staff/login" replace />} />
            <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="applications" element={<AdminApplicationsPage />} />
              <Route path="applications/:id" element={<AdminApplicationDetailPage />} />
              <Route path="queue/verification" element={<AdminVerificationQueuePage />} />
              <Route path="queue/underwriting" element={<AdminUnderwritingPage />} />
              <Route path="queue/sanctions" element={<AdminSanctionsOffersPage />} />
              <Route path="queue/disbursement" element={<AdminDisbursementDeskPage />} />
              <Route path="queue/repayments" element={<AdminRepaymentsQueuePage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="team" element={<AdminTeamPage />} />
            </Route>

            {/* Catch all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

