/**
 * Login Page Component for GREEN version
 * This file handles user authentication UI and logic
 */

// Function to handle login form submission
async function handleLogin(email, password, rememberMe = false) {
  try {
    // Show loading state
    const submitButton = document.querySelector('.login-form button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<div class="spinner"></div> Logging in...';
    }
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: email, password, rememberMe })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to log in');
    }
    
    // Get user data
    const userData = await response.json();
    
    // Create the user data object to store
    const userDataToStore = JSON.stringify({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      role: userData.role || 'user',
      subscriptionTier: userData.subscriptionTier || 'free',
      subscriptionActive: userData.subscriptionActive || false,
      onboardingCompleted: userData.onboardingCompleted || false,
      onboardingStep: userData.onboardingStep || 'welcome'
    });
    
    // Store auth data based on "Remember Me" selection
    if (rememberMe) {
      // Use localStorage for persistent login (stays after browser is closed)
      localStorage.setItem('stackrToken', userData.token);
      localStorage.setItem('stackrUser', userDataToStore);
      
      // Clear sessionStorage to avoid conflicts
      sessionStorage.removeItem('stackrToken');
      sessionStorage.removeItem('stackrUser');
      
      console.log('User credentials saved to localStorage (persistent)');
    } else {
      // Use sessionStorage for temporary login (cleared when browser is closed)
      sessionStorage.setItem('stackrToken', userData.token);
      sessionStorage.setItem('stackrUser', userDataToStore);
      
      // Clear localStorage to avoid conflicts
      localStorage.removeItem('stackrToken');
      localStorage.removeItem('stackrUser');
      
      console.log('User credentials saved to sessionStorage (session only)');
    }
    
    // Redirect to dashboard or specified redirect URL
    const urlParams = new URLSearchParams(window.location.search);
    // If onboarding is not completed, redirect to onboarding page
    const redirectUrl = userData.onboardingCompleted ? 
      (urlParams.get('redirect') || '#dashboard') : 
      '#onboarding';
    window.location.href = redirectUrl;
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Show error message
    const errorEl = document.querySelector('.login-error');
    if (errorEl) {
      errorEl.textContent = error.message || 'Invalid email or password';
      errorEl.style.display = 'block';
    }
    
    // Reset button
    const submitButton = document.querySelector('.login-form button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Log In';
    }
  }
}

// Function to handle registration form submission
async function handleRegister(username, email, password) {
  try {
    // Show loading state
    const submitButton = document.querySelector('.register-form button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<div class="spinner"></div> Creating account...';
    }
    
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create account');
    }
    
    // Get user data
    const userData = await response.json();
    
    // Create the user data object to store
    const userDataToStore = JSON.stringify({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      role: userData.role || 'user',
      subscriptionTier: userData.subscriptionTier || 'free',
      subscriptionActive: userData.subscriptionActive || false,
      onboardingCompleted: userData.onboardingCompleted || false,
      onboardingStep: userData.onboardingStep || 'welcome'
    });
    
    // For registration, we default to storing in localStorage for convenience
    // Clear sessionStorage to avoid conflicts
    sessionStorage.removeItem('stackrToken');
    sessionStorage.removeItem('stackrUser');
    
    // Store auth data in localStorage
    localStorage.setItem('stackrToken', userData.token);
    localStorage.setItem('stackrUser', userDataToStore);
    
    // Redirect to onboarding
    window.location.href = '#onboarding';
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Show error message
    const errorEl = document.querySelector('.register-error');
    if (errorEl) {
      errorEl.textContent = error.message || 'Failed to create account';
      errorEl.style.display = 'block';
    }
    
    // Reset button
    const submitButton = document.querySelector('.register-form button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Create Account';
    }
  }
}

