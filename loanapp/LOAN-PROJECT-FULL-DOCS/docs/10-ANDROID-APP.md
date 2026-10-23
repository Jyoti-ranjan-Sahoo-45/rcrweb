# 10 — Android Application

## Purpose
Deliver the customer React experience as a dedicated Android app while providing native capabilities.

## Launch
App icon → native splash → bootstrap/session → customer experience.

## Must not expose
- URL/address bar
- browser tabs
- generic WebView error pages
- staging/debug indicators in production

## Native responsibilities
- splash/icon
- WebView lifecycle
- safe navigation
- Android back button
- file picker
- camera/document capture
- downloads
- permission handling
- connectivity screen
- push notifications
- deep links
- payment return/deep-link handling
- external URL policy

## Security
- allowlist trusted origins
- no TLS-error bypass
- no unrestricted JavaScript bridge
- validate bridge messages
- disable WebView debugging in release
- block unknown schemes
- avoid arbitrary filesystem access

## Back behavior
Inside flow: navigate back.
At root/dashboard: optionally confirm exit.
