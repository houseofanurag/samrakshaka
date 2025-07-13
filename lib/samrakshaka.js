/**
 * Samrakshaka.js - A lightweight client-side bot detection and content protection library
 * 
 * Features:
 * - Behavioral analysis (mouse movements, scrolling, touch events)
 * - Proof-of-Work (PoW) challenge
 * - Canvas fingerprinting
 * - DOM integrity checks
 * - Configurable modes (strict, moderate, off)
 * - LocalStorage caching of verification status
 */

(async () => {
  // --------------------------
  // Initial Setup and Checks
  // --------------------------

  // Check for required DOMPurify dependency
  if (typeof DOMPurify === 'undefined') {
    console.error('Samrakshaka: DOMPurify is not loaded. Please include it before samrakshaka.js');
    return;
  }

  // Parse configuration from <samrakshaka> tag
  const configElement = document.querySelector('samrakshaka');
  if (!configElement) {
    console.warn('Samrakshaka: No <samrakshaka> tag found');
    return;
  }

  // Get configuration with defaults
  const config = {
    mode: configElement.getAttribute('mode') || 'moderate',
    challenge: configElement.getAttribute('challenge') || 'both',
    protectedId: configElement.getAttribute('protected-id') || 'content'
  };

  // Get DOM elements
  const shieldMessageElement = document.getElementById('shield-message');
  const protectedContentElement = document.getElementById(config.protectedId);

  // Validate required elements exist
  if (!protectedContentElement || !shieldMessageElement) {
    console.error('Samrakshaka: Missing shield-message or protected content element');
    return;
  }

  // --------------------------
  // Cache Verification
  // --------------------------

  const CACHE_KEYS = {
    VERIFIED: 'samrakshaka_verified',
    TIMESTAMP: 'samrakshaka_timestamp'
  };
  const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  const checkCache = () => {
    const cachedVerified = localStorage.getItem(CACHE_KEYS.VERIFIED) === 'true';
    const cachedTimestamp = parseInt(localStorage.getItem(CACHE_KEYS.TIMESTAMP)) || 0;
    const now = Date.now();

    if (cachedVerified && now - cachedTimestamp < CACHE_EXPIRY_MS) {
      return true;
    }

    // Clear stale cache
    localStorage.removeItem(CACHE_KEYS.VERIFIED);
    localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
    return false;
  };

  const grantAccess = () => {
    shieldMessageElement.style.display = 'none';
    protectedContentElement.style.display = 'block';
    localStorage.setItem(CACHE_KEYS.VERIFIED, 'true');
    localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());

    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('samrakshakaVerified'));
      document.dispatchEvent(new Event('DOMContentLoaded'));
      console.log('Samrakshaka: Triggered content rendering');
    }, 400);
  };

  // Check cache first
  if (config.mode !== 'off' && checkCache()) {
    console.log('Samrakshaka: Using cached verification');
    grantAccess();
    return;
  }

  // Handle 'off' mode immediately
  if (config.mode === 'off') {
    console.log('Samrakshaka: Mode is off, skipping verification');
    grantAccess();
    return;
  }

  // --------------------------
  // Verification Setup
  // --------------------------

  // Show verification message
  shieldMessageElement.style.display = 'block';
  protectedContentElement.style.display = 'none';
  console.log('Samrakshaka: Starting verification');

  // Verification flags
  const verificationResults = {
    isHuman: false,
    powPassed: false,
    keystrokePassed: false,
    canvasPassed: false
  };

  // --------------------------
  // Behavioral Analysis
  // --------------------------

  const setupBehavioralAnalysis = async () => {
    if (!(config.challenge === 'behavior' || config.challenge === 'both')) return;

    let mouseEvents = 0;
    let scrollEvents = 0;
    let touchEvents = 0;
    let navigationCount = 0;
    const NAVIGATION_LIMIT = 10;

    // Track user interactions
    document.addEventListener('mousemove', () => mouseEvents++, { passive: true });
    document.addEventListener('scroll', () => scrollEvents++, { passive: true });

    document.addEventListener('touchstart', (e) => {
      if (!e.target.closest('.hamburger, .mobile-menu-container, .mobile-menu-close, .mobile-menu-overlay')) {
        touchEvents++;
      }
    }, { passive: true });

    // Honeypot trap
    const setupHoneypot = () => {
      const honeypot = document.createElement('a');
      honeypot.href = '#samrakshaka-trap';
      honeypot.style.display = 'none';
      document.body.appendChild(honeypot);

      honeypot.addEventListener('click', () => {
        verificationResults.isHuman = false;
        shieldMessageElement.textContent = DOMPurify.sanitize('Access Denied: Samrakshaka detected unauthorized access');
        shieldMessageElement.style.display = 'block';
        protectedContentElement.style.display = 'none';
        clearInterval(integrityCheckInterval);
      });
    };

    // Navigation speed detection
    const setupNavigationTracking = () => {
      setInterval(() => (navigationCount = 0), 10000);

      document.querySelectorAll('.card:not(.hamburger):not(:has(.hamburger, .mobile-menu-container, .mobile-menu-close, .mobile-menu-overlay)), .read-more, .filter-chip').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          navigationCount++;
          if (navigationCount > NAVIGATION_LIMIT) verificationResults.isHuman = false;
        });
      });
    };

    // Keystroke timing analysis
    const setupKeystrokeAnalysis = async () => {
      const keyIntervals = [];
      let lastKeyTime = null;

      document.addEventListener('keydown', (_) => {
        const currentTime = performance.now();
        if (lastKeyTime && (currentTime - lastKeyTime < 5000)) {
          keyIntervals.push(currentTime - lastKeyTime);
        }
        lastKeyTime = currentTime;
      }, { passive: true });

      await new Promise(resolve => setTimeout(resolve, 5000));

      verificationResults.isHuman = mouseEvents > 2 || scrollEvents > 1 || touchEvents > 1;

      if (keyIntervals.length > 2) {
        const avgInterval = keyIntervals.reduce((sum, val) => sum + val, 0) / keyIntervals.length;
        const variance = keyIntervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / keyIntervals.length;
        verificationResults.keystrokePassed = variance > 1000;
        console.log('Samrakshaka: Keystroke variance:', variance);
      } else {
        verificationResults.keystrokePassed = true;
      }
    };

    setupHoneypot();
    setupNavigationTracking();
    await setupKeystrokeAnalysis();
  };

  // --------------------------
  // Canvas Fingerprinting
  // --------------------------

  const performCanvasFingerprinting = () => {
    if (!(config.challenge === 'behavior' || config.challenge === 'both')) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      ctx.font = '14px Arial';
      ctx.fillText('Samrakshaka', 10, 50);
      ctx.strokeStyle = 'rgba(255, 111, 97, 0.5)';
      ctx.beginPath();
      ctx.arc(50, 50, 20, 0, Math.PI * 2);
      ctx.stroke();

      const fingerprint = canvas.toDataURL();
      verificationResults.canvasPassed = fingerprint.length > 100 && !fingerprint.includes('data:,');
      console.log('Samrakshaka: Canvas fingerprint valid:', verificationResults.canvasPassed);
    } catch (error) {
      console.warn('Samrakshaka: Canvas fingerprinting failed', error);
      verificationResults.canvasPassed = true;
    }
  };

  // --------------------------
  // Proof-of-Work Challenge
  // --------------------------

  const computePoW = async (sessionId, maxAttempts, difficulty) => {
    let nonce = 0;

    while (nonce < maxAttempts) {
      const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(nonce + sessionId)
      );

      const hashHex = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (hashHex.startsWith(difficulty)) return nonce;

      nonce++;
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    console.warn('Samrakshaka: PoW timed out after', maxAttempts, 'attempts');
    return null;
  };

  const performPoWChallenge = async () => {
    if (!(config.challenge === 'pow' || config.challenge === 'both')) return;

    const sessionId = crypto.randomUUID();
    const MAX_ATTEMPTS = 10000;

    // Dynamic difficulty based on other verification results
    const powDifficulty = (verificationResults.isHuman &&
      verificationResults.keystrokePassed &&
      verificationResults.canvasPassed) ? '00' : '000';

    const nonce = await computePoW(sessionId, MAX_ATTEMPTS, powDifficulty);

    if (nonce !== null) {
      const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(nonce + sessionId)
      );

      const hashHex = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      verificationResults.powPassed = hashHex.startsWith(powDifficulty);
      console.log('Samrakshaka: PoW passed with difficulty:', powDifficulty);
    }
  };

  // --------------------------
  // DOM Integrity Check
  // --------------------------

  const setupDOMIntegrityCheck = () => {
    const mainElement = document.querySelector('main');
    if (!mainElement) return null;

    const originalContent = mainElement.innerHTML;
    let allowDynamicRender = true;

    const integrityCheckInterval = setInterval(() => {
      if (allowDynamicRender) {
        setTimeout(() => { allowDynamicRender = false; }, 5000);
        return;
      }

      if (mainElement.innerHTML !== originalContent) {
        verificationResults.isHuman = false;
        shieldMessageElement.textContent = DOMPurify.sanitize('Access Denied: Samrakshaka detected unauthorized DOM changes');
        shieldMessageElement.style.display = 'block';
        protectedContentElement.style.display = 'none';
        clearInterval(integrityCheckInterval);
      }
    }, 1000);

    return integrityCheckInterval;
  };

  // --------------------------
  // Verification Execution
  // --------------------------

  await setupBehavioralAnalysis();
  performCanvasFingerprinting();
  await performPoWChallenge();

  const integrityCheckInterval = setupDOMIntegrityCheck();

  // Determine verification outcome
  const isVerificationPassed =
    verificationResults.isHuman && (
      (config.challenge === 'both' &&
        verificationResults.powPassed &&
        verificationResults.keystrokePassed &&
        verificationResults.canvasPassed) ||
      (config.challenge === 'behavior' &&
        verificationResults.keystrokePassed &&
        verificationResults.canvasPassed) ||
      (config.challenge === 'pow' &&
        verificationResults.powPassed)
    );

  // --------------------------
  // Handle Verification Result
  // --------------------------

  if (isVerificationPassed) {
    console.log('Samrakshaka: Verification passed');
    shieldMessageElement.style.display = 'none';
    protectedContentElement.style.display = 'block';
    if (integrityCheckInterval) clearInterval(integrityCheckInterval);
    grantAccess();
  } else if (config.mode === 'moderate') {
    setTimeout(() => {
      if (protectedContentElement.style.display === 'none') {
        console.warn('Samrakshaka: Verification timeout, proceeding in moderate mode');
        shieldMessageElement.style.display = 'none';
        protectedContentElement.style.display = 'block';
        if (integrityCheckInterval) clearInterval(integrityCheckInterval);
        grantAccess();
      }
    }, 10000);
  } else {
    console.log('Samrakshaka: Verification failed in strict mode');
    shieldMessageElement.textContent = DOMPurify.sanitize('Access Denied: Samrakshaka detected unauthorized access');
    shieldMessageElement.style.display = 'block';
    protectedContentElement.style.display = 'none';
  }
})();
