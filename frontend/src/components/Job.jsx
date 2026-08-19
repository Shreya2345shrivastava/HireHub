import React from 'react'
import { Button } from './ui/button'
import { Bookmark, BookmarkCheck, MapPin } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '@/api/axiosInstance'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { setAllSavedJobs } from '@/redux/jobSlice'
import { toast } from 'sonner'
import VerificationBadge from './admin/VerificationBadge'

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
        <div className='p-6 rounded-2xl shadow-glass bg-card border border-border flex flex-col justify-between h-full transition-all duration-300 hover:shadow-glow hover:-translate-y-2 hover:border-cyan-500/50 group'>
            <div>
                <div className='flex items-center justify-between mb-4'>
                    <p className='text-sm text-muted-foreground'>
                        {daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
                    </p>
                    <Button 
                        onClick={saveJobHandler} 
                        variant="outline" 
                        className={`rounded-full h-10 w-10 border ${isSaved ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/20" : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-border/80"}`} 
                        size="icon"
                    >
                        {isSaved ? <BookmarkCheck className="h-5 w-5 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" /> : <Bookmark className="h-5 w-5" />}
                    </Button>
                </div>

                <div className='flex items-center gap-4 my-4'>
                    <Button 
                        onClick={() => navigate(`/company/${job?.company?._id}`)}
                        className="w-12 h-12 rounded-xl bg-secondary/50 border border-border p-0 flex items-center justify-center hover:border-cyan-500/30 transition-colors cursor-pointer" 
                        variant="outline"
                    >
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={job?.company?.logo} />
                        </Avatar>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 
                                onClick={() => navigate(`/company/${job?.company?._id}`)}
                                className='font-semibold text-lg text-card-foreground hover:text-cyan-400 transition-colors capitalize cursor-pointer'
                            >
                                {job?.company?.name || "Company"}
                            </h1>
                            {job?.company?.verificationStatus && job?.company?.verificationStatus !== "unverified" && (
                                <VerificationBadge status={job?.company?.verificationStatus} />
                            )}
                        </div>
                        <p className='text-sm text-muted-foreground flex items-center gap-1'>
                            <MapPin className="w-3.5 h-3.5" /> India
                        </p>
                    </div>
                </div>

                <div className='mb-6'>
                    <h1 className='font-bold text-xl mb-2 text-foreground capitalize tracking-tight'>{job?.title}</h1>
                    <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
                        {job?.description && job.description !== 'null' ? job.description : 'No description provided.'}
                    </p>
                </div>
                
                <div className='flex items-center gap-2 mt-auto pt-4 border-t border-border/50 flex-wrap'>
                    <Badge className={'text-blue-400 font-semibold bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1'} variant="outline">{job?.position} Positions</Badge>
                    <Badge className={'text-red-400 font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1'} variant="outline">{job?.jobType}</Badge>
                    <Badge className={'text-cyan-400 font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-3 py-1'} variant="outline">{job?.salary} LPA</Badge>
                </div>
            </div>

            <div className='flex items-center gap-4 mt-6'>
                <Button onClick={() => navigate(`/description/${job?._id}`)} variant="outline" className="border-border hover:bg-secondary">Details</Button>
                <Button 
                    onClick={saveJobHandler} 
                    className={`font-semibold ${isSaved ? "bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
                >
                    {isSaved ? "Saved" : "Save For Later"}
                </Button>
            </div>
        </div>
    )
}

export default Job;