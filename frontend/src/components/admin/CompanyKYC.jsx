import React from 'react'
import Navbar from '../shared/Navbar'
import VerificationForm from './VerificationForm'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetCompanyById from '@/hooks/useGetCompanyById'
import { Button } from '../ui/button'
import { ArrowLeft } from 'lucide-react'
import VerificationBadge from './VerificationBadge'

const CompanyKYC = () => {
    const params = useParams();
    useGetCompanyById(params.id);
    const { singleCompany } = useSelector(store => store.company);
    const navigate = useNavigate();

    return (
        <div>
            <Navbar />
            <div className='max-w-2xl mx-auto my-10'>
                <div className='flex items-center justify-between p-8 bg-card border border-border shadow-sm rounded-xl mb-6'>
                    <div className='flex items-center gap-5'>
                        <Button onClick={() => navigate(`/recruiter/companies/${params.id}`)} variant="outline" className="flex items-center gap-2 text-gray-500 font-semibold">
                            <ArrowLeft />
                            <span>Back to Setup</span>
                        </Button>
                        <div>
                            <h1 className='font-bold text-xl'>KYC Verification</h1>
                            <p className='text-sm text-muted-foreground'>For {singleCompany?.name}</p>
                        </div>
                    </div>
                    <VerificationBadge status={singleCompany?.verificationStatus} />
                </div>
                
                <VerificationForm companyId={params.id} initialData={singleCompany} />
            </div>
        </div>
    )
}

export default CompanyKYC
