import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import axiosInstance from '@/api/axiosInstance';
import { INTERVIEW_API_END_POINT, AI_API_END_POINT } from '@/utils/constant';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MapPin, ExternalLink, ArrowLeft, Building, User, Bot, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useSelector } from 'react-redux';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const InterviewDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const [feedback, setFeedback] = useState({
        rating: 3,
        recommendation: 'Consider',
        comments: ''
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axiosInstance.get(`${INTERVIEW_API_END_POINT}/${id}`);
                if (res.data.success) {
                    setInterview(res.data.interview);
                }
            } catch (error) {
                console.error("Failed to fetch interview details", error);
                toast.error(error.response?.data?.message || "Failed to load");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleFeedbackSubmit = async () => {
        try {
            const res = await axiosInstance.post(`${INTERVIEW_API_END_POINT}/${id}/feedback`, feedback);
            if (res.data.success) {
                toast.success("Feedback submitted!");
                setInterview(res.data.interview);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit feedback");
        }
    };

    const handleStatusUpdate = async (status) => {
        try {
            const res = await axiosInstance.put(`${INTERVIEW_API_END_POINT}/${id}/status`, { status });
            if (res.data.success) {
                toast.success("Status updated!");
                setInterview(res.data.interview);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const generateAIPrep = async () => {
        setIsGeneratingAI(true);
        try {
            const res = await axiosInstance.post(`${AI_API_END_POINT}/generate-interview-prep/${id}`);
            if (res.data.success) {
                toast.success("AI Prep Sheet Generated!");
                setInterview({...interview, aiPrepSheet: res.data.aiPrepSheet});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate AI Prep Sheet");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
    if (!interview) return <div className="min-h-screen bg-background flex items-center justify-center">Interview not found</div>;

    const isRecruiter = user?.role === 'recruiter';

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
                <button onClick={() => navigate(-1)} className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>

                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-8 border-b border-border bg-secondary/30 relative">
                        <div className="absolute top-8 right-8">
                            <Badge variant="outline" className={`px-3 py-1 ${
                                interview.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                interview.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                                {interview.status}
                            </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-background rounded-xl flex items-center justify-center border border-border overflow-hidden">
                                {interview.jobId?.company?.logo ? (
                                    <img src={interview.jobId.company.logo} alt="logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Building className="w-10 h-10 text-muted-foreground" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{interview.jobId?.title}</h1>
                                <p className="text-lg text-primary font-medium mt-1">{interview.jobId?.company?.name}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary">{interview.roundName}</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Time & Location */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Interview Schedule</h3>
                                <div className="space-y-4 bg-background p-4 rounded-xl border border-border">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-medium text-foreground">{interview.interviewDate}</p>
                                            <p className="text-sm text-muted-foreground">Date</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-medium text-foreground">{interview.interviewTime}</p>
                                            <p className="text-sm text-muted-foreground">Duration: {interview.duration || 'TBD'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Location & Link</h3>
                                <div className="space-y-4 bg-background p-4 rounded-xl border border-border">
                                    {interview.interviewType === 'Online' ? (
                                        <div className="flex items-start gap-3">
                                            <Video className="w-5 h-5 text-green-500 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground">Virtual Meeting</p>
                                                {interview.meetingLink ? (
                                                    <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center mt-1">
                                                        Join Meeting <ExternalLink className="w-3 h-3 ml-1" />
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground mt-1">Link will be provided soon.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-foreground">In-Person</p>
                                                <p className="text-sm text-muted-foreground mt-1">{interview.location || 'Location TBD'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Notes & Recruiter Area */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Instructions / Notes</h3>
                                <div className="bg-secondary/30 p-4 rounded-xl border border-border text-sm text-foreground whitespace-pre-wrap min-h-[100px]">
                                    {interview.notes || 'No specific instructions provided.'}
                                </div>
                            </div>

                            {isRecruiter && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Candidate Information</h3>
                                    <div className="flex items-center gap-3 bg-background p-4 rounded-xl border border-border">
                                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                                            {interview.candidateId?.profile?.profilePhoto ? (
                                                <img src={interview.candidateId.profile.profilePhoto} alt="candidate" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{interview.candidateId?.fullname}</p>
                                            <p className="text-sm text-muted-foreground">{interview.candidateId?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Interview Prep Area */}
                    {isRecruiter && (
                        <div className="p-8 border-t border-border bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-glow">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">AI Interview Assistant</h2>
                                        <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
                                    </div>
                                </div>
                                {!interview.aiPrepSheet && (
                                    <Button 
                                        onClick={generateAIPrep} 
                                        disabled={isGeneratingAI}
                                        className="bg-indigo-600 hover:bg-indigo-700 shadow-glow text-white"
                                    >
                                        {isGeneratingAI ? 'Analyzing Profile...' : <><Sparkles className="w-4 h-4 mr-2" /> Generate Prep Sheet</>}
                                    </Button>
                                )}
                            </div>

                            {interview.aiPrepSheet && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                                            <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider mb-3">Key Strengths</h3>
                                            <ul className="space-y-2">
                                                {interview.aiPrepSheet.strengths?.map((s, i) => (
                                                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                                        <span className="text-green-500 mt-0.5">•</span> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                                            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">Potential Weaknesses</h3>
                                            <ul className="space-y-2">
                                                {interview.aiPrepSheet.weaknesses?.map((w, i) => (
                                                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                                        <span className="text-orange-500 mt-0.5">•</span> {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-background p-5 rounded-xl border border-border shadow-sm h-full">
                                            <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-3">Suggested Questions</h3>
                                            <ul className="space-y-3">
                                                {interview.aiPrepSheet.suggestedQuestions?.map((q, i) => (
                                                    <li key={i} className="text-sm text-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
                                                        <span className="font-semibold text-indigo-400 mr-2">Q{i+1}:</span> {q}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-6 pt-4 border-t border-border/50">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Initial AI Recommendation</h4>
                                                <p className="text-sm font-medium text-foreground">{interview.aiPrepSheet.hiringRecommendation}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recruiter Feedback Area */}
                    {isRecruiter && (
                        <div className="p-8 border-t border-border bg-secondary/10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-foreground">Recruiter Feedback</h2>
                                {interview.status === 'Scheduled' && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('No Show')}>Mark No Show</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate('Cancelled')}>Cancel</Button>
                                    </div>
                                )}
                            </div>

                            {interview.feedback?.recommendation ? (
                                <div className="bg-background p-6 rounded-xl border border-border">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Badge className={
                                            interview.feedback.recommendation === 'Strong Hire' ? 'bg-green-500' :
                                            interview.feedback.recommendation === 'Reject' ? 'bg-red-500' : 'bg-yellow-500'
                                        }>
                                            {interview.feedback.recommendation}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">Rating: {interview.feedback.rating}/5</span>
                                    </div>
                                    <p className="text-foreground whitespace-pre-wrap">{interview.feedback.comments}</p>
                                </div>
                            ) : (
                                <div className="space-y-4 bg-background p-6 rounded-xl border border-border shadow-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Recommendation</Label>
                                            <Select value={feedback.recommendation} onValueChange={(v) => setFeedback({...feedback, recommendation: v})}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Strong Hire">Strong Hire</SelectItem>
                                                    <SelectItem value="Consider">Consider</SelectItem>
                                                    <SelectItem value="Reject">Reject</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Rating (1-5)</Label>
                                            <Select value={feedback.rating.toString()} onValueChange={(v) => setFeedback({...feedback, rating: Number(v)})}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[1,2,3,4,5].map(n => (
                                                        <SelectItem key={n} value={n.toString()}>{n} Star{n>1?'s':''}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Feedback Comments</Label>
                                        <Textarea 
                                            placeholder="Write detailed feedback about the candidate's performance..."
                                            value={feedback.comments}
                                            onChange={(e) => setFeedback({...feedback, comments: e.target.value})}
                                            className="min-h-[120px]"
                                        />
                                    </div>
                                    <Button onClick={handleFeedbackSubmit} className="w-full">Submit Feedback & Mark Completed</Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewDetails;
