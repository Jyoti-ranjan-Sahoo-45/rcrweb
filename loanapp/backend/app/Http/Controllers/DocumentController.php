<?php

namespace App\Http\Controllers;

use App\Enums\DocumentStatus;
use App\Enums\LoanStatus;
use App\Models\ApplicationDocument;
use App\Models\LoanApplication;
use App\Models\ProductDocumentRequirement;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function upload(Request $request, int $applicationId): JsonResponse
    {
        $request->validate([
            'document_type' => 'required|string',
            'requirement_id' => 'nullable|exists:product_document_requirements,id',
            'file' => 'required|file|mimes:pdf,jpeg,jpg,png|max:10240', // 10MB max
        ]);

        $user = $request->user();
        $application = LoanApplication::where('id', $applicationId)
            ->when(!$user->isStaff(), fn($q) => $q->where('user_id', $user->id))
            ->firstOrFail();

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $originalFilename = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $mimeType = $file->getMimeType();

        // Safe private storage path
        $path = $file->store("documents/{$application->id}", 'public');

        // Check if existing document of this type exists for versioning
        $existing = ApplicationDocument::where('application_id', $application->id)
            ->where('document_type', $request->input('document_type'))
            ->latest('version')
            ->first();

        $version = $existing ? $existing->version + 1 : 1;

        $isStaff = $user->isStaff();
        $status = $isStaff ? DocumentStatus::VERIFIED : DocumentStatus::PENDING;

        $doc = ApplicationDocument::create([
            'application_id' => $application->id,
            'requirement_id' => $request->input('requirement_id'),
            'document_type' => $request->input('document_type'),
            'file_path' => $path,
            'original_filename' => $originalFilename,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
            'status' => $status,
            'verified_by_user_id' => $isStaff ? $user->id : null,
            'verified_at' => $isStaff ? now() : null,
            'version' => $version,
        ]);

        AuditService::log('document_uploaded', 'ApplicationDocument', $doc->id, null, [
            'type' => $doc->document_type,
            'version' => $version,
            'filename' => $originalFilename,
            'by_staff' => $isStaff,
        ]);

        return response()->json([
            'success' => true,
            'message' => $isStaff ? 'Document uploaded and verified successfully by staff.' : 'Document uploaded successfully.',
            'data' => $doc,
        ]);
    }

    public function reupload(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized staff action.');
        }

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpeg,jpg,png,webp|max:10240',
        ]);

        $doc = ApplicationDocument::with('application')->findOrFail($id);
        $file = $request->file('file');
        $originalFilename = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $mimeType = $file->getMimeType();

        // Delete old file if exists
        if ($doc->file_path && Storage::disk('public')->exists($doc->file_path)) {
            try {
                Storage::disk('public')->delete($doc->file_path);
            } catch (\Throwable $e) {
                // Ignore delete error
            }
        }

        // Store new file
        $path = $file->store("documents/{$doc->application_id}", 'public');
        $newVersion = ($doc->version ?? 1) + 1;

        $doc->update([
            'file_path' => $path,
            'original_filename' => $originalFilename,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
            'version' => $newVersion,
            'status' => DocumentStatus::VERIFIED,
            'verified_by_user_id' => $user->id,
            'verified_at' => now(),
            'rejection_reason' => null,
        ]);

        AuditService::log('document_reuploaded', 'ApplicationDocument', $doc->id, null, [
            'type' => $doc->document_type,
            'version' => $newVersion,
            'filename' => $originalFilename,
            'by' => $user->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Document re-uploaded and verified successfully (Version {$newVersion}).",
            'data' => $doc,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized staff action.');
        }

        $doc = ApplicationDocument::findOrFail($id);

        if ($doc->file_path && Storage::disk('public')->exists($doc->file_path)) {
            try {
                Storage::disk('public')->delete($doc->file_path);
            } catch (\Throwable $e) {
                // Ignore error
            }
        }

        $docId = $doc->id;
        $docType = $doc->document_type;
        $doc->delete();

        AuditService::log('document_deleted', 'ApplicationDocument', $docId, null, [
            'type' => $docType,
            'by' => $user->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully.',
        ]);
    }

    public function download(Request $request, int $id)
    {
        $user = $request->user();
        $doc = ApplicationDocument::with('application')->findOrFail($id);

        if (!$user->isStaff() && $doc->application->user_id !== $user->id) {
            abort(403, 'Unauthorized to view this document.');
        }

        if (!Storage::disk('public')->exists($doc->file_path)) {
            abort(404, 'File not found on storage.');
        }

        return Storage::disk('public')->download($doc->file_path, $doc->original_filename);
    }

    public function verify(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized staff action.');
        }

        $request->validate([
            'status' => 'required|in:verified,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string|max:500',
        ]);

        $doc = ApplicationDocument::with('application')->findOrFail($id);
        $status = $request->input('status') === 'verified' ? DocumentStatus::VERIFIED : DocumentStatus::REJECTED;

        $doc->update([
            'status' => $status,
            'verified_by_user_id' => $user->id,
            'verified_at' => now(),
            'rejection_reason' => $status === DocumentStatus::REJECTED ? $request->input('rejection_reason') : null,
        ]);

        AuditService::log('document_verified', 'ApplicationDocument', $doc->id, null, [
            'status' => $status->value,
            'rejection_reason' => $doc->rejection_reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Document has been marked as {$status->value}.",
            'data' => $doc,
        ]);
    }
}
