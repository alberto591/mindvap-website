// Test script to verify Supabase database connectivity
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? '*****' : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or key is not set in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('Authentication test:', authError.message);
    } else {
      console.log('Authentication test: Success');
    }
    
    // Test database query
    const { data, error: queryError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (queryError) {
      console.log('Database query test:', queryError.message);
    } else {
      console.log('Database query test: Success');
      console.log('Sample data:', data);
    }
    
    console.log('\nSupabase connection test completed.');
  } catch (error) {
    console.error('Error during connection test:', error.message);
    process.exit(1);
  }
}

testConnection();