/**
 * Utility functions for Stackr Finance
 */

/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @param {string} [currencyCode='USD'] - Currency code
 * @param {string} [locale='en-US'] - Locale
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currencyCode = 'USD', locale = 'en-US') {
  if (isNaN(value)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currencyCode 
  }).format(value);
}

/**
 * Format a date as a string
 * @param {Date} date - The date to format
 * @param {string} [format='short'] - Format type ('short', 'medium', 'long')
 * @param {string} [locale='en-US'] - Locale
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short', locale = 'en-US') {
  if (!(date instanceof Date)) {
    return '';
  }
  
  const options = {};
  
  switch (format) {
    case 'short':
      options.year = 'numeric';
      options.month = 'numeric';
      options.day = 'numeric';
      break;
    case 'medium':
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      break;
    case 'long':
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      options.weekday = 'long';
      break;
  }
  
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} [length=100] - Maximum length
 * @param {string} [suffix='...'] - Suffix to append if truncated
 * @returns {string} Truncated string
 */
export function truncateString(str, length = 100, suffix = '...') {
  if (!str || str.length <= length) {
    return str;
  }
  
  return str.substring(0, length).trim() + suffix;
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} [wait=300] - Debounce wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a random ID
 * @param {number} [length=8] - Length of the ID
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export function calculatePercentage(value, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

/**
 * Format a number with thousands separators
 * @param {number} value - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(value) {
  if (isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat().format(value);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date} date - Date to format
 * @returns {string} Relative time string
 */
export function getRelativeTimeString(date) {
  if (!(date instanceof Date)) {
    return '';
  }
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) {
    return years === 1 ? '1 year ago' : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else {
    return seconds < 30 ? 'just now' : `${seconds} seconds ago`;
  }
}