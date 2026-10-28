<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\AuditService;
use App\Services\MetaCapiService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => UserRole::CUSTOMER,
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditService::log('customer_registered', 'User', $user->id, null, ['email' => $user->email], $user->id);

        MetaCapiService::sendEvent('CompleteRegistration', [
            'email' => $user->email,
            'phone' => $user->phone,
            'first_name' => explode(' ', $user->name)[0] ?? '',
        ], [
            'status' => 'completed',
            'content_name' => 'Customer Registration',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $login = $request->input('login');
        $user = User::where('email', $login)
            ->orWhere('phone', $login)
            ->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Invalid email/phone or password.'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is suspended. Please contact customer support.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditService::log('user_logged_in', 'User', $user->id, null, null, $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20|unique:users,phone,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            if ($request->hasFile('avatar')) {
                $request->validate([
                    'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
                ]);

                $file = $request->file('avatar');
                $fileName = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('avatars', $fileName, 'public');
                $url = '/storage/' . $path;

                $user->avatar_url = $url;
                $user->save();
            } elseif ($request->filled('avatar_base64')) {
                $base64 = $request->input('avatar_base64');
                
                // Parse and decode data URI if present
                if (preg_match('/^data:image\/(\w+);base64,/', $base64, $matches)) {
                    $imageType = strtolower($matches[1]);
                    if (!in_array($imageType, ['png', 'jpg', 'jpeg', 'webp', 'gif'])) {
                        $imageType = 'png';
                    }
                    $data = substr($base64, strpos($base64, ',') + 1);
                    $decoded = base64_decode($data);
                    
                    if ($decoded !== false) {
                        $fileName = 'avatar_' . $user->id . '_' . time() . '.' . $imageType;
                        \Illuminate\Support\Facades\Storage::disk('public')->put('avatars/' . $fileName, $decoded);
                        $user->avatar_url = '/storage/avatars/' . $fileName;
                        $user->save();
                    } else {
                        $user->avatar_url = $base64;
                        $user->save();
                    }
                } else {
                    $user->avatar_url = $base64;
                    $user->save();
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No image file or base64 image data provided.',
                ], 422);
            }

            AuditService::log('user_avatar_updated', 'User', $user->id, null, null, $user->id);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Avatar upload error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to process avatar: ' . $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile image updated successfully.',
            'user' => $user,
            'avatar_url' => $user->avatar_url,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out.',
        ]);
    }

    /**
     * Send Password Reset OTP to registered email
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required|string',
        ]);

        $login = trim($request->input('login'));
        $user = User::where('email', $login)
            ->orWhere('phone', $login)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No registered account found with this email or mobile number.',
            ], 404);
        }

        if (empty($user->email)) {
            return response()->json([
                'success' => false,
                'message' => 'Your account does not have a linked email address. Please contact customer support.',
            ], 422);
        }

        // Generate secure 6-digit numeric OTP
        $otp = (string) random_int(100000, 999999);

        // Store OTP in password_reset_tokens table with current timestamp
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($otp),
                'created_at' => now(),
            ]
        );

        // Send Email via Gmail SMTP
        try {
            $userEmail = $user->email;
            $userName = $user->name;

            Mail::send([], [], function ($message) use ($userEmail, $userName, $otp) {
                $message->to($userEmail, $userName)
                    ->subject("RCR Finance - Password Reset Code [{$otp}]")
                    ->html("
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset='utf-8'>
                            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                        </head>
                        <body style='margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>
                            <table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f1f5f9; padding:30px 15px;'>
                                <tr>
                                    <td align='center'>
                                        <table width='100%' max-width='560px' cellpadding='0' cellspacing='0' style='max-width:560px; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.06); border:1px solid #e2e8f0;'>
                                            <!-- Header -->
                                            <tr>
                                                <td style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding:28px 32px; text-align:center;'>
                                                    <div style='display:inline-block; background-color:#2563eb; color:#ffffff; font-weight:900; font-size:18px; padding:8px 16px; border-radius:12px; letter-spacing:1px; margin-bottom:8px;'>
                                                        RCR FINANCE
                                                    </div>
                                                    <div style='color:#94a3b8; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px;'>
                                                        Instant Digital Lending & MSME Credit
                                                    </div>
                                                </td>
                                            </tr>

                                            <!-- Body -->
                                            <tr>
                                                <td style='padding:32px 32px 24px;'>
                                                    <h2 style='margin:0 0 12px; color:#0f172a; font-size:20px; font-weight:800;'>
                                                        Password Reset Request
                                                    </h2>
                                                    <p style='margin:0 0 16px; color:#475569; font-size:14px; line-height:1.6;'>
                                                        Dear <strong>{$userName}</strong>,
                                                    </p>
                                                    <p style='margin:0 0 24px; color:#475569; font-size:14px; line-height:1.6;'>
                                                        We received a request to reset the password for your RCR Finance account. Please use the 6-digit One-Time Password (OTP) below to proceed:
                                                    </p>

                                                    <!-- OTP Box -->
                                                    <div style='background-color:#f8fafc; border:2px dashed #3b82f6; border-radius:16px; padding:20px; text-align:center; margin:24px 0;'>
                                                        <div style='color:#64748b; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;'>
                                                            Your One-Time Password (OTP)
                                                        </div>
                                                        <div style='font-family:\"SF Mono\", Monaco, Consolas, monospace; font-size:36px; font-weight:900; color:#1d4ed8; letter-spacing:8px;'>
                                                            {$otp}
                                                        </div>
                                                        <div style='color:#ef4444; font-size:11px; font-weight:700; margin-top:8px;'>
                                                            ⏱ Valid for 15 minutes only
                                                        </div>
                                                    </div>

                                                    <p style='margin:0 0 16px; color:#64748b; font-size:13px; line-height:1.5;'>
                                                        If you did not request a password reset, no action is needed. Your account remains completely secure. Never share this code with anyone.
                                                    </p>
                                                </td>
                                            </tr>

                                            <!-- Footer -->
                                            <tr>
                                                <td style='background-color:#f8fafc; border-top:1px solid #f1f5f9; padding:20px 32px; text-align:center;'>
                                                    <p style='margin:0 0 4px; color:#94a3b8; font-size:11px;'>
                                                        This is an automated security email from RCR Finance Platform.
                                                    </p>
                                                    <p style='margin:0; color:#cbd5e1; font-size:10px;'>
                                                        Need help? Contact support at rcrcontactteam@gmail.com
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                        </html>
                    ");
            });

            AuditService::log('password_reset_otp_sent', 'User', $user->id, null, ['email' => $user->email], $user->id);

            // Mask email for user privacy (e.g. j***@domain.com)
            $parts = explode('@', $user->email);
            $namePart = $parts[0];
            $domainPart = $parts[1] ?? '';
            $maskedName = substr($namePart, 0, 1) . str_repeat('*', max(3, strlen($namePart) - 2)) . substr($namePart, -1);
            $maskedEmail = $maskedName . '@' . $domainPart;

            return response()->json([
                'success' => true,
                'message' => "A 6-digit reset OTP has been sent to your registered email ({$maskedEmail}).",
                'email' => $user->email,
                'masked_email' => $maskedEmail,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Password reset email sending failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP email: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify OTP & Reset Password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|min:6|max:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $email = trim($request->input('email'));
        $otp = trim($request->input('otp'));
        $newPassword = $request->input('password');

        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'No active password reset request found for this email. Please request a new OTP.',
            ], 422);
        }

        // Check 15-minute expiration
        if (Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Your OTP has expired (valid for 15 minutes). Please request a new OTP.',
            ], 422);
        }

        // Verify OTP hash
        if (!Hash::check($otp, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP code entered. Please check your email and try again.',
            ], 422);
        }

        // Update User Password
        $user = User::where('email', $email)->firstOrFail();
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Clean up reset token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Revoke existing personal access tokens for security
        $user->tokens()->delete();

        // Issue new authentication token so user is automatically logged in
        $token = $user->createToken('auth_token')->plainTextToken;

        AuditService::log('password_reset_success', 'User', $user->id, null, ['email' => $user->email], $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Your password has been successfully reset! You are now logged in.',
            'token' => $token,
            'user' => $user,
        ]);
    }
}
