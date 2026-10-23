<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class StaffEmployeeController extends Controller
{
    /**
     * Get staff list, available roles, and system permissions
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $staff = User::where('role', '!=', UserRole::CUSTOMER)
            ->with(['roleRecord.permissions'])
            ->latest('id')
            ->get();

        $roles = Role::with('permissions')
            ->where('name', '!=', 'customer')
            ->get();

        $permissions = Permission::all()->groupBy('module');

        return response()->json([
            'success' => true,
            'data' => [
                'staff' => $staff,
                'roles' => $roles,
                'permissions' => $permissions,
                'flat_permissions' => Permission::all(),
            ],
        ]);
    }

    /**
     * Onboard / Create New Staff Member
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && !$user->hasPermission('staff_manage')) {
            abort(403, 'Unauthorized to manage staff members.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6',
            'role_id' => 'nullable|exists:roles,id',
            'custom_permissions' => 'nullable|array',
            'send_email' => 'nullable|boolean',
        ]);

        $roleSlug = 'operations_executive';
        if (!empty($validated['role_id'])) {
            $roleRecord = Role::find($validated['role_id']);
            if ($roleRecord) {
                $roleSlug = $roleRecord->name;
            }
        }

        $permanentPassword = $validated['password'];

        $newEmployee = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($permanentPassword),
            'role' => $roleSlug,
            'role_id' => $validated['role_id'] ?? null,
            'custom_permissions' => $validated['custom_permissions'] ?? [],
            'status' => 'active',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);

        // Send welcome email with permanent credentials if requested
        if ($request->input('send_email', true)) {
            try {
                $empEmail = $newEmployee->email;
                $empName = $newEmployee->name;
                $loginUrl = 'https://rcrfinance.com/admin/login';

                Mail::send([], [], function ($message) use ($empEmail, $empName, $permanentPassword, $loginUrl) {
                    $message->to($empEmail, $empName)
                        ->subject("Welcome to RCR Finance Team - Your Staff Access Credentials")
                        ->html("
                            <!DOCTYPE html>
                            <html>
                            <body style='font-family:-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background-color:#f1f5f9; padding:24px;'>
                                <div style='max-width:560px; margin:0 auto; background:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 8px 24px rgba(0,0,0,0.06);'>
                                    <div style='background:#0f172a; padding:24px; text-align:center;'>
                                        <div style='display:inline-block; background:#2563eb; color:#fff; font-weight:800; font-size:16px; padding:6px 14px; border-radius:10px;'>RCR FINANCE</div>
                                        <div style='color:#94a3b8; font-size:11px; margin-top:6px; letter-spacing:1px; text-transform:uppercase;'>Internal Operations Portal</div>
                                    </div>
                                    <div style='padding:28px 24px;'>
                                        <h2 style='margin:0 0 12px; color:#0f172a; font-size:18px;'>Welcome to the Operations Team!</h2>
                                        <p style='color:#475569; font-size:13px; line-height:1.6;'>
                                            Hello <strong>{$empName}</strong>,<br>
                                            Your official staff account on the RCR Finance lending portal has been activated. Please use the permanent credentials below to access your desk:
                                        </p>
                                        
                                        <div style='background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:18px; margin:20px 0;'>
                                            <div style='margin-bottom:10px;'><strong style='color:#64748b; font-size:11px; text-transform:uppercase; display:block;'>Login URL:</strong> <a href='{$loginUrl}' style='color:#2563eb; font-weight:600; text-decoration:none;'>{$loginUrl}</a></div>
                                            <div style='margin-bottom:10px;'><strong style='color:#64748b; font-size:11px; text-transform:uppercase; display:block;'>Staff Email:</strong> <span style='color:#0f172a; font-family:monospace; font-weight:700;'>{$empEmail}</span></div>
                                            <div><strong style='color:#64748b; font-size:11px; text-transform:uppercase; display:block;'>Permanent Security Password:</strong> <span style='color:#2563eb; font-family:monospace; font-size:15px; font-weight:800; background:#eff6ff; padding:4px 8px; border-radius:6px;'>{$permanentPassword}</span></div>
                                        </div>

                                        <div style='text-align:center; margin:24px 0 16px;'>
                                            <a href='{$loginUrl}' style='background:#2563eb; color:#ffffff; font-weight:700; font-size:13px; padding:12px 28px; border-radius:12px; text-decoration:none; display:inline-block;'>Sign In to Operations Portal &rarr;</a>
                                        </div>

                                        <p style='color:#94a3b8; font-size:11px; line-height:1.5; margin:0;'>
                                            * Security Warning: Do not share your login credentials with anyone. All operational actions are logged and audited.
                                        </p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        ");
                });
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Failed to send staff welcome email: ' . $e->getMessage());
            }
        }

        AuditService::log('staff_employee_created', 'User', $newEmployee->id, null, [
            'name' => $newEmployee->name,
            'role' => $newEmployee->role,
        ], $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Staff employee onboarded successfully!',
            'data' => $newEmployee->load('roleRecord.permissions'),
        ], 201);
    }

    /**
     * Update Staff Employee (Role, Custom Permissions, Status, Info)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && !$user->hasPermission('staff_manage')) {
            abort(403, 'Unauthorized to manage staff members.');
        }

        $employee = User::findOrFail($id);

        // Safeguard Root Super Admin ID 1
        if ($employee->id === 1 && $user->id !== 1) {
            return response()->json(['success' => false, 'message' => 'Root Super Administrator account cannot be modified by other users.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $employee->id,
            'phone' => 'nullable|string|max:20|unique:users,phone,' . $employee->id,
            'role_id' => 'nullable|exists:roles,id',
            'custom_permissions' => 'nullable|array',
            'status' => 'required|in:active,suspended',
        ]);

        $roleSlug = $employee->role->value ?? (string)$employee->role;
        if (!empty($validated['role_id'])) {
            $roleRecord = Role::find($validated['role_id']);
            if ($roleRecord) {
                $roleSlug = $roleRecord->name;
            }
        }

        $employee->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $roleSlug,
            'role_id' => $validated['role_id'] ?? null,
            'custom_permissions' => $validated['custom_permissions'] ?? [],
            'status' => $validated['status'],
        ]);

        AuditService::log('staff_employee_updated', 'User', $employee->id, null, [
            'role' => $employee->role,
            'status' => $employee->status,
        ], $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Employee details and permissions updated successfully.',
            'data' => $employee->load('roleRecord.permissions'),
        ]);
    }

    /**
     * Update Staff Permanent Password
     */
    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && !$user->hasPermission('staff_manage')) {
            abort(403, 'Unauthorized to reset staff passwords.');
        }

        $request->validate([
            'password' => 'required|string|min:6',
            'send_email' => 'nullable|boolean',
        ]);

        $employee = User::findOrFail($id);

        if ($employee->id === 1 && $user->id !== 1) {
            return response()->json(['success' => false, 'message' => 'Cannot modify Root Super Admin password.'], 403);
        }

        $newPassword = $request->input('password');
        $employee->update([
            'password' => Hash::make($newPassword),
        ]);

        if ($request->input('send_email', true)) {
            try {
                $empEmail = $employee->email;
                $empName = $employee->name;

                Mail::send([], [], function ($message) use ($empEmail, $empName, $newPassword) {
                    $message->to($empEmail, $empName)
                        ->subject("RCR Finance - Security Password Updated")
                        ->html("
                            <div style='font-family:sans-serif; padding:20px; background:#f8fafc; border-radius:12px;'>
                                <h3 style='color:#0f172a;'>Your Staff Password Was Updated</h3>
                                <p style='color:#475569;'>Hello <strong>{$empName}</strong>, your operational account password has been updated by administration:</p>
                                <p style='font-family:monospace; font-size:16px; font-weight:bold; color:#2563eb;'>{$newPassword}</p>
                                <p style='font-size:11px; color:#94a3b8;'>Please sign in at <a href='https://rcrfinance.com/admin/login'>https://rcrfinance.com/admin/login</a>.</p>
                            </div>
                        ");
                });
            } catch (\Exception $e) {
                // ignore
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Permanent password updated successfully!',
        ]);
    }

    /**
     * Deactivate / Delete Staff Account
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && !$user->hasPermission('staff_manage')) {
            abort(403, 'Unauthorized.');
        }

        if ($id === 1) {
            return response()->json(['success' => false, 'message' => 'Root Super Administrator account cannot be deleted.'], 403);
        }

        if ($id === $user->id) {
            return response()->json(['success' => false, 'message' => 'You cannot delete your own account.'], 403);
        }

        $employee = User::findOrFail($id);
        $employee->tokens()->delete();
        $employee->delete();

        AuditService::log('staff_employee_deleted', 'User', $id, null, null, $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Staff employee account deleted successfully.',
        ]);
    }

    /**
     * List all Roles with their permissions
     */
    public function rolesList(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $roles = Role::with('permissions')
            ->where('name', '!=', 'customer')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    /**
     * Create New Named Role Template
     */
    public function storeRole(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && !$user->hasPermission('staff_manage')) {
            abort(403, 'Unauthorized to create roles.');
        }

        $validated = $request->validate([
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $slug = Str::slug($validated['display_name'], '_');
        $originalSlug = $slug;
        $counter = 1;
        while (Role::where('name', $slug)->exists()) {
            $slug = "{$originalSlug}_{$counter}";
            $counter++;
        }

        $role = Role::create([
            'name' => $slug,
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
        ]);

        // Attach permissions
        $permIds = Permission::whereIn('name', $validated['permissions'])->pluck('id')->toArray();
        $role->permissions()->sync($permIds);

        return response()->json([
            'success' => true,
            'message' => "Role template '{$role->display_name}' created successfully!",
            'data' => $role->load('permissions'),
        ], 201);
    }

    /**
     * Update Named Role Template
     */
    public function updateRole(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && !$user->hasPermission('staff_manage')) {
            abort(403, 'Unauthorized to edit roles.');
        }

        $role = Role::findOrFail($id);

        if ($role->name === 'super_admin' || $role->name === 'customer') {
            return response()->json(['success' => false, 'message' => 'System default roles cannot be renamed.'], 403);
        }

        $validated = $request->validate([
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update([
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
        ]);

        $permIds = Permission::whereIn('name', $validated['permissions'])->pluck('id')->toArray();
        $role->permissions()->sync($permIds);

        return response()->json([
            'success' => true,
            'message' => "Role template '{$role->display_name}' updated successfully!",
            'data' => $role->load('permissions'),
        ]);
    }

    /**
     * Delete Named Role Template
     */
    public function destroyRole(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isSuperAdmin() && !$user->hasPermission('staff_manage')) {
            abort(403, 'Unauthorized.');
        }

        $role = Role::findOrFail($id);
        $reserved = ['super_admin', 'credit_manager', 'credit_executive', 'verification_executive', 'finance_executive', 'operations_executive', 'manager', 'customer'];

        if (in_array($role->name, $reserved, true)) {
            return response()->json(['success' => false, 'message' => 'Core system roles cannot be deleted.'], 403);
        }

        // Unlink users having this role
        User::where('role_id', $role->id)->update(['role_id' => null]);
        $role->permissions()->detach();
        $role->delete();

        return response()->json([
            'success' => true,
            'message' => "Role template deleted successfully.",
        ]);
    }
}
