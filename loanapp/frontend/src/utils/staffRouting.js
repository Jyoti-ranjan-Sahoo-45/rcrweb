/**
 * Staff RBAC & Routing Utilities
 */

export const PERMISSION_MODULES = [
  {
    module: 'LOS Operation Queues',
    description: 'Core lending lifecycle queues and application processing',
    permissions: [
      { key: 'applications_view', label: 'View Applications', desc: 'Browse and search incoming loan applications' },
      { key: 'applications_delete', label: 'Delete Applications', desc: 'Permanently remove applications & bulk delete' },
      { key: 'kyc_verification', label: 'KYC & Doc Verification', desc: 'Review Aadhaar, PAN, Bank statements & verify KYC' },
      { key: 'underwriting_assess', label: 'Credit Underwriting', desc: 'Credit assessment, CIBIL/bureau review, risk grading' },
      { key: 'sanctions_approve', label: 'Sanction & Loan Offers', desc: 'Approve sanction letters, configure loan offers & APR' },
      { key: 'disbursement_process', label: 'Disbursement Desk', desc: 'Process NEFT/IMPS payout, verify bank UTRs' },
      { key: 'repayments_manage', label: 'Repayments & Collections', desc: 'Track EMIs, record offline collections, mark default' },
    ],
  },
  {
    module: 'Customers & Products',
    description: 'Borrower records and loan scheme product catalog',
    permissions: [
      { key: 'customers_view', label: 'Customer 360 Directory', desc: 'Access borrower profiles, loan histories, and contacts' },
      { key: 'products_manage', label: 'Loan Schemes & Products', desc: 'Configure loan products, interest rates, fee tiers' },
    ],
  },
  {
    module: 'Analytics & Governance',
    description: 'Business intelligence, audit trail and staff access controls',
    permissions: [
      { key: 'mis_analytics', label: 'Operations Command / MIS', desc: 'Access central KPI dashboard and real-time metrics' },
      { key: 'reports_view', label: 'Portfolio Reports', desc: 'Download MIS, NPA, DPD aging & disbursement reports' },
      { key: 'audit_view', label: 'Audit Trail Logs', desc: 'Inspect administrative and staff system activity logs' },
      { key: 'staff_manage', label: 'Staff & Roles Management', desc: 'Onboard employees, assign roles, passwords & permissions' },
    ],
  },
];

export const getStaffDefaultRoute = (user) => {
  if (!user) return '/admin/login';
  if (user.role === 'super_admin') return '/admin';
  const perms = Array.isArray(user.effective_permissions) ? user.effective_permissions : [];

  if (perms.includes('mis_analytics')) return '/admin';
  if (perms.includes('underwriting_assess')) return '/admin/queue/underwriting';
  if (perms.includes('sanctions_approve')) return '/admin/queue/sanctions';
  if (perms.includes('kyc_verification')) return '/admin/queue/verification';
  if (perms.includes('disbursement_process')) return '/admin/queue/disbursement';
  if (perms.includes('repayments_manage')) return '/admin/queue/repayments';
  if (perms.includes('applications_view')) return '/admin/applications';
  if (perms.includes('customers_view')) return '/admin/customers';
  if (perms.includes('products_manage')) return '/admin/products';
  if (perms.includes('staff_manage')) return '/admin/team';
  if (perms.includes('audit_view')) return '/admin/audit-logs';
  if (perms.includes('reports_view')) return '/admin/reports';

  return '/admin';
};
