import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Scale, FlaskConical, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';

export default function AdminLayout() {
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-background-primary shadow-md flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-border-light">
                    <h1 className="font-headline text-xl font-bold text-brand-primary">MindVap Admin</h1>
                    <p className="text-xs text-text-muted mt-1">Back Office</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        to="/admin"
                        className={`flex items - center gap - 3 px - 4 py - 3 rounded - md transition - colors ${isActive('/admin')
                            ? 'bg-brand-primary text-white'
                            : 'text-text-secondary hover:bg-background-accent'
                            } `}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link
                        to="/admin/sourcing"
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/sourcing')
                            ? 'bg-brand-primary text-white'
                            : 'text-text-secondary hover:bg-background-accent'
                            }`}
                    >
                        <ShoppingBag size={20} />
                        AI Sourcing Agent
                    </Link>
                    <Link
                        to="/admin/legal"
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/legal')
                            ? 'bg-brand-primary text-white'
                            : 'text-text-secondary hover:bg-background-accent'
                            }`}
                    >
                        <Scale size={20} />
                        Legal Research
                    </Link>
                    <Link
                        to="/admin/formulation"
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/formulation')
                            ? 'bg-brand-primary text-white'
                            : 'text-text-secondary hover:bg-background-accent'
                            }`}
                    >
                        <FlaskConical size={20} />
                        Formulation Lab
                    </Link>
                    <div className="my-2 border-t border-border-light"></div>
                    <Link
                        to="/admin/tutorials"
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/tutorials')
                            ? 'bg-brand-primary text-white'
                            : 'text-text-secondary hover:bg-background-accent'
                            }`}
                    >
                        <BookOpen size={20} />
                        Help & Tutorials
                    </Link>
                    <Link
                        to="/admin/settings"
                        className={`flex items - center gap - 3 px - 4 py - 3 rounded - md transition - colors ${isActive('/admin/settings')
                            ? 'bg-brand-primary text-white'
                            : 'text-text-secondary hover:bg-background-accent'
                            } `}
                    >
                        <Settings size={20} />
                        Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-border-light">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
