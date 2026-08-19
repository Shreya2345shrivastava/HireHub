import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bot, Sparkles, MapPin, Briefcase, ChevronRight, Loader2, Target } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { AI_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const JobRecommendations = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    if (user?.role !== 'student') return null;

    const recommendations = user?.profile?.aiJobRecommendations;

    const handleGenerateRecommendations = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.post(`${AI_API_END_POINT}/job-recommendations`);
            if (res.data.success) {
                const updatedUser = { ...user, profile: { ...user.profile, aiJobRecommendations: res.data.aiJobRecommendations } };
                dispatch(setUser({ user: updatedUser }));
                toast.success("AI matched jobs generated successfully!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate recommendations. Ensure your resume is uploaded and parsed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-10 max-w-7xl mx-auto w-full">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-glass backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 p-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-500"></div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
                            <Target className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-card-foreground">AI Job Matcher</h2>
                            <p className="text-sm text-muted-foreground">Jobs perfectly aligned with your skills and experience.</p>
                        </div>
                    </div>
                    <Button onClick={handleGenerateRecommendations} disabled={loading} className="bg-primary hover:bg-primary/90 text-white shadow-glow whitespace-nowrap">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        {recommendations && recommendations.length > 0 ? "Refresh Matches" : "Find Matches"}
                    </Button>
                </div>

                {recommendations && recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {recommendations.map((rec, index) => {
                            if (!rec.jobId) return null; // In case the job was deleted
                            return (
                                <div key={index} className="bg-secondary/30 border border-border rounded-xl p-5 hover:border-primary/50 transition-colors flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 shadow-none">
                                                {rec.matchPercentage}% Match
                                            </Badge>
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{rec.jobId.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <MapPin className="w-3.5 h-3.5" /> {rec.jobId.location}
                                        </div>
                                        
                                        <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10 mb-4 line-clamp-3">
                                            <strong className="text-primary block mb-1">AI Reasoning:</strong>
                                            {rec.matchReasoning}
                                        </div>
                                    </div>
                                    
                                    <Link to={`/description/${rec.jobId._id}`}>
                                        <Button variant="outline" className="w-full border-border hover:bg-primary hover:text-white group/btn">
                                            View Details <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-secondary/30 border border-border border-dashed rounded-xl p-8 text-center text-muted-foreground">
                        <Bot className="w-12 h-12 mx-auto mb-3 text-primary/40" />
                        <p>No matches generated yet. Click the button above to let AI find the perfect roles for you.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobRecommendations;
