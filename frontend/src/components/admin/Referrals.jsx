import React, { useState, useEffect } from 'react';
import Navbar from '../shared/Navbar';
import axiosInstance from '@/api/axiosInstance';
import { useSelector } from 'react-redux';
import { Loader2, Users, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const Referrals = () => {
    const { companies } = useSelector(store => store.company);
    const [selectedCompany, setSelectedCompany] = useState(companies[0]?._id || '');
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedCompany) fetchReferrals(selectedCompany);
    }, [selectedCompany]);

    const fetchReferrals = async (companyId) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`http://localhost:8000/api/v1/referral/company/${companyId}`);
            if (res.data.success) {
                setReferrals(res.data.referrals);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (referralId, newStatus) => {
        try {
            const res = await axiosInstance.put(`http://localhost:8000/api/v1/referral/${referralId}/status`, { status: newStatus });
            if (res.data.success) {
                setReferrals(referrals.map(ref => ref._id === referralId ? res.data.referral : ref));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <Users className="w-8 h-8 text-primary" />
                            Employee Referrals
                        </h1>
                        <p className="text-muted-foreground mt-1">Track and manage candidate referrals from your team.</p>
                    </div>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Company" />
                        </SelectTrigger>
                        <SelectContent>
                            {companies.map(c => (
                                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : referrals.length === 0 ? (
                    <div className="text-center py-20 bg-card border border-border rounded-xl">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium">No referrals yet</h3>
                        <p className="text-muted-foreground mt-2">Encourage your team to refer top talent.</p>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/50 border-b border-border text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Candidate</th>
                                    <th className="px-6 py-4 font-medium">Job</th>
                                    <th className="px-6 py-4 font-medium">Referred By</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Resume</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.map(ref => (
                                    <tr key={ref._id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-foreground">{ref.candidateName}</p>
                                            <p className="text-xs text-muted-foreground">{ref.candidateEmail}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{ref.jobId?.title || 'Unknown Job'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <img src={ref.referrerId?.profile?.profilePhoto || `https://ui-avatars.com/api/?name=${ref.referrerId?.fullname}`} className="w-6 h-6 rounded-full" alt="avatar"/>
                                                <span className="text-sm">{ref.referrerId?.fullname}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Select value={ref.status} onValueChange={(val) => handleStatusChange(ref._id, val)}>
                                                <SelectTrigger className="h-8 text-xs font-semibold border-0 w-[130px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["Pending", "Reviewed", "Interviewing", "Hired", "Rejected"].map(s => (
                                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={ref.resume} target="_blank" rel="noreferrer">
                                                <Button variant="outline" size="sm" className="text-primary hover:bg-primary/10">
                                                    <FileText className="w-4 h-4 mr-2" /> View Resume
                                                </Button>
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Referrals;
