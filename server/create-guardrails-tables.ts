import { pool, db } from './db';
import { sql } from 'drizzle-orm';

async function createGuardrailsTables() {
  try {
    console.log('Creating Guardrails tables...');
    
    // Create the spending_limits table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS spending_limits (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        limit_amount NUMERIC NOT NULL,
        cycle TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('Created spending_limits table');
    
    // Create the spending_logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS spending_logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        amount_spent NUMERIC NOT NULL,
        description TEXT,
        source TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created spending_logs table');
    
    // Create the spending_reflections table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS spending_reflections (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        week_start_date DATE NOT NULL,
        week_end_date DATE NOT NULL,
        overall_status TEXT,
        category_summary JSONB,
        ai_suggestion TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Created spending_reflections table');
    
    console.log('All Guardrails tables created successfully');
  } catch (error) {
    console.error('Error creating Guardrails tables:', error);
  } finally {
    await pool.end();
  }
}

createGuardrailsTables();