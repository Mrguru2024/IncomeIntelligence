/**
 * Login Page Component for GREEN version
 * This file handles user authentication UI and logic
 */

// Google OAuth function
async function handleGoogleLogin() {
  try {
    // Show loading state
    const googleButton = document.querySelector('.google-login-btn');
    if (googleButton) {
      googleButton.disabled = true;
      googleButton.innerHTML = '<div class="spinner"></div> Signing in with Google...';
    }
    
    // In a real implementation, this would redirect to Google OAuth flow
    // For demo purposes, we're simulating a successful login
    
    console.log('Initiating Google OAuth login flow...');
    
    // Simulate OAuth flow with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create mock user data for demonstration
    const mockUser = {
      id: 'google-' + Date.now(),
      username: 'googleuser',
      email: 'user@gmail.com',
      role: 'user',
      authProvider: 'google'
    };
    
    // Store user data as if it came from a real authentication
    const userDataToStore = JSON.stringify({
      id: mockUser.id,
      email: mockUser.email,
      username: mockUser.username,
      role: mockUser.role,
      authProvider: 'google'
    });
    
    // Store token in localStorage (or sessionStorage based on remember me)
    localStorage.setItem('user', userDataToStore);
    localStorage.setItem('token', 'mock-google-token-' + Date.now());
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
    
  } catch (error) {
    console.error('Google login error:', error);
    
    // Reset button state
    const googleButton = document.querySelector('.google-login-btn');
    if (googleButton) {
      googleButton.disabled = false;
      googleButton.textContent = 'Sign in with Google';
    }
    
    // Show error message
    const errorEl = document.querySelector('.login-error');
    if (errorEl) {
      errorEl.textContent = 'Google login failed. Please try again.';
      errorEl.style.display = 'block';
    }
  }
}

