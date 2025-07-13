# Samrakshaka.js

[![GitHub license](https://img.shields.io/github/license/houseofanurag/samrakshaka)](LICENSE)

A lightweight client-side JavaScript library for bot detection and content protection. Safeguard your web applications with behavioral analysis, proof-of-work challenges, and DOM integrity checks.

## Features

- 🛡️ **Bot Detection**: Behavioral analysis, canvas fingerprinting, and proof-of-work
- 🔒 **Content Protection**: Hide content until verification completes
- ⚙️ **Configurable**: Choose between `strict`, `moderate`, or `off` modes
- 🚀 **SPA Ready**: Works with single-page applications and dynamic content
- 🔄 **Event-Driven**: Fires `samrakshakaVerified` when content is unlocked

## Usage
```html
<samrakshaka mode="strict" challenge="both" protected-id="content"></samrakshaka>
<!-- Include DOMPurify and samrakshaka.js -->
