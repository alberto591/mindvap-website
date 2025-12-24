
import { supabase } from '../../infrastructure/lib/supabase';
import { log } from '../../infrastructure/lib/logger';
import { GetUserActivityRequest, GetUserActivityResponse } from '../../domain/entities/auth';

/**
 * SRP: Handles user activity tracking and retrieval
 */
export class UserActivityService {
    static async getUserActivity(request: GetUserActivityRequest = {}): Promise<GetUserActivityResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated', activities: [] };
            }

            const limit = request.limit || 10;

            let query = supabase
                .from('user_activities')
                .select('*')
                .eq('user_id', user.id);

            if (request.type) {
                query = query.eq('type', request.type);
            }

            if (request.since) {
                query = query.gte('created_at', request.since);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return { success: true, activities: data || [] };
        } catch (error) {
            log.error('Get user activity error', error, { request });
            return { success: false, message: 'Failed to retrieve user activity', activities: [] };
        }
    }
}
