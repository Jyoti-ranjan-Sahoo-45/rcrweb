<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

class MetaCapiService
{
    /**
     * Send a server-side conversion event to Meta Conversions API (CAPI)
     *
     * @param string $eventName e.g. 'CompleteRegistration', 'Lead', 'Purchase'
     * @param array $userData e.g. ['email' => '...', 'phone' => '...']
     * @param array $customData e.g. ['value' => 50000, 'currency' => 'INR', 'content_name' => 'Personal Loan']
     * @param string|null $eventId Optional event_id for client-server deduplication
     * @return bool
     */
    public static function sendEvent(string $eventName, array $userData = [], array $customData = [], ?string $eventId = null): bool
    {
        $pixelId = config('services.meta.pixel_id') ?: env('META_PIXEL_ID', '1792100208524597');
        $accessToken = config('services.meta.capi_token') ?: env('META_CAPI_ACCESS_TOKEN');

        if (empty($accessToken) || empty($pixelId)) {
            Log::debug('Meta CAPI skipped: Missing pixel_id or access_token.');
            return false;
        }

        try {
            $formattedUserData = [
                'client_ip_address' => Request::ip() ?? '127.0.0.1',
                'client_user_agent' => Request::userAgent() ?? 'RCRFinance-Server/1.0',
            ];

            // Normalize and hash email (SHA-256)
            if (!empty($userData['email'])) {
                $cleanEmail = strtolower(trim($userData['email']));
                $formattedUserData['em'] = [hash('sha256', $cleanEmail)];
            }

            // Normalize and hash phone (SHA-256)
            if (!empty($userData['phone'])) {
                $cleanPhone = preg_replace('/[^0-9]/', '', (string)$userData['phone']);
                // Default to India country code 91 if 10 digits
                if (strlen($cleanPhone) === 10) {
                    $cleanPhone = '91' . $cleanPhone;
                }
                $formattedUserData['ph'] = [hash('sha256', $cleanPhone)];
            }

            // Optional first / last name
            if (!empty($userData['first_name'])) {
                $formattedUserData['fn'] = [hash('sha256', strtolower(trim($userData['first_name'])))];
            }
            if (!empty($userData['last_name'])) {
                $formattedUserData['ln'] = [hash('sha256', strtolower(trim($userData['last_name'])))];
            }

            $eventPayload = [
                'event_name' => $eventName,
                'event_time' => time(),
                'action_source' => 'website',
                'event_source_url' => Request::fullUrl() ?: 'https://rcrfinance.com',
                'user_data' => $formattedUserData,
            ];

            if ($eventId) {
                $eventPayload['event_id'] = $eventId;
            }

            if (!empty($customData)) {
                $eventPayload['custom_data'] = $customData;
            }

            $endpoint = "https://graph.facebook.com/v19.0/{$pixelId}/events";

            $response = Http::timeout(4)->post($endpoint, [
                'access_token' => $accessToken,
                'data' => [$eventPayload],
            ]);

            if ($response->successful()) {
                Log::info("Meta CAPI event successfully dispatched: {$eventName}", [
                    'events_received' => $response->json('events_received'),
                    'fbtrace_id' => $response->json('fbtrace_id'),
                ]);
                return true;
            }

            Log::warning("Meta CAPI error response for {$eventName}", [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
            return false;
        } catch (\Throwable $e) {
            // Fail safely: Never let an ad tracking call break critical banking/user actions
            Log::warning("Meta CAPI execution failed: " . $e->getMessage());
            return false;
        }
    }
}
