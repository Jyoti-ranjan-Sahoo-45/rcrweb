<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DisbursementController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FormalitiesController;
use App\Http\Controllers\LoanApplicationController;
use App\Http\Controllers\LoanOfferController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\StaffApplicationController;
use App\Http\Controllers\StaffOperationsController;
use App\Http\Controllers\StaffEmployeeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', [DashboardController::class, 'health']);

// Public catalog routes
Route::get('/categories', [CatalogController::class, 'categories']);
Route::get('/products', [CatalogController::class, 'products']);
Route::get('/products/{slug}', [CatalogController::class, 'productDetail']);
Route::post('/eligibility/check', [CatalogController::class, 'checkEligibility']);

// Authentication & Password Recovery routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User Profile & Avatar management
    Route::post('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/avatar', [AuthController::class, 'uploadAvatar']);

    // Customer dashboard & applications
    Route::get('/customer/dashboard', [DashboardController::class, 'customerDashboard']);
    Route::get('/applications', [LoanApplicationController::class, 'index']);
    Route::get('/applications/active-draft', [LoanApplicationController::class, 'activeDraft']);
    Route::get('/applications/{id}', [LoanApplicationController::class, 'show']);
    Route::post('/applications/draft', [LoanApplicationController::class, 'saveDraft']);
    Route::delete('/applications/draft/{id}', [LoanApplicationController::class, 'discardDraft']);
    Route::post('/applications/{id}/submit', [LoanApplicationController::class, 'submit']);
    Route::post('/applications/{id}/info-requests/{requestId}/respond', [LoanApplicationController::class, 'respondInformationRequest']);

    // Customer documents
    Route::post('/applications/{id}/documents', [DocumentController::class, 'upload']);
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']);

    // Customer offers & formalities
    Route::post('/applications/{id}/offer/accept', [LoanOfferController::class, 'accept']);
    Route::post('/applications/{id}/offer/decline', [LoanOfferController::class, 'decline']);
    Route::post('/applications/{id}/formalities/sign', [FormalitiesController::class, 'signAgreement']);

    // Customer payment
    Route::post('/applications/{id}/payment/initiate', [PaymentController::class, 'initiate']);
    Route::post('/applications/{id}/payment/submit-receipt', [PaymentController::class, 'submitReceipt']);
    Route::post('/applications/{id}/payment/mock-pay', [PaymentController::class, 'mockPay']);

    // Customer Loan Repayments & EMI Schedule
    Route::get('/applications/{id}/repayment-schedule', [\App\Http\Controllers\RepaymentController::class, 'getSchedule']);
    Route::post('/applications/{id}/repayments/submit', [\App\Http\Controllers\RepaymentController::class, 'submitRepayment']);

    // Staff & Admin endpoints
    Route::prefix('staff')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'adminDashboard']);
        Route::get('/applications', [StaffApplicationController::class, 'index']);
        Route::post('/applications/bulk-delete', [StaffApplicationController::class, 'bulkDelete']);
        Route::delete('/applications/{id}', [StaffApplicationController::class, 'destroy']);
        Route::get('/applications/{id}', [StaffApplicationController::class, 'show']);
        Route::post('/applications/{id}/assign', [StaffApplicationController::class, 'assign']);
        Route::post('/applications/{id}/notes', [StaffApplicationController::class, 'addNote']);
        Route::post('/applications/{id}/info-request', [StaffApplicationController::class, 'requestInformation']);
        Route::post('/applications/{id}/assessment', [StaffApplicationController::class, 'createAssessment']);
        Route::post('/applications/{id}/decision', [StaffApplicationController::class, 'makeDecision']);
        Route::post('/applications/{id}/status', [StaffApplicationController::class, 'transitionStatus']);

        // Staff quick 1-click workflows
        Route::post('/applications/{id}/quick-sanction-offer', [StaffApplicationController::class, 'quickSanctionOffer']);
        Route::post('/applications/{id}/quick-verify-and-disburse', [StaffApplicationController::class, 'quickVerifyAndDisburse']);

        // Staff Loan Repayment & Collections Desk
        Route::get('/repayments', [\App\Http\Controllers\RepaymentController::class, 'staffRepaymentsList']);
        Route::get('/applications/{id}/repayment-schedule', [\App\Http\Controllers\RepaymentController::class, 'getSchedule']);
        Route::post('/repayments/{transactionId}/verify', [\App\Http\Controllers\RepaymentController::class, 'verifyRepayment']);
        Route::post('/applications/{id}/repayments/record-manual', [\App\Http\Controllers\RepaymentController::class, 'recordManualRepayment']);

        // Staff document management & verification
        Route::post('/applications/{id}/documents', [DocumentController::class, 'upload']);
        Route::post('/documents/{id}/reupload', [DocumentController::class, 'reupload']);
        Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
        Route::post('/documents/{id}/verify', [DocumentController::class, 'verify']);

        // Staff loan offer management
        Route::post('/applications/{id}/offer/generate', [LoanOfferController::class, 'generate']);
        Route::post('/applications/{id}/offer/issue', [LoanOfferController::class, 'issueOffer']);

        // Staff payment verification
        Route::post('/applications/{id}/payment/verify', [PaymentController::class, 'verifyPayment']);

        // Staff disbursement management
        Route::post('/applications/{id}/disbursement/verify-checklist', [DisbursementController::class, 'verifyChecklist']);
        Route::post('/applications/{id}/disbursement/process', [DisbursementController::class, 'processDisbursement']);



        // Staff Customers 360 & Directory
        Route::get('/customers', [StaffOperationsController::class, 'customers']);
        Route::post('/customers/bulk-delete', [StaffOperationsController::class, 'bulkDeleteCustomers']);
        Route::get('/customers/{id}', [StaffOperationsController::class, 'customerDetail']);

        // Staff Reports & Portfolio Analytics
        Route::get('/reports', [StaffOperationsController::class, 'reports']);

        // Staff Audit Logs
        Route::get('/audit-logs', [StaffOperationsController::class, 'auditLogs']);

        // Staff Team Members
        Route::get('/team', [StaffOperationsController::class, 'staffList']);

        // Staff Employees & RBAC Management
        Route::get('/employees', [StaffEmployeeController::class, 'index']);
        Route::post('/employees', [StaffEmployeeController::class, 'store']);
        Route::put('/employees/{id}', [StaffEmployeeController::class, 'update']);
        Route::post('/employees/{id}/reset-password', [StaffEmployeeController::class, 'resetPassword']);
        Route::delete('/employees/{id}', [StaffEmployeeController::class, 'destroy']);
        Route::get('/roles', [StaffEmployeeController::class, 'rolesList']);
        Route::post('/roles', [StaffEmployeeController::class, 'storeRole']);
        Route::put('/roles/{id}', [StaffEmployeeController::class, 'updateRole']);
        Route::delete('/roles/{id}', [StaffEmployeeController::class, 'destroyRole']);

        // Staff Catalog Products Management
        Route::get('/products', [CatalogController::class, 'adminProducts']);
        Route::post('/products', [CatalogController::class, 'storeProduct']);
        Route::put('/products/{id}', [CatalogController::class, 'updateProduct']);
        Route::post('/products/{id}/toggle', [CatalogController::class, 'toggleProduct']);
    });
});
