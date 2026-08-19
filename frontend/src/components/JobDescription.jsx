import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams, useNavigate } from 'react-router-dom';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, USER_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { setUser } from '@/redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosInstance';
import { Bookmark, BookmarkCheck, MapPin, Sparkles, Loader2, Copy, Download, Bot } from 'lucide-react';
import VerificationBadge from './admin/VerificationBadge';
import { AI_API_END_POINT } from '@/utils/constant';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const [coverLetter, setCoverLetter] = useState("");
    const [loadingCoverLetter, setLoadingCoverLetter] = useState(false);

    const isSaved = user?.savedJobs?.includes(singleJob?._id);

    const params = useParams();
    const jobId = params.id;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await axiosInstance.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`);
            
            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Application failed");
        }
    }

    const saveJobHandler = async () => {
        if (!user) {
            toast.error("Please login to save jobs");
            return;
        }
        try {
            const res = await axiosInstance.post(`${USER_API_END_POINT}/save-job/${jobId}`);
            if (res.data.success) {
                toast.success(res.data.message);
                const updatedSavedJobs = res.data.savedJobs;
                const updatedUser = { ...user, savedJobs: updatedSavedJobs };
                dispatch(setUser({ user: updatedUser }));
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axiosInstance.get(`${JOB_API_END_POINT}/get/${jobId}`);
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    const handleGenerateCoverLetter = async () => {
        if (!user || user.role !== 'student') {
            toast.error("Only students can generate cover letters.");
            return;
        }
        try {
            setLoadingCoverLetter(true);
            const res = await axiosInstance.post(`${AI_API_END_POINT}/cover-letter`, { jobId });
            if (res.data.success) {
                setCoverLetter(res.data.coverLetter);
                toast.success("Cover letter generated!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate cover letter. Please upload your resume first.");
        } finally {
            setLoadingCoverLetter(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(coverLetter);
        toast.success("Copied to clipboard!");
    };

    const downloadCoverLetter = () => {
        const element = document.createElement("a");
        const file = new Blob([coverLetter], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `Cover_Letter_${singleJob?.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };

    return (
        <div className='max-w-7xl mx-auto my-10 px-4'>
            <div className='flex items-center justify-between flex-wrap gap-4'>
                <div>
                    <h1 className='font-bold text-2xl'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-2 mt-4 flex-wrap'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.position} Positions</Badge>
                        <Badge className={'text-[#F83002] font-bold'} variant="ghost">{singleJob?.jobType}</Badge>
                        <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{singleJob?.salary} LPA</Badge>
                    </div>
                </div>

                <div className='flex items-center gap-3'>
                    <Button
                        onClick={saveJobHandler}
                        variant={isSaved ? "default" : "outline"}
                        className={isSaved ? 'bg-[#5aa621] hover:bg-[#48871a] text-white flex items-center gap-2' : 'border-[#7209b7] text-[#7209b7] hover:bg-[#7209b7] hover:text-white flex items-center gap-2'}
                    >
                        {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                        {isSaved ? 'Saved' : 'Save Job'}
                    </Button>

                    <Button
                        onClick={isApplied ? null : applyJobHandler}
                        disabled={isApplied}
                        className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}>
                        {isApplied ? 'Already Applied' : 'Apply Now'}
                    </Button>
                </div>
            </div>
            <h1 className='border-b-2 border-b-gray-300 font-medium py-4 text-lg mt-6'>Job Description</h1>
            <div className='my-4 space-y-2'>
                <div className='flex items-center font-bold'>
                    Company: 
                    <span 
                        onClick={() => navigate(`/company/${singleJob?.company?._id}`)}
                        className='pl-4 font-normal text-gray-800 capitalize hover:text-cyan-600 hover:underline cursor-pointer'
                    >
                        {singleJob?.company?.name}
                    </span>
                    {singleJob?.company?.verificationStatus && singleJob?.company?.verificationStatus !== "unverified" && (
                        <VerificationBadge status={singleJob?.company?.verificationStatus} className="ml-2" />
                    )}
                </div>
                <h1 className='font-bold'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>
                <h1 className='font-bold'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location}</span></h1>
                <h1 className='font-bold'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experienceLevel} yrs</span></h1>
                <h1 className='font-bold'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary} LPA</span></h1>
                <h1 className='font-bold'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length}</span></h1>
                <h1 className='font-bold'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt ? singleJob?.createdAt.split("T")[0] : 'N/A'}</span></h1>
            </div>

            {/* AI Cover Letter Generator */}
            {user?.role === 'student' && (
                <div className='mt-10 bg-card border border-border rounded-2xl p-6 shadow-glass backdrop-blur-xl relative overflow-hidden group'>
                    <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
                    
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
                                <Bot className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-card-foreground">AI Cover Letter Generator</h2>
                                <p className="text-sm text-muted-foreground">Generate a tailored cover letter using your parsed resume.</p>
                            </div>
                        </div>
                        <Button onClick={handleGenerateCoverLetter} disabled={loadingCoverLetter} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-glow whitespace-nowrap">
                            {loadingCoverLetter ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {coverLetter ? "Regenerate" : "Generate Cover Letter"}
                        </Button>
                    </div>

                    {coverLetter && (
                        <div className='mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                            <div className='bg-secondary/30 border border-border rounded-xl p-6 text-foreground text-sm leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar font-serif'>
                                {coverLetter}
                            </div>
                            <div className='flex gap-3 mt-4 justify-end'>
                                <Button onClick={copyToClipboard} variant="outline" className="border-border text-foreground hover:bg-secondary">
                                    <Copy className="w-4 h-4 mr-2" /> Copy
                                </Button>
                                <Button onClick={downloadCoverLetter} className="bg-primary hover:bg-primary/90 text-white">
                                    <Download className="w-4 h-4 mr-2" /> Download TXT
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default JobDescription