// Function to handle login form submission
async function handleLogin(usernameOrEmail, password, rememberMe = false) {
  try {
    // Show loading state
    const submitButton = document.querySelector('.login-form button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<div class="spinner"></div> Logging in...';
    }
    
    // Ensure any active input is blurred to prevent keyboard issues
    document.activeElement.blur();
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: usernameOrEmail, password, rememberMe })
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
    
    // Ensure any active input is blurred to prevent keyboard issues
    document.activeElement.blur();
    
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
  // Get viewport width for responsive design
  const width = window.innerWidth;
  const isMobile = width < 768;
  const isSmallMobile = width < 500;
  const isExtraSmallMobile = width < 350;
  
  const formContainer = document.createElement('div');
  formContainer.classList.add('login-form-container');
  
  // Add Google OAuth button directly to the container (outside the form)
  const googleLoginButton = document.createElement('button');
  googleLoginButton.type = 'button';
  googleLoginButton.className = 'google-login-btn';
  googleLoginButton.style.display = 'flex';
  googleLoginButton.style.alignItems = 'center';
  googleLoginButton.style.justifyContent = 'center';
  googleLoginButton.style.width = '100%';
  googleLoginButton.style.padding = '12px';
  googleLoginButton.style.margin = '0 0 16px 0';
  googleLoginButton.style.backgroundColor = 'white';
  googleLoginButton.style.border = '1px solid #dadce0';
  googleLoginButton.style.borderRadius = '8px';
  googleLoginButton.style.cursor = 'pointer';
  googleLoginButton.style.fontWeight = '500';
  googleLoginButton.style.color = '#333333';
  googleLoginButton.style.fontSize = '16px';
  googleLoginButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
  
  // Google icon
  const googleIcon = document.createElement('span');
  googleIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>`;
  googleIcon.style.marginRight = '10px';
  
  googleLoginButton.appendChild(googleIcon);
  googleLoginButton.appendChild(document.createTextNode('Sign in with Google'));
  
  googleLoginButton.onclick = (e) => {
    e.preventDefault();
    handleGoogleLogin();
  };
  
  // Add hover effect
  googleLoginButton.onmouseover = () => {
    googleLoginButton.style.backgroundColor = '#f5f5f5';
    googleLoginButton.style.boxShadow = '0 1px 5px rgba(0,0,0,0.15)';
  };
  googleLoginButton.onmouseout = () => {
    googleLoginButton.style.backgroundColor = 'white';
    googleLoginButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
  };
  
  // Add or text divider
  const dividerContainer = document.createElement('div');
  dividerContainer.style.display = 'flex';
  dividerContainer.style.alignItems = 'center';
  dividerContainer.style.margin = '0 0 16px 0';
  
  const leftLine = document.createElement('div');
  leftLine.style.flex = '1';
  leftLine.style.height = '1px';
  leftLine.style.backgroundColor = '#dadce0';
  
  const orText = document.createElement('span');
  orText.textContent = 'OR';
  orText.style.margin = '0 10px';
  orText.style.color = '#666';
  orText.style.fontSize = '14px';
  
  const rightLine = document.createElement('div');
  rightLine.style.flex = '1';
  rightLine.style.height = '1px';
  rightLine.style.backgroundColor = '#dadce0';
  
  dividerContainer.appendChild(leftLine);
  dividerContainer.appendChild(orText);
  dividerContainer.appendChild(rightLine);
  
  // Add them to container
  formContainer.appendChild(googleLoginButton);
  formContainer.appendChild(dividerContainer);
  
  const formEl = document.createElement('form');
  formEl.classList.add('login-form');
  formEl.style.backgroundColor = 'white';
  
  // Responsive padding for different devices
  if (isExtraSmallMobile) {
    formEl.style.padding = '16px'; // Extra small screens (folded)
  } else if (isSmallMobile) {
    formEl.style.padding = '20px'; // Small mobile
  } else if (isMobile) {
    formEl.style.padding = '24px'; // Regular mobile
  } else {
    formEl.style.padding = '32px'; // Larger screens
  }
  
  formEl.style.borderRadius = isSmallMobile ? '8px' : '12px';
  formEl.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.08)';
  
  formEl.onsubmit = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation to prevent any parent handlers
    
    // Get values immediately
    const usernameOrEmail = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    const rememberMe = e.target.elements.rememberMe?.checked || false;
    
    // For mobile devices, use a different approach to keep keyboard open while processing
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      // Prevent multiple submissions
      if (formEl.getAttribute('data-submitting') === 'true') {
        return;
      }
      
      // Mark form as currently submitting
      formEl.setAttribute('data-submitting', 'true');
      
      // Process the login without blurring first
      handleLogin(usernameOrEmail, password, rememberMe);
      
      // Reset submission state after a delay
      setTimeout(() => {
        formEl.setAttribute('data-submitting', 'false');
      }, 500);
    } else {
      // Desktop approach - blur first then process
      if (document.activeElement) {
        document.activeElement.blur();
      }
      
      setTimeout(() => {
        handleLogin(usernameOrEmail, password, rememberMe);
      }, 50);
    }
  };
  
  // Form title
  const titleEl = document.createElement('h2');
  titleEl.textContent = 'Log In';
  titleEl.style.marginBottom = '24px';
  titleEl.style.fontSize = '24px';
  titleEl.style.fontWeight = 'bold';
  titleEl.style.color = '#333333';
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
  emailLabel.textContent = 'Username or Email';
  emailLabel.style.display = 'block';
  emailLabel.style.marginBottom = '8px';
  emailLabel.style.fontWeight = '500';
  emailLabel.style.color = '#333333';
  
  const emailInput = document.createElement('input');
  emailInput.type = "text";
  emailInput.id = 'email';
  emailInput.name = 'email';
  emailInput.placeholder = 'Enter your username or email';
  emailInput.required = true;
  emailInput.style.width = '100%';
  
  // Prevent automatic keyboard closing on mobile
  emailInput.addEventListener('focus', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  emailInput.addEventListener('blur', (e) => {
    if (e.relatedTarget && 
        (e.relatedTarget.tagName === 'BUTTON' || 
         e.relatedTarget.tagName === 'INPUT')) {
      // Don't blur if user is moving to another form element
      return;
    }
  });
  
  // Responsive input padding based on screen size
  if (isExtraSmallMobile) {
    emailInput.style.padding = '8px 10px'; // Extra small screens (folded)
    emailInput.style.fontSize = '14px';
  } else if (isSmallMobile) {
    emailInput.style.padding = '9px 12px'; // Small mobile
    emailInput.style.fontSize = '15px';
  } else {
    emailInput.style.padding = '10px 14px'; // Larger screens
  }
  
  emailInput.style.borderRadius = isExtraSmallMobile ? '6px' : 'var(--radius-md)';
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
  passwordLabel.style.color = '#333333';
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.name = 'password';
  passwordInput.placeholder = 'Enter your password';
  passwordInput.required = true;
  passwordInput.style.width = '100%';
  
  // Prevent automatic keyboard closing on mobile
  passwordInput.addEventListener('focus', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  passwordInput.addEventListener('blur', (e) => {
    if (e.relatedTarget && 
        (e.relatedTarget.tagName === 'BUTTON' || 
         e.relatedTarget.tagName === 'INPUT')) {
      // Don't blur if user is moving to another form element
      return;
    }
  });
  
  // Responsive input padding based on screen size
  if (isExtraSmallMobile) {
    passwordInput.style.padding = '8px 10px'; // Extra small screens (folded)
    passwordInput.style.fontSize = '14px';
  } else if (isSmallMobile) {
    passwordInput.style.padding = '9px 12px'; // Small mobile
    passwordInput.style.fontSize = '15px';
  } else {
    passwordInput.style.padding = '10px 14px'; // Larger screens
  }
  
  passwordInput.style.borderRadius = isExtraSmallMobile ? '6px' : 'var(--radius-md)';
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
  rememberMeLabel.style.color = '#333333';
  
  rememberMeGroup.appendChild(rememberMeCheckbox);
  rememberMeGroup.appendChild(rememberMeLabel);
  formEl.appendChild(rememberMeGroup);
  
  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Log In';
  submitButton.classList.add('btn', 'btn-primary');
  submitButton.style.width = '100%';
  
  // Responsive button styling
  if (isExtraSmallMobile) {
    submitButton.style.padding = '10px';
    submitButton.style.marginBottom = '12px';
    submitButton.style.borderRadius = '6px';
    submitButton.style.fontSize = '15px';
  } else if (isSmallMobile) {
    submitButton.style.padding = '10px';
    submitButton.style.marginBottom = '14px';
    submitButton.style.borderRadius = '7px';
    submitButton.style.fontSize = '15px';
  } else {
    submitButton.style.padding = '12px';
    submitButton.style.marginBottom = '16px';
    submitButton.style.borderRadius = '8px';
    submitButton.style.fontSize = '16px';
  }
  
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
  
  // Add separator with "or"
  const separatorContainer = document.createElement('div');
  separatorContainer.style.display = 'flex';
  separatorContainer.style.alignItems = 'center';
  separatorContainer.style.margin = '20px 0';
  
  const leftLine = document.createElement('div');
  leftLine.style.flex = '1';
  leftLine.style.height = '1px';
  leftLine.style.backgroundColor = 'var(--color-border)';
  
  const orText = document.createElement('span');
  orText.textContent = 'OR';
  orText.style.margin = '0 10px';
  orText.style.color = '#666';
  orText.style.fontSize = '14px';
  
  const rightLine = document.createElement('div');
  rightLine.style.flex = '1';
  rightLine.style.height = '1px';
  rightLine.style.backgroundColor = 'var(--color-border)';
  
  separatorContainer.appendChild(leftLine);
  separatorContainer.appendChild(orText);
  separatorContainer.appendChild(rightLine);
  formEl.appendChild(separatorContainer);
  
  // Google login button
  const googleButton = document.createElement('button');
  googleButton.type = 'button'; // Not submit
  googleButton.className = 'google-login-btn';
  googleButton.style.width = '100%';
  googleButton.style.display = 'flex';
  googleButton.style.alignItems = 'center';
  googleButton.style.justifyContent = 'center';
  googleButton.style.backgroundColor = 'white';
  googleButton.style.border = '1px solid var(--color-border)';
  googleButton.style.borderRadius = isSmallMobile ? '6px' : '8px';
  googleButton.style.padding = isExtraSmallMobile ? '8px' : '10px';
  googleButton.style.marginBottom = '20px';
  googleButton.style.cursor = 'pointer';
  googleButton.style.transition = 'all 0.2s ease';
  
  // Google icon
  const googleIcon = document.createElement('span');
  googleIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>`;
  googleIcon.style.marginRight = '10px';
  
  const googleText = document.createElement('span');
  googleText.textContent = 'Sign in with Google';
  googleText.style.fontWeight = '500';
  googleText.style.color = '#333333';
  
  googleButton.appendChild(googleIcon);
  googleButton.appendChild(googleText);
  
  // Add hover effect
  googleButton.onmouseover = () => {
    googleButton.style.backgroundColor = '#f5f5f5';
    googleButton.style.transform = 'translateY(-1px)';
    googleButton.style.boxShadow = '0 1px 5px rgba(0, 0, 0, 0.05)';
  };
  googleButton.onmouseout = () => {
    googleButton.style.backgroundColor = 'white';
    googleButton.style.transform = 'translateY(0)';
    googleButton.style.boxShadow = 'none';
  };
  
  // Handle Google sign in click
  googleButton.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleGoogleLogin();
  };
  
  formEl.appendChild(googleButton);
  
  // Switch to register link
  const switchText = document.createElement('p');
  switchText.style.textAlign = 'center';
  switchText.style.fontSize = '14px';
  switchText.style.color = '#333333';
  
  const switchLink = document.createElement('a');
  switchLink.href = '#';
  switchLink.textContent = 'Create an account';
  switchLink.style.color = 'var(--color-primary)';
  switchLink.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For mobile: don't blur immediately to prevent keyboard issues
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      setTimeout(() => {
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
          const registerForm = renderRegisterForm();
          authContainer.innerHTML = '';
          authContainer.appendChild(registerForm);
        }
      }, 10);
    } else {
      // Desktop approach
      if (document.activeElement) {
        document.activeElement.blur();
      }
      
      setTimeout(() => {
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
          const registerForm = renderRegisterForm();
          authContainer.innerHTML = '';
          authContainer.appendChild(registerForm);
        }
      }, 50);
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
  // Get viewport width for responsive design
  const width = window.innerWidth;
  const isMobile = width < 768;
  const isSmallMobile = width < 500;
  const isExtraSmallMobile = width < 350;
  
  const formContainer = document.createElement('div');
  formContainer.classList.add('register-form-container');
  
  // Add Google OAuth button directly to the container (outside the form)
  const googleLoginButton = document.createElement('button');
  googleLoginButton.type = 'button';
  googleLoginButton.className = 'google-login-btn';
  googleLoginButton.style.display = 'flex';
  googleLoginButton.style.alignItems = 'center';
  googleLoginButton.style.justifyContent = 'center';
  googleLoginButton.style.width = '100%';
  googleLoginButton.style.padding = '12px';
  googleLoginButton.style.margin = '0 0 16px 0';
  googleLoginButton.style.backgroundColor = 'white';
  googleLoginButton.style.border = '1px solid #dadce0';
  googleLoginButton.style.borderRadius = '8px';
  googleLoginButton.style.cursor = 'pointer';
  googleLoginButton.style.fontWeight = '500';
  googleLoginButton.style.color = '#333333';
  googleLoginButton.style.fontSize = '16px';
  googleLoginButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
  
  // Google icon
  const googleIcon = document.createElement('span');
  googleIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>`;
  googleIcon.style.marginRight = '10px';
  
  googleLoginButton.appendChild(googleIcon);
  googleLoginButton.appendChild(document.createTextNode('Sign up with Google'));
  
  googleLoginButton.onclick = (e) => {
    e.preventDefault();
    handleGoogleLogin();
  };
  
  // Add hover effect
  googleLoginButton.onmouseover = () => {
    googleLoginButton.style.backgroundColor = '#f5f5f5';
    googleLoginButton.style.boxShadow = '0 1px 5px rgba(0,0,0,0.15)';
  };
  googleLoginButton.onmouseout = () => {
    googleLoginButton.style.backgroundColor = 'white';
    googleLoginButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
  };
  
  // Add or text divider
  const dividerContainer = document.createElement('div');
  dividerContainer.style.display = 'flex';
  dividerContainer.style.alignItems = 'center';
  dividerContainer.style.margin = '0 0 16px 0';
  
  const leftLine = document.createElement('div');
  leftLine.style.flex = '1';
  leftLine.style.height = '1px';
  leftLine.style.backgroundColor = '#dadce0';
  
  const orText = document.createElement('span');
  orText.textContent = 'OR';
  orText.style.margin = '0 10px';
  orText.style.color = '#666';
  orText.style.fontSize = '14px';
  
  const rightLine = document.createElement('div');
  rightLine.style.flex = '1';
  rightLine.style.height = '1px';
  rightLine.style.backgroundColor = '#dadce0';
  
  dividerContainer.appendChild(leftLine);
  dividerContainer.appendChild(orText);
  dividerContainer.appendChild(rightLine);
  
  // Add them to container
  formContainer.appendChild(googleLoginButton);
  formContainer.appendChild(dividerContainer);
  
  const formEl = document.createElement('form');
  formEl.classList.add('register-form');
  formEl.style.backgroundColor = 'white';
  
  // Responsive padding for different devices
  if (isExtraSmallMobile) {
    formEl.style.padding = '16px'; // Extra small screens (folded)
  } else if (isSmallMobile) {
    formEl.style.padding = '20px'; // Small mobile
  } else if (isMobile) {
    formEl.style.padding = '24px'; // Regular mobile
  } else {
    formEl.style.padding = '32px'; // Larger screens
  }
  
  formEl.style.borderRadius = isSmallMobile ? '8px' : '12px';
  formEl.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.08)';
  
  formEl.onsubmit = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation to prevent any parent handlers
    
    // Get values immediately
    const username = e.target.elements.username.value;
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    
    // For mobile devices, use a different approach to keep keyboard open while processing
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      // Prevent multiple submissions
      if (formEl.getAttribute('data-submitting') === 'true') {
        return;
      }
      
      // Mark form as currently submitting
      formEl.setAttribute('data-submitting', 'true');
      
      // Process the registration without blurring first
      handleRegister(username, email, password);
      
      // Reset submission state after a delay
      setTimeout(() => {
        formEl.setAttribute('data-submitting', 'false');
      }, 500);
    } else {
      // Desktop approach - blur first then process
      if (document.activeElement) {
        document.activeElement.blur();
      }
      
      setTimeout(() => {
        handleRegister(username, email, password);
      }, 50);
    }
  };
  
  // Form title
  const titleEl = document.createElement('h2');
  titleEl.textContent = 'Create Account';
  titleEl.style.marginBottom = '24px';
  titleEl.style.fontSize = '24px';
  titleEl.style.fontWeight = 'bold';
  titleEl.style.color = '#333333';
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
  usernameLabel.style.color = '#333333';
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'username';
  usernameInput.name = 'username';
  usernameInput.placeholder = 'Choose a username';
  usernameInput.required = true;
  usernameInput.style.width = '100%';
  
  // Prevent automatic keyboard closing on mobile
  usernameInput.addEventListener('focus', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  usernameInput.addEventListener('blur', (e) => {
    if (e.relatedTarget && 
        (e.relatedTarget.tagName === 'BUTTON' || 
         e.relatedTarget.tagName === 'INPUT')) {
      // Don't blur if user is moving to another form element
      return;
    }
  });
  
  // Responsive input padding based on screen size
  if (isExtraSmallMobile) {
    usernameInput.style.padding = '8px 10px'; // Extra small screens (folded)
    usernameInput.style.fontSize = '14px';
  } else if (isSmallMobile) {
    usernameInput.style.padding = '9px 12px'; // Small mobile
    usernameInput.style.fontSize = '15px';
  } else {
    usernameInput.style.padding = '10px 14px'; // Larger screens
  }
  
  usernameInput.style.borderRadius = isExtraSmallMobile ? '6px' : 'var(--radius-md)';
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
  emailLabel.style.color = '#333333';
  
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'email';
  emailInput.name = 'email';
  emailInput.placeholder = 'Enter your email';
  emailInput.required = true;
  emailInput.style.width = '100%';
  
  // Prevent automatic keyboard closing on mobile
  emailInput.addEventListener('focus', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  emailInput.addEventListener('blur', (e) => {
    if (e.relatedTarget && 
        (e.relatedTarget.tagName === 'BUTTON' || 
         e.relatedTarget.tagName === 'INPUT')) {
      // Don't blur if user is moving to another form element
      return;
    }
  });
  
  // Responsive input padding based on screen size
  if (isExtraSmallMobile) {
    emailInput.style.padding = '8px 10px'; // Extra small screens (folded)
    emailInput.style.fontSize = '14px';
  } else if (isSmallMobile) {
    emailInput.style.padding = '9px 12px'; // Small mobile
    emailInput.style.fontSize = '15px';
  } else {
    emailInput.style.padding = '10px 14px'; // Larger screens
  }
  
  emailInput.style.borderRadius = isExtraSmallMobile ? '6px' : 'var(--radius-md)';
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
  passwordLabel.style.color = '#333333';
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'password';
  passwordInput.name = 'password';
  passwordInput.placeholder = 'Choose a password';
  passwordInput.required = true;
  passwordInput.style.width = '100%';
  
  // Prevent automatic keyboard closing on mobile
  passwordInput.addEventListener('focus', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  passwordInput.addEventListener('blur', (e) => {
    if (e.relatedTarget && 
        (e.relatedTarget.tagName === 'BUTTON' || 
         e.relatedTarget.tagName === 'INPUT')) {
      // Don't blur if user is moving to another form element
      return;
    }
  });
  
  // Responsive input padding based on screen size
  if (isExtraSmallMobile) {
    passwordInput.style.padding = '8px 10px'; // Extra small screens (folded)
    passwordInput.style.fontSize = '14px';
  } else if (isSmallMobile) {
    passwordInput.style.padding = '9px 12px'; // Small mobile
    passwordInput.style.fontSize = '15px';
  } else {
    passwordInput.style.padding = '10px 14px'; // Larger screens
  }
  
  passwordInput.style.borderRadius = isExtraSmallMobile ? '6px' : 'var(--radius-md)';
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
  termsLabel.style.color = '#333333';
  
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
  
  // Responsive button styling
  if (isExtraSmallMobile) {
    submitButton.style.padding = '10px';
    submitButton.style.marginBottom = '12px';
    submitButton.style.borderRadius = '6px';
    submitButton.style.fontSize = '15px';
  } else if (isSmallMobile) {
    submitButton.style.padding = '10px';
    submitButton.style.marginBottom = '14px';
    submitButton.style.borderRadius = '7px';
    submitButton.style.fontSize = '15px';
  } else {
    submitButton.style.padding = '12px';
    submitButton.style.marginBottom = '16px';
    submitButton.style.borderRadius = '8px';
    submitButton.style.fontSize = '16px';
  }
  
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
  
  // Add separator with "or"
  const separatorContainer = document.createElement('div');
  separatorContainer.style.display = 'flex';
  separatorContainer.style.alignItems = 'center';
  separatorContainer.style.margin = '20px 0';
  
  const leftLine = document.createElement('div');
  leftLine.style.flex = '1';
  leftLine.style.height = '1px';
  leftLine.style.backgroundColor = 'var(--color-border)';
  
  const orText = document.createElement('span');
  orText.textContent = 'OR';
  orText.style.margin = '0 10px';
  orText.style.color = '#666';
  orText.style.fontSize = '14px';
  
  const rightLine = document.createElement('div');
  rightLine.style.flex = '1';
  rightLine.style.height = '1px';
  rightLine.style.backgroundColor = 'var(--color-border)';
  
  separatorContainer.appendChild(leftLine);
  separatorContainer.appendChild(orText);
  separatorContainer.appendChild(rightLine);
  formEl.appendChild(separatorContainer);
  
  // Google signup button
  const googleButton = document.createElement('button');
  googleButton.type = 'button'; // Not submit
  googleButton.className = 'google-login-btn';
  googleButton.style.width = '100%';
  googleButton.style.display = 'flex';
  googleButton.style.alignItems = 'center';
  googleButton.style.justifyContent = 'center';
  googleButton.style.backgroundColor = 'white';
  googleButton.style.border = '1px solid var(--color-border)';
  googleButton.style.borderRadius = isSmallMobile ? '6px' : '8px';
  googleButton.style.padding = isExtraSmallMobile ? '8px' : '10px';
  googleButton.style.marginBottom = '20px';
  googleButton.style.cursor = 'pointer';
  googleButton.style.transition = 'all 0.2s ease';
  
  // Google icon
  const googleIcon = document.createElement('span');
  googleIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>`;
  googleIcon.style.marginRight = '10px';
  
  const googleText = document.createElement('span');
  googleText.textContent = 'Sign up with Google';
  googleText.style.fontWeight = '500';
  googleText.style.color = '#333333';
  
  googleButton.appendChild(googleIcon);
  googleButton.appendChild(googleText);
  
  // Add hover effect
  googleButton.onmouseover = () => {
    googleButton.style.backgroundColor = '#f5f5f5';
    googleButton.style.transform = 'translateY(-1px)';
    googleButton.style.boxShadow = '0 1px 5px rgba(0, 0, 0, 0.05)';
  };
  googleButton.onmouseout = () => {
    googleButton.style.backgroundColor = 'white';
    googleButton.style.transform = 'translateY(0)';
    googleButton.style.boxShadow = 'none';
  };
  
  // Handle Google sign in click
  googleButton.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleGoogleLogin(); // Reuse the same function as login
  };
  
  formEl.appendChild(googleButton);
  
  // Switch to login link
  const switchText = document.createElement('p');
  switchText.style.textAlign = 'center';
  switchText.style.fontSize = '14px';
  switchText.style.color = '#333333';
  
  const switchLink = document.createElement('a');
  switchLink.href = '#';
  switchLink.textContent = 'Log in';
  switchLink.style.color = 'var(--color-primary)';
  switchLink.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For mobile: don't blur immediately to prevent keyboard issues
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      setTimeout(() => {
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
          const loginForm = renderLoginForm();
          authContainer.innerHTML = '';
          authContainer.appendChild(loginForm);
        }
      }, 10);
    } else {
      // Desktop approach
      if (document.activeElement) {
        document.activeElement.blur();
      }
      
      setTimeout(() => {
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
          const loginForm = renderLoginForm();
          authContainer.innerHTML = '';
          authContainer.appendChild(loginForm);
        }
      }, 50);
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
  // Get viewport width and detect foldable device state
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isFoldable = /(?:Samsung.+SM-F|Fold)/i.test(navigator.userAgent);
  const isFoldableClosed = width < 400 && (height / width) > 1.8;
  
  console.log("Viewport: " + (width < 350 ? "extra small mobile" : width < 500 ? "small mobile" : width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop"));
  if (isFoldable) {
    console.log("Detected: Foldable device " + (isFoldableClosed ? "(closed)" : "(open)"));
  }
  
  // Create page container
  const container = document.createElement('div');
  container.classList.add('auth-page');
  container.style.minHeight = '100vh';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  
  // Responsive padding
  if (width < 350) {
    container.style.padding = '10px'; // Extra small screens
  } else if (width < 500) {
    container.style.padding = '15px'; // Small mobile
  } else {
    container.style.padding = '20px'; // Larger screens
  }
  
  container.style.background = 'var(--color-background)';
  
  // Create a layout that adapts between one and two columns based on screen size
  const layoutContainer = document.createElement('div');
  layoutContainer.classList.add('auth-layout');
  
  // Change from flex row to flex column on small screens
  if (width < 768) {
    layoutContainer.style.display = 'flex';
    layoutContainer.style.flexDirection = 'column';
  } else {
    layoutContainer.style.display = 'flex';
    layoutContainer.style.flexDirection = 'row';
  }
  
  layoutContainer.style.borderRadius = 'var(--radius-lg)';
  layoutContainer.style.overflow = 'hidden';
  layoutContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
  layoutContainer.style.maxWidth = '1000px';
  layoutContainer.style.width = '100%';
  layoutContainer.style.background = 'white';
  
  // Create hero column
  const heroCol = document.createElement('div');
  heroCol.classList.add('auth-hero');
  heroCol.style.display = 'flex';
  heroCol.style.flexDirection = 'column';
  heroCol.style.justifyContent = 'center';
  heroCol.style.alignItems = 'flex-start';
  
  // Responsive padding for hero column
  if (width < 350) {
    heroCol.style.padding = '20px'; // Extra small screens
  } else if (width < 768) {
    heroCol.style.padding = '30px'; // Mobile screens
  } else {
    heroCol.style.padding = '40px'; // Larger screens
  }
  
  // Adjust width based on screen size
  if (width < 768) {
    heroCol.style.width = '100%'; // Full width on mobile
  } else {
    heroCol.style.width = '50%'; // Half width on larger screens
  }
  
  heroCol.style.background = 'white';
  heroCol.style.color = '#333333';
  
  // Add branding and hero content
  const logo = document.createElement('div');
  logo.classList.add('auth-logo');
  
  // Responsive logo size
  if (width < 350) {
    logo.style.fontSize = '20px'; // Extra small screens
    logo.style.marginBottom = '20px';
  } else if (width < 768) {
    logo.style.fontSize = '22px'; // Mobile screens
    logo.style.marginBottom = '30px';
  } else {
    logo.style.fontSize = '24px'; // Larger screens
    logo.style.marginBottom = '40px';
  }
  
  logo.style.fontWeight = 'bold';
  logo.textContent = 'Stackr Finance';
  
  const heroTitle = document.createElement('h1');
  
  // Responsive title size
  if (width < 350) {
    heroTitle.style.fontSize = '24px'; // Extra small screens
    heroTitle.style.marginBottom = '12px';
  } else if (width < 768) {
    heroTitle.style.fontSize = '28px'; // Mobile screens
    heroTitle.style.marginBottom = '14px';
  } else {
    heroTitle.style.fontSize = '32px'; // Larger screens
    heroTitle.style.marginBottom = '16px';
  }
  
  heroTitle.style.fontWeight = 'bold';
  heroTitle.style.lineHeight = '1.2';
  heroTitle.textContent = 'Take control of your financial future';
  
  const heroDescription = document.createElement('p');
  
  // Responsive description 
  if (width < 350) {
    heroDescription.style.fontSize = '14px'; // Extra small screens
    heroDescription.style.marginBottom = '18px';
  } else if (width < 768) {
    heroDescription.style.fontSize = '15px'; // Mobile screens
    heroDescription.style.marginBottom = '20px';
  } else {
    heroDescription.style.fontSize = '16px'; // Larger screens
    heroDescription.style.marginBottom = '24px';
  }
  
  heroDescription.style.lineHeight = '1.6';
  
  // Shorter description on very small screens
  if (width < 350) {
    heroDescription.textContent = 'Track your income, plan your expenses, and achieve your financial goals with Stackr Finance.';
  } else {
    heroDescription.textContent = 'Track your income, plan your expenses, and achieve your financial goals with Stackr Finance - the ultimate tool for service providers.';
  }
  
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
  
  // Simplify feature list for very small screens
  const simplifiedFeatures = width < 350 ? [
    'Custom 40/30/30 income split',
    'Bank integration with Plaid',
    'Goal tracking visualization',
    'AI financial advice'
  ] : features;
  
  simplifiedFeatures.forEach(feature => {
    const featureItem = document.createElement('li');
    
    // Adjust bottom margin based on screen size
    if (width < 350) {
      featureItem.style.marginBottom = '8px'; // Extra small screens need tighter spacing
      featureItem.style.fontSize = '13px';
    } else if (width < 768) {
      featureItem.style.marginBottom = '10px'; // Mobile screens
      featureItem.style.fontSize = '14px';
    } else {
      featureItem.style.marginBottom = '12px'; // Larger screens
    }
    
    featureItem.style.display = 'flex';
    featureItem.style.alignItems = 'center';
    
    const checkIcon = document.createElement('span');
    
    // Smaller icon for smaller screens
    const iconSize = width < 350 ? "16" : "20";
    checkIcon.innerHTML = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    
    // Adjust icon spacing
    checkIcon.style.marginRight = width < 350 ? '8px' : '12px';
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
  
  // Make form column responsive
  if (width < 768) {
    formCol.style.width = '100%'; // Full width on mobile
    
    // Adjust padding based on screen size
    if (width < 350) {
      formCol.style.padding = '20px'; // Extra small screens
    } else {
      formCol.style.padding = '25px'; // Small/medium screens
    }
  } else {
    formCol.style.width = '50%'; // Half width on larger screens
    formCol.style.padding = '40px'; // More padding on larger screens
  }
  
  formCol.style.display = 'flex';
  formCol.style.flexDirection = 'column';
  formCol.style.justifyContent = 'center';
  formCol.style.backgroundColor = 'white';
  formCol.style.color = '#333333';
  
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
    /* Force all text to be dark by default */
    body, div, span, p, h1, h2, h3, h4, h5, h6, label, input, 
    button, a, textarea, select, option, form {
      color: #333333 !important;
    }

    /* Form layout responsiveness for tablets and mid-sized screens */
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
      
      .auth-hero h1 {
        font-size: 28px;
      }
      
      .auth-hero p {
        font-size: 15px;
      }
    }
    
    /* Additional adjustments for small mobile screens */
    @media (max-width: 500px) {
      .auth-layout {
        border-radius: 10px;
      }
      
      .auth-hero, .auth-form-col {
        padding: 25px 20px;
      }
      
      .auth-hero h1 {
        font-size: 26px;
      }
      
      .login-form, .register-form {
        padding: 20px;
      }
      
      .login-form h2, .register-form h2 {
        font-size: 22px;
      }
    }
    
    /* Special handling for Samsung Z Fold closed and extra small screens */
    @media (max-width: 350px) {
      .auth-layout {
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }
      
      .auth-page {
        padding: 10px;
      }
      
      .auth-hero, .auth-form-col {
        padding: 20px 16px;
      }
      
      .auth-hero h1 {
        font-size: 24px;
        margin-bottom: 12px;
      }
      
      .auth-hero p {
        font-size: 14px;
        margin-bottom: 18px;
      }
      
      .auth-hero li {
        font-size: 13px;
        margin-bottom: 8px;
      }
      
      .login-form, .register-form {
        padding: 16px;
      }
      
      .login-form h2, .register-form h2 {
        font-size: 20px;
        margin-bottom: 16px;
      }
      
      input, button, label {
        font-size: 14px !important;
      }
      
      .form-group {
        margin-bottom: 12px !important;
      }
    }
    
    /* Form elements styling */
    .auth-form-col, 
    .auth-form-col div,
    .login-form-container, 
    .register-form-container,
    .login-form, 
    .register-form {
      background-color: white !important;
      color: #333333 !important;
    }
    
    .auth-form-col input[type="text"], 
    .auth-form-col input[type="password"], 
    .auth-form-col input[type="email"] {
      color: #333333 !important;
      background-color: white !important;
    }
    
    .auth-form-col input::placeholder {
      color: #888888 !important;
      opacity: 1;
    }
    
    .auth-form-col label {
      color: #333333 !important;
    }
    
    /* Error styling */
    .login-error, .register-error {
      color: #e53e3e !important;
      background-color: #fed7d7 !important;
    }
    
    /* Text elements */
    .auth-form-col p,
    .auth-form-col span,
    .auth-form-col h1,
    .auth-form-col h2,
    .auth-form-col h3,
    .auth-form-col h4,
    .auth-form-col h5,
    .auth-form-col h6 {
      color: #333333 !important;
    }
    
    /* Links */
    .auth-form-col a {
      color: var(--color-primary) !important;
      text-decoration: none;
    }
    
    .auth-form-col a:hover {
      text-decoration: underline;
    }
    
    /* Hero section text should be dark too */
    .auth-hero, 
    .auth-hero div, 
    .auth-hero p, 
    .auth-hero h1, 
    .auth-hero h2, 
    .auth-hero h3, 
    .auth-hero span, 
    .auth-hero li {
      color: #333333 !important;
    }
    
    /* Buttons text should be white */
    .btn-primary {
      color: white !important;
    }
    
    /* Spinner */
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
      
      // Even if there's an error, still clear the storage
      localStorage.removeItem('stackrToken');
      localStorage.removeItem('stackrUser');
      sessionStorage.removeItem('stackrToken');
      sessionStorage.removeItem('stackrUser');
      
      reject(error);
    }
  });
}

// Function to check if user is authenticated
export function isAuthenticated() {
  // Check both localStorage and sessionStorage
  const localToken = localStorage.getItem('stackrToken');
  const sessionToken = sessionStorage.getItem('stackrToken');
  
  return !!localToken || !!sessionToken;
}

// Function to get current user data
export function getCurrentUser() {
  try {
    // Try localStorage first
    const localUserData = localStorage.getItem('stackrUser');
    if (localUserData) {
      return JSON.parse(localUserData);
    }
    
    // Then try sessionStorage
    const sessionUserData = sessionStorage.getItem('stackrUser');
    if (sessionUserData) {
      return JSON.parse(sessionUserData);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}