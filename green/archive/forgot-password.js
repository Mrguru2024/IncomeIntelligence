/**
 * Forgot Password Component
 * 
 * This component handles the password reset flow including:
 * 1. Initial email request form
 * 2. Password reset form (when token is provided)
 * 3. Success/error messaging
 */

import { design } from './utils/design-system.js';
import { validateEmail, validatePassword } from './utils/validation.js';
import { showToast, showLoading, hideLoading } from './utils/ui-utils.js';
import { sanitizeHtml } from './utils/security-utils.js';

/**
 * Renders the forgot password page
 * @param {string} token - Optional reset token (from URL)
 */
export function renderForgotPasswordPage(token = null) {
  const container = document.createElement('div');
  container.className = 'forgot-password-container auth-form-container';
  
  // Page Title
  const title = document.createElement('h1');
  title.textContent = token ? 'Reset Your Password' : 'Forgot Your Password?';
  title.className = 'auth-title';
  
  // Subtitle/Description
  const subtitle = document.createElement('p');
  subtitle.className = 'auth-subtitle';
  subtitle.textContent = token 
    ? 'Create a new password for your Stackr account' 
    : 'Enter your email address below and we\'ll send you instructions to reset your password.';
  
  container.appendChild(title);
  container.appendChild(subtitle);
  
  // Conditional rendering based on whether we have a token
  if (token) {
    container.appendChild(createResetPasswordForm(token));
  } else {
    container.appendChild(createRequestResetForm());
  }
  
  // Back to login link
  const loginLink = document.createElement('p');
  loginLink.className = 'auth-link-container';
  loginLink.innerHTML = `
    <a href="#login" class="auth-link">
      <i class="fas fa-arrow-left"></i> Back to Login
    </a>
  `;
  container.appendChild(loginLink);
  
  return container;
}

/**
 * Creates the initial form to request a password reset email
 * @returns {HTMLFormElement} The form element
 */
function createRequestResetForm() {
  const form = document.createElement('form');
  form.className = 'auth-form';
  form.id = 'forgot-password-form';
  
  // Email input
  const emailGroup = document.createElement('div');
  emailGroup.className = 'form-group';
  
  const emailLabel = document.createElement('label');
  emailLabel.setAttribute('for', 'email');
  emailLabel.textContent = 'Email Address';
  emailLabel.className = 'form-label';
  
  const emailInput = document.createElement('input');
  emailInput.setAttribute('type', 'email');
  emailInput.setAttribute('id', 'email');
  emailInput.setAttribute('name', 'email');
  emailInput.setAttribute('placeholder', 'Enter your email address');
  emailInput.className = 'form-input';
  emailInput.required = true;
  
  const emailError = document.createElement('div');
  emailError.className = 'form-error';
  emailError.id = 'email-error';
  
  emailGroup.appendChild(emailLabel);
  emailGroup.appendChild(emailInput);
  emailGroup.appendChild(emailError);
  
  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.setAttribute('type', 'submit');
  submitBtn.className = 'auth-button primary-button';
  submitBtn.textContent = 'Send Reset Link';
  
  // Success message (hidden initially)
  const successMsg = document.createElement('div');
  successMsg.className = 'auth-success-message';
  successMsg.style.display = 'none';
  successMsg.id = 'reset-success';
  
  form.appendChild(emailGroup);
  form.appendChild(submitBtn);
  form.appendChild(successMsg);
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset any previous errors
    emailError.textContent = '';
    successMsg.style.display = 'none';
    
    const email = sanitizeHtml(emailInput.value.trim());
    
    // Validate email
    if (!validateEmail(email)) {
      emailError.textContent = 'Please enter a valid email address';
      return;
    }
    
    try {
      showLoading('Sending reset link...');
      
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Always show success even if the email doesn't exist (security best practice)
        successMsg.innerHTML = `
          <i class="fas fa-check-circle"></i>
          <p>If a user with that email exists, we've sent instructions to reset your password.
          Please check your inbox.</p>
        `;
        successMsg.style.display = 'flex';
        form.reset();
      } else {
        throw new Error(data.message || 'Error sending reset link');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      showToast('Error', error.message || 'Something went wrong. Please try again later.', 'error');
    } finally {
      hideLoading();
    }
  });
  
  return form;
}

/**
 * Creates the password reset form when a token is provided
 * @param {string} token - The reset token from the URL
 * @returns {HTMLFormElement} The form element
 */
