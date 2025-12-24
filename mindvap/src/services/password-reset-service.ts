// Password Reset Service
// Handles password reset functionality and email notifications

import { supabase } from '../lib/supabase';
import { log } from '../lib/logger';
import { User } from '../types/auth';
import { sendAuthEmail } from './auth-email-service';

export interface PasswordResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
}

export class PasswordResetService {
  private static readonly TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
  private static readonly TOKEN_LENGTH = 32;

  /**
   * Generate a secure password reset token
   */
  static generateResetToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash the reset token for storage
   */
  static async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Request password reset for user
   */
  static async requestPasswordReset(email: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('email', email.toLowerCase())
        .eq('status', 'active')
        .single();

      if (userError || !user) {
        // Don't reveal whether email exists - return generic success message
        return {
          success: true,
          message: 'If an account with that email exists, we\'ve sent a password reset link.'
        };
      }

      // Check for existing recent reset requests
      const { data: recentRequests } = await supabase
        .from('password_reset_tokens')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentRequests && recentRequests.length > 0) {
        return {
          success: false,
          message: 'A password reset has already been requested recently. Please wait before requesting another.',
          error: 'RATE_LIMITED'
        };
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      const tokenHash = await this.hashToken(resetToken);
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY);

      // Store token in database
      const { error: insertError } = await supabase
        .from('password_reset_tokens')
        .insert({
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
          ip_address: 'unknown', // Would be set by backend
          created_at: new Date().toISOString()
        });

      if (insertError) {
        log.error('Failed to store reset token', insertError, { userId: user.id });
        return {
          success: false,
          message: 'An error occurred. Please try again later.',
          error: 'DATABASE_ERROR'
        };
      }

      // Generate reset URL
      const resetUrl = `${window.location.origin}/login?token=${resetToken}&type=recovery`;

      // Send password reset email
      try {
        const emailSent = await sendAuthEmail({
          toEmail: user.email,
          toName: `${user.first_name} ${user.last_name}`,
          templateType: 'password_reset',
          templateParams: {
            reset_link: resetUrl,
            first_name: user.first_name,
            expires_in: '1 hour',
            user_agent: navigator.userAgent,
            request_time: new Date().toLocaleString()
          }
        });

        if (!emailSent) {
          log.warn('Failed to send password reset email, but proceeding', { userId: user.id });
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the whole process if email fails
      }

      return {
        success: true,
        message: 'If an account with that email exists, we\'ve sent a password reset link.'
      };

    } catch (error) {
      log.error('Password reset request failed', error, { email });
      return {
        success: false,
        message: 'An error occurred. Please try again later.',
        error: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Verify password reset token
   */
  static async verifyResetToken(token: string): Promise<{
    valid: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      // Hash the provided token
      const tokenHash = await this.hashToken(token);

      // Find valid token
      const { data: resetToken, error } = await supabase
        .from('password_reset_tokens')
        .select(`
          *,
          users (
            id,
            email,
            first_name,
            last_name,
            status
          )
        `)
        .eq('token_hash', tokenHash)
        .eq('used_at', null)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !resetToken) {
        return {
          valid: false,
          error: 'Invalid or expired reset token'
        };
      }

      if (resetToken.users.status !== 'active') {
        return {
          valid: false,
          error: 'Account is not active'
        };
      }

      return {
        valid: true,
        user: resetToken.users
      };

    } catch (error) {
      log.error('Token verification failed', error);
      return {
        valid: false,
        error: 'Token verification failed'
      };
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      // Verify token
      const tokenValidation = await this.verifyResetToken(token);
      if (!tokenValidation.valid || !tokenValidation.user) {
        return {
          success: false,
          message: 'Invalid or expired reset token',
          error: 'INVALID_TOKEN'
        };
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters long',
          error: 'WEAK_PASSWORD'
        };
      }

      // Update user password using Supabase Auth
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        tokenValidation.user.id,
        { password: newPassword }
      );

      if (updateError) {
        log.error('Password update failed', updateError, { userId: tokenValidation.user.id });
        return {
          success: false,
          message: 'Failed to update password. Please try again.',
          error: 'UPDATE_FAILED'
        };
      }

      // Mark token as used
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .update({
          used_at: new Date().toISOString()
        })
        .eq('token_hash', await this.hashToken(token))
        .eq('user_id', tokenValidation.user.id);

      if (tokenError) {
        log.warn('Failed to mark token as used', { error: tokenError, userId: tokenValidation.user.id });
      }

      // Clean up any other active tokens for this user
      await supabase
        .from('password_reset_tokens')
        .update({
          used_at: new Date().toISOString()
        })
        .eq('user_id', tokenValidation.user.id)
        .eq('used_at', null);

      return {
        success: true,
        message: 'Password has been successfully reset. You can now log in with your new password.'
      };

    } catch (error) {
      log.error('Password reset failed', error);
      return {
        success: false,
        message: 'An error occurred. Please try again later.',
        error: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Clean up expired reset tokens
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const { error, count } = await supabase
        .from('password_reset_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        log.error('Failed to cleanup expired tokens', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      log.error('Token cleanup failed', error);
      return 0;
    }
  }

  /**
   * Get password reset statistics (for admin)
   */
  static async getResetStats(): Promise<{
    totalRequests: number;
    successfulResets: number;
    recentRequests: number;
  }> {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Total requests (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { count: totalRequests } = await supabase
        .from('password_reset_tokens')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Successful resets
      const { count: successfulResets } = await supabase
        .from('password_reset_tokens')
        .select('*', { count: 'exact', head: true })
        .not('used_at', 'is', null)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Recent requests (last 24 hours)
      const { count: recentRequests } = await supabase
        .from('password_reset_tokens')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', last24Hours.toISOString());

      return {
        totalRequests: totalRequests || 0,
        successfulResets: successfulResets || 0,
        recentRequests: recentRequests || 0
      };
    } catch (error) {
      log.error('Failed to get reset stats', error);
      return {
        totalRequests: 0,
        successfulResets: 0,
        recentRequests: 0
      };
    }
  }
}

export default PasswordResetService;