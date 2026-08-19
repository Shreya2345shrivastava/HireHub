import React, { useEffect, useState } from 'react';
import useGetAuditLogs from '@/hooks/useGetAuditLogs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Briefcase, Building, CheckCircle, FileText, Search, User, XCircle } from 'lucide-react';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';

const AdminActivityTimeline = () => {
    const { logs, analytics, loading, totalPages, fetchLogs, fetchAnalytics } = useGetAuditLogs();
    
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        role: '',
        action: '',
        search: ''
    });

    useEffect(() => {
        fetchAnalytics();
        fetchLogs(filters, 1, false);
        setPage(1);
    }, [filters, fetchAnalytics, fetchLogs]);

    const handleLoadMore = () => {
        if (page < totalPages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchLogs(filters, nextPage, true);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value === "all" ? "" : value }));
    };

    const getIconForAction = (action) => {
        if (action.includes('JOB')) return <Briefcase className="w-4 h-4 text-blue-500" />;
        if (action.includes('COMPANY')) return <Building className="w-4 h-4 text-purple-500" />;
        if (action.includes('APPLICATION')) return <FileText className="w-4 h-4 text-orange-500" />;
        if (action.includes('USER')) return <User className="w-4 h-4 text-green-500" />;
        if (action.includes('APPROVAL')) return <CheckCircle className="w-4 h-4 text-green-500" />;
        if (action.includes('REJECTION') || action.includes('SUSPENSION')) return <XCircle className="w-4 h-4 text-red-500" />;
        return <Activity className="w-4 h-4 text-gray-500" />;
    };

    const groupedLogs = logs.reduce((acc, log) => {
        const date = new Date(log.createdAt);
        let group = 'Older';
        if (isToday(date)) group = 'Today';
        else if (isYesterday(date)) group = 'Yesterday';
        else if (isThisWeek(date)) group = 'This Week';
        
        if (!acc[group]) acc[group] = [];
        acc[group].push(log);
        return acc;
    }, {});

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-6">Activity Timeline</h1>

            {/* Analytics Summary Cards */}
            {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-center">
                        <p className="text-sm text-muted-foreground font-medium">Total Activities</p>
                        <h2 className="text-2xl font-bold text-foreground mt-1">{analytics.totalActivities}</h2>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-center">
                        <p className="text-sm text-muted-foreground font-medium">Jobs Created</p>
                        <h2 className="text-2xl font-bold text-foreground mt-1">{analytics.jobsCreated}</h2>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-center">
                        <p className="text-sm text-muted-foreground font-medium">Applications</p>
                        <h2 className="text-2xl font-bold text-foreground mt-1">{analytics.appsSubmitted}</h2>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-center">
                        <p className="text-sm text-muted-foreground font-medium">Cos. Approved</p>
                        <h2 className="text-2xl font-bold text-green-500 mt-1">{analytics.companiesApproved}</h2>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-center">
                        <p className="text-sm text-muted-foreground font-medium">Cos. Rejected</p>
                        <h2 className="text-2xl font-bold text-red-500 mt-1">{analytics.companiesRejected}</h2>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search logs..." 
                        className="pl-9"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <Select onValueChange={(val) => handleFilterChange('role', val)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <Select onValueChange={(val) => handleFilterChange('action', val)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by Action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="JOB_CREATED">Jobs Created</SelectItem>
                        <SelectItem value="COMPANY_CREATED">Companies Created</SelectItem>
                        <SelectItem value="APPLICATION_SUBMITTED">Applications</SelectItem>
                        <SelectItem value="ADMIN_APPROVAL">Approvals</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Timeline */}
            <div className="space-y-8">
                {Object.keys(groupedLogs).length === 0 && !loading && (
                    <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-border border-dashed">
                        No activity found matching your filters.
                    </div>
                )}
                
                {['Today', 'Yesterday', 'This Week', 'Older'].map((group) => (
                    groupedLogs[group] && groupedLogs[group].length > 0 && (
                        <div key={group}>
                            <h3 className="text-lg font-semibold text-foreground mb-4 sticky top-16 bg-background/80 backdrop-blur-md py-2 z-10">
                                {group}
                            </h3>
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                {groupedLogs[group].map((log) => (
                                    <div key={log._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                                            {getIconForAction(log.action)}
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition duration-200">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-foreground text-sm flex items-center gap-2">
                                                    {log.actor?.fullname || "Unknown User"}
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground uppercase font-semibold">
                                                        {log.actorRole}
                                                    </span>
                                                </div>
                                                <time className="text-xs font-medium text-muted-foreground">
                                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                </time>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {log.description}
                                            </div>
                                            {log.ipAddress && (
                                                <div className="text-[10px] text-muted-foreground/50 mt-2 font-mono">
                                                    IP: {log.ipAddress}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
                
                {loading && (
                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                )}
                
                {page < totalPages && !loading && (
                    <div className="flex justify-center mt-8">
                        <Button variant="outline" onClick={handleLoadMore}>
                            Load More
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminActivityTimeline;
