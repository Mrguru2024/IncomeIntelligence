/**
 * Format a number as currency with $ sign and 2 decimal places
 * @param value The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a date string or Date object to a readable format
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a percentage value with % sign
 * @param value The percentage value (e.g., 40 for 40%)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}
