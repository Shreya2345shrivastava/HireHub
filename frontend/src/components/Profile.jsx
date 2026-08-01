import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Bookmark, Contact, Mail, Pen } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import { Link } from 'react-router-dom'

// const skills = ["Html", "Css", "Javascript", "Reactjs"]
const isResume = true;

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    return (
        <div>
            <Navbar />
            <div className='max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8'>
                {user ? (
                    <>
                        <div className='flex justify-between'>
                            <div className='flex items-center gap-4'>
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg" alt="profile" />
                                </Avatar>
                                <div>
                                    <h1 className='font-medium text-xl'>{user?.fullname}</h1>
                                    <p>{user?.profile?.bio}</p>
                                </div>
                            </div>
                            <Button onClick={() => setOpen(true)} className="text-right" variant="outline"><Pen /></Button>
                        </div>
                        {/* Skills section */}
                        <div className='my-5'>
                            <h1>Skills</h1>
                            <div className='flex items-center gap-1'>
                                {
                                    user?.profile?.skills?.length > 0 ?
                                        user?.profile?.skills.map((item, index) => <Badge key={index}>{item}</Badge>)
                                        : <span>NA</span>
                                }
                            </div>
                        </div>
                        {/* Resume Section */}
                        <div className='grid w-full max-w-sm items-center gap-1.5'>
                            <Label className="text-md font-bold">Resume</Label>
                            {
                                isResume ? <a target='blank' href={user?.profile?.resume} className='text-blue-500 w-full hover:underline cursor-pointer'>{user?.profile?.resumeOriginalName}</a> : <span>NA</span>
                            }
                        </div>
                    </>
                ) : (
                    <div>Loading...</div>  // This will show if user is not yet defined.
                )}
            </div>
            <div className='max-w-4xl mx-auto bg-white rounded-2xl p-4'>
                <div className='flex items-center justify-between my-5'>
                    <h1 className='font-bold text-lg'>Applied Jobs</h1>
                    <Link to="/saved-jobs">
                        <Button variant="outline" className="flex items-center gap-2 border-[#7209b7] text-[#7209b7] hover:bg-[#7209b7] hover:text-white">
                            <Bookmark className="w-4 h-4" /> View Saved Jobs
                        </Button>
                    </Link>
                </div>
                {/* Applied Job Table */}
                <AppliedJobTable />
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile;
