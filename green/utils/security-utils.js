/**
 * Security Utilities for Stackr Finance
 * Provides protection against web scraping, XSS, CSRF and other security threats
 */

/**
 * Initialize security measures across the application
 * @returns {void}
 */
export function initializeSecurityMeasures() {
  // Add security headers via meta tags (since we can't modify HTTP headers directly in client-side code)
  addSecurityMetaTags();
  
  // Add anti-scraping protections
  setupAntiScrapingMeasures();
  
  // Add XSS protection
  setupXSSProtection();
  
  // Add CSRF token mechanism
  setupCSRFProtection();
  
  // Add browser fingerprinting for suspicious activity detection
  setupBrowserFingerprinting();
  
  console.log('Security measures initialized');
}

/**
 * Add security-related meta tags to the document
 * @returns {void}
 */
function addSecurityMetaTags() {
  // Create and append Content Security Policy meta tag
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://api.openai.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.perplexity.ai https://api.x.ai https://api.stripe.com; frame-src https://js.stripe.com;";
  document.head.appendChild(cspMeta);
  
  // X-Content-Type-Options
  const xContentTypeMeta = document.createElement('meta');
  xContentTypeMeta.httpEquiv = 'X-Content-Type-Options';
  xContentTypeMeta.content = 'nosniff';
  document.head.appendChild(xContentTypeMeta);
  
  // X-Frame-Options
  const xFrameOptionsMeta = document.createElement('meta');
  xFrameOptionsMeta.httpEquiv = 'X-Frame-Options';
  xFrameOptionsMeta.content = 'DENY';
  document.head.appendChild(xFrameOptionsMeta);
  
  // Referrer-Policy
  const referrerPolicyMeta = document.createElement('meta');
  referrerPolicyMeta.name = 'referrer';
  referrerPolicyMeta.content = 'strict-origin-when-cross-origin';
  document.head.appendChild(referrerPolicyMeta);
  
  // Feature-Policy
  const featurePolicyMeta = document.createElement('meta');
  featurePolicyMeta.httpEquiv = 'Feature-Policy';
  featurePolicyMeta.content = "camera 'self'; microphone 'self'; geolocation 'none'";
  document.head.appendChild(featurePolicyMeta);
}

/**
 * Set up anti-scraping measures
 * @returns {void}
 */
function setupAntiScrapingMeasures() {
  // 1. Detect and block headless browsers
  detectHeadlessBrowsers();
  
  // 2. Rate limiting for API calls
  setupRateLimiting();
  
  // 3. Honeypot fields in forms
  addHoneypotFields();
  
  // 4. Block right-click on sensitive pages
  preventRightClickOnSensitivePages();
  
  // 5. Disable programmatic text selection and copying on sensitive data
  protectSensitiveContent();
}

/**
 * Detect headless browsers commonly used for scraping
 * @returns {boolean} - True if headless browser detected
 */
function detectHeadlessBrowsers() {
  // Store detection result
  let isHeadless = false;
  
  // Check for common headless browser tells
  const navigatorObj = window.navigator;
  
  // Check for WebDriver attribute (used by Selenium)
  if (navigatorObj.webdriver) {
    isHeadless = true;
  }
  
  // Check for missing properties that regular browsers would have
  if (!window.chrome || 
      !window.chrome.runtime || 
      !window.chrome.runtime.id) {
    // This might be a headless Chrome
    isHeadless = true;
  }
  
  // Check for inconsistencies in navigator properties
  if (navigatorObj.languages === "" || 
      (navigatorObj.languages && navigatorObj.languages.length === 0)) {
    isHeadless = true;
  }
  
  // Check for suspicious screen dimensions
  if (window.screen.width < 100 || window.screen.height < 100) {
    isHeadless = true;
  }
  
  // Take action if headless browser detected
  if (isHeadless) {
    // Add random, slight delays to API responses
    window._securitySettings = window._securitySettings || {};
    window._securitySettings.addRandomDelay = true;
    window._securitySettings.delayMin = 100;
    window._securitySettings.delayMax = 500;
    
    // Inject misleading data for scrapers
    injectMisleadingDataForScrapers();
    
    // In extreme cases, optionally add this code:
    // Log suspicious activity (headless browser detection)
    logSuspiciousActivity('headless_browser_detected');
  }
  
  return isHeadless;
}

