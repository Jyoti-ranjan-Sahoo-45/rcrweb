# 18 — Payment Flow

## Purpose
Handle legitimate configured applicable charges only.

## Lifecycle
Payable created → customer reviews → initiate → provider processing → success/failure/pending → backend verification → verified.

## States
created, initiated, pending, successful_unverified, verified, failed, cancelled, refunded, partially_refunded if supported.

## Rules
- payable amount is server-controlled
- return page cannot mark success
- verify with provider/backend
- prevent duplicate charges
- use provider reference and idempotency where supported
- record amount/currency/timestamps
- payment is never represented as guarantee of approval/disbursement

## Refund
If enabled: reference, amount, reason, state, timestamps.
