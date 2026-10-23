<?php

namespace App\Http\Controllers;

use App\Models\LoanCategory;
use App\Models\LoanProduct;
use App\Services\EligibilityEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CatalogController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = LoanCategory::where('is_active', true)
            ->with(['products' => function ($query) {
                $query->where('is_active', true)->with(['eligibilityRule', 'documentRequirements']);
            }])
            ->orderBy('display_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function products(): JsonResponse
    {
        $products = LoanProduct::where('is_active', true)
            ->with(['category', 'eligibilityRule', 'documentRequirements'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function productDetail(string $slug): JsonResponse
    {
        $product = LoanProduct::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int)$slug : 0)
            ->with(['category', 'eligibilityRule', 'documentRequirements'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    public function checkEligibility(Request $request, EligibilityEngine $engine): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:loan_products,id',
            'monthly_income' => 'required|numeric|min:0',
            'age' => 'nullable|integer|min:18|max:100',
            'credit_score' => 'nullable|integer|min:300|max:900',
            'existing_emi' => 'nullable|numeric|min:0',
            'employment_type' => 'nullable|string',
        ]);

        $product = LoanProduct::with('eligibilityRule')->findOrFail($request->input('product_id'));
        $result = $engine->evaluate($product, $request->all());

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Admin/Staff Product Catalog (All products including inactive)
     */
    public function adminProducts(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $products = LoanProduct::with(['category', 'eligibilityRule', 'documentRequirements'])
            ->withCount('applications')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Admin create new Loan Product
     */
    public function storeProduct(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:loan_categories,id',
            'name' => 'required|string|max:255',
            'short_description' => 'required|string|max:500',
            'min_amount' => 'required|numeric|min:1000',
            'max_amount' => 'required|numeric|gte:min_amount',
            'min_tenure_months' => 'required|integer|min:1',
            'max_tenure_months' => 'required|integer|gte:min_tenure_months',
            'interest_rate_min' => 'required|numeric|min:0',
            'interest_rate_max' => 'required|numeric|gte:interest_rate_min',
            'interest_type' => 'required|string',
            'processing_fee_type' => 'required|string',
            'processing_fee_value' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . rand(100, 999);

        $product = LoanProduct::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Loan product created successfully.',
            'data' => $product,
        ]);
    }

    /**
     * Admin update Loan Product
     */
    public function updateProduct(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $product = LoanProduct::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:loan_categories,id',
            'name' => 'sometimes|string|max:255',
            'short_description' => 'sometimes|string|max:500',
            'min_amount' => 'sometimes|numeric|min:1000',
            'max_amount' => 'sometimes|numeric',
            'min_tenure_months' => 'sometimes|integer|min:1',
            'max_tenure_months' => 'sometimes|integer',
            'interest_rate_min' => 'sometimes|numeric|min:0',
            'interest_rate_max' => 'sometimes|numeric',
            'interest_type' => 'sometimes|string',
            'processing_fee_type' => 'sometimes|string',
            'processing_fee_value' => 'sometimes|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Loan product updated successfully.',
            'data' => $product,
        ]);
    }

    /**
     * Admin toggle Loan Product active status
     */
    public function toggleProduct(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $product = LoanProduct::findOrFail($id);
        $product->is_active = !$product->is_active;
        $product->save();

        return response()->json([
            'success' => true,
            'message' => 'Loan product status updated.',
            'data' => $product,
        ]);
    }
}
