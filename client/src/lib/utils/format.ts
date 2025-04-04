/**
 * Formats a number as a currency string (USD).
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}

/**
 * Formats a number as a percentage string.
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value / 100);
}

/**
 * Formats a date to a readable string.
 */
export function formatDate(date: Date | string, format: string = 'medium'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch(format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric' 
      });
    case 'medium':
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'full':
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    default:
      return dateObj.toLocaleDateString();
  }
}