// Function to render the login form
function renderLoginForm() {
  const formContainer = document.createElement('div');
  formContainer.classList.add('login-form-container');
  
  const formEl = document.createElement('form');
  formEl.classList.add('login-form');
  formEl.style.backgroundColor = 'white';
  formEl.style.padding = '32px';
  formEl.style.borderRadius = '12px';
  formEl.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.08)';
  
  formEl.onsubmit = (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    const rememberMe = e.target.elements.rememberMe?.checked || false;
    handleLogin(email, password, rememberMe);
  };
  
  // Form title
  const titleEl = document.createElement('h2');
  titleEl.textContent = 'Log In';
  titleEl.style.marginBottom = '24px';
  titleEl.style.fontSize = '24px';
  titleEl.style.fontWeight = 'bold';
  formEl.appendChild(titleEl);
  
  // Error message container
  const errorEl = document.createElement('div');
  errorEl.classList.add('login-error');
  errorEl.style.color = 'var(--color-error)';
  errorEl.style.backgroundColor = 'var(--color-error-light)';
  errorEl.style.padding = '10px';
  errorEl.style.borderRadius = 'var(--radius-md)';
  errorEl.style.marginBottom = '16px';
  errorEl.style.display = 'none';
  formEl.appendChild(errorEl);
  
  // Email input
  const emailGroup = document.createElement('div');
  emailGroup.classList.add('form-group');
  emailGroup.style.marginBottom = '16px';
  
  const emailLabel = document.createElement('label');
  emailLabel.htmlFor = 'email';
  emailLabel.textContent = 'Email';
  emailLabel.style.display = 'block';
  emailLabel.style.marginBottom = '8px';
  emailLabel.style.fontWeight = '500';
  
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'email';
  emailInput.name = 'email';
  emailInput.placeholder = 'Enter your email';
  emailInput.required = true;
  emailInput.style.width = '100%';
  emailInput.style.padding = '10px 14px';
  emailInput.style.borderRadius = 'var(--radius-md)';
  emailInput.style.border = '1px solid var(--color-border)';
  
  emailGroup.appendChild(emailLabel);
  emailGroup.appendChild(emailInput);
  formEl.appendChild(emailGroup);
  
  // Password input
  const passwordGroup = document.createElement('div');
  passwordGroup.classList.add('form-group');
  passwordGroup.style.marginBottom = '24px';
  
  const passwordLabel = document.createElement('label');
  passwordLabel.htmlFor = 'password';
  passwordLabel.textContent = 'Password';
  passwordLabel.style.display = 'block';
  passwordLabel.style.marginBottom = '8px';
  passwordLabel.style.fontWeight = '500';
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.name = 'password';
  passwordInput.placeholder = 'Enter your password';
  passwordInput.required = true;
  passwordInput.style.width = '100%';
  passwordInput.style.padding = '10px 14px';
  passwordInput.style.borderRadius = 'var(--radius-md)';
  passwordInput.style.border = '1px solid var(--color-border)';
  
  passwordGroup.appendChild(passwordLabel);
  passwordGroup.appendChild(passwordInput);
  formEl.appendChild(passwordGroup);
  
  // Remember Me checkbox
  const rememberMeGroup = document.createElement('div');
  rememberMeGroup.classList.add('form-group');
  rememberMeGroup.style.marginBottom = '20px';
  rememberMeGroup.style.display = 'flex';
  rememberMeGroup.style.alignItems = 'center';
  
  const rememberMeCheckbox = document.createElement('input');
  rememberMeCheckbox.type = 'checkbox';
  rememberMeCheckbox.id = 'rememberMe';
  rememberMeCheckbox.name = 'rememberMe';
  rememberMeCheckbox.style.marginRight = '8px';
  
  const rememberMeLabel = document.createElement('label');
  rememberMeLabel.htmlFor = 'rememberMe';
  rememberMeLabel.textContent = 'Remember me';
  rememberMeLabel.style.fontSize = '14px';
  rememberMeLabel.style.cursor = 'pointer';
  rememberMeLabel.style.color = '#555';
  
  rememberMeGroup.appendChild(rememberMeCheckbox);
  rememberMeGroup.appendChild(rememberMeLabel);
  formEl.appendChild(rememberMeGroup);
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Log In';
  submitButton.classList.add('btn', 'btn-primary');
  submitButton.style.width = '100%';
  submitButton.style.padding = '12px';
  submitButton.style.marginBottom = '16px';
  submitButton.style.borderRadius = '8px';
  submitButton.style.fontSize = '16px';
  submitButton.style.fontWeight = '600';
  submitButton.style.color = 'white';
  submitButton.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  submitButton.style.border = 'none';
  submitButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  submitButton.style.cursor = 'pointer';
  submitButton.style.transition = 'all 0.2s ease';

  // Add hover effect
  submitButton.onmouseover = () => {
    submitButton.style.transform = 'translateY(-2px)';
    submitButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.15)';
  };
  submitButton.onmouseout = () => {
    submitButton.style.transform = 'translateY(0)';
    submitButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  };
  
  formEl.appendChild(submitButton);
  
  // Switch to register link
  const switchText = document.createElement('p');
  switchText.style.textAlign = 'center';
  switchText.style.fontSize = '14px';
  
  const switchLink = document.createElement('a');
  switchLink.href = '#';
  switchLink.textContent = 'Create an account';
  switchLink.onclick = (e) => {
    e.preventDefault();
    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
      const registerForm = renderRegisterForm();
      authContainer.innerHTML = '';
      authContainer.appendChild(registerForm);
    }
  };
  
  switchText.appendChild(document.createTextNode("Don't have an account? "));
  switchText.appendChild(switchLink);
  formEl.appendChild(switchText);
  
  formContainer.appendChild(formEl);
  return formContainer;
}