/**
 * Set up rate limiting for API calls
 * @returns {void}
 */
function setupRateLimiting() {
  // Simple client-side rate limiting for API calls
  window._securitySettings = window._securitySettings || {};
  window._securitySettings.rateLimits = {
    apiCalls: {
      maxRequests: 50,
      perTimeWindow: 60000, // 1 minute in milliseconds
      currentRequests: 0,
      windowStart: Date.now()
    }
  };
  
  // Create a proxy for fetch to implement rate limiting
  const originalFetch = window.fetch;
  window.fetch = function() {
    // Reset counter if time window expired
    const rateLimits = window._securitySettings.rateLimits.apiCalls;
    const now = Date.now();
    if (now - rateLimits.windowStart > rateLimits.perTimeWindow) {
      rateLimits.windowStart = now;
      rateLimits.currentRequests = 0;
    }
    
    // Check if rate limit exceeded
    if (rateLimits.currentRequests >= rateLimits.maxRequests) {
      console.error('Rate limit exceeded');
      return Promise.reject(new Error('Too many requests. Please try again later.'));
    }
    
    // Increment request counter
    rateLimits.currentRequests++;
    
    // Apply random delay if needed (anti-scraping measure)
    if (window._securitySettings.addRandomDelay) {
      const min = window._securitySettings.delayMin || 100;
      const max = window._securitySettings.delayMax || 300;
      const delay = Math.floor(Math.random() * (max - min)) + min;
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(originalFetch.apply(this, arguments));
        }, delay);
      });
    }
    
    // Normal fetch operation
    return originalFetch.apply(this, arguments);
  };
}

/**
 * Add hidden honeypot fields to forms to detect bots
 * @returns {void}
 */
function addHoneypotFields() {
  // Add honeypot fields to all forms
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    // Skip if already has a honeypot
    if (form.querySelector('.hp-field')) return;
    
    // Create honeypot field
    const honeypotField = document.createElement('div');
    honeypotField.style.opacity = '0';
    honeypotField.style.position = 'absolute';
    honeypotField.style.height = '0';
    honeypotField.style.width = '0';
    honeypotField.style.overflow = 'hidden';
    honeypotField.className = 'hp-field';
    
    const honeypotInput = document.createElement('input');
    honeypotInput.type = 'text';
    honeypotInput.name = 'website';  // Attractive field name for bots
    honeypotInput.id = 'website-field';
    honeypotInput.tabIndex = -1;
    honeypotInput.autocomplete = 'off';
    
    honeypotField.appendChild(honeypotInput);
    form.appendChild(honeypotField);
    
    // Add form submit handler to check honeypot
    form.addEventListener('submit', function(e) {
      const honeypotValue = honeypotInput.value;
      if (honeypotValue) {
        // Bot detected! Prevent form submission
        e.preventDefault();
        logSuspiciousActivity('honeypot_triggered');
        
        // Pretend the form submitted successfully
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          const originalText = submitButton.textContent;
          submitButton.disabled = true;
          submitButton.textContent = 'Submitting...';
          
          setTimeout(() => {
            submitButton.textContent = 'Submitted!';
            setTimeout(() => {
              submitButton.textContent = originalText;
              submitButton.disabled = false;
              // Optional: Reset the form
              form.reset();
            }, 2000);
          }, 1500);
        }
      }
    });
  });
}

/**
 * Prevent right-click on sensitive pages
 * @returns {void}
 */
