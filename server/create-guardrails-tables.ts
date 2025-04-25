import { pool } from './db';

/**
 * Create the Guardrails feature database tables
 * This script creates the spending_limits and spending_logs tables
 * for the Stackr Guardrails feature
 */
async function createGuardrailsTables() {
  const client = await pool.connect();
  
  try {
    console.log('Creating Guardrails database tables...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Create spending_limits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS spending_limits (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        limit_amount NUMERIC NOT NULL,
        cycle VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Create spending_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS spending_logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount_spent NUMERIC NOT NULL,
        description TEXT,
        source TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Guardrails tables created successfully!');
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error creating Guardrails tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the function directly if this file is executed
// Use import.meta.url to check if we're the main module
const isMainModule = import.meta.url.endsWith(process.argv[1].replace(/^file:\/\//, ''));
if (isMainModule) {
  createGuardrailsTables()
    .then(() => {
      console.log('Database setup completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Database setup failed:', err);
      process.exit(1);
    });
}

export { createGuardrailsTables };