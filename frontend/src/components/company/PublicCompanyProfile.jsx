import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useGetCompanyPublicProfile from '@/hooks/useGetCompanyPublicProfile';
import Navbar from '../shared/Navbar';
import Job from '../Job';
import VerificationBadge from '../admin/VerificationBadge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { ExternalLink, Linkedin, MapPin, Building, Users, Briefcase, FileText, Activity, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

const PublicCompanyProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const { company, jobs, stats, loading } = useGetCompanyPublicProfile(id);

    useEffect(() => {
        if (company) {
            document.title = `${company.name} | HireHub`;
        }
        return () => {
            document.title = 'HireHub';
        }
    }, [company]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-foreground">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-foreground">
                <Navbar />
                <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)]">
                    <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
                    <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
                </div>
            </div>
        );
    }

    const isOwner = user?._id === company?.userId;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground">
            <Navbar />
            
            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                
                {/* Hero Section */}
                <div className="relative p-8 rounded-2xl border border-border bg-card shadow-glass mb-8 overflow-hidden">
                    {/* Abstract design elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <Avatar className="w-32 h-32 border-4 border-card shadow-lg bg-white rounded-xl">
                            <AvatarImage src={company.logo} alt={company.name} className="object-contain p-2 rounded-xl" />
                        </Avatar>
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-4xl font-bold capitalize tracking-tight text-foreground">{company.name}</h1>
                                {company.verificationStatus && company.verificationStatus !== "unverified" && (
                                    <VerificationBadge status={company.verificationStatus} />
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-muted-foreground text-sm flex-wrap mt-3">
                                {company.location && (
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {company.location}</span>
                                )}
                                {company.industry && (
                                    <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {company.industry}</span>
                                )}
                                {company.companySize && (
                                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {company.companySize} Employees</span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Activity className="w-4 h-4" /> Joined {format(new Date(company.createdAt), 'MMMM yyyy')}
                                </span>
                            </div>
                        </div>

                        {/* Owner Actions */}
                        {isOwner && (
                            <div className="shrink-0 flex flex-col gap-3">
                                <Button onClick={() => navigate(`/admin/companies/${company._id}`)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                                    Edit Company Profile
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column (Stats & About) */}
                    <div className="lg:col-span-1 space-y-8">
                        
                        {/* Trust & Stats Card */}
                        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Company Overview</h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-secondary/50 p-4 rounded-xl text-center">
                                    <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Trust Score</p>
                                    <p className={`text-2xl font-bold ${company.trustScore >= 80 ? 'text-green-500' : company.trustScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {company.trustScore || 0}
                                    </p>
                                </div>
                                <div className="bg-secondary/50 p-4 rounded-xl text-center">
                                    <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Active Jobs</p>
                                    <p className="text-2xl font-bold text-foreground">{stats?.activeJobs || 0}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground text-sm flex items-center gap-2"><Briefcase className="w-4 h-4" /> Total Jobs Posted</span>
                                    <span className="font-semibold text-foreground">{stats?.totalJobsPosted || 0}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Applications Received</span>
                                    <span className="font-semibold text-foreground">{stats?.totalApplicationsReceived || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* About Card */}
                        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                            <h2 className="text-xl font-bold mb-4">About</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                                {company.description || "No description provided."}
                            </p>
                            
                            <div className="space-y-3">
                                {company.website && (
                                    <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                                        <ExternalLink className="w-4 h-4" /> {company.website}
                                    </a>
                                )}
                                {company.linkedinUrl && (
                                    <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-[#0a66c2] transition-colors">
                                        <Linkedin className="w-4 h-4" /> LinkedIn Profile
                                    </a>
                                )}
                                {company.headquarters && (
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4" /> HQ: {company.headquarters}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Jobs) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Active Jobs</h2>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{jobs.length} Jobs</Badge>
                        </div>
                        
                        {jobs.length === 0 ? (
                            <div className="p-12 text-center rounded-2xl border border-border border-dashed bg-card/50">
                                <h3 className="text-lg font-medium text-foreground mb-2">No active jobs</h3>
                                <p className="text-muted-foreground">This company is not hiring right now.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {jobs.map((job) => (
                                    <Job key={job._id} job={{...job, company}} />
                                ))}
                            </div>
                        )}
                    </div>
                    
                </div>
            </main>
        </div>
    );
};

// Internal Badge component (since I didn't import from ui/badge directly to avoid clutter)
function Badge({ children, className, ...props }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props}>
            {children}
        </span>
    );
}

export default PublicCompanyProfile;