function preventRightClickOnSensitivePages() {
  // Get current page from app state
  const currentPage = window.appState?.currentPage || '';
  
  // List of sensitive pages
  const sensitivePaths = ['dashboard', 'expenses', 'income', 'bankconnections', 'subscriptionsniper', 'settings'];
  
  // Check if current page is sensitive
  if (sensitivePaths.includes(currentPage)) {
    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });
    
    // Disable keyboard shortcuts for viewing source
    document.addEventListener('keydown', function(e) {
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I or F12 (Developer Tools)
      if ((e.ctrlKey && e.shiftKey && e.key === 'i') || e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    });
  }
}

/**
 * Protect sensitive content from being copied
 * @returns {void}
 */
function protectSensitiveContent() {
  // Add CSS to prevent text selection on sensitive elements
  const style = document.createElement('style');
  style.textContent = `
    .protect-content {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  `;
  document.head.appendChild(style);
  
  // Find and protect sensitive elements
  const sensitiveElements = document.querySelectorAll('.account-number, .balance, .user-data');
  sensitiveElements.forEach(element => {
    element.classList.add('protect-content');
    
    // Prevent copy event
    element.addEventListener('copy', (e) => {
      e.preventDefault();
      return false;
    });
  });
  
  // Apply protection to dynamically added elements
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        // Check each added node
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the element is sensitive
            if (node.classList.contains('account-number') || 
                node.classList.contains('balance') || 
                node.classList.contains('user-data')) {
              node.classList.add('protect-content');
              
              // Prevent copy event
              node.addEventListener('copy', (e) => {
                e.preventDefault();
                return false;
              });
            }
            
            // Check children of added node
            const sensitiveChildren = node.querySelectorAll('.account-number, .balance, .user-data');
            sensitiveChildren.forEach(element => {
              element.classList.add('protect-content');
              
              // Prevent copy event
              element.addEventListener('copy', (e) => {
                e.preventDefault();
                return false;
              });
            });
          }
        });
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Inject misleading data to confuse scrapers
 * @returns {void}
 */
function injectMisleadingDataForScrapers() {
  // Create hidden content that will confuse scrapers
  // but won't affect real users since it's not visible
  const honeypotContent = document.createElement('div');
  honeypotContent.style.position = 'absolute';
  honeypotContent.style.left = '-9999px';
  honeypotContent.style.top = '-9999px';
  honeypotContent.style.height = '1px';
  honeypotContent.style.width = '1px';
  honeypotContent.style.overflow = 'hidden';
  honeypotContent.setAttribute('aria-hidden', 'true');
  
  // Add fake data that scrapers might target
  honeypotContent.innerHTML = `
    <div class="user-profile">
      <h2>User Profile</h2>
      <div>Username: dummy_user_123</div>
      <div>Email: example@fake-email.com</div>
      <div>Member since: 2020-01-01</div>
    </div>
    <div class="account-details">
      <h2>Account Details</h2>
      <div>Account: 1234567890</div>
      <div>Balance: $99,999.00</div>
      <div>Status: Active</div>
    </div>
    <div class="transaction-history">
      <h2>Recent Transactions</h2>
      <ul>
        <li>2023-01-01: Payment - $123.45</li>
        <li>2023-01-02: Deposit - $678.90</li>
        <li>2023-01-03: Transfer - $246.80</li>
      </ul>
    </div>
  `;
  
  // Add to document, but make sure it's not visible or accessible
  document.body.appendChild(honeypotContent);
}

/**
 * Set up XSS protection measures
 * @returns {void}
 */
function setupXSSProtection() {
  // Global function to sanitize user-generated content before rendering
  window.sanitizeContent = function(html) {
    // Simple HTML sanitization function
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  };
  
  // Override innerHTML to add sanitization
  const originalHTMLSetter = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
  
  Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function(value) {
      // Only sanitize for user-generated content
      if (this.classList.contains('user-content') || 
          this.hasAttribute('data-sanitize') || 
          this.getAttribute('id') === 'user-input-display') {
        // Sanitize the content
        const sanitized = window.sanitizeContent(value);
        originalHTMLSetter.call(this, sanitized);
      } else {
        // Normal behavior for trusted content
        originalHTMLSetter.call(this, value);
      }
    }
  });
}

