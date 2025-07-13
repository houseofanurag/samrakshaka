# Privacy Policy for Samrakshaka.js

**Last Updated**: [July 13'2025]

## 1. Overview

Samrakshaka.js ("the Library") is a client-side JavaScript library designed to protect web applications from unauthorized bot access. This document explains what data the Library collects and how it's processed.

## 2. Data Collection

### 2.1 Collected Data
The Library may process:

- **Behavioral Data**: Mouse movements, scroll events, and touch interactions (processed locally, not stored)
- **Device Characteristics**: Canvas fingerprinting results (anonymous, non-unique identifiers)
- **Proof-of-Work Solutions**: Cryptographic hashes (immediately discarded after verification)
- **Timestamps**: Last verification time (stored locally for caching)

### 2.2 Storage Locations
- `localStorage`: Stores verification status for up to 24 hours
- Memory: Temporary processing during page session

## 3. Data Sharing

The Library:
- ❌ Does **not** send data to external servers
- ❌ Does **not** use third-party analytics
- ❌ Does **not** include tracking pixels

All processing occurs in the user's browser.

## 4. User Control

### 4.1 Opt-Out Options
Site owners can:
- Set `mode="off"` to disable verification
- Use `challenge="pow"` to skip behavioral tracking

### 4.2 Data Removal
- Clear `localStorage` entries:
  ```javascript
  localStorage.removeItem('samrakshaka_verified');
  localStorage.removeItem('samrakshaka_timestamp');