// Function to render the registration form
function renderRegisterForm() {
  const formContainer = document.createElement('div');
  formContainer.classList.add('register-form-container');
  
  const formEl = document.createElement('form');
  formEl.classList.add('register-form');
  formEl.onsubmit = (e) => {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    handleRegister(username, email, password);
  };
  
  // Form title
  const titleEl = document.createElement('h2');
  titleEl.textContent = 'Create Account';
  titleEl.style.marginBottom = '24px';
  titleEl.style.fontSize = '24px';
  titleEl.style.fontWeight = 'bold';
  formEl.appendChild(titleEl);
  
  // Error message container
  const errorEl = document.createElement('div');
  errorEl.classList.add('register-error');
  errorEl.style.color = 'var(--color-error)';
  errorEl.style.backgroundColor = 'var(--color-error-light)';
  errorEl.style.padding = '10px';
  errorEl.style.borderRadius = 'var(--radius-md)';
  errorEl.style.marginBottom = '16px';
  errorEl.style.display = 'none';
  formEl.appendChild(errorEl);
  
  // Username input
  const usernameGroup = document.createElement('div');
  usernameGroup.classList.add('form-group');
  usernameGroup.style.marginBottom = '16px';
  
  const usernameLabel = document.createElement('label');
  usernameLabel.htmlFor = 'username';
  usernameLabel.textContent = 'Username';
  usernameLabel.style.display = 'block';
  usernameLabel.style.marginBottom = '8px';
  usernameLabel.style.fontWeight = '500';
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'username';
  usernameInput.name = 'username';
  usernameInput.placeholder = 'Choose a username';
  usernameInput.required = true;
  usernameInput.style.width = '100%';
  usernameInput.style.padding = '10px 14px';
  usernameInput.style.borderRadius = 'var(--radius-md)';
  usernameInput.style.border = '1px solid var(--color-border)';
  
  usernameGroup.appendChild(usernameLabel);
  usernameGroup.appendChild(usernameInput);
  formEl.appendChild(usernameGroup);
  
  // Email input
  const emailGroup = document.createElement('div');
  emailGroup.classList.add('form-group');
  emailGroup.style.marginBottom = '16px';
  
  const emailLabel = document.createElement('label');
  emailLabel.htmlFor = 'email';
  emailLabel.textContent = 'Email';
  emailLabel.style.display = 'block';
  emailLabel.style.marginBottom = '8px';
  emailLabel.style.fontWeight = '500';
  
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'email';
  emailInput.name = 'email';
  emailInput.placeholder = 'Enter your email';
  emailInput.required = true;
  emailInput.style.width = '100%';
  emailInput.style.padding = '10px 14px';
  emailInput.style.borderRadius = 'var(--radius-md)';
  emailInput.style.border = '1px solid var(--color-border)';
  
  emailGroup.appendChild(emailLabel);
  emailGroup.appendChild(emailInput);
  formEl.appendChild(emailGroup);
  
  // Password input
  const passwordGroup = document.createElement('div');
  passwordGroup.classList.add('form-group');
  passwordGroup.style.marginBottom = '24px';
  
  const passwordLabel = document.createElement('label');
  passwordLabel.htmlFor = 'password';
  passwordLabel.textContent = 'Password';
  passwordLabel.style.display = 'block';
  passwordLabel.style.marginBottom = '8px';
  passwordLabel.style.fontWeight = '500';
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.name = 'password';
  passwordInput.placeholder = 'Choose a password';
  passwordInput.required = true;
  passwordInput.style.width = '100%';
  passwordInput.style.padding = '10px 14px';
  passwordInput.style.borderRadius = 'var(--radius-md)';
  passwordInput.style.border = '1px solid var(--color-border)';
  
  passwordGroup.appendChild(passwordLabel);
  passwordGroup.appendChild(passwordInput);
  formEl.appendChild(passwordGroup);
  
  // Terms and conditions checkbox
  const termsGroup = document.createElement('div');
  termsGroup.classList.add('form-group');
  termsGroup.style.marginBottom = '24px';
  termsGroup.style.display = 'flex';
  termsGroup.style.alignItems = 'flex-start';
  
  const termsCheckbox = document.createElement('input');
  termsCheckbox.type = 'checkbox';
  termsCheckbox.id = 'terms';
  termsCheckbox.name = 'terms';
  termsCheckbox.required = true;
  termsCheckbox.style.marginRight = '8px';
  termsCheckbox.style.marginTop = '4px';
  
  const termsLabel = document.createElement('label');
  termsLabel.htmlFor = 'terms';
  termsLabel.style.fontSize = '14px';
  termsLabel.style.lineHeight = '1.5';
  
  termsLabel.innerHTML = 'I agree to the <a href="#terms" style="color: var(--color-primary);">Terms of Service</a> and <a href="#privacy" style="color: var(--color-primary);">Privacy Policy</a>';
  
  termsGroup.appendChild(termsCheckbox);
  termsGroup.appendChild(termsLabel);
  formEl.appendChild(termsGroup);
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Create Account';
  submitButton.classList.add('btn', 'btn-primary');
  submitButton.style.width = '100%';
  submitButton.style.padding = '12px';
  submitButton.style.marginBottom = '16px';
  submitButton.style.borderRadius = '8px';
  submitButton.style.fontSize = '16px';
  submitButton.style.fontWeight = '600';
  submitButton.style.color = 'white';
  submitButton.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)';
  submitButton.style.border = 'none';
  submitButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  submitButton.style.cursor = 'pointer';
  submitButton.style.transition = 'all 0.2s ease';

  // Add hover effect
  submitButton.onmouseover = () => {
    submitButton.style.transform = 'translateY(-2px)';
    submitButton.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.15)';
  };
  submitButton.onmouseout = () => {
    submitButton.style.transform = 'translateY(0)';
    submitButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  };
  
  formEl.appendChild(submitButton);
  
  // Switch to login link
  const switchText = document.createElement('p');
  switchText.style.textAlign = 'center';
  switchText.style.fontSize = '14px';
  
  const switchLink = document.createElement('a');
  switchLink.href = '#';
  switchLink.textContent = 'Log in';
  switchLink.onclick = (e) => {
    e.preventDefault();
    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
      const loginForm = renderLoginForm();
      authContainer.innerHTML = '';
      authContainer.appendChild(loginForm);
    }
  };
  
  switchText.appendChild(document.createTextNode("Already have an account? "));
  switchText.appendChild(switchLink);
  formEl.appendChild(switchText);
  
  formContainer.appendChild(formEl);
  return formContainer;
}

