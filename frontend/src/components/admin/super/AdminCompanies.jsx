import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Avatar, AvatarImage } from '../../ui/avatar'
import { Button } from '../../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { toast } from 'sonner'
import axiosInstance from '@/api/axiosInstance'
import { ADMIN_API_END_POINT } from '@/utils/constant'
import { useDispatch, useSelector } from 'react-redux'
import { setAdminCompanies } from '@/redux/companySlice'
import ReviewCompanyModal from './ReviewCompanyModal'

const AdminCompanies = () => {
    const dispatch = useDispatch()
    const { adminCompanies } = useSelector(store => store.company)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('pending')

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                // Fetch ALL companies
                const res = await axiosInstance.get(`${ADMIN_API_END_POINT}/companies`)
                if (res.data.success) {
                    dispatch(setAdminCompanies(res.data.companies))
                }
            } catch (error) {
                console.log(error)
                toast.error("Failed to load companies")
            }
        }
        fetchCompanies()
    }, [dispatch])

    const handleAction = async (id, action, customReason = null) => {
        try {
            setLoading(true)
            let reason = "";
            if (action === "reject" || action === "suspend") {
                reason = customReason || prompt(`Please enter a reason for ${action}:`);
                if (!reason) {
                    setLoading(false);
                    return;
                }
            }

            const endpoint = `${ADMIN_API_END_POINT}/company/${id}/${action}`
            const data = (action === "reject" || action === "suspend") ? { reason } : {}
            
            const res = await axiosInstance.put(endpoint, data)
            if (res.data.success) {
                toast.success(res.data.message)
                // Update company in redux store directly
                const updatedCompanies = adminCompanies.map(c => 
                    c._id === id ? res.data.company : c
                )
                dispatch(setAdminCompanies(updatedCompanies))
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || `Failed to ${action} company`)
        } finally {
            setLoading(false)
        }
    }

    const filteredCompanies = adminCompanies?.filter(c => {
        if (activeTab === 'all') return true;
        return c.verificationStatus === activeTab;
    }) || [];

    const getStatusColor = (status) => {
        switch(status) {
            case 'verified': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'suspended': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    }

    return (
        <div className="bg-card border border-border shadow-sm rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Company Verifications</h1>
                    <p className="text-muted-foreground text-sm">Manage and review all registered companies on the platform.</p>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="verified">Verified</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    <TabsTrigger value="suspended">Suspended</TabsTrigger>
                    <TabsTrigger value="all">All Companies</TabsTrigger>
                </TabsList>

                <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-secondary/50">
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead>Contact Email</TableHead>
                                <TableHead>Industry</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Trust Score</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCompanies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No companies found in this category.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <TableRow key={company._id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={company.logo} />
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{company.name}</p>
                                                <p className="text-xs text-muted-foreground">{company.website}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{company.officialCompanyEmail}</TableCell>
                                        <TableCell>{company.industry}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(company.verificationStatus)}`}>
                                                {company.verificationStatus}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md text-xs border border-blue-200">
                                                {company.trustScore !== undefined ? `${company.trustScore}/100` : "N/A"}
                                            </div>
                                        </TableCell>
                                        <TableCell>{company.verificationSubmittedAt?.split("T")[0]}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <ReviewCompanyModal 
                                                    company={company} 
                                                    onApprove={(id) => handleAction(id, "approve")}
                                                    onReject={(id, reason) => handleAction(id, "reject", reason)}
                                                    onSuspend={(id, reason) => handleAction(id, "suspend", reason)}
                                                    loading={loading}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Tabs>
        </div>
    )
}

export default AdminCompanies
