import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, MapPin, Briefcase, ChevronRight, Filter } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { USER_API_END_POINT } from '@/utils/constant';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';

const CandidateSearch = () => {
    const [searchParams, setSearchParams] = useState({
        keyword: '',
        skills: '',
        experience: '',
    });
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const changeHandler = (e) => {
        setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setHasSearched(true);
            const queryParams = new URLSearchParams(searchParams).toString();
            const res = await axiosInstance.get(`${USER_API_END_POINT}/search?${queryParams}`);
            
            if (res.data.success) {
                setCandidates(res.data.candidates);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-foreground">Advanced Candidate Search</h1>
                    <p className="text-muted-foreground mt-2">Source the best passive and active talent from the HireHub network.</p>
                </div>

                {/* Search Panel */}
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mb-10">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Keywords (Name, Bio)</label>
                            <Input 
                                name="keyword" 
                                value={searchParams.keyword} 
                                onChange={changeHandler} 
                                placeholder="e.g. John Doe, Full Stack" 
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Skills (Comma separated)</label>
                            <Input 
                                name="skills" 
                                value={searchParams.skills} 
                                onChange={changeHandler} 
                                placeholder="React, Node.js" 
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Min Experience (Yrs)</label>
                            <Input 
                                name="experience" 
                                type="number"
                                value={searchParams.experience} 
                                onChange={changeHandler} 
                                placeholder="e.g. 3" 
                                className="w-full"
                            />
                        </div>
                        <div className="md:col-span-4 flex justify-end mt-2">
                            <Button type="submit" disabled={loading} className="px-8">
                                {loading ? 'Searching...' : <><Search className="w-4 h-4 mr-2" /> Search Candidates</>}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Results Section */}
                <div>
                    <h2 className="text-xl font-bold mb-6">
                        Results <Badge className="ml-2" variant="secondary">{candidates.length}</Badge>
                    </h2>
                    
                    {hasSearched && candidates.length === 0 && !loading && (
                        <div className="text-center py-10 bg-secondary/30 rounded-xl border border-border">
                            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-foreground">No candidates found</h3>
                            <p className="text-muted-foreground mt-1">Try adjusting your filters to broaden your search.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {candidates.map(candidate => (
                            <div key={candidate._id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                                        <img src={candidate.profile?.profilePhoto || `https://ui-avatars.com/api/?name=${candidate.fullname}`} alt={candidate.fullname} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">{candidate.fullname}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{candidate.profile?.bio || 'No bio available'}</p>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Top Skills</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {candidate.profile?.skills?.slice(0, 4).map((skill, index) => (
                                            <Badge key={index} variant="outline" className="text-xs py-0 h-5 bg-secondary/50">{skill}</Badge>
                                        ))}
                                        {candidate.profile?.skills?.length > 4 && (
                                            <Badge variant="outline" className="text-xs py-0 h-5 bg-secondary/50">+{candidate.profile.skills.length - 4}</Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
                                    <div className="text-sm text-muted-foreground flex items-center">
                                        <Briefcase className="w-4 h-4 mr-1.5" />
                                        {candidate.profile?.aiCareerProfile?.parsedResume?.experienceYears || 0} Yrs Exp
                                    </div>
                                    {/* Mock candidate link assuming recruiter can view public profile or similar */}
                                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                        View Profile <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateSearch;