// Function to render the authentication page
export function renderAuthPage() {
  // Create page container
  const container = document.createElement('div');
  container.classList.add('auth-page');
  container.style.minHeight = '100vh';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.padding = '20px';
  container.style.background = 'var(--color-background)';
  
  // Create a two-column layout
  const layoutContainer = document.createElement('div');
  layoutContainer.classList.add('auth-layout');
  layoutContainer.style.display = 'flex';
  layoutContainer.style.borderRadius = 'var(--radius-lg)';
  layoutContainer.style.overflow = 'hidden';
  layoutContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
  layoutContainer.style.maxWidth = '1000px';
  layoutContainer.style.width = '100%';
  layoutContainer.style.background = 'var(--color-card)';
  
  // Create hero column
  const heroCol = document.createElement('div');
  heroCol.classList.add('auth-hero');
  heroCol.style.display = 'flex';
  heroCol.style.flexDirection = 'column';
  heroCol.style.justifyContent = 'center';
  heroCol.style.alignItems = 'flex-start';
  heroCol.style.padding = '40px';
  heroCol.style.width = '50%';
  heroCol.style.background = 'var(--color-primary-gradient)';
  heroCol.style.color = 'white';
  
  // Add branding and hero content
  const logo = document.createElement('div');
  logo.classList.add('auth-logo');
  logo.style.fontSize = '24px';
  logo.style.fontWeight = 'bold';
  logo.style.marginBottom = '40px';
  logo.textContent = 'Stackr Finance';
  
  const heroTitle = document.createElement('h1');
  heroTitle.style.fontSize = '32px';
  heroTitle.style.fontWeight = 'bold';
  heroTitle.style.marginBottom = '16px';
  heroTitle.style.lineHeight = '1.2';
  heroTitle.textContent = 'Take control of your financial future';
  
  const heroDescription = document.createElement('p');
  heroDescription.style.fontSize = '16px';
  heroDescription.style.marginBottom = '24px';
  heroDescription.style.lineHeight = '1.6';
  heroDescription.textContent = 'Track your income, plan your expenses, and achieve your financial goals with Stackr Finance - the ultimate tool for service providers.';
  
  const featuresList = document.createElement('ul');
  featuresList.style.listStyle = 'none';
  featuresList.style.padding = '0';
  featuresList.style.margin = '0';
  
  const features = [
    'Custom income allocation with 40/30/30 split',
    'Bank account integration with Plaid',
    'Goal tracking with progress visualization',
    'AI-powered financial advice',
    'Expense categorization and budget planning'
  ];
  
  features.forEach(feature => {
    const featureItem = document.createElement('li');
    featureItem.style.marginBottom = '12px';
    featureItem.style.display = 'flex';
    featureItem.style.alignItems = 'center';
    
    const checkIcon = document.createElement('span');
    checkIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    checkIcon.style.marginRight = '12px';
    checkIcon.style.display = 'flex';
    checkIcon.style.alignItems = 'center';
    checkIcon.style.justifyContent = 'center';
    
    featureItem.appendChild(checkIcon);
    featureItem.appendChild(document.createTextNode(feature));
    featuresList.appendChild(featureItem);
  });
  
  heroCol.appendChild(logo);
  heroCol.appendChild(heroTitle);
  heroCol.appendChild(heroDescription);
  heroCol.appendChild(featuresList);
  
  // Create form column
  const formCol = document.createElement('div');
  formCol.classList.add('auth-form-col');
  formCol.style.width = '50%';
  formCol.style.padding = '40px';
  formCol.style.display = 'flex';
  formCol.style.flexDirection = 'column';
  formCol.style.justifyContent = 'center';
  
  // Determine if user wants login or register based on hash
  const authContainer = document.createElement('div');
  authContainer.classList.add('auth-container');
  
  // Check if we're in login or register mode
  const hash = window.location.hash;
  let initialForm;
  
  if (hash === '#register') {
    initialForm = renderRegisterForm();
  } else {
    initialForm = renderLoginForm();
  }
  
  authContainer.appendChild(initialForm);
  formCol.appendChild(authContainer);
  
  // Assemble the layout
  layoutContainer.appendChild(heroCol);
  layoutContainer.appendChild(formCol);
  container.appendChild(layoutContainer);
  
  // Add responsive styling
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @media (max-width: 768px) {
      .auth-layout {
        flex-direction: column;
        max-width: 100%;
      }
      
      .auth-hero, .auth-form-col {
        width: 100%;
      }
      
      .auth-hero {
        padding: 30px;
      }
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
      margin-right: 8px;
      display: inline-block;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleEl);
  
  return container;
}

