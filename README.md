# Samrakshaka

Samrakshaka is a lightweight JavaScript library for client-side bot detection and content protection. It uses behavioral analysis, proof-of-work, canvas fingerprinting, and DOM integrity checks to prevent unauthorized access while ensuring a seamless user experience.

## Features
- **Behavioral Analysis**: Detects human-like interactions (mouse, scroll, touch, keystrokes).
- **Proof-of-Work (PoW)**: Dynamic difficulty to deter bots.
- **Canvas Fingerprinting**: Identifies browser characteristics.
- **DOM Integrity**: Prevents unauthorized DOM modifications.
- **LocalStorage Caching**: Speeds up repeat visits with 24-hour verification caching.
- **Generic Messaging**: Customizable shield messages for user feedback.
- **CSP Compliant**: Works with `script-src 'self'`.

## Installation
```bash
npm install samrakshaka