/**
 * Set up CSRF protection
 * @returns {void}
 */
function setupCSRFProtection() {
  // Generate CSRF token
  const generateCSRFToken = () => {
    // Create a random token
    const randomValues = new Uint8Array(16);
    window.crypto.getRandomValues(randomValues);
    return Array.from(randomValues)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  };
  
  // Set CSRF token if not already set
  if (!localStorage.getItem('csrf_token')) {
    localStorage.setItem('csrf_token', generateCSRFToken());
  }
  
  // Add CSRF token to all fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    // Only add CSRF token to same-origin POST requests
    if (typeof url === 'string' && 
        (url.startsWith('/') || url.startsWith(window.location.origin)) && 
        options.method && 
        options.method.toUpperCase() === 'POST') {
      
      // Initialize headers if not already set
      options.headers = options.headers || {};
      
      // Add CSRF token to headers
      if (typeof options.headers.append === 'function') {
        // Headers object
        options.headers.append('X-CSRF-Token', localStorage.getItem('csrf_token'));
      } else {
        // Plain object
        options.headers['X-CSRF-Token'] = localStorage.getItem('csrf_token');
      }
    }
    
    return originalFetch.call(this, url, options);
  };
  
  // Also add CSRF tokens to forms
  document.addEventListener('submit', function(event) {
    const form = event.target;
    
    // Only handle same-origin POST forms
    if (form.method.toLowerCase() === 'post' && 
        (!form.action || form.action.startsWith(window.location.origin) || form.action.startsWith('/'))) {
      
      // Check if the form already has a CSRF token field
      if (!form.querySelector('input[name="csrf_token"]')) {
        // Add CSRF token as hidden field
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrf_token';
        csrfInput.value = localStorage.getItem('csrf_token');
        form.appendChild(csrfInput);
      }
    }
  }, true);
}

/**
 * Set up browser fingerprinting to detect suspicious activity
 * @returns {void}
 */
function setupBrowserFingerprinting() {
  // Generate a simple browser fingerprint
  const generateFingerprint = () => {
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      colorDepth: window.screen.colorDepth,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      doNotTrack: navigator.doNotTrack,
      cookiesEnabled: navigator.cookieEnabled,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage
    };
    
    // Create a hash of the fingerprint
    let fingerprintStr = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < fingerprintStr.length; i++) {
      const char = fingerprintStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString(16);
  };
  
  // Calculate fingerprint
  const currentFingerprint = generateFingerprint();
  
  // Compare with stored fingerprint (if any)
  const storedFingerprint = localStorage.getItem('browser_fingerprint');
  if (storedFingerprint && storedFingerprint !== currentFingerprint) {
    // Suspicious activity - browser fingerprint changed
    logSuspiciousActivity('browser_fingerprint_changed');
    
    // Show security notification to user
    showSecurityNotification('Unusual activity detected. For your security, please verify your identity.');
  }
  
  // Store current fingerprint
  localStorage.setItem('browser_fingerprint', currentFingerprint);
  
  // Setup fingerprint check on page load
  window.addEventListener('load', () => {
    // Check fingerprint on each page load
    if (localStorage.getItem('browser_fingerprint') !== currentFingerprint) {
      // Update stored fingerprint
      localStorage.setItem('browser_fingerprint', currentFingerprint);
      
      // Log suspicious activity
      logSuspiciousActivity('browser_fingerprint_changed_on_load');
    }
  });
}

/**
 * Log suspicious activity for monitoring
 * @param {string} activityType - Type of suspicious activity
 * @param {Object} [details={}] - Additional details
 * @returns {void}
 */
