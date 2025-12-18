// Supabase Client Configuration
// Initializes and configures the Supabase client for authentication

import { createClient } from '@supabase/supabase-js';
import type { MobileOtpType, EmailOtpType } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we should use mock authentication
const shouldUseMockAuth = () => {
  return !supabaseUrl || !supabaseAnonKey ||
         supabaseUrl.includes('your-project') ||
         supabaseUrl.includes('placeholder') ||
         supabaseAnonKey.includes('your-') ||
         supabaseAnonKey.includes('placeholder');
};

// Create Supabase client or mock client
export const supabase = shouldUseMockAuth()
  ? createClient('https://mock.supabase.co', 'mock-anon-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 0
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'mindvap-mock-auth-system'
        }
      }
    })
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'mindvap-auth-system'
        }
      }
    });

// Export flag for mock usage
export const isUsingMockAuth = shouldUseMockAuth();

// Authentication helper functions
export class SupabaseAuth {
  /**
   * Get the current user session
   */
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  }

  /**
   * Get the current user
   */
  static async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  }

  /**
   * Sign in with email and password
   */
  static async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Sign up with email and password
   */
  static async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Sign out
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return { error };
    }
    return { error: null };
  }

  /**
   * Reset password for email
   */
  static async resetPasswordForEmail(email: string, options?: {
    redirectTo?: string;
  }) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, options);
    
    if (error) {
      console.error('Password reset error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Update user password
   */
  static async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) {
      console.error('Password update error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Update user metadata
   */
  static async updateUserMetadata(metadata: Record<string, any>) {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });
    
    if (error) {
      console.error('User metadata update error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Generate a magic link for email authentication
   */
  static async signInWithOtp(email: string, options?: {
    emailRedirectTo?: string;
    shouldCreateUser?: boolean;
  }) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options
    });
    
    if (error) {
      console.error('Magic link error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Verify OTP token
   */
  static async verifyOtp(tokenHash: string, token: string, type: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      token,
      type: type as any
    });
    
    if (error) {
      console.error('OTP verification error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Exchange authorization code for session (PKCE flow)
   */
  static async exchangeCodeForSession(code: string) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Code exchange error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Refresh the current session
   */
  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Listen for auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Get current session token
   */
  static async getAccessToken(): Promise<string | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return null;
    return session?.access_token || null;
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const { data: { session }, error } = await supabase.auth.getSession();
    return !!session;
  }

  /**
   * Get user from session
   */
  static async getUserFromSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return session?.user || null;
  }
}

// Database helper functions
export class SupabaseDatabase {
  /**
   * Insert a record into a table
   */
  static async insert<T>(table: string, record: Partial<T>) {
    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Select records from a table
   */
  static async select<T>(table: string, query?: string) {
    const queryBuilder = supabase.from(table).select(query);

    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error(`Error selecting from ${table}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Update a record in a table
   */
  static async update<T>(table: string, id: string, updates: Partial<T>) {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${table}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Delete a record from a table
   */
  static async delete(table: string, id: string) {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Execute a custom function
   */
  static async rpc<T>(functionName: string, params?: Record<string, any>) {
    const { data, error } = await supabase
      .rpc(functionName, params);
    
    if (error) {
      console.error(`Error calling function ${functionName}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }
}

// Real-time subscriptions
export class SupabaseRealtime {
  /**
   * Subscribe to table changes
   */
  static subscribe(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();
  }

  /**
   * Subscribe to auth state changes
   */
  static subscribeToAuth(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback).data.subscription;
  }
}

// Storage helper functions
export class SupabaseStorage {
  /**
   * Upload a file to storage
   */
  static async uploadFile(bucket: string, path: string, file: File, options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);
    
    if (error) {
      console.error('File upload error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Get a signed URL for a file
   */
  static async getSignedUrl(bucket: string, path: string, expiresIn?: number) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    
    if (error) {
      console.error('Signed URL error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(bucket: string, paths: string[]) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    
    if (error) {
      console.error('File deletion error:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  }
}

// Export default client
export default supabase;