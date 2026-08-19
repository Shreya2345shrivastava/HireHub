import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bot, Sparkles, Target, AlertTriangle, FileText, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { AI_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const StudentAIDashboard = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    
    const [loadingCareer, setLoadingCareer] = useState(false);
    const [loadingResume, setLoadingResume] = useState(false);

    const careerProfile = user?.profile?.aiCareerProfile;
    const resumeOptimizer = user?.profile?.aiResumeOptimizer;

    const handleAnalyzeCareer = async () => {
        try {
            setLoadingCareer(true);
            const res = await axiosInstance.post(`${AI_API_END_POINT}/career-intelligence`);
            if (res.data.success) {
                const updatedUser = { ...user, profile: { ...user.profile, aiCareerProfile: res.data.aiCareerProfile } };
                dispatch(setUser({ user: updatedUser }));
                toast.success("Career Intelligence report generated!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to analyze career. Please upload and parse resume first.");
        } finally {
            setLoadingCareer(false);
        }
    };

    const handleOptimizeResume = async () => {
        try {
            setLoadingResume(true);
            const res = await axiosInstance.post(`${AI_API_END_POINT}/resume-optimizer`);
            if (res.data.success) {
                const updatedUser = { ...user, profile: { ...user.profile, aiResumeOptimizer: res.data.aiResumeOptimizer } };
                dispatch(setUser({ user: updatedUser }));
                toast.success("Resume Optimization report generated!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to analyze resume. Please upload and parse resume first.");
        } finally {
            setLoadingResume(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            {/* Career Intelligence Panel */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-glass backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-500"></div>
                
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
                            <Target className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-card-foreground">Career Intelligence</h2>
                    </div>
                    {!careerProfile && (
                        <Button onClick={handleAnalyzeCareer} disabled={loadingCareer} className="bg-primary hover:bg-primary/90 text-white shadow-glow">
                            {loadingCareer ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
                            Analyze Profile
                        </Button>
                    )}
                </div>

                {careerProfile ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Career Readiness Score</p>
                                <div className="text-3xl font-bold text-primary">{careerProfile.careerScore}/100</div>
                            </div>
                            <Button onClick={handleAnalyzeCareer} disabled={loadingCareer} variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                                {loadingCareer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} Refresh
                            </Button>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Top Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {careerProfile.topSkills?.map((s, i) => (
                                    <Badge key={i} className="bg-green-500/10 text-green-500 border border-green-500/20">{s}</Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /> Missing Skills for Senior Roles</h3>
                            <div className="flex flex-wrap gap-2">
                                {careerProfile.missingSkills?.map((s, i) => (
                                    <Badge key={i} className="bg-orange-500/10 text-orange-500 border border-orange-500/20">{s}</Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-blue-500" /> Recommended Learning Roadmap</h3>
                            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                {careerProfile.learningRoadmap?.map((step, i) => (
                                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-primary bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(106,56,194,0.5)] z-10"></div>
                                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-colors">
                                            <div className="font-bold text-sm text-foreground">{step.step}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <Bot className="w-12 h-12 mb-3 text-primary/40" />
                        <p>Generate an AI Career Profile to get insights on your skills and learning roadmap.</p>
                    </div>
                )}
            </div>

            {/* Resume Optimizer Panel */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-glass backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-3xl -z-10 group-hover:bg-cyan-500/10 transition-colors duration-500"></div>
                
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/30">
                            <FileText className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-bold text-card-foreground">AI Resume Optimizer</h2>
                    </div>
                    {!resumeOptimizer && (
                        <Button onClick={handleOptimizeResume} disabled={loadingResume} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                            {loadingResume ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Optimize Resume
                        </Button>
                    )}
                </div>

                {resumeOptimizer ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">ATS Compatibility Score</p>
                                <div className="text-3xl font-bold text-cyan-400">{resumeOptimizer.atsScore}/100</div>
                            </div>
                            <Button onClick={handleOptimizeResume} disabled={loadingResume} variant="outline" size="sm" className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white">
                                {loadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} Re-Scan
                            </Button>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-indigo-400" /> Missing Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {resumeOptimizer.missingKeywords?.map((s, i) => (
                                    <Badge key={i} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{s}</Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Critical Weaknesses & Formatting</h3>
                            <ul className="space-y-2">
                                {resumeOptimizer.weaknesses?.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-red-500/5 p-2 rounded border border-red-500/10">
                                        <ChevronRight className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                                        {w}
                                    </li>
                                ))}
                                {resumeOptimizer.formattingIssues?.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-orange-500/5 p-2 rounded border border-orange-500/10">
                                        <ChevronRight className="w-4 h-4 shrink-0 text-orange-400 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-green-400" /> Suggested Improvements</h3>
                            <ul className="space-y-2">
                                {resumeOptimizer.improvements?.map((imp, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-green-500/5 p-2 rounded border border-green-500/10">
                                        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400 mt-0.5" />
                                        {imp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mb-3 text-cyan-500/40" />
                        <p>Scan your resume against ATS standards to find missing keywords and formatting issues.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAIDashboard;