function logSuspiciousActivity(activityType, details = {}) {
  // Create activity log
  const logEntry = {
    type: activityType,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...details
  };
  
  // Store in local storage (limited capacity)
  try {
    // Get existing logs
    let activityLogs = JSON.parse(localStorage.getItem('security_activity_logs') || '[]');
    
    // Limit size to prevent localStorage overflow
    if (activityLogs.length >= 50) {
      activityLogs = activityLogs.slice(-49);
    }
    
    // Add new log
    activityLogs.push(logEntry);
    
    // Save back to localStorage
    localStorage.setItem('security_activity_logs', JSON.stringify(activityLogs));
  } catch (error) {
    console.error('Failed to log suspicious activity:', error);
  }
  
  // In a real app, we would send this to the server
  // but for the GREEN version, we're just storing locally
  console.warn('Suspicious activity detected:', activityType);
}

/**
 * Show security notification to user
 * @param {string} message - Notification message
 * @returns {void}
 */
function showSecurityNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'security-notification';
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#FEF2F2';
  notification.style.color = '#B91C1C';
  notification.style.padding = '12px 16px';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  notification.style.zIndex = '9999';
  notification.style.maxWidth = '300px';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  
  // Add security icon
  const icon = document.createElement('div');
  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
  icon.style.marginRight = '12px';
  notification.appendChild(icon);
  
  // Add message
  const text = document.createElement('div');
  text.textContent = message;
  notification.appendChild(text);
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = '#B91C1C';
  closeBtn.style.fontSize = '18px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.marginLeft = 'auto';
  closeBtn.style.padding = '0 0 0 16px';
  
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(notification);
  });
  
  notification.appendChild(closeBtn);
  
  // Add to document
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 10000);
}

/**
 * Enable content encryption for sensitive data
 * @param {string} data - Sensitive data to encrypt
 * @param {string} [purpose='general'] - Purpose for the encryption (e.g., 'account', 'payment')
 * @returns {string} - Encrypted data or the original data if encryption fails
 */
export function encryptSensitiveData(data, purpose = 'general') {
  try {
    // Simple encryption using Base64 + a secret key for obfuscation
    // In a real app, use the Web Crypto API for true encryption
    const secretKey = localStorage.getItem('encryption_key') || 'stackr_secure_key';
    const encodedData = btoa(encodeURIComponent(data)); // Base64 encode
    
    // Create a simple obfuscation layer by XOR with key
    const obfuscated = encodedData.split('').map((char, index) => {
      const keyChar = secretKey.charCodeAt(index % secretKey.length);
      const charCode = char.charCodeAt(0) ^ (keyChar & 15); // Simple XOR with limited range
      return String.fromCharCode(charCode);
    }).join('');
    
    return obfuscated;
  } catch (error) {
    console.error('Encryption failed:', error);
    // Return original data if encryption fails
    return data;
  }
}

/**
 * Decrypt previously encrypted sensitive data
 * @param {string} encryptedData - Data previously encrypted with encryptSensitiveData
 * @returns {string} - Decrypted data or the input if decryption fails
 */
export function decryptSensitiveData(encryptedData) {
  try {
    // Matching decryption for the simple encryption above
    const secretKey = localStorage.getItem('encryption_key') || 'stackr_secure_key';
    
    // Reverse the obfuscation
    const deobfuscated = encryptedData.split('').map((char, index) => {
      const keyChar = secretKey.charCodeAt(index % secretKey.length);
      const charCode = char.charCodeAt(0) ^ (keyChar & 15); // Simple XOR with limited range
      return String.fromCharCode(charCode);
    }).join('');
    
    // Decode from Base64
    return decodeURIComponent(atob(deobfuscated));
  } catch (error) {
    console.error('Decryption failed:', error);
    // Return input if decryption fails
    return encryptedData;
  }
}

// Generate a secure encryption key when module first loads
(function generateEncryptionKey() {
  if (!localStorage.getItem('encryption_key')) {
    // Generate a random encryption key
    const keyArray = new Uint8Array(32);
    window.crypto.getRandomValues(keyArray);
    const key = Array.from(keyArray)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    localStorage.setItem('encryption_key', key);
  }
})();