/**
 * SQL Security utilities to prevent SQL injection attacks
 * 
 * NOTE: These utilities are mainly for educational purposes since Drizzle ORM
 * already provides parameterized queries that protect against SQL injection.
 * Always use Drizzle's query building methods instead of raw SQL when possible.
 */

/**
 * Sanitize a string to prevent SQL injection
 * This is a basic implementation and should not be relied upon exclusively
 */
export function sanitizeSqlString(input: string): string {
  // Escape characters that could be used for SQL injection
  return input
    .replace(/'/g, "''") // Replace single quotes with two single quotes
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/\x00/g, "\\0") // Replace NULL bytes
    .replace(/\n/g, "\\n") // Replace newlines
    .replace(/\r/g, "\\r") // Replace carriage returns
    .replace(/\x1a/g, "\\Z"); // Replace ctrl+Z
}

/**
 * Check if a string contains potential SQL injection attempts
 */
export function hasSqlInjection(input: string): boolean {
  // Regular expression to detect common SQL injection patterns
  const sqlInjectionPattern = /('|").*?(\1).*?(--|#|\/\*|\*\/|;)/i;
  
  // Detect common SQL injection keywords
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'EXEC',
    'UNION', 'TRUNCATE', 'DECLARE', 'WAITFOR', 'CAST', 'OR', 'AND'
  ];
  
  // Check for SQL patterns
  if (sqlInjectionPattern.test(input)) {
    return true;
  }
  
  // Check for SQL keywords with word boundaries
  const keywordRegex = new RegExp(`\\b(${sqlKeywords.join('|')})\\b`, 'i');
  if (keywordRegex.test(input)) {
    return true;
  }
  
  return false;
}

/**
 * Verify that a value is a valid number
 */
export function isValidNumber(value: any): boolean {
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }
  
  if (typeof value === 'string') {
    // Check if string can be converted to a valid number
    const num = Number(value);
    return !isNaN(num) && isFinite(num) && value.trim() !== '';
  }
  
  return false;
}

/**
 * Check if a string contains only alphanumeric characters, underscores, and hyphens
 * Useful for validating table and column names
 */
export function isValidIdentifier(value: string): boolean {
  // Only allow letters, numbers, underscores, and hyphens
  return /^[a-zA-Z0-9_-]+$/.test(value);
}

/**
 * Sanitize an SQL identifier (table or column name)
 */
export function sanitizeSqlIdentifier(identifier: string): string {
  // Remove all non-alphanumeric characters except underscores and hyphens
  return identifier.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Generate a parameterized SQL query and parameters array
 * (For demonstration purposes - use Drizzle ORM instead)
 */
export function buildParameterizedQuery(
  baseQuery: string,
  params: Record<string, any>
): { query: string; values: any[] } {
  let parameterizedQuery = baseQuery;
  const values: any[] = [];
  
  // Replace placeholders with parameter indexes
  Object.keys(params).forEach((key, index) => {
    const placeholder = `:${key}`;
    parameterizedQuery = parameterizedQuery.replace(
      new RegExp(placeholder, 'g'),
      `$${index + 1}`
    );
    values.push(params[key]);
  });
  
  return { query: parameterizedQuery, values };
}