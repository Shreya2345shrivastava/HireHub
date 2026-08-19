import React, { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Loader2 } from 'lucide-react'
import axiosInstance from '@/api/axiosInstance'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'

const VerificationForm = ({ companyId, initialData }) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    
    const [input, setInput] = useState({
        officialCompanyEmail: "",
        linkedinUrl: "",
        registrationNumber: "",
        companySize: "",
        industry: "",
        headquarters: "",
        files: null
    });

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };
    
    const changeFileHandler = (e) => {
        setInput({ ...input, files: e.target.files });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("officialCompanyEmail", input.officialCompanyEmail);
        formData.append("linkedinUrl", input.linkedinUrl);
        formData.append("registrationNumber", input.registrationNumber);
        formData.append("companySize", input.companySize);
        formData.append("industry", input.industry);
        formData.append("headquarters", input.headquarters);
        
        if (input.files) {
            for (let i = 0; i < input.files.length; i++) {
                formData.append("files", input.files[i]);
            }
        }

        try {
            setLoading(true);
            const res = await axiosInstance.post(`${COMPANY_API_END_POINT}/verify/${companyId}`, formData, {
                headers: { 'Content-Type': "multipart/form-data" }
            });
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setSingleCompany(res.data.company));
                // Update local state to reflect the pending status immediately
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Verification submission failed.");
        } finally {
            setLoading(false);
        }
    }

    if (initialData?.verificationStatus === "pending") {
        return (
            <div className='p-6 bg-amber-500/10 border border-amber-500/20 rounded-md my-6 text-center'>
                <h3 className='text-amber-400 font-semibold mb-2'>Verification Under Review</h3>
                <p className='text-sm text-muted-foreground'>Your company details have been submitted and are currently being reviewed by our team. You will be able to post jobs once approved.</p>
            </div>
        )
    }

    if (initialData?.verificationStatus === "verified") {
        return (
            <div className='p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-md my-6 text-center'>
                <h3 className='text-cyan-400 font-semibold mb-2'>Company Verified</h3>
                <p className='text-sm text-muted-foreground'>Your company is fully verified. You can now post jobs and attract top talent.</p>
            </div>
        )
    }

    return (
        <div className='mt-10 p-8 border border-border shadow-glass rounded-xl bg-card'>
            <div className='mb-6'>
                <h2 className='text-xl font-bold text-foreground'>Company Verification</h2>
                <p className='text-sm text-muted-foreground mt-1'>Submit these details to verify your company. Verified companies can post jobs.</p>
            </div>

            {initialData?.verificationStatus === "rejected" && (
                <div className='p-4 bg-red-500/10 border border-red-500/20 rounded-md mb-6'>
                    <h3 className='text-red-400 font-semibold text-sm'>Verification Rejected</h3>
                    <p className='text-sm text-red-400/80 mt-1'>Reason: {initialData.verificationNotes}</p>
                    <p className='text-xs text-muted-foreground mt-2'>Please update your details below and resubmit.</p>
                </div>
            )}
            
            <form onSubmit={submitHandler}>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <Label>Official Company Email</Label>
                        <Input
                            type="email"
                            name="officialCompanyEmail"
                            value={input.officialCompanyEmail}
                            onChange={changeEventHandler}
                            placeholder="hr@company.com"
                            required
                        />
                    </div>
                    <div>
                        <Label>LinkedIn Page URL</Label>
                        <Input
                            type="url"
                            name="linkedinUrl"
                            value={input.linkedinUrl}
                            onChange={changeEventHandler}
                            placeholder="https://linkedin.com/company/..."
                            required
                        />
                    </div>
                    <div>
                        <Label>Industry</Label>
                        <Input
                            type="text"
                            name="industry"
                            value={input.industry}
                            onChange={changeEventHandler}
                            placeholder="e.g. Technology, Finance"
                            required
                        />
                    </div>
                    <div>
                        <Label>Headquarters</Label>
                        <Input
                            type="text"
                            name="headquarters"
                            value={input.headquarters}
                            onChange={changeEventHandler}
                            placeholder="City, Country"
                            required
                        />
                    </div>
                    <div>
                        <Label>Registration Number (CIN/GST/EIN)</Label>
                        <Input
                            type="text"
                            name="registrationNumber"
                            value={input.registrationNumber}
                            onChange={changeEventHandler}
                            placeholder="Business Registration Number"
                            required
                        />
                    </div>
                    <div>
                        <Label>Company Size</Label>
                        <Select onValueChange={(value) => setInput({...input, companySize: value})} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="1-10">1-10 employees</SelectItem>
                                    <SelectItem value="11-50">11-50 employees</SelectItem>
                                    <SelectItem value="51-200">51-200 employees</SelectItem>
                                    <SelectItem value="201-500">201-500 employees</SelectItem>
                                    <SelectItem value="500+">500+ employees</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='col-span-2'>
                        <Label>Supporting Documents (Max 5 files, PDF/JPEG/PNG)</Label>
                        <Input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={changeFileHandler}
                            className="cursor-pointer"
                            required={!initialData?.supportingDocuments?.length}
                        />
                        <p className='text-xs text-muted-foreground mt-1'>Upload GST Certificate, Registration Certificate, or Business License.</p>
                    </div>
                </div>
                {
                    loading ? 
                    <Button className="w-full my-6 bg-cyan-600"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : 
                    <Button type="submit" className="w-full my-6">Submit for Verification</Button>
                }
            </form>
        </div>
    )
}

export default VerificationForm
