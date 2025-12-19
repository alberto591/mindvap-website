import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// For this MVP, we'll assume any logged-in user with a specific email or metadata is an admin.
// You can expand this logic later.
const ADMIN_EMAILS = ['albertocalvorivas@gmail.com', 'admin@mindvap.com'];

export default function AdminRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    // Check if user is logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user is authorized (simple email check for now)
    const isAuthorized = user.email && ADMIN_EMAILS.includes(user.email);

    // If you want to bypass this for testing purposes, uncomment the next line temporarily
    // const isAuthorized = true; 

    if (!isAuthorized) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
