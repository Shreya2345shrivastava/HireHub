import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Avatar, AvatarImage } from '../../ui/avatar'
import { Button } from '../../ui/button'
import { toast } from 'sonner'
import axiosInstance from '@/api/axiosInstance'
import { ADMIN_API_END_POINT } from '@/utils/constant'
import { useDispatch, useSelector } from 'react-redux'
import { setPendingCompanies } from '@/redux/companySlice'
import ReviewCompanyModal from './ReviewCompanyModal'

const PendingVerifications = () => {
    const dispatch = useDispatch()
    const { pendingCompanies } = useSelector(store => store.company)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await axiosInstance.get(`${ADMIN_API_END_POINT}/companies/pending`)
                if (res.data.success) {
                    dispatch(setPendingCompanies(res.data.companies))
                }
            } catch (error) {
                console.log(error)
                toast.error("Failed to load pending companies")
            }
        }
        fetchPending()
    }, [dispatch])

    const handleAction = async (id, action, customReason = null) => {
        try {
            setLoading(true)
            const reason = action === "reject" ? (customReason || prompt("Please enter a reason for rejection:")) : ""
            if (action === "reject" && !reason) {
                setLoading(false)
                return
            }

            const endpoint = `${ADMIN_API_END_POINT}/company/${id}/${action}`
            const data = action === "reject" ? { reason: arguments[2] } : {}
            
            const res = await axiosInstance.put(endpoint, data)
            if (res.data.success) {
                toast.success(res.data.message)
                // Remove from pending list
                dispatch(setPendingCompanies(pendingCompanies.filter(c => c._id !== id)))
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || `Failed to ${action} company`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <Table>
                <TableCaption>List of companies pending verification</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact Email</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pendingCompanies?.length <= 0 ? <span>No pending verifications.</span> : (
                        pendingCompanies?.map((company) => (
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
                                <TableCell>{company.verificationSubmittedAt?.split("T")[0]}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <ReviewCompanyModal 
                                            company={company} 
                                            onApprove={(id) => handleAction(id, "approve")}
                                            onReject={(id, reason) => handleAction(id, "reject", reason)}
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
    )
}

export default PendingVerifications
