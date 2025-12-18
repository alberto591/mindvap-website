// Script to apply database migrations to Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
const supabaseUrl = 'https://dlnzhapqodnqpzjwkjho.supabase.co';
const supabaseAnonKey = 'sb_publishable_BRjIourGUoBBHs_M1mqlRg_YuZ9qtDs';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to read SQL file
function readSQLFile(filePath) {
  return readFileSync(resolve(filePath), 'utf8');
}

// Function to execute SQL queries
async function executeSQL(sql) {
  try {
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      const { data, error } = await supabase.rpc('execute_sql', { sql: statement });
      
      if (error) {
        console.error('Error executing SQL:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error executing SQL:', error);
    return false;
  }
}

// Apply migrations
async function applyMigrations() {
  console.log('Applying database migrations...');
  
  const migrations = [
    'supabase/migrations/001_create_users_table.sql',
    'supabase/migrations/002_create_user_sessions_table.sql',
    'supabase/migrations/003_create_user_addresses_table.sql',
    'supabase/migrations/004_create_security_tables.sql',
    'supabase/migrations/005_create_views_and_functions.sql'
  ];
  
  for (const migration of migrations) {
    console.log(`Applying migration: ${migration}`);
    const sql = readSQLFile(migration);
    const success = await executeSQL(sql);
    
    if (success) {
      console.log(`Migration ${migration} applied successfully`);
    } else {
      console.error(`Failed to apply migration ${migration}`);
    }
  }
  
  console.log('Database migrations completed.');
}

// Run migrations
applyMigrations().catch(console.error);