import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, USER_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { setUser } from '@/redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosInstance';
import { Bookmark, BookmarkCheck } from 'lucide-react';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    const isSaved = user?.savedJobs?.includes(singleJob?._id);

    const params = useParams();
    const jobId = params.id;
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
                <h1 className='font-bold'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>
                <h1 className='font-bold'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location}</span></h1>
                <h1 className='font-bold'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experienceLevel} yrs</span></h1>
                <h1 className='font-bold'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary} LPA</span></h1>
                <h1 className='font-bold'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length}</span></h1>
                <h1 className='font-bold'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt ? singleJob?.createdAt.split("T")[0] : 'N/A'}</span></h1>
            </div>
        </div>
    )
}

export default JobDescription