# 28 — File Storage

## File classes
customer uploads, generated offers, KFS/agreements, receipts, disbursement documents, reports/exports.

## Rules
- private storage
- non-guessable keys
- authorized access
- no raw filesystem paths
- sanitize names
- validate MIME/size
- preserve required version history

## Metadata
original filename, storage key, MIME, size, uploader, application, type, version, timestamps, verification status.

## Generated files
Store template/version, application, generation timestamp and final artifact reference.
