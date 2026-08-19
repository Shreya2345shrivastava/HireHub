import React, { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { Sparkles, Trophy, Target, TrendingUp, Users } from 'lucide-react';

const AIInsightsDashboard = () => {
    const [insights, setInsights] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await axiosInstance.get('/analytics/ai-insights');
                if (res.data.success) {
                    setInsights(res.data);
                }
            } catch (error) {
                console.error("Failed to load AI insights", error);
            }
        };
        fetchInsights();
    }, []);

    if (!insights) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-card/50 backdrop-blur-md rounded-xl border border-primary/20 p-4 shadow-glow flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-primary">Top Candidate</h3>
                    <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <p className="text-xl font-bold text-card-foreground">{insights.topCandidate}</p>
                    <p className="text-xs text-muted-foreground">Rank Score: {insights.topCandidateScore?.toFixed(1) || 0}</p>
                </div>
            </div>

            <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Avg Match Score</h3>
                    <Target className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-xl font-bold text-card-foreground">{insights.avgMatchScore}%</p>
                    <p className="text-xs text-muted-foreground">Across all applications</p>
                </div>
            </div>

            <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Hardest Skill</h3>
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                    <p className="text-xl font-bold text-card-foreground">{insights.hardestSkill}</p>
                    <p className="text-xs text-muted-foreground">To hire for currently</p>
                </div>
            </div>

            <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Apps This Week</h3>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-xl font-bold text-card-foreground">{insights.appsThisWeek}</p>
                    <p className="text-xs text-muted-foreground">New candidates</p>
                </div>
            </div>

            <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border p-4 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Funnel Conversion</h3>
                    <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-xl font-bold text-card-foreground">
                        {insights.hiringFunnel?.applied ? Math.round((insights.hiringFunnel.interview / insights.hiringFunnel.applied) * 100) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">To Interview Stage</p>
                </div>
            </div>
        </div>
    );
};

export default AIInsightsDashboard;
