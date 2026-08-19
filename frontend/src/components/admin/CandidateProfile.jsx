import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import axiosInstance from '@/api/axiosInstance';
import { APPLICATION_API_END_POINT, INTERVIEW_API_END_POINT } from '@/utils/constant';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Github, Linkedin, ExternalLink, Mail, Phone, MapPin, Calendar, Briefcase, Award, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const CandidateProfile = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [interviewDetails, setInterviewDetails] = useState({ date: '', time: '', link: '', notes: '' });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axiosInstance.get(`${APPLICATION_API_END_POINT}/details/${applicationId}`);
                if (res.data.success) {
                    setApplication(res.data.application);
                }
            } catch (error) {
                console.error("Failed to fetch candidate details", error);
                toast.error(error.response?.data?.message || "Failed to load candidate profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [applicationId]);

    const handleStatusUpdate = async (status) => {
        try {
            const res = await axiosInstance.post(`${APPLICATION_API_END_POINT}/status/${applicationId}/update`, { status });
            if (res.data.success) {
                toast.success(`Candidate moved to ${status.replace('_', ' ')}`);
                setApplication({ ...application, status });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleInterviewSchedule = async () => {
        try {
            const payload = {
                applicationId,
                roundName: 'Technical Round',
                interviewType: 'Online',
                interviewDate: interviewDetails.date,
                interviewTime: interviewDetails.time,
                duration: '45 mins',
                meetingLink: interviewDetails.link,
                notes: interviewDetails.notes
            };

            const res = await axiosInstance.post(`${INTERVIEW_API_END_POINT}/schedule`, payload);
            if (res.data.success) {
                toast.success("Interview scheduled successfully!");
                setApplication({ ...application, status: 'interview_scheduled' });
                setIsInterviewModalOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to schedule interview");
        }
    };

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading candidate profile...</div>;
    if (!application) return <div className="min-h-screen bg-background flex items-center justify-center">Candidate not found.</div>;

    const applicant = application.applicant;
    const profile = applicant?.profile || {};
    const parsedData = profile.parsedResumeData || {};
    const links = parsedData.links || {};

    const getMatchScoreColor = (score) => {
        if (score >= 80) return "text-green-500 bg-green-500/10 border-green-500/20";
        if (score >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
        return "text-red-500 bg-red-500/10 border-red-500/20";
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 pt-24">
                <button onClick={() => navigate(-1)} className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Board
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile & Actions */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-4 border-background shadow-md mb-4 flex items-center justify-center">
                                {profile.profilePhoto ? (
                                    <img src={profile.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-muted-foreground">{applicant.fullname.charAt(0)}</span>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-foreground">{applicant.fullname}</h1>
                            <p className="text-muted-foreground mt-1 mb-4">{application.job?.title}</p>

                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {links.github && (
                                    <a href={links.github} target="_blank" rel="noreferrer" className="p-2 bg-secondary rounded-full text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                                        <Github className="w-5 h-5" />
                                    </a>
                                )}
                                {links.linkedin && (
                                    <a href={links.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-secondary rounded-full text-foreground hover:bg-blue-600 hover:text-white transition-colors">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                )}
                                {links.portfolio && (
                                    <a href={links.portfolio} target="_blank" rel="noreferrer" className="p-2 bg-secondary rounded-full text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                            </div>

                            <div className="w-full space-y-3 text-sm text-left border-t border-border pt-4">
                                <div className="flex items-center text-muted-foreground">
                                    <Mail className="w-4 h-4 mr-3" /> {applicant.email}
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <Phone className="w-4 h-4 mr-3" /> {applicant.phoneNumber}
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-3" /> {profile.location || 'Location Not Provided'}
                                </div>
                            </div>
                        </div>

                        {/* Recruiter Actions */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-foreground mb-4">Recruiter Actions</h3>
                            <div className="space-y-3">
                                <Badge variant="outline" className="w-full justify-center py-2 text-sm bg-secondary border-border mb-2 uppercase tracking-wide">
                                    Current Status: {application.status.replace('_', ' ')}
                                </Badge>
                                <Button onClick={() => handleStatusUpdate('shortlisted')} className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Shortlist Candidate
                                </Button>
                                {/* Interview Action Button */}
                                {application.interviews && application.interviews.length > 0 ? (
                                    <Button onClick={() => navigate(`/interviews/${application.interviews[application.interviews.length - 1]._id}`)} className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <Calendar className="w-4 h-4 mr-2" /> View Interview Details
                                    </Button>
                                ) : (
                                    <Button onClick={() => setIsInterviewModalOpen(true)} className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                                    </Button>
                                )}
                                <Button onClick={() => handleStatusUpdate('rejected')} variant="destructive" className="w-full justify-start">
                                    <XCircle className="w-4 h-4 mr-2" /> Reject Candidate
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Resume & AI Insights */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* AI Match Score Card */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="text-primary">✦</span> AI Recruitment Insights
                                </h3>
                                <p className="text-muted-foreground mt-1">Automated analysis of candidate fit for this role.</p>
                            </div>
                            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-inner ${getMatchScoreColor(application.matchScore || 0)}`}>
                                <div className="text-center">
                                    <span className="text-2xl font-bold block leading-none">{application.matchScore || 0}%</span>
                                    <span className="text-[10px] uppercase tracking-wider font-bold">Match</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Summary */}
                        {application.aiSummary && (
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                <h4 className="font-semibold text-primary mb-2 flex items-center"><Award className="w-4 h-4 mr-2" /> Match Justification</h4>
                                <p className="text-sm text-foreground leading-relaxed italic">"{application.aiSummary}"</p>
                            </div>
                        )}

                        {/* Resume Actions */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-foreground">Resume & Documents</h3>
                                <div className="flex gap-3">
                                    {profile.resume ? (
                                        <>
                                            <a href={profile.resume} target="_blank" rel="noreferrer">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4 mr-2" /> View Resume
                                                </Button>
                                            </a>
                                            <a href={profile.resume} download>
                                                <Button size="sm">
                                                    <Download className="w-4 h-4 mr-2" /> Download
                                                </Button>
                                            </a>
                                        </>
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">No resume uploaded</span>
                                    )}
                                </div>
                            </div>

                            {/* Extracted Data Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                <div className="flex flex-col">
                                    <h4 className="font-semibold text-foreground mb-3 flex items-center"><Briefcase className="w-4 h-4 mr-2 text-primary" /> Experience</h4>
                                    <div className="bg-secondary/50 p-4 rounded-xl flex-1 flex items-center">
                                        <div>
                                            <span className="text-3xl font-bold text-foreground">{parsedData.experienceYears || 0}</span>
                                            <span className="text-muted-foreground ml-2">Years</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-semibold text-foreground mb-3 flex items-center"><Award className="w-4 h-4 mr-2 text-primary" /> Education</h4>
                                    <div className="bg-secondary/50 p-4 rounded-xl flex-1 flex items-center">
                                        <span className="font-medium text-foreground">{parsedData.education || 'Not extracted'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-foreground mb-4">Skills & Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {parsedData.extractedSkills && parsedData.extractedSkills.length > 0 ? (
                                    parsedData.extractedSkills.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-sm">No skills extracted.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Interview Modal */}
            <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Schedule Interview</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                className="col-span-3"
                                value={interviewDetails.date}
                                onChange={(e) => setInterviewDetails({...interviewDetails, date: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">Time</Label>
                            <Input
                                id="time"
                                type="time"
                                className="col-span-3"
                                value={interviewDetails.time}
                                onChange={(e) => setInterviewDetails({...interviewDetails, time: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="link" className="text-right">Link</Label>
                            <Input
                                id="link"
                                type="url"
                                placeholder="https://zoom.us/j/..."
                                className="col-span-3"
                                value={interviewDetails.link}
                                onChange={(e) => setInterviewDetails({...interviewDetails, link: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="notes" className="text-right mt-2">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Specific instructions for the candidate..."
                                className="col-span-3"
                                value={interviewDetails.notes}
                                onChange={(e) => setInterviewDetails({...interviewDetails, notes: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInterviewModalOpen(false)}>Cancel</Button>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleInterviewSchedule}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CandidateProfile;
