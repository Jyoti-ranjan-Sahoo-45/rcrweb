import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PERMISSION_MODULES } from '../../utils/staffRouting';
import {
  UserCheck,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Key,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Sliders,
  Layers,
  Search,
  AlertTriangle,
  Check,
  X,
  Sparkles,
  Send,
  Copy,
  Users,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AdminTeamPage = () => {
  const { user: currentUser, isSuperAdmin, hasPermission } = useAuth();

  // Primary State
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'roles'
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteRoleTarget, setDeleteRoleTarget] = useState(null);

  // Selected Employee for edit / reset
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Form states
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // New Employee Form
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    assignmentType: 'role', // 'role' (Type 2) or 'custom' (Type 1)
    role_id: '',
    custom_permissions: [],
    send_email: true,
  });
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Edit Employee Form
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    assignmentType: 'role',
    role_id: '',
    custom_permissions: [],
  });

  // Password Reset Form
  const [resetPasswordText, setResetPasswordText] = useState('');
  const [resetSendEmail, setResetSendEmail] = useState(true);
  const [showResetPasswordText, setShowResetPasswordText] = useState(false);

  // Role Template Form
  const [roleForm, setRoleForm] = useState({
    id: null,
    display_name: '',
    description: '',
    permissions: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/employees');
      if (res.data?.data) {
        setStaff(res.data.data.staff || []);
        setRoles(res.data.data.roles || []);
      }
    } catch (e) {
      console.error('Failed to load staff and roles', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper: Generate Secure Permanent Password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Rcr@${rand}`;
  };

  const handleOpenOnboard = () => {
    const defaultRoleId = roles.length > 0 ? roles[0].id : '';
    setNewEmployee({
      name: '',
      email: '',
      phone: '',
      password: generateSecurePassword(),
      assignmentType: 'role',
      role_id: defaultRoleId,
      custom_permissions: [],
      send_email: true,
    });
    setFormError('');
    setFormSuccess('');
    setShowPasswordText(true);
    setShowOnboardModal(true);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFormError('');
    try {
      const payload = {
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone || null,
        password: newEmployee.password,
        role_id: newEmployee.assignmentType === 'role' ? newEmployee.role_id : null,
        custom_permissions: newEmployee.custom_permissions,
        send_email: newEmployee.send_email,
      };

      const res = await api.post('/staff/employees', payload);
      if (res.data?.success) {
        setShowOnboardModal(false);
        await fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to onboard employee.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenEdit = (employee) => {
    setSelectedEmployee(employee);
    const hasRole = Boolean(employee.role_id);
    setEditForm({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      status: employee.status || 'active',
      assignmentType: hasRole ? 'role' : 'custom',
      role_id: employee.role_id || (roles.length > 0 ? roles[0].id : ''),
      custom_permissions: Array.isArray(employee.custom_permissions) ? employee.custom_permissions : [],
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setModalLoading(true);
    setFormError('');
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        status: editForm.status,
        role_id: editForm.assignmentType === 'role' ? editForm.role_id : null,
        custom_permissions: editForm.custom_permissions,
      };

      const res = await api.put(`/staff/employees/${selectedEmployee.id}`, payload);
      if (res.data?.success) {
        setShowEditModal(false);
        await fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update employee.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenPasswordReset = (employee) => {
    setSelectedEmployee(employee);
    setResetPasswordText(generateSecurePassword());
    setResetSendEmail(true);
    setShowResetPasswordText(true);
    setFormError('');
    setFormSuccess('');
    setShowPasswordModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setModalLoading(true);
    setFormError('');
    try {
      const res = await api.post(`/staff/employees/${selectedEmployee.id}/reset-password`, {
        password: resetPasswordText,
        send_email: resetSendEmail,
      });
      if (res.data?.success) {
        setFormSuccess('Permanent password updated successfully!');
        setTimeout(() => {
          setShowPasswordModal(false);
        }, 1200);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteTarget) return;
    setModalLoading(true);
    try {
      await api.delete(`/staff/employees/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete staff member.');
    } finally {
      setModalLoading(false);
    }
  };

  // Role Template Actions
  const handleOpenCreateRole = () => {
    setSelectedRole(null);
    setRoleForm({
      id: null,
      display_name: '',
      description: '',
      permissions: ['applications_view', 'kyc_verification'],
    });
    setFormError('');
    setShowRoleModal(true);
  };

  const handleOpenEditRole = (role) => {
    setSelectedRole(role);
    const existingPerms = role.permissions ? role.permissions.map((p) => p.name) : [];
    setRoleForm({
      id: role.id,
      display_name: role.display_name,
      description: role.description || '',
      permissions: existingPerms,
    });
    setFormError('');
    setShowRoleModal(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFormError('');
    try {
      if (roleForm.id) {
        await api.put(`/staff/roles/${roleForm.id}`, {
          display_name: roleForm.display_name,
          description: roleForm.description,
          permissions: roleForm.permissions,
        });
      } else {
        await api.post('/staff/roles', {
          display_name: roleForm.display_name,
          description: roleForm.description,
          permissions: roleForm.permissions,
        });
      }
      setShowRoleModal(false);
      await fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save role template.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleTarget) return;
    setModalLoading(true);
    try {
      await api.delete(`/staff/roles/${deleteRoleTarget.id}`);
      setDeleteRoleTarget(null);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete role template.');
    } finally {
      setModalLoading(false);
    }
  };

  // Filter staff list
  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone?.includes(searchTerm);

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'custom' && !s.role_id) ||
      (s.role_id && String(s.role_id) === String(roleFilter));

    const matchesStatus =
      statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Toggle permission checkbox in array
  const togglePermission = (permKey, currentList, setter) => {
    if (currentList.includes(permKey)) {
      setter(currentList.filter((k) => k !== permKey));
    } else {
      setter([...currentList, permKey]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-bold uppercase tracking-wider border border-blue-500/20 mb-2">
            <Shield size={12} />
            <span>Dual-Type Access Control & Security</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Staff Team & RBAC Operations</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure Named Role Templates (Type 2) or assign individual Direct Custom Permissions (Type 1). 
            Provision permanent passwords and grant tailored desk access.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenCreateRole}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-98"
          >
            <Sliders size={15} className="text-blue-400" />
            <span>New Role Template</span>
          </button>
          <button
            onClick={handleOpenOnboard}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 active:scale-98"
          >
            <Plus size={16} />
            <span>Onboard Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Staff</span>
            <Users size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{staff.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active & Operational Accounts</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Named Roles</span>
            <Shield size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{roles.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Reusable Permission Presets</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>System Permissions</span>
            <Key size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">13</div>
          <div className="text-[10px] text-slate-500 mt-0.5">LOS Queues & MIS Modules</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Security Status</span>
            <CheckCircle2 size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">Enforced</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Permanent Passwords & Audit</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'employees'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck size={16} />
          <span>Staff Directory ({staff.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'roles'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders size={16} />
          <span>Named Role Templates ({roles.length})</span>
        </button>
      </div>

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search staff by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Roles & Templates</option>
                <option value="custom">Custom Direct Permissions</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.display_name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Access</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Staff Cards Grid */}
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading Staff Directory & RBAC Matrix...</span>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
              No staff members found matching your search filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((member) => {
                const isRoot = member.id === 1;
                const roleRecord = member.role_record;
                const effectivePerms = Array.isArray(member.effective_permissions)
                  ? member.effective_permissions
                  : [];
                const isDirectCustom = !member.role_id;

                return (
                  <div
                    key={member.id}
                    className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl transition relative flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Avatar & Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-base shadow-lg shadow-blue-500/20 shrink-0">
                            {member.name?.charAt(0) || 'S'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-white text-sm truncate flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isRoot && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                                  Root
                                </span>
                              )}
                            </h3>
                            <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            member.status === 'suspended'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {member.status === 'suspended' ? 'Suspended' : 'Active'}
                        </span>
                      </div>

                      {/* Role & Access Info Box */}
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Assigned Role:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                              isRoot
                                ? 'bg-amber-500/20 text-amber-300'
                                : roleRecord
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}
                          >
                            {isRoot
                              ? 'Super Administrator'
                              : roleRecord?.display_name || 'Custom Direct Permissions'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                          <span className="text-slate-400 text-[11px]">Permitted Modules:</span>
                          <span className="font-bold text-slate-200 text-[11px]">
                            {isRoot ? 'All Desks (13)' : `${effectivePerms.length} Active`}
                          </span>
                        </div>

                        {/* Permission Pills Preview */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {isRoot ? (
                            <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Full Administrative Authority
                            </span>
                          ) : effectivePerms.length === 0 ? (
                            <span className="text-[10px] text-slate-500 italic">No desks assigned</span>
                          ) : (
                            effectivePerms.slice(0, 3).map((permKey) => (
                              <span
                                key={permKey}
                                className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-mono"
                              >
                                {permKey.replace(/_/g, ' ')}
                              </span>
                            ))
                          )}
                          {!isRoot && effectivePerms.length > 3 && (
                            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              +{effectivePerms.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contact metadata */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span className="flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-500" />
                          <span>{member.phone || 'No phone set'}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">ID: #{member.id}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenPasswordReset(member)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                        title="Update Permanent Password"
                      >
                        <Key size={13} className="text-amber-400" />
                        <span>Password</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                          title="Edit Permissions & Role"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        {!isRoot && member.id !== currentUser?.id && (
                          <button
                            onClick={() => setDeleteTarget(member)}
                            className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer active:scale-95"
                            title="Delete Account"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: NAMED ROLE TEMPLATES */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Role Template Presets (Type 2)</h3>
              <p className="text-xs text-slate-400">
                Define reusable job profiles (e.g. Credit Underwriter, Verification Agent) and assign them to employees in one click.
              </p>
            </div>
            <button
              onClick={handleOpenCreateRole}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto shrink-0"
            >
              <Plus size={15} />
              <span>Create Role Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => {
              const rolePerms = role.permissions ? role.permissions.map((p) => p.name) : [];
              const assignedCount = staff.filter((s) => s.role_id === role.id).length;
              const isSuper = role.name === 'super_admin';

              return (
                <div
                  key={role.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{role.display_name}</h4>
                        <span className="font-mono text-[10px] text-slate-500">{role.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {assignedCount} Staff
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 min-h-[32px]">
                      {role.description || 'Pre-configured access profile for backoffice staff.'}
                    </p>

                    {/* Permissions list */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Included Desks:</span>
                        <span className="font-bold text-blue-400 text-[11px]">{rolePerms.length} Modules</span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                        {rolePerms.map((p) => (
                          <span
                            key={p}
                            className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1"
                          >
                            <Check size={10} className="text-emerald-400 shrink-0" />
                            <span>{p.replace(/_/g, ' ')}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isSuper && (
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditRole(role)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Edit Template</span>
                      </button>
                      <button
                        onClick={() => setDeleteRoleTarget(role)}
                        className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Role Template"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: ONBOARD EMPLOYEE */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">Onboard Operations Employee</h3>
                <p className="text-xs text-slate-400">Set permanent credentials and configure desk permissions</p>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              {/* Section A: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="staff@rcrfinance.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Phone Number</label>
                  <input
                    type="text"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Section B: Permanent Password Setup */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Key size={14} className="text-amber-400" />
                      Permanent Password Credentials
                    </span>
                    <p className="text-[11px] text-slate-400">
                      This is the employee's permanent password. You can customize it or generate a strong one.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewEmployee({ ...newEmployee, password: generateSecurePassword() })}
                    className="px-2.5 py-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>Generate Strong</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPasswordText ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Email toggle */}
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEmployee.send_email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, send_email: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    Send Welcome Email with Permanent Credentials & Login Link via Gmail SMTP
                  </span>
                </label>
              </div>

              {/* Section C: Dual-Type Permissions Assignment */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Permission Assignment Method:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewEmployee({ ...newEmployee, assignmentType: 'role' })}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      newEmployee.assignmentType === 'role'
                        ? 'bg-blue-600/10 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                      <Shield size={14} className="text-blue-400" />
                      <span>Type 2: Named Role Template</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Assign a predefined role preset (e.g. Underwriter, Verification Agent).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewEmployee({ ...newEmployee, assignmentType: 'custom' })}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      newEmployee.assignmentType === 'custom'
                        ? 'bg-blue-600/10 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                      <Sliders size={14} className="text-purple-400" />
                      <span>Type 1: Direct Custom Permissions</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Pick and choose individual desk permissions via interactive checkboxes.
                    </p>
                  </button>
                </div>

                {/* Sub-view for Type 2: Role selection */}
                {newEmployee.assignmentType === 'role' && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">
                      Select Role Template:
                    </label>
                    <select
                      value={newEmployee.role_id}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role_id: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.display_name} ({r.permissions?.length || 0} permissions included)
                        </option>
                      ))}
                    </select>

                    {/* Preview of role's permissions */}
                    {(() => {
                      const sel = roles.find((r) => String(r.id) === String(newEmployee.role_id));
                      if (!sel) return null;
                      return (
                        <div className="pt-2">
                          <span className="text-[11px] text-slate-400 block mb-1">
                            Included in this role template:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {sel.permissions?.map((p) => (
                              <span
                                key={p.id}
                                className="text-[10px] bg-slate-900 border border-slate-800 text-blue-300 px-2 py-0.5 rounded"
                              >
                                {p.name.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Sub-view for Type 1: Direct custom checkboxes */}
                {newEmployee.assignmentType === 'custom' && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 max-h-60 overflow-y-auto">
                    {PERMISSION_MODULES.map((mod) => (
                      <div key={mod.module} className="space-y-1.5 pb-2 border-b border-slate-800/80 last:border-0">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          {mod.module}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {mod.permissions.map((p) => {
                            const isChecked = newEmployee.custom_permissions.includes(p.key);
                            return (
                              <label
                                key={p.key}
                                className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    togglePermission(
                                      p.key,
                                      newEmployee.custom_permissions,
                                      (updated) => setNewEmployee({ ...newEmployee, custom_permissions: updated })
                                    )
                                  }
                                  className="mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                                />
                                <div>
                                  <span className="text-xs font-semibold text-slate-200 block">{p.label}</span>
                                  <span className="text-[10px] text-slate-500 block leading-tight">{p.desc}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  <span>{modalLoading ? 'Creating Employee...' : 'Confirm & Onboard'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EMPLOYEE & PERMISSIONS */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">Edit Employee: {selectedEmployee.name}</h3>
                <p className="text-xs text-slate-400">Modify role templates or direct permissions</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Access Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">Active (Granted Access)</option>
                    <option value="suspended">Suspended (Blocked Access)</option>
                  </select>
                </div>
              </div>

              {/* Assignment Type Toggle */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300">
                  Permission Assignment Method:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, assignmentType: 'role' })}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      editForm.assignmentType === 'role'
                        ? 'bg-blue-600/10 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                      <Shield size={14} className="text-blue-400" />
                      <span>Type 2: Named Role Template</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Assigned through a standard named role preset.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, assignmentType: 'custom' })}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      editForm.assignmentType === 'custom'
                        ? 'bg-blue-600/10 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                      <Sliders size={14} className="text-purple-400" />
                      <span>Type 1: Direct Custom Permissions</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Custom permission checkboxes for this user only.</p>
                  </button>
                </div>

                {editForm.assignmentType === 'role' ? (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">
                      Select Role Template:
                    </label>
                    <select
                      value={editForm.role_id}
                      onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.display_name} ({r.permissions?.length || 0} permissions)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 max-h-60 overflow-y-auto">
                    {PERMISSION_MODULES.map((mod) => (
                      <div key={mod.module} className="space-y-1.5 pb-2 border-b border-slate-800/80 last:border-0">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          {mod.module}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {mod.permissions.map((p) => {
                            const isChecked = editForm.custom_permissions.includes(p.key);
                            return (
                              <label
                                key={p.key}
                                className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    togglePermission(
                                      p.key,
                                      editForm.custom_permissions,
                                      (updated) => setEditForm({ ...editForm, custom_permissions: updated })
                                    )
                                  }
                                  className="mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                                />
                                <div>
                                  <span className="text-xs font-semibold text-slate-200 block">{p.label}</span>
                                  <span className="text-[10px] text-slate-500 block leading-tight">{p.desc}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  <span>{modalLoading ? 'Saving...' : 'Save Changes'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PERMANENT PASSWORD RESET */}
      {showPasswordModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Reset Permanent Password</h3>
                <p className="text-xs text-slate-400">Employee: {selectedEmployee.name}</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">New Permanent Password</label>
                  <button
                    type="button"
                    onClick={() => setResetPasswordText(generateSecurePassword())}
                    className="text-[11px] font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={11} />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPasswordText ? 'text' : 'password'}
                    required
                    value={resetPasswordText}
                    onChange={(e) => setResetPasswordText(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordText(!showResetPasswordText)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showResetPasswordText ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetSendEmail}
                  onChange={(e) => setResetSendEmail(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">
                  Notify employee via Gmail ({selectedEmployee.email})
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>{modalLoading ? 'Updating...' : 'Set Permanent Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE / EDIT ROLE TEMPLATE */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">
                  {roleForm.id ? `Edit Role: ${roleForm.display_name}` : 'Create New Role Template'}
                </h3>
                <p className="text-xs text-slate-400">Reusable desk permission presets</p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  value={roleForm.display_name}
                  onChange={(e) => setRoleForm({ ...roleForm, display_name: e.target.value })}
                  placeholder="e.g. Senior Verification Specialist"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="e.g. Responsible for reviewing Aadhaar, PAN, and Bank Statements"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Included Desk Permissions:
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 max-h-60 overflow-y-auto">
                  {PERMISSION_MODULES.map((mod) => (
                    <div key={mod.module} className="space-y-1 pb-2 border-b border-slate-800/80 last:border-0">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        {mod.module}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {mod.permissions.map((p) => {
                          const isChecked = roleForm.permissions.includes(p.key);
                          return (
                            <label
                              key={p.key}
                              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  togglePermission(
                                    p.key,
                                    roleForm.permissions,
                                    (updated) => setRoleForm({ ...roleForm, permissions: updated })
                                  )
                                }
                                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                              />
                              <span className="text-xs text-slate-200">{p.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>{modalLoading ? 'Saving...' : 'Save Role Template'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE EMPLOYEE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">Delete Staff Employee?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete <strong className="text-white">{deleteTarget.name}</strong> ({deleteTarget.email})? 
                Their session and desk access will be revoked immediately.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                disabled={modalLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                {modalLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ROLE TEMPLATE CONFIRMATION MODAL */}
      {deleteRoleTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">Delete Role Template?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove the template <strong className="text-white">{deleteRoleTarget.display_name}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteRoleTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
                disabled={modalLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                {modalLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
