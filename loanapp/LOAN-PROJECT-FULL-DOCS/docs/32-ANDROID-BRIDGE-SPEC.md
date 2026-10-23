# 32 — Android Bridge Specification

## Goal
Expose only required native features to the customer React app.

## Candidate actions
chooseFile, captureDocument, saveDownload, openDownloadedFile, requestNotificationPermission, getAppVersion, openExternalUrl, paymentReturn.

## Request envelope
action, requestId, validated payload.

## Response envelope
requestId, success, data or errorCode.

## Security
- no arbitrary command execution
- no raw filesystem access
- no unrestricted JS interface
- accept messages only from trusted app origin
- validate payload type/size
- validate external URLs
- do not unnecessarily pass auth secrets

## Notifications
Push payload contains minimal route/action. On tap: open app → restore/authenticate → navigate to authorized route.

## Payment
External payment return restores UI, but backend verification controls payment status.