function createResetPasswordForm(token) {
  const form = document.createElement('form');
  form.className = 'auth-form';
  form.id = 'reset-password-form';
  
  // New password input
  const passwordGroup = document.createElement('div');
  passwordGroup.className = 'form-group';
  
  const passwordLabel = document.createElement('label');
  passwordLabel.setAttribute('for', 'new-password');
  passwordLabel.textContent = 'New Password';
  passwordLabel.className = 'form-label';
  
  const passwordInput = document.createElement('input');
  passwordInput.setAttribute('type', 'password');
  passwordInput.setAttribute('id', 'new-password');
  passwordInput.setAttribute('name', 'newPassword');
  passwordInput.setAttribute('placeholder', 'Enter your new password');
  passwordInput.className = 'form-input';
  passwordInput.required = true;
  
  const passwordError = document.createElement('div');
  passwordError.className = 'form-error';
  passwordError.id = 'password-error';
  
  passwordGroup.appendChild(passwordLabel);
  passwordGroup.appendChild(passwordInput);
  passwordGroup.appendChild(passwordError);
  
  // Confirm password input
  const confirmGroup = document.createElement('div');
  confirmGroup.className = 'form-group';
  
  const confirmLabel = document.createElement('label');
  confirmLabel.setAttribute('for', 'confirm-password');
  confirmLabel.textContent = 'Confirm Password';
  confirmLabel.className = 'form-label';
  
  const confirmInput = document.createElement('input');
  confirmInput.setAttribute('type', 'password');
  confirmInput.setAttribute('id', 'confirm-password');
  confirmInput.setAttribute('name', 'confirmPassword');
  confirmInput.setAttribute('placeholder', 'Confirm your new password');
  confirmInput.className = 'form-input';
  confirmInput.required = true;
  
  const confirmError = document.createElement('div');
  confirmError.className = 'form-error';
  confirmError.id = 'confirm-error';
  
  confirmGroup.appendChild(confirmLabel);
  confirmGroup.appendChild(confirmInput);
  confirmGroup.appendChild(confirmError);
  
  // Password requirements
  const passwordRequirements = document.createElement('div');
  passwordRequirements.className = 'password-requirements';
  passwordRequirements.innerHTML = `
    <p>Password must:</p>
    <ul>
      <li id="req-length"><i class="far fa-circle"></i> Be at least 8 characters long</li>
      <li id="req-uppercase"><i class="far fa-circle"></i> Include at least one uppercase letter</li>
      <li id="req-lowercase"><i class="far fa-circle"></i> Include at least one lowercase letter</li>
      <li id="req-number"><i class="far fa-circle"></i> Include at least one number</li>
      <li id="req-special"><i class="far fa-circle"></i> Include at least one special character</li>
    </ul>
  `;
  
  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.setAttribute('type', 'submit');
  submitBtn.className = 'auth-button primary-button';
  submitBtn.textContent = 'Reset Password';
  
  // Success message (hidden initially)
  const successMsg = document.createElement('div');
  successMsg.className = 'auth-success-message';
  successMsg.style.display = 'none';
  successMsg.id = 'reset-success';
  
  form.appendChild(passwordGroup);
  form.appendChild(confirmGroup);
  form.appendChild(passwordRequirements);
  form.appendChild(submitBtn);
  form.appendChild(successMsg);
  
  // Real-time password validation
  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    
    // Check length
    const lengthValid = password.length >= 8;
    document.getElementById('req-length').innerHTML = lengthValid 
      ? '<i class="fas fa-check-circle text-success"></i> Be at least 8 characters long'
      : '<i class="far fa-circle"></i> Be at least 8 characters long';
    
    // Check uppercase
    const uppercaseValid = /[A-Z]/.test(password);
    document.getElementById('req-uppercase').innerHTML = uppercaseValid
      ? '<i class="fas fa-check-circle text-success"></i> Include at least one uppercase letter'
      : '<i class="far fa-circle"></i> Include at least one uppercase letter';
    
    // Check lowercase
    const lowercaseValid = /[a-z]/.test(password);
    document.getElementById('req-lowercase').innerHTML = lowercaseValid
      ? '<i class="fas fa-check-circle text-success"></i> Include at least one lowercase letter'
      : '<i class="far fa-circle"></i> Include at least one lowercase letter';
    
    // Check number
    const numberValid = /[0-9]/.test(password);
    document.getElementById('req-number').innerHTML = numberValid
      ? '<i class="fas fa-check-circle text-success"></i> Include at least one number'
      : '<i class="far fa-circle"></i> Include at least one number';
    
    // Check special character
    const specialValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    document.getElementById('req-special').innerHTML = specialValid
      ? '<i class="fas fa-check-circle text-success"></i> Include at least one special character'
      : '<i class="far fa-circle"></i> Include at least one special character';
  });
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset any previous errors
    passwordError.textContent = '';
    confirmError.textContent = '';
    successMsg.style.display = 'none';
    
    const newPassword = passwordInput.value;
    const confirmPassword = confirmInput.value;
    
    // Validate password
    if (!validatePassword(newPassword)) {
      passwordError.textContent = 'Password does not meet the requirements';
      return;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      confirmError.textContent = 'Passwords do not match';
      return;
    }
    
    try {
      showLoading('Resetting password...');
      
      const response = await fetch(`/api/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        successMsg.innerHTML = `
          <i class="fas fa-check-circle"></i>
          <p>Your password has been reset successfully!</p>
          <a href="#login" class="auth-button primary-button">Log In Now</a>
        `;
        successMsg.style.display = 'flex';
        form.reset();
      } else {
        throw new Error(data.message || 'Error resetting password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showToast('Error', error.message || 'Something went wrong. Please try again later.', 'error');
    } finally {
      hideLoading();
    }
  });
  
  return form;
}