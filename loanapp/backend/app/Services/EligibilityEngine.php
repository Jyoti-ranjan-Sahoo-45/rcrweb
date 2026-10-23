<?php

namespace App\Services;

use App\Models\LoanProduct;

class EligibilityEngine
{
    public function evaluate(LoanProduct $product, array $customerData): array
    {
        $age = $customerData['age'] ?? 25;
        $monthlyIncome = (float)($customerData['monthly_income'] ?? 0);
        $existingEmi = (float)($customerData['existing_emi'] ?? 0);
        $creditScore = (int)($customerData['credit_score'] ?? 720);
        $employmentType = $customerData['employment_type'] ?? 'salaried';

        $rules = $product->eligibilityRule;
        $minAge = $rules->min_age ?? 21;
        $maxAge = $rules->max_age ?? 60;
        $minIncome = (float)($rules->min_monthly_income ?? 20000);
        $minScore = (int)($rules->min_credit_score ?? 650);
        $maxDti = (float)($rules->max_dti_ratio ?? 50.0);

        $reasons = [];
        $isEligible = true;

        if ($age < $minAge || $age > $maxAge) {
            $isEligible = false;
            $reasons[] = "Age must be between {$minAge} and {$maxAge} years.";
        }

        if ($monthlyIncome < $minIncome) {
            $isEligible = false;
            $reasons[] = "Monthly income must be at least ₹" . number_format($minIncome);
        }

        if ($creditScore < $minScore) {
            $isEligible = false;
            $reasons[] = "Credit score of {$creditScore} is below minimum requirement of {$minScore}.";
        }

        // Calculate Maximum Allowable EMI (DTI cap)
        $maxAllowableEmi = max(0, ($monthlyIncome * ($maxDti / 100)) - $existingEmi);

        // Estimate max loan amount based on product rate and max tenure
        $tenure = $product->default_tenure_months ?: 36;
        $ratePerMonth = ($product->default_interest_rate / 12) / 100;
        
        $maxEligibleAmount = 0;
        if ($maxAllowableEmi > 0 && $ratePerMonth > 0) {
            // PV = EMI * (1 - (1+r)^-n) / r
            $factor = (1 - pow(1 + $ratePerMonth, -$tenure)) / $ratePerMonth;
            $maxEligibleAmount = round($maxAllowableEmi * $factor, -2);
            $maxEligibleAmount = min($maxEligibleAmount, (float)$product->max_amount);
            $maxEligibleAmount = max($maxEligibleAmount, (float)$product->min_amount);
        }

        $estimatedEmi = $this->calculateEmi($maxEligibleAmount, $product->default_interest_rate, $tenure);

        return [
            'is_eligible' => $isEligible,
            'reasons' => $reasons,
            'max_eligible_amount' => $isEligible ? $maxEligibleAmount : 0,
            'recommended_tenure_months' => $tenure,
            'estimated_interest_rate' => $product->default_interest_rate,
            'estimated_monthly_emi' => $isEligible ? $estimatedEmi : 0,
            'dti_ratio' => $monthlyIncome > 0 ? round(($existingEmi / $monthlyIncome) * 100, 2) : 0,
        ];
    }

    public function calculateEmi(float $principal, float $annualRatePct, int $tenureMonths): float
    {
        if ($principal <= 0 || $tenureMonths <= 0) {
            return 0.0;
        }

        $r = ($annualRatePct / 12) / 100;
        if ($r == 0) {
            return round($principal / $tenureMonths, 2);
        }

        $emi = ($principal * $r * pow(1 + $r, $tenureMonths)) / (pow(1 + $r, $tenureMonths) - 1);
        return round($emi, 2);
    }
}
