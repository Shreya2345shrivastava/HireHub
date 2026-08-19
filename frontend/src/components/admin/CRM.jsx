import React, { useState, useEffect } from 'react';
import Navbar from '../shared/Navbar';
import axiosInstance from '@/api/axiosInstance';
import { COMPANY_API_END_POINT } from '@/utils/constant'; // Wait, CRM route is CRM_API_END_POINT
import { useSelector } from 'react-redux';
import { Loader2, Plus, PhoneCall, Mail, MessageSquare, MoreHorizontal, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const CRM = () => {
    const { companies } = useSelector(store => store.company);
    const [selectedCompany, setSelectedCompany] = useState(companies[0]?._id || '');
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedCompany) {
            fetchLeads(selectedCompany);
        }
    }, [selectedCompany]);

    const fetchLeads = async (companyId) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`http://localhost:8000/api/v1/crm/company/${companyId}`);
            if (res.data.success) {
                setLeads(res.data.leads);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const res = await axiosInstance.put(`http://localhost:8000/api/v1/crm/${leadId}/status`, { status: newStatus });
            if (res.data.success) {
                setLeads(leads.map(lead => lead._id === leadId ? res.data.lead : lead));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'New Lead': return 'bg-blue-100 text-blue-800';
            case 'Contacted': return 'bg-yellow-100 text-yellow-800';
            case 'Interested': return 'bg-purple-100 text-purple-800';
            case 'Interviewing': return 'bg-orange-100 text-orange-800';
            case 'Hired': return 'bg-green-100 text-green-800';
            case 'Archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <UserPlus className="w-8 h-8 text-primary" />
                            Recruitment CRM
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage passive candidates and talent pipelines.</p>
                    </div>

                    <div className="flex gap-4 items-center">
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
                        <Button className="bg-primary"><Plus className="w-4 h-4 mr-2" /> Add Lead</Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : leads.length === 0 ? (
                    <div className="text-center py-20 bg-card border border-border rounded-xl">
                        <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium">No leads found</h3>
                        <p className="text-muted-foreground mt-2">Start sourcing candidates to build your pipeline.</p>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/50 border-b border-border text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Candidate</th>
                                    <th className="px-6 py-4 font-medium">Top Skills</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(lead => (
                                    <tr key={lead._id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={lead.candidateId?.profile?.profilePhoto || `https://ui-avatars.com/api/?name=${lead.candidateId?.fullname}`} alt="avatar" className="w-10 h-10 rounded-full border border-border" />
                                                <div>
                                                    <p className="font-medium text-foreground">{lead.candidateId?.fullname}</p>
                                                    <p className="text-xs text-muted-foreground">{lead.candidateId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {lead.candidateId?.profile?.skills?.slice(0, 3).map((skill, i) => (
                                                    <Badge key={i} variant="outline" className="text-[10px] py-0">{skill}</Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Select value={lead.status} onValueChange={(val) => handleStatusChange(lead._id, val)}>
                                                <SelectTrigger className={`h-8 text-xs font-semibold border-0 ${getStatusColor(lead.status)}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {["New Lead", "Contacted", "Interested", "Interviewing", "Hired", "Archived"].map(s => (
                                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Mail className="w-4 h-4" /></Button>
                                                <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><MessageSquare className="w-4 h-4" /></Button>
                                                <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><MoreHorizontal className="w-4 h-4" /></Button>
                                            </div>
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

export default CRM;
