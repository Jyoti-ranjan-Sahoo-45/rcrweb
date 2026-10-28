<?php

namespace App\Http\Controllers;

use App\Enums\LoanStatus;
use App\Enums\OfferStatus;
use App\Models\ApplicationBusinessDetail;
use App\Models\ApplicationEmploymentDetail;
use App\Models\ApplicationFinancialDetail;
use App\Models\ApplicationPersonalDetail;
use App\Models\LoanApplication;
use App\Models\LoanOffer;
use App\Models\LoanProduct;
use App\Services\AuditService;
use App\Services\EligibilityEngine;
use App\Services\LoanStateMachine;
use App\Services\MetaCapiService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LoanApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $applications = LoanApplication::where('user_id', $request->user()->id)
            ->with(['product', 'offer', 'formalities', 'paymentRecord', 'disbursementRecord'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    public function show(Request $request, int $id, EligibilityEngine $engine, LoanStateMachine $stateMachine): JsonResponse
    {
        $application = LoanApplication::where('user_id', $request->user()->id)
            ->with([
                'user',
                'product.documentRequirements',
                'personalDetails',
                'employmentDetails',
                'businessDetails',
                'financialDetails',
                'documents',
                'informationRequests',
                'offer',
                'formalities',
                'paymentRecord',
                'disbursementRecord',
                'statusHistory',
            ])
            ->findOrFail($id);

        // 60-Second Auto-Approval Logic (Approved Amount = 10% less than applied amount, Fee = Rs. 299 + 18% GST = Rs. 352.82)
        $preApprovalStatuses = [
            LoanStatus::SUBMITTED,
            LoanStatus::INITIAL_REVIEW,
            LoanStatus::DOCUMENT_VERIFICATION,
            LoanStatus::ELIGIBILITY_REVIEW,
            LoanStatus::CREDIT_ASSESSMENT,
            LoanStatus::APPROVAL_PENDING,
        ];

        $submittedAt = $application->submitted_at ?? $application->created_at;
        $secondsElapsed = $submittedAt ? Carbon::now()->diffInSeconds($submittedAt) : 0;
        $shouldAutoApprove = ($secondsElapsed >= 60) || $request->has('fast_track') || $request->has('auto_approve');

        if (in_array($application->current_status, $preApprovalStatuses, true) && $shouldAutoApprove) {
            $approvedAmount = round($application->requested_amount * 0.90, 2); // 10% less than requested amount
            $tenure = (int)$application->requested_tenure_months;
            $rate = (float)($application->product->interest_rate_min ?? 12.5);
            $stampingDutyFee = 352.82; // Fixed Rs. 299 + 18% GST (Rs. 53.82)

            $emi = $engine->calculateEmi($approvedAmount, $rate, $tenure);
            $totalPayable = round(($emi * $tenure) + $stampingDutyFee, 2);
            $offerNumber = 'OFF-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            $offer = LoanOffer::updateOrCreate(
                ['application_id' => $application->id],
                [
                    'offer_number' => $offerNumber,
                    'approved_amount' => $approvedAmount,
                    'approved_tenure_months' => $tenure,
                    'interest_rate' => $rate,
                    'emi_amount' => $emi,
                    'processing_fee' => $stampingDutyFee,
                    'total_payable' => $totalPayable,
                    'status' => OfferStatus::ISSUED,
                    'issued_at' => now(),
                    'expires_at' => now()->addDays(7),
                    'remarks' => 'Automated algorithmic approval: 10% pre-adjusted sanction with fixed Rs. 299 + 18% GST stamp duties and paper charges.',
                ]
            );

            $application->update([
                'approved_amount' => $approvedAmount,
                'approved_tenure_months' => $tenure,
                'approved_interest_rate' => $rate,
                'current_status' => LoanStatus::OFFER_SENT,
            ]);

            AuditService::log('auto_offer_generated', 'LoanOffer', $offer->id, null, [
                'approved_amount' => $approvedAmount,
                'applied_amount' => $application->requested_amount,
                'stamping_fee' => $stampingDutyFee,
            ]);

            $application->load('offer');
        }

        $countdownRemaining = max(0, 60 - $secondsElapsed);

        return response()->json([
            'success' => true,
            'data' => $application,
            'customer_label' => $application->current_status->customerLabel(),
            'seconds_elapsed' => $secondsElapsed,
            'countdown_remaining_seconds' => $countdownRemaining,
            'auto_approved' => ($application->current_status === LoanStatus::OFFER_SENT || $application->offer !== null),
        ]);
    }

    /**
     * Get the active incomplete draft application for the logged-in user
     */
    public function activeDraft(Request $request): JsonResponse
    {
        $user = $request->user();

        $draft = LoanApplication::where('user_id', $user->id)
            ->where('current_status', LoanStatus::DRAFT)
            ->with([
                'product',
                'personalDetails',
                'employmentDetails',
                'businessDetails',
                'financialDetails',
                'documents',
            ])
            ->latest('id')
            ->first();

        return response()->json([
            'success' => true,
            'has_draft' => $draft !== null,
            'data' => $draft,
        ]);
    }

    /**
     * Discard an incomplete draft application
     */
    public function discardDraft(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $draft = LoanApplication::where('user_id', $user->id)
            ->where('id', $id)
            ->where('current_status', LoanStatus::DRAFT)
            ->firstOrFail();

        AuditService::log('application_draft_discarded', 'LoanApplication', $draft->id, null, [
            'application_number' => $draft->application_number,
            'requested_amount' => $draft->requested_amount,
        ], $user->id);

        $draft->delete();

        return response()->json([
            'success' => true,
            'message' => 'Draft application discarded successfully.',
        ]);
    }

    public function saveDraft(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'application_id' => 'nullable|exists:loan_applications,id',
            'product_id' => 'required|exists:loan_products,id',
            'requested_amount' => 'required|numeric|min:1000',
            'requested_tenure_months' => 'required|integer|min:1',
            'purpose' => 'nullable|string|max:255',
            'current_step' => 'nullable|integer|min:1|max:6',

            // Personal
            'personal' => 'nullable|array',
            'personal.full_name' => 'nullable|string|max:200',
            'personal.first_name' => 'nullable|string|max:100',
            'personal.last_name' => 'nullable|string|max:100',
            'personal.email' => 'nullable|email|max:150',
            'personal.phone' => 'nullable|string|max:20',
            'personal.dob' => 'nullable|date',
            'personal.gender' => 'nullable|string|max:20',
            'personal.marital_status' => 'nullable|string|max:20',
            'personal.current_address_line1' => 'nullable|string|max:255',
            'personal.current_city' => 'nullable|string|max:100',
            'personal.current_state' => 'nullable|string|max:100',
            'personal.current_pincode' => 'nullable|string|max:10',
            'personal.permanent_address_line1' => 'nullable|string|max:255',
            'personal.permanent_city' => 'nullable|string|max:100',
            'personal.permanent_state' => 'nullable|string|max:100',
            'personal.permanent_pincode' => 'nullable|string|max:10',
            'personal.pan_number' => 'nullable|string|max:20',
            'personal.aadhaar_number' => 'nullable|string|max:20',
            'personal.father_husband_name' => 'nullable|string|max:150',
            'personal.residence_type' => 'nullable|string|max:50',
            'personal.years_at_current_address' => 'nullable|string|max:20',
            'personal.reference_name' => 'nullable|string|max:150',
            'personal.reference_phone' => 'nullable|string|max:20',
            'personal.reference_relationship' => 'nullable|string|max:100',
            'personal.declaration_accepted' => 'nullable|boolean',

            // Employment
            'employment' => 'nullable|array',
            'employment.employment_type' => 'nullable|string',
            'employment.employer_name' => 'nullable|string|max:200',
            'employment.designation' => 'nullable|string|max:100',
            'employment.monthly_income' => 'nullable|numeric|min:0',
            'employment.work_experience_years' => 'nullable|numeric|min:0',
            'employment.official_email' => 'nullable|email|max:150',
            'employment.office_address' => 'nullable|string|max:255',

            // Business
            'business' => 'nullable|array',
            'business.business_name' => 'nullable|string|max:200',
            'business.business_type' => 'nullable|string|max:50',
            'business.registration_number' => 'nullable|string|max:50',
            'business.annual_turnover' => 'nullable|numeric|min:0',
            'business.business_vintage_years' => 'nullable|numeric|min:0',
            'business.business_address' => 'nullable|string|max:255',

            // Financial
            'financial' => 'nullable|array',
            'financial.monthly_expenses' => 'nullable|numeric|min:0',
            'financial.existing_emi_obligations' => 'nullable|numeric|min:0',
            'financial.primary_bank_name' => 'nullable|string|max:100',
            'financial.account_holder_name' => 'nullable|string|max:150',
            'financial.account_number' => 'nullable|string|max:50',
            'financial.ifsc_code' => 'nullable|string|max:20',
            'financial.account_type' => 'nullable|string|max:30',
        ]);

        $user = $request->user();

        $application = DB::transaction(function () use ($validated, $user, $request) {
            $application = null;

            if (!empty($validated['application_id'])) {
                $application = LoanApplication::where('user_id', $user->id)
                    ->where('id', $validated['application_id'])
                    ->firstOrFail();

                if ($application->current_status !== LoanStatus::DRAFT) {
                    abort(422, 'Cannot edit an application that has already been submitted.');
                }

                $updateData = [
                    'product_id' => $validated['product_id'],
                    'requested_amount' => $validated['requested_amount'],
                    'requested_tenure_months' => $validated['requested_tenure_months'],
                    'purpose' => $validated['purpose'] ?? null,
                ];
                if (!empty($validated['current_step'])) {
                    $updateData['current_step'] = $validated['current_step'];
                }

                $application->update($updateData);
            } else {
                $applicationNumber = 'APP-' . date('Ymd') . '-' . strtoupper(Str::random(6));

                $application = LoanApplication::create([
                    'application_number' => $applicationNumber,
                    'user_id' => $user->id,
                    'product_id' => $validated['product_id'],
                    'requested_amount' => $validated['requested_amount'],
                    'requested_tenure_months' => $validated['requested_tenure_months'],
                    'purpose' => $validated['purpose'] ?? null,
                    'current_status' => LoanStatus::DRAFT,
                    'current_step' => $validated['current_step'] ?? 1,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }

            if (!empty($validated['personal'])) {
                $pData = $validated['personal'];
                $fullName = $pData['full_name'] ?? null;
                $firstName = $pData['first_name'] ?? null;
                $lastName = $pData['last_name'] ?? null;

                if (!empty($fullName) && empty($firstName)) {
                    $nameParts = preg_split('/\s+/', trim($fullName));
                    $firstName = $nameParts[0] ?? $fullName;
                    $lastName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : '';
                }

                if (empty($firstName)) {
                    $firstName = $user->name ?? 'Applicant';
                }
                if ($lastName === null) {
                    $lastName = '';
                }

                ApplicationPersonalDetail::updateOrCreate(
                    ['application_id' => $application->id],
                    array_merge($pData, [
                        'full_name' => $fullName ?: trim($firstName . ' ' . $lastName),
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'email' => $pData['email'] ?? $user->email ?? '',
                        'phone' => $pData['phone'] ?? $user->phone ?? '',
                    ])
                );
            }

            if (!empty($validated['employment'])) {
                ApplicationEmploymentDetail::updateOrCreate(
                    ['application_id' => $application->id],
                    $validated['employment']
                );
            }

            if (!empty($validated['business'])) {
                ApplicationBusinessDetail::updateOrCreate(
                    ['application_id' => $application->id],
                    $validated['business']
                );
            }

            if (!empty($validated['financial'])) {
                ApplicationFinancialDetail::updateOrCreate(
                    ['application_id' => $application->id],
                    $validated['financial']
                );
            }

            return $application;
        });

        return response()->json([
            'success' => true,
            'message' => 'Application draft saved successfully.',
            'data' => $application->load(['personalDetails', 'employmentDetails', 'businessDetails', 'financialDetails', 'documents']),
        ]);
    }

    public function submit(Request $request, int $id, LoanStateMachine $stateMachine): JsonResponse
    {
        $application = LoanApplication::where('user_id', $request->user()->id)
            ->with(['personalDetails', 'employmentDetails', 'financialDetails', 'documents'])
            ->findOrFail($id);

        if ($application->current_status !== LoanStatus::DRAFT) {
            return response()->json([
                'success' => false,
                'message' => 'Application is already submitted or in progress.',
            ], 422);
        }

        // Validate completeness - Strictly mandatory KYC, Address, Bank details, and Documents
        if (!$application->personalDetails || empty($application->personalDetails->pan_number)) {
            return response()->json(['success' => false, 'message' => 'PAN number and personal KYC details are mandatory.'], 422);
        }
        if (empty($application->personalDetails->current_address_line1) || empty($application->personalDetails->current_city) || empty($application->personalDetails->current_pincode)) {
            return response()->json(['success' => false, 'message' => 'Complete residential address and PIN code are mandatory.'], 422);
        }
        if (!$application->financialDetails || empty($application->financialDetails->account_number) || empty($application->financialDetails->ifsc_code)) {
            return response()->json(['success' => false, 'message' => 'Complete disbursement bank account details and IFSC code are mandatory.'], 422);
        }

        // Validate strictly mandatory KYC documents (PAN, Aadhaar Front, Aadhaar Back, Selfie)
        $uploadedDocTypes = $application->documents->pluck('document_type')->unique()->toArray();
        $requiredDocs = ['pan_card', 'aadhaar_front', 'aadhaar_back', 'selfie'];
        $missingDocs = array_diff($requiredDocs, $uploadedDocTypes);
        if (!empty($missingDocs)) {
            $docNames = [
                'pan_card' => 'PAN Card Photo',
                'aadhaar_front' => 'Aadhaar Card (Front Photo)',
                'aadhaar_back' => 'Aadhaar Card (Back Photo)',
                'selfie' => 'Live Applicant Selfie',
            ];
            $missingNames = array_map(fn($t) => $docNames[$t] ?? $t, $missingDocs);
            return response()->json([
                'success' => false,
                'message' => 'Document upload is strictly mandatory. Please upload: ' . implode(', ', $missingNames),
                'missing_documents' => array_values($missingDocs),
            ], 422);
        }

        $application->update(['submitted_at' => now()]);
        $stateMachine->transition($application, LoanStatus::SUBMITTED, 'Submitted by customer', $request->user()->id);

        $applicantUser = $request->user();
        MetaCapiService::sendEvent('Lead', [
            'email' => $applicantUser?->email,
            'phone' => $applicantUser?->phone,
            'first_name' => $application->personalDetails?->first_name ?? explode(' ', $applicantUser?->name ?? '')[0] ?? '',
            'last_name' => $application->personalDetails?->last_name ?? '',
        ], [
            'content_name' => $application->product?->title ?? 'Loan Application',
            'value' => (float)($application->requested_amount ?? 10000),
            'currency' => 'INR',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully! Your application is now under review.',
            'data' => $application->fresh(),
        ]);
    }

    public function respondInformationRequest(Request $request, int $id, int $requestId, LoanStateMachine $stateMachine): JsonResponse
    {
        $request->validate(['response_text' => 'required|string|min:2']);

        $application = LoanApplication::where('user_id', $request->user()->id)->findOrFail($id);
        $infoReq = $application->informationRequests()->where('status', 'open')->findOrFail($requestId);

        $infoReq->update([
            'status' => 'responded',
            'response_text' => $request->input('response_text'),
            'responded_at' => now(),
        ]);

        if ($application->current_status === LoanStatus::ADDITIONAL_INFO_REQUIRED) {
            $stateMachine->transition($application, LoanStatus::DOCUMENT_VERIFICATION, 'Customer responded to information request', $request->user()->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Response submitted successfully.',
        ]);
    }
}
