// Test Supabase Integration
// This file tests the Supabase client integration

import { supabase, SupabaseAuth, SupabaseDatabase, isUsingMockAuth } from './supabase';

// Test Supabase client initialization
console.log('Testing Supabase client initialization...');
console.log('Supabase client:', supabase);
console.log('Is using mock auth:', isUsingMockAuth);

// Test authentication
async function testAuthentication() {
  try {
    console.log('Testing authentication...');
    const session = await SupabaseAuth.getSession();
    const user = await SupabaseAuth.getUser();
    
    console.log('Session:', session);
    console.log('User:', user);
    
    if (session && user) {
      console.log('Authentication test: Success');
    } else {
      console.log('Authentication test: No active session');
    }
  } catch (error) {
    console.error('Authentication test error:', error);
  }
}

// Test database connectivity
async function testDatabaseConnectivity() {
  try {
    console.log('Testing database connectivity...');
    const { data, error } = await SupabaseDatabase.select('users', '*');
    
    if (error) {
      console.error('Database query error:', error);
    } else {
      console.log('Database query test: Success');
      console.log('Sample data:', data);
    }
  } catch (error) {
    console.error('Database connectivity test error:', error);
  }
}

// Run tests
async function runTests() {
  console.log('Running Supabase integration tests...');
  
  if (isUsingMockAuth) {
    console.log('Using mock authentication - skipping real tests');
    return;
  }
  
  await testAuthentication();
  await testDatabaseConnectivity();
  
  console.log('Supabase integration tests completed.');
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  // Run tests in browser environment
  runTests();
}

export { runTests };