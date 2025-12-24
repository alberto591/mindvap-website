
import { supabase } from '../../infrastructure/lib/supabase';
import { log } from '../../infrastructure/lib/logger';
import { GetDashboardStatsResponse, DashboardStats } from '../../domain/entities/auth';

/**
 * SRP: Orchestrates statistics for the account dashboard
 */
export class AccountDashboardService {
    static async getDashboardStats(): Promise<GetDashboardStatsResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated' };
            }

            // Get basic stats
            const [ordersResult, wishlistResult, activityResult] = await Promise.all([
                supabase
                    .from('orders')
                    .select('id, total_amount, created_at, status')
                    .eq('user_id', user.id),
                supabase
                    .from('user_wishlist')
                    .select('id')
                    .eq('user_id', user.id),
                supabase
                    .from('user_activities')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5)
            ]);

            const orders = ordersResult.data || [];
            const wishlistCount = wishlistResult.data?.length || 0;
            const recentActivity = activityResult.data || [];

            const totalSpent = orders
                .filter(order => ['delivered', 'shipped', 'completed'].includes(order.status))
                .reduce((sum, order) => sum + (order.total_amount || 0), 0);

            const lastOrder = orders
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

            const stats: DashboardStats = {
                totalOrders: orders.length,
                totalSpent,
                wishlistCount,
                lastOrderDate: lastOrder?.created_at,
                emailVerified: user.user_metadata?.email_verified || false,
                ageVerified: user.user_metadata?.age_verified || false,
                recentActivity
            };

            return { success: true, stats };
        } catch (error) {
            log.error('Get dashboard stats error', error);
            return { success: false, message: 'Failed to retrieve dashboard stats' };
        }
    }
}
