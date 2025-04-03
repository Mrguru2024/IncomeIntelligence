/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number | string): string {
  // If value is a string, convert it to a number
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle NaN or undefined
  if (isNaN(numericValue) || numericValue === undefined) {
    return '$0.00';
  }
  
  // Format as USD
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(0)}%`;
}

/**
 * Format a date as a string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}