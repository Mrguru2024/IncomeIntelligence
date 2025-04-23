/**
 * Authentication Utilities for Stackr Finance GREEN Edition
 * This module provides functions to check authentication status and retrieve user data
 */

// Import application state
import { appState } from './src/main.js';

/**
 * Renders the login page
 * @returns {HTMLElement} - The login page container
 */
export function renderLoginPage() {
  console.log("Auth module loaded");
  
  // Auto login for development purposes
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('replit')) {
    console.log('Auto-login enabled for development');
    
    // Set up demo user
    appState.user = {
      id: 1,
      username: 'demo_user',
      name: 'Demo User',
      email: 'demo@example.com',
      isAuthenticated: true,
      subscription: {
        tier: 'pro',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      splitRatio: {
        needs: 40,
        investments: 30,
        savings: 30
      },
      onboardingCompleted: true
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('stackrUser', JSON.stringify({
      username: 'demo_user',
      email: 'demo@example.com',
      isAuthenticated: true,
      onboardingCompleted: true
    }));
    
    // Update state
    localStorage.setItem('stackr-finance-state', JSON.stringify(appState));
    
    console.log('Auto-login complete, redirecting to dashboard');
    window.navigateTo('dashboard');
    
    // Return empty div since we're redirecting
    const emptyDiv = document.createElement('div');
    return emptyDiv;
  }
  
  // Create the container for the login page
  const container = document.createElement('div');
  container.className = 'auth-container';
  container.style.display = 'flex';
  container.style.minHeight = '100vh';
  container.style.background = 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)';
  
  // Create the left panel (form)
  const formPanel = document.createElement('div');
  formPanel.className = 'auth-form-panel';
  formPanel.style.flex = '1';
  formPanel.style.padding = '2rem';
  formPanel.style.display = 'flex';
  formPanel.style.flexDirection = 'column';
  formPanel.style.justifyContent = 'center';
  formPanel.style.alignItems = 'center';
  formPanel.style.backgroundColor = 'white';
  
  // On mobile, make it full width
  if (window.innerWidth < 768) {
    formPanel.style.width = '100%';
  }
  
  // Create the logo section
  const logoSection = document.createElement('div');
  logoSection.style.marginBottom = '2rem';
  logoSection.style.textAlign = 'center';
  
  const logo = document.createElement('h1');
  logo.textContent = 'Stackr Finance';
  logo.style.fontSize = '1.875rem';
  logo.style.fontWeight = 'bold';
  logo.style.color = 'var(--color-primary)';
  logoSection.appendChild(logo);
  
  const tagline = document.createElement('p');
  tagline.textContent = 'Log in to manage your 40/30/30 income split';
  tagline.style.fontSize = '0.875rem';
  tagline.style.color = 'var(--color-text-secondary)';
  tagline.style.marginTop = '0.5rem';
  logoSection.appendChild(tagline);
  
  formPanel.appendChild(logoSection);
  
  // Create the form
  const form = document.createElement('form');
  form.className = 'login-form';
  form.style.width = '100%';
  form.style.maxWidth = '400px';
  
  // Username/Email field
  const usernameGroup = document.createElement('div');
  usernameGroup.className = 'form-group';
  usernameGroup.style.marginBottom = '1.5rem';
  
  const usernameLabel = document.createElement('label');
  usernameLabel.htmlFor = 'username';
  usernameLabel.textContent = 'Username or Email';
  usernameLabel.style.display = 'block';
  usernameLabel.style.marginBottom = '0.5rem';
  usernameLabel.style.fontSize = '0.875rem';
  usernameLabel.style.fontWeight = '500';
  usernameGroup.appendChild(usernameLabel);
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'username';
  usernameInput.placeholder = 'Enter your username or email';
  usernameInput.style.width = '100%';
  usernameInput.style.padding = '0.75rem';
  usernameInput.style.border = '1px solid var(--color-border)';
  usernameInput.style.borderRadius = '0.375rem';
  usernameInput.style.fontSize = '0.875rem';
  usernameGroup.appendChild(usernameInput);
  
  form.appendChild(usernameGroup);
  
  // Password field
  const passwordGroup = document.createElement('div');
  passwordGroup.className = 'form-group';
  passwordGroup.style.marginBottom = '1.5rem';
  
  const passwordLabel = document.createElement('label');
  passwordLabel.htmlFor = 'password';
  passwordLabel.textContent = 'Password';
  passwordLabel.style.display = 'block';
  passwordLabel.style.marginBottom = '0.5rem';
  passwordLabel.style.fontSize = '0.875rem';
  passwordLabel.style.fontWeight = '500';
  passwordGroup.appendChild(passwordLabel);
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.placeholder = 'Enter your password';
  passwordInput.style.width = '100%';
  passwordInput.style.padding = '0.75rem';
  passwordInput.style.border = '1px solid var(--color-border)';
  passwordInput.style.borderRadius = '0.375rem';
  passwordInput.style.fontSize = '0.875rem';
  passwordGroup.appendChild(passwordInput);
  
  form.appendChild(passwordGroup);
  
  // Remember me and forgot password row
  const optionsRow = document.createElement('div');
  optionsRow.style.display = 'flex';
  optionsRow.style.justifyContent = 'space-between';
  optionsRow.style.marginBottom = '1.5rem';
  
  const rememberMe = document.createElement('div');
  rememberMe.style.display = 'flex';
  rememberMe.style.alignItems = 'center';
  
  const rememberCheckbox = document.createElement('input');
  rememberCheckbox.type = 'checkbox';
  rememberCheckbox.id = 'remember-me';
  rememberCheckbox.style.marginRight = '0.5rem';
  rememberMe.appendChild(rememberCheckbox);
  
  const rememberLabel = document.createElement('label');
  rememberLabel.htmlFor = 'remember-me';
  rememberLabel.textContent = 'Remember me';
  rememberLabel.style.fontSize = '0.75rem';
  rememberLabel.style.color = 'var(--color-text-secondary)';
  rememberMe.appendChild(rememberLabel);
  
  optionsRow.appendChild(rememberMe);
  
  const forgotPassword = document.createElement('a');
  forgotPassword.href = '#';
  forgotPassword.textContent = 'Forgot password?';
  forgotPassword.style.fontSize = '0.75rem';
  forgotPassword.style.color = 'var(--color-accent)';
  forgotPassword.style.textDecoration = 'none';
  optionsRow.appendChild(forgotPassword);
  
  form.appendChild(optionsRow);
  
  // Login button
  const loginButton = document.createElement('button');
  loginButton.type = 'button'; // Use button type to prevent form submission
  loginButton.textContent = 'Log In';
  loginButton.style.width = '100%';
  loginButton.style.padding = '0.75rem';
  loginButton.style.backgroundColor = 'var(--color-primary)';
  loginButton.style.color = 'white';
  loginButton.style.borderRadius = '0.375rem';
  loginButton.style.border = 'none';
  loginButton.style.fontSize = '0.875rem';
  loginButton.style.fontWeight = '500';
  loginButton.style.cursor = 'pointer';
  loginButton.style.transition = 'background-color 0.2s ease';
  
  // Add login button event listener
  loginButton.addEventListener('click', () => {
    // Simulate login - Just for demo
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
      alert('Please enter username and password');
      return;
    }
    
    // For demonstration, accept any username/password
    // This would be replaced with actual authentication logic
    appState.user.isAuthenticated = true;
    appState.user.name = username;
    appState.user.email = username.includes('@') ? username : `${username}@example.com`;
    
    // Store in localStorage for persistence
    localStorage.setItem('stackrUser', JSON.stringify({
      username: username,
      email: appState.user.email,
      isAuthenticated: true,
      onboardingCompleted: true
    }));
    
    console.log('Navigated from login to dashboard');
    window.navigateTo('dashboard');
  });
  
  form.appendChild(loginButton);
  
  // Divider
  const divider = document.createElement('div');
  divider.style.display = 'flex';
  divider.style.alignItems = 'center';
  divider.style.margin = '1.5rem 0';
  
  const line1 = document.createElement('div');
  line1.style.flex = '1';
  line1.style.height = '1px';
  line1.style.backgroundColor = 'var(--color-border)';
  divider.appendChild(line1);
  
  const orText = document.createElement('span');
  orText.textContent = 'Or';
  orText.style.padding = '0 1rem';
  orText.style.color = 'var(--color-text-secondary)';
  orText.style.fontSize = '0.75rem';
  divider.appendChild(orText);
  
  const line2 = document.createElement('div');
  line2.style.flex = '1';
  line2.style.height = '1px';
  line2.style.backgroundColor = 'var(--color-border)';
  divider.appendChild(line2);
  
  form.appendChild(divider);
  
  // Social login buttons
  const socialButtons = document.createElement('div');
  socialButtons.style.display = 'flex';
  socialButtons.style.gap = '0.75rem';
  socialButtons.style.marginBottom = '1.5rem';
  
  // Google login button
  const googleButton = document.createElement('button');
  googleButton.type = 'button';
  googleButton.className = 'social-login-button';
  googleButton.style.flex = '1';
  googleButton.style.display = 'flex';
  googleButton.style.alignItems = 'center';
  googleButton.style.justifyContent = 'center';
  googleButton.style.padding = '0.75rem';
  googleButton.style.border = '1px solid var(--color-border)';
  googleButton.style.borderRadius = '0.375rem';
  googleButton.style.backgroundColor = 'white';
  googleButton.style.cursor = 'pointer';
  
  // Google icon
  googleButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="margin-right: 0.5rem;">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
    Continue with Google
  `;
  
  // Add Google login event listener
  googleButton.addEventListener('click', () => {
    console.log('Initiating Google OAuth login flow...');
    
    // Mock successful Google login for demo
    setTimeout(() => {
      appState.user.isAuthenticated = true;
      appState.user.name = 'Google User';
      appState.user.email = 'googleuser@example.com';
      
      // Store in localStorage for persistence
      localStorage.setItem('stackrUser', JSON.stringify({
        username: 'Google User',
        email: 'googleuser@example.com',
        isAuthenticated: true,
        onboardingCompleted: true
      }));
      
      window.navigateTo('dashboard');
    }, 1000);
  });
  
  socialButtons.appendChild(googleButton);
  form.appendChild(socialButtons);
  
  // Don't have an account section
  const noAccountSection = document.createElement('div');
  noAccountSection.style.textAlign = 'center';
  noAccountSection.style.fontSize = '0.875rem';
  
  const noAccountText = document.createElement('span');
  noAccountText.textContent = 'Don\'t have an account? ';
  noAccountText.style.color = 'var(--color-text-secondary)';
  noAccountSection.appendChild(noAccountText);
  
  const signupLink = document.createElement('a');
  signupLink.href = '#register';
  signupLink.textContent = 'Sign up';
  signupLink.style.color = 'var(--color-primary)';
  signupLink.style.fontWeight = '500';
  signupLink.style.textDecoration = 'none';
  
  // Add signup link event listener
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Navigate to register page
    window.navigateTo('register');
  });
  
  noAccountSection.appendChild(signupLink);
  form.appendChild(noAccountSection);
  
  formPanel.appendChild(form);
  container.appendChild(formPanel);
  
  // Create right panel with app promo (only visible on larger screens)
  if (window.innerWidth >= 768) {
    const promoPanel = document.createElement('div');
    promoPanel.className = 'auth-promo-panel';
    promoPanel.style.flex = '1';
    promoPanel.style.padding = '2rem';
    promoPanel.style.display = 'flex';
    promoPanel.style.flexDirection = 'column';
    promoPanel.style.justifyContent = 'center';
    promoPanel.style.color = 'white';
    promoPanel.style.background = 'linear-gradient(135deg, rgba(52, 168, 83, 0.9) 0%, rgba(30, 98, 48, 0.9) 100%)';
    
    const promoTitle = document.createElement('h2');
    promoTitle.textContent = 'Financial Freedom Awaits';
    promoTitle.style.fontSize = '2rem';
    promoTitle.style.fontWeight = 'bold';
    promoTitle.style.marginBottom = '1rem';
    promoPanel.appendChild(promoTitle);
    
    const promoDescription = document.createElement('p');
    promoDescription.textContent = 'Take control of your finances with our innovative 40/30/30 split approach. Stackr helps you allocate your income to needs, investments, and savings automatically.';
    promoDescription.style.fontSize = '1rem';
    promoDescription.style.marginBottom = '2rem';
    promoDescription.style.lineHeight = '1.5';
    promoPanel.appendChild(promoDescription);
    
    // Features list
    const featuresList = document.createElement('ul');
    featuresList.style.listStyleType = 'none';
    featuresList.style.padding = '0';
    featuresList.style.marginBottom = '2rem';
    
    const features = [
      'Automatic income allocation with the 40/30/30 rule',
      'Track your income and expenses in one place',
      'Set and achieve financial goals with ease',
      'Get AI-powered financial advice and insights'
    ];
    
    features.forEach(feature => {
      const featureItem = document.createElement('li');
      featureItem.style.marginBottom = '0.75rem';
      featureItem.style.display = 'flex';
      featureItem.style.alignItems = 'center';
      
      // Checkmark icon
      const checkmark = document.createElement('span');
      checkmark.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
      checkmark.style.marginRight = '0.75rem';
      checkmark.style.color = 'rgba(255, 255, 255, 0.9)';
      featureItem.appendChild(checkmark);
      
      const featureText = document.createElement('span');
      featureText.textContent = feature;
      featureItem.appendChild(featureText);
      
      featuresList.appendChild(featureItem);
    });
    
    promoPanel.appendChild(featuresList);
    
    container.appendChild(promoPanel);
  }
  
  return container;
}

/**
 * Check if current user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export function isAuthenticated() {
  if (!appState || !appState.user) {
    return false;
  }
  return appState.user.isAuthenticated === true;
}

/**
 * Get the current user object
 * @returns {Object|null} - User object or null if not authenticated
 */
export function getCurrentUser() {
  if (!isAuthenticated()) {
    return null;
  }
  return { ...appState.user }; // Return a copy to prevent direct mutation
}

/**
 * Get user subscription tier
 * @returns {string} - 'free', 'pro', or 'lifetime'
 */
export function getUserSubscriptionTier() {
  const user = getCurrentUser();
  if (!user) {
    return 'free';
  }
  
  console.log("Current user subscription data:", {
    username: user.username,
    subscriptionTier: user.subscriptionTier,
    subscription: user.subscription
  });
  
  // Check both the direct property and the nested subscription object
  // Check for 'pro' username to override for testing
  if (user.username && user.username.toLowerCase().includes('pro')) {
    return 'pro';  // Force PRO for users with pro in their name (test accounts)
  } else if (user.subscriptionTier) {
    return user.subscriptionTier;
  } else if (user.subscription && user.subscription.tier) {
    return user.subscription.tier;
  }
  return 'free';
}

/**
 * Check if user is a Pro or Lifetime subscriber
 * @returns {boolean} - True if Pro or Lifetime
 */
export function isPremiumUser() {
  const tier = getUserSubscriptionTier();
  return tier === 'pro' || tier === 'lifetime';
}

/**
 * Check if current user has admin privileges
 * @returns {boolean} - True if user has admin privileges
 */
export function isAdminUser() {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  return user.isAdmin === true;
}

/**
 * Get the user ID
 * @returns {number|null} - User ID or null if not authenticated
 */
export function getUserId() {
  const user = getCurrentUser();
  if (!user) {
    return null;
  }
  return user.id;
}

/**
 * Get user display name (username or email)
 * @returns {string} - User display name
 */
export function getUserDisplayName() {
  const user = getCurrentUser();
  if (!user) {
    return 'Guest';
  }
  return user.username || user.email || 'User';
}

/**
 * Update the current user's data in appState
 * This function only updates the local state, not the backend
 * @param {Object} userData - Updated user properties
 */
export function updateUserData(userData) {
  if (!appState || !appState.user) {
    console.error('Cannot update user data: User not authenticated');
    return;
  }
  
  appState.user = {
    ...appState.user,
    ...userData
  };
  
  // Trigger state save if needed
  if (typeof window.saveStateToStorage === 'function') {
    window.saveStateToStorage();
  }
}