// Function to log out the user
export function logout() {
  return new Promise(async (resolve, reject) => {
    try {
      // Call the logout API
      // Get token from either localStorage or sessionStorage
      const token = localStorage.getItem('stackrToken') || sessionStorage.getItem('stackrToken');
      
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Clear both localStorage and sessionStorage regardless of API response
      localStorage.removeItem('stackrToken');
      localStorage.removeItem('stackrUser');
      sessionStorage.removeItem('stackrToken');
      sessionStorage.removeItem('stackrUser');
      
      // Redirect to login page
      window.location.href = '#login';
      
      // If the page doesn't reload automatically (e.g., in a SPA), 
      // we trigger a reload to ensure all app state is cleared
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      resolve();
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still clear both localStorage and sessionStorage on error
      localStorage.removeItem('stackrToken');
      localStorage.removeItem('stackrUser');
      sessionStorage.removeItem('stackrToken');
      sessionStorage.removeItem('stackrUser');
      window.location.href = '#login';
      
      // Force reload as a backup plan
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      reject(error);
    }
  });
}

// Check if the user is authenticated
export function isAuthenticated() {
  // Check both localStorage and sessionStorage for the token
  const localToken = localStorage.getItem('stackrToken');
  const sessionToken = sessionStorage.getItem('stackrToken');
  return !!(localToken || sessionToken);
}

// Get the current user data
export function getCurrentUser() {
  // Try to get user data from localStorage first, then sessionStorage
  const localUserStr = localStorage.getItem('stackrUser');
  const sessionUserStr = sessionStorage.getItem('stackrUser');
  const userStr = localUserStr || sessionUserStr;
  
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}