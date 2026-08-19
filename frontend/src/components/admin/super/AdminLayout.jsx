import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import Navbar from '../../shared/Navbar'
import { Building2, LayoutDashboard, Settings, Users, Briefcase, Activity } from 'lucide-react'

const AdminLayout = () => {
    const location = useLocation();

    const sidebarLinks = [
        { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin/dashboard' },
        { name: 'Companies', icon: <Building2 className="w-5 h-5" />, path: '/admin/companies' },
        { name: 'Users', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
        { name: 'Jobs', icon: <Briefcase className="w-5 h-5" />, path: '/admin/jobs' },
        { name: 'Activity', icon: <Activity className="w-5 h-5" />, path: '/admin/activity' },
        { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground">
            <Navbar />
            <div className="flex h-[calc(100vh-4rem)] pt-4">
                {/* Sidebar */}
                <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl h-full flex flex-col px-4 py-6 rounded-tr-2xl">
                    <div className="mb-8 px-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Super Admin</p>
                        <h2 className="text-xl font-bold mt-1">Workspace</h2>
                    </div>
                    <nav className="flex-1 space-y-2">
                        {sidebarLinks.map((link) => {
                            const isActive = location.pathname.startsWith(link.path);
                            return (
                                <Link 
                                    key={link.name} 
                                    to={link.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                        isActive 
                                            ? 'bg-primary text-primary-foreground shadow-glow' 
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                                >
                                    {link.icon}
                                    <span className="font-medium">{link.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {/* Ambient Glow */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                    
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
