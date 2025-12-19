import { Activity, Users, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div>
            <h2 className="font-headline text-2xl font-semibold text-text-primary mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-border-light">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">System Status</p>
                            <h3 className="text-xl font-bold text-text-primary">Operational</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-border-light">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Active Agents</p>
                            <h3 className="text-xl font-bold text-text-primary">1 Idle</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-border-light">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Pending Alerts</p>
                            <h3 className="text-xl font-bold text-text-primary">0</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-border-light p-8 text-center text-text-secondary">
                <p>Welcome to the MindVap Admin Panel. Select a tool from the sidebar to get started.</p>
            </div>
        </div>
    );
}
