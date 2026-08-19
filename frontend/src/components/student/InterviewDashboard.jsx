import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import axiosInstance from '@/api/axiosInstance';
import { INTERVIEW_API_END_POINT } from '@/utils/constant';
import { Calendar, Clock, Video, MapPin, Building, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const InterviewDashboard = () => {
    const [interviews, setInterviews] = useState([]);
    const [tab, setTab] = useState('Upcoming');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await axiosInstance.get(`${INTERVIEW_API_END_POINT}/student/all`);
                if (res.data.success) {
                    setInterviews(res.data.interviews);
                }
            } catch (error) {
                console.error("Failed to fetch interviews", error);
            }
        };
        fetchInterviews();
    }, []);

    const filteredInterviews = interviews.filter(i => {
        if (tab === 'Upcoming') return i.status === 'Scheduled';
        if (tab === 'Completed') return i.status === 'Completed';
        if (tab === 'Cancelled') return i.status === 'Cancelled' || i.status === 'No Show';
        return true;
    });

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">My Interviews</h1>
                        <p className="text-muted-foreground mt-1">Manage and track your interview schedules.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-secondary/50 p-1 rounded-xl w-max mb-8 border border-border">
                    {['Upcoming', 'Completed', 'Cancelled'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInterviews.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            No {tab.toLowerCase()} interviews found.
                        </div>
                    ) : (
                        filteredInterviews.map((interview) => (
                            <div key={interview._id} onClick={() => navigate(`/interviews/${interview._id}`)} className="group bg-card hover:bg-card/80 border border-border rounded-xl p-6 shadow-sm hover:shadow-glow hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                                            {interview.companyId?.logo ? (
                                                <img src={interview.companyId.logo} alt="logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <Building className="w-6 h-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground text-lg">{interview.companyId?.name}</h3>
                                            <p className="text-sm text-muted-foreground">{interview.jobId?.title}</p>
                                        </div>
                                    </div>
                                </div>

                                <Badge variant="outline" className="w-max mb-4 bg-primary/5 text-primary border-primary/20">
                                    {interview.roundName}
                                </Badge>

                                <div className="space-y-3 mt-auto pt-4 border-t border-border/50">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                                        {interview.interviewDate}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4 mr-2 text-primary" />
                                        {interview.interviewTime} ({interview.duration || 'TBD'})
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        {interview.interviewType === 'Online' ? (
                                            <Video className="w-4 h-4 mr-2 text-green-500" />
                                        ) : (
                                            <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                                        )}
                                        {interview.interviewType}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                        interview.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-500' :
                                        interview.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                        'bg-red-500/10 text-red-500'
                                    }`}>
                                        {interview.status}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewDashboard;
