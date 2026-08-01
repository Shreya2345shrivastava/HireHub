import React from 'react'
import { Button } from './ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '@/api/axiosInstance'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { setAllSavedJobs } from '@/redux/jobSlice'
import { toast } from 'sonner'

const Job = ({ job }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const { allSavedJobs } = useSelector(store => store.job);

    const isSaved = user?.savedJobs?.includes(job?._id) || allSavedJobs?.some(item => (item?._id || item) === job?._id);

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }

    const saveJobHandler = async () => {
        if (!user) {
            toast.error("Please login to save jobs");
            return navigate("/login");
        }
        try {
            const res = await axiosInstance.post(`${USER_API_END_POINT}/save-job/${job?._id}`);
            if (res.data.success) {
                toast.success(res.data.message);
                
                // Update local user savedJobs in Redux auth state
                const updatedSavedJobs = res.data.savedJobs;
                const updatedUser = { ...user, savedJobs: updatedSavedJobs };
                dispatch(setUser({ user: updatedUser }));

                // Update allSavedJobs in Redux job state
                if (isSaved) {
                    dispatch(setAllSavedJobs(allSavedJobs.filter(item => (item?._id || item) !== job?._id)));
                } else {
                    dispatch(setAllSavedJobs([...allSavedJobs, job]));
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100 flex flex-col justify-between h-full'>
            <div>
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-gray-500'>
                        {daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
                    </p>
                    <Button 
                        onClick={saveJobHandler} 
                        variant={isSaved ? "default" : "outline"} 
                        className={`rounded-full ${isSaved ? "bg-[#7209b7] text-white hover:bg-[#5f0799]" : ""}`} 
                        size="icon"
                    >
                        {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                    </Button>
                </div>

                <div className='flex items-center gap-2 my-2'>
                    <Button className="p-6" variant="outline" size="icon">
                        <Avatar>
                            <AvatarImage src={job?.company?.logo} />
                        </Avatar>
                    </Button>
                    <div>
                        <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
                        <p className='text-sm text-gray-500'>India</p>
                    </div>
                </div>

                <div>
                    <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                    <p className='text-sm text-gray-600 line-clamp-2'>{job?.description}</p>
                </div>
                <div className='flex items-center gap-2 mt-4 flex-wrap'>
                    <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position} Positions</Badge>
                    <Badge className={'text-[#F83002] font-bold'} variant="ghost">{job?.jobType}</Badge>
                    <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{job?.salary} LPA</Badge>
                </div>
            </div>

            <div className='flex items-center gap-4 mt-6'>
                <Button onClick={() => navigate(`/description/${job?._id}`)} variant="outline">Details</Button>
                <Button 
                    onClick={saveJobHandler} 
                    className={isSaved ? "bg-[#5aa621] hover:bg-[#48871a]" : "bg-[#7209b7] hover:bg-[#5f0799]"}
                >
                    {isSaved ? "Saved" : "Save For Later"}
                </Button>
            </div>
        </div>
    )
}

export default Job;