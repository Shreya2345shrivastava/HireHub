import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import Navbar from './shared/Navbar';
import { Loader2, MapPin, Building, Users, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import VerificationBadge from './admin/VerificationBadge';

const PublicCareerPage = () => {
    const { slug } = useParams();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCareerPage = async () => {
            try {
                const res = await axiosInstance.get(`${COMPANY_API_END_POINT}/h/${slug}`);
                if (res.data.success) {
                    setCompany(res.data.company);
                    setJobs(res.data.jobs);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCareerPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <Navbar />
                <h1 className="text-3xl font-bold mt-10">404 - Career Page Not Found</h1>
                <p className="text-muted-foreground mt-2">The page you are looking for does not exist.</p>
                <Link to="/" className="mt-4"><Button>Go Home</Button></Link>
            </div>
        );
    }

    const { customCareerPage } = company;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            {/* Hero Section */}
            <div className="relative w-full h-[400px] bg-secondary flex items-end justify-center pb-10"
                 style={{ 
                     backgroundImage: customCareerPage?.banner ? `url(${customCareerPage.banner})` : 'none',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center'
                 }}
            >
                {/* Overlay */}
                {customCareerPage?.banner && <div className="absolute inset-0 bg-black/50 z-0"></div>}
                
                <div className="relative z-10 text-center flex flex-col items-center max-w-4xl px-4">
                    {company.logo && (
                        <div className="w-24 h-24 bg-white rounded-xl p-2 shadow-lg mb-6 flex items-center justify-center overflow-hidden">
                            <img src={company.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                    )}
                    <h1 className={`text-4xl md:text-6xl font-extrabold ${customCareerPage?.banner ? 'text-white' : 'text-foreground'} tracking-tight mb-4`}>
                        Careers at {company.name}
                        {company.verificationStatus && company.verificationStatus !== 'unverified' && (
                            <VerificationBadge status={company.verificationStatus} className="ml-3" />
                        )}
                    </h1>
                    <p className={`text-lg md:text-xl ${customCareerPage?.banner ? 'text-gray-200' : 'text-muted-foreground'} max-w-2xl`}>
                        {company.description || "Join our team and build the future with us."}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Left Column: About & Culture */}
                <div className="lg:col-span-2 space-y-12">
                    {customCareerPage?.aboutUs && (
                        <section>
                            <h2 className="text-3xl font-bold mb-6 text-foreground">About Us</h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap font-serif">
                                {customCareerPage.aboutUs}
                            </div>
                        </section>
                    )}

                    {customCareerPage?.culture && (
                        <section>
                            <h2 className="text-3xl font-bold mb-6 text-foreground">Our Culture</h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap font-serif">
                                {customCareerPage.culture}
                            </div>
                        </section>
                    )}

                    {/* Open Positions */}
                    <section id="jobs" className="pt-10">
                        <h2 className="text-3xl font-bold mb-8 text-foreground">Open Positions <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">{jobs.length}</Badge></h2>
                        
                        {jobs.length === 0 ? (
                            <div className="bg-card border border-border rounded-xl p-10 text-center">
                                <p className="text-muted-foreground">There are currently no open positions. Check back later!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {jobs.map((job) => (
                                    <div key={job._id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location}</span>
                                                <span className="flex items-center"><Building className="w-4 h-4 mr-1" /> {job.jobType}</span>
                                            </div>
                                        </div>
                                        <Link to={`/description/${job._id}`}>
                                            <Button className="whitespace-nowrap">View Job <ExternalLink className="w-4 h-4 ml-2" /></Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Details & Benefits */}
                <div className="space-y-8">
                    {/* Quick Facts */}
                    <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
                        <h3 className="font-bold text-lg mb-4">Quick Facts</h3>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            {company.industry && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-foreground">Industry</span>
                                    <span>{company.industry}</span>
                                </div>
                            )}
                            {company.companySize && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-foreground">Company Size</span>
                                    <span>{company.companySize} employees</span>
                                </div>
                            )}
                            {company.headquarters && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-foreground">Headquarters</span>
                                    <span>{company.headquarters}</span>
                                </div>
                            )}
                            {company.website && (
                                <div className="flex justify-between">
                                    <span className="font-medium text-foreground">Website</span>
                                    <a href={company.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{company.website.replace(/^https?:\/\//, '')}</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Benefits */}
                    {customCareerPage?.benefits && customCareerPage.benefits.length > 0 && (
                        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Perks & Benefits</h3>
                            <ul className="space-y-3">
                                {customCareerPage.benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-start text-muted-foreground text-sm">
                                        <div className="bg-green-500/10 p-1 rounded-full mr-3 mt-0.5">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PublicCareerPage;
