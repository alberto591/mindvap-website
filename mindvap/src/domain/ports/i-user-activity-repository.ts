export interface UserActivity {
    id: string;
    user_id: string;
    activity_type: 'login' | 'logout' | 'order_placed' | 'profile_updated' | 'address_added' | 'wishlist_updated' | 'password_changed';
    description: string;
    metadata?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

export interface CreateUserActivityRequest {
    userId: string;
    activityType: UserActivity['activity_type'];
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

export interface GetUserActivityRequest {
    userId: string;
    limit?: number;
    offset?: number;
    activityTypes?: UserActivity['activity_type'][];
    startDate?: string;
    endDate?: string;
}

/**
 * User Activity Repository - Focused on activity tracking only (ISP)
 */
export interface IUserActivityRepository {
    getUserActivity(request: GetUserActivityRequest): Promise<UserActivity[]>;
    logActivity(activity: CreateUserActivityRequest): Promise<UserActivity>;
    getActivityCount(userId: string): Promise<number>;
    deleteOldActivities(userId: string, olderThanDays: number): Promise<void>;
}
