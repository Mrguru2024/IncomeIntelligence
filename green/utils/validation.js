/**
 * Validation Utilities
 * 
 * A collection of validation functions for form inputs and data
 */

/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateEmail(email) {
  if (!email) return false;
  
  // RFC 5322 compliant email regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validatePassword(password) {
  if (!password) return false;
  
  // Password must:
  // - Be at least 8 characters long
  // - Contain at least one uppercase letter
  // - Contain at least one lowercase letter
  // - Contain at least one number
  // - Contain at least one special character
  
  const lengthValid = password.length >= 8;
  const uppercaseValid = /[A-Z]/.test(password);
  const lowercaseValid = /[a-z]/.test(password);
  const numberValid = /[0-9]/.test(password);
  const specialValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return lengthValid && uppercaseValid && lowercaseValid && numberValid && specialValid;
}

/**
 * Validates username format
 * @param {string} username - The username to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateUsername(username) {
  if (!username) return false;
  
  // Username rules:
  // - 3-20 characters
  // - Only alphanumeric characters, underscores, and hyphens
  // - Cannot start or end with underscore or hyphen
  
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,18}[a-zA-Z0-9]$/.test(username);
}

/**
 * Validates a name (first or last name)
 * @param {string} name - The name to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateName(name) {
  if (!name) return false;
  
  // Name rules:
  // - 2-50 characters
  // - Only letters, spaces, hyphens, and apostrophes
  
  return /^[a-zA-Z\s'-]{2,50}$/.test(name);
}

/**
 * Validates a phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validatePhoneNumber(phone) {
  if (!phone) return false;
  
  // Accept various formats with or without country code:
  // +1 (123) 456-7890
  // (123) 456-7890
  // 123-456-7890
  // 123.456.7890
  // 1234567890
  
  const phoneRegex = /^(\+\d{1,3}[ -]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

/**
 * Validates a URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateUrl(url) {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validates a numeric value
 * @param {string|number} value - The value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} True if valid, false otherwise
 */
export function validateNumber(value, min = null, max = null) {
  if (value === null || value === undefined || value === '') return false;
  
  const num = Number(value);
  if (isNaN(num)) return false;
  
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  
  return true;
}

/**
 * Validates a date format
 * @param {string|Date} date - The date to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateDate(date) {
  if (!date) return false;
  
  const timestamp = Date.parse(date);
  return !isNaN(timestamp);
}

/**
 * Validates if a field is not empty
 * @param {string} value - The value to check
 * @returns {boolean} True if not empty, false otherwise
 */
export function validateRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Validates if a value is within a certain length range
 * @param {string} value - The value to check
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if valid, false otherwise
 */
export function validateLength(value, min, max) {
  if (value === null || value === undefined) return false;
  const strValue = String(value);
  
  if (min !== null && strValue.length < min) return false;
  if (max !== null && strValue.length > max) return false;
  
  return true;
}