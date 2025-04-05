/**
 * Utility functions for SQL security
 * Note: While using an ORM like Drizzle already provides protection against SQL injection,
 * these are additional safeguards for any raw SQL that might be necessary.
 */

/**
 * Sanitize value to prevent SQL injection in raw SQL queries
 * @param value Value to sanitize for use in SQL
 * @returns Sanitized value safe for use in SQL
 */
export function sqlSanitize(value: string | number | boolean | null): string {
  if (value === null) {
    return 'NULL';
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  
  // Handle strings - escape single quotes and other potentially dangerous characters
  return "'" + value.toString().replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
}

/**
 * Validate table/column name to prevent SQL injection through identifiers
 * @param identifier Table or column name to validate
 * @returns True if the identifier is safe
 */
export function isValidSqlIdentifier(identifier: string): boolean {
  // SQL identifiers should only contain alphanumeric characters, underscores
  // and should not start with a number
  const identifierPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return identifierPattern.test(identifier);
}

/**
 * Safely quote a SQL identifier to prevent injection
 * @param identifier Table or column name
 * @returns Quoted identifier safe for use in SQL
 */
export function quoteSqlIdentifier(identifier: string): string {
  if (!isValidSqlIdentifier(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`);
  }
  // Double-quote identifiers for PostgreSQL
  return `"${identifier}"`;
}

/**
 * Create safe parameterized query and values for PostgreSQL
 * @param query SQL query with $1, $2, etc. placeholders
 * @param values Values to substitute into the query
 * @returns Object with valid query string and values array
 */
export function createParameterizedQuery(
  query: string,
  values: any[]
): { query: string; values: any[] } {
  // Ensure values don't contain any SQL injections
  // We rely on node-postgres parameter binding for security
  return {
    query,
    values
  };
}

/**
 * Check if a SQL query is potentially dangerous
 * @param query SQL query to check
 * @returns True if the query appears to be safe
 */
export function isSafeSqlQuery(query: string): boolean {
  // Convert to lowercase for comparison
  const lowercaseQuery = query.toLowerCase();
  
  // Check for multiple statements which could be dangerous
  if (lowercaseQuery.includes(';') && !lowercaseQuery.endsWith(';')) {
    return false;
  }
  
  // Check for dangerous operations in SELECT queries
  if (lowercaseQuery.startsWith('select')) {
    // Disallow certain dangerous functions or operations in SELECT
    const dangerousPatterns = [
      'pg_sleep',
      'pg_read_file',
      'pg_ls_dir',
      'create function',
      'create procedure',
      'copy from program',
      'lo_import',
      'lo_export'
    ];
    
    return !dangerousPatterns.some(pattern => lowercaseQuery.includes(pattern));
  }
  
  // For non-SELECT queries, we should be more careful
  // Only allow specific operations explicit for the application
  const allowedNonSelectOperations = [
    'insert into',
    'update',
    'delete from',
    'create table',
    'alter table',
    'drop table',
    'create index',
    'drop index'
  ];
  
  return allowedNonSelectOperations.some(op => lowercaseQuery.startsWith(op));
}

/**
 * Validate and filter order by clause parameters
 * @param columnName Column to order by
 * @param direction Sort direction ('ASC' or 'DESC')
 * @param allowedColumns Array of allowed column names
 * @returns Validated SQL ORDER BY clause
 */
export function validateOrderBy(
  columnName: string,
  direction: 'ASC' | 'DESC' = 'ASC',
  allowedColumns: string[] = []
): string {
  // Ensure column name is valid and allowed
  if (!isValidSqlIdentifier(columnName) || 
      (allowedColumns.length > 0 && !allowedColumns.includes(columnName))) {
    throw new Error(`Invalid or disallowed column name: ${columnName}`);
  }
  
  // Ensure direction is valid
  if (direction !== 'ASC' && direction !== 'DESC') {
    throw new Error(`Invalid sort direction: ${direction}`);
  }
  
  return `${quoteSqlIdentifier(columnName)} ${direction}`;
}

/**
 * Create a safe LIMIT/OFFSET SQL clause with validation
 * @param limit Number of rows to limit to
 * @param offset Number of rows to skip
 * @returns SQL LIMIT/OFFSET clause
 */
export function createLimitOffset(limit?: number, offset?: number): string {
  let sql = '';
  
  // Add LIMIT clause if provided
  if (limit !== undefined) {
    // Ensure limit is a positive integer
    if (!Number.isInteger(limit) || limit <= 0 || limit > 1000) {
      throw new Error(`Invalid LIMIT value: ${limit}`);
    }
    sql += ` LIMIT ${limit}`;
  }
  
  // Add OFFSET clause if provided
  if (offset !== undefined) {
    // Ensure offset is a non-negative integer
    if (!Number.isInteger(offset) || offset < 0) {
      throw new Error(`Invalid OFFSET value: ${offset}`);
    }
    sql += ` OFFSET ${offset}`;
  }
  
  return sql;
}