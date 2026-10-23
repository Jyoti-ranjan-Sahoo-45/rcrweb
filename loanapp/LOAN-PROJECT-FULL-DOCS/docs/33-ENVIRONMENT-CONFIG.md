# 33 — Environment Configuration

## Environments
local, development, staging/UAT, production.

## Hostinger Live Deployment
- Base URL: `https://antiquewhite-fish-888897.hostingersite.com/`
- MySQL Database: `u529002218_Loan1`
- MySQL User: `u529002218_Loan1`
- PHP Binary: `/opt/alt/php82/usr/bin/php`
- Web Root: `/home/u529002218/domains/antiquewhite-fish-888897.hostingersite.com/public_html`

## Frontend
API URL: `/api`, environment name, public provider config identifiers, feature flags.

## Backend secrets
DB, mail, SMS/WhatsApp, payment provider, storage, push credentials. Never commit secrets to source control.

## Android
Customer portal origin: `https://antiquewhite-fish-888897.hostingersite.com/`, allowed domains, deep-link hosts, push config, package `com.app.rcrfinance`.

## Rule
Production builds must never point at staging services.

