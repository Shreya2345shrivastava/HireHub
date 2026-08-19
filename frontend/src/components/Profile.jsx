import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { BarChart2, Bookmark, Contact, Mail, Pen, Building2, Briefcase } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import { Link } from 'react-router-dom'
import StudentAIDashboard from './student/StudentAIDashboard'

// const skills = ["Html", "Css", "Javascript", "Reactjs"]
const isResume = true;

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    return (
        <div>
            <Navbar />
            <div className='max-w-4xl mx-auto bg-card border border-border rounded-2xl my-5 p-8 shadow-glass backdrop-blur-xl'>
                {user ? (
                    <>
                        <div className='flex justify-between'>
                            <div className='flex items-center gap-4'>
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src="https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg" alt="profile" />
                                </Avatar>
                                <div>
                                    <h1 className='font-bold text-3xl text-card-foreground flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
                                        Welcome back, {user?.fullname}
                                        {user?.role === 'recruiter' ? (
                                            <Badge className="w-fit bg-primary/20 text-primary border border-primary/50 shadow-[0_0_10px_rgba(106,56,194,0.3)] pointer-events-none mt-1">Recruiter</Badge>
                                        ) : (
                                            <Badge className="w-fit bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] pointer-events-none mt-1">Student</Badge>
                                        )}
                                    </h1>
                                    <p className='text-muted-foreground mt-2 text-lg'>{user?.profile?.bio || "No bio provided."}</p>
                                </div>
                            </div>
                            <Button onClick={() => setOpen(true)} className="text-right border-border hover:bg-secondary text-foreground" variant="outline"><Pen className='w-4 h-4' /></Button>
                        </div>
                        {/* Skills section */}
                        {user?.role === 'student' ? (
                            <>
                                <div className='my-5'>
                                    <h1 className='font-semibold text-lg text-card-foreground mb-3'>Skills</h1>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        {
                                            user?.profile?.skills?.length > 0 ?
                                                user?.profile?.skills.map((item, index) => <Badge key={index} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border">{item}</Badge>)
                                                : <span className='text-muted-foreground'>NA</span>
                                        }
                                    </div>
                                </div>
                                {/* Resume Section */}
                                <div className='grid w-full max-w-sm items-center gap-2 mt-6'>
                                    <Label className="text-md font-bold text-card-foreground">Resume</Label>
                                    {
                                        isResume ? <a target='blank' href={user?.profile?.resume} className='text-primary w-full hover:underline cursor-pointer flex items-center gap-2'><Bookmark className='w-4 h-4'/> {user?.profile?.resumeOriginalName}</a> : <span className='text-muted-foreground'>NA</span>
                                    }
                                </div>
                            </>
                        ) : (
                            <div className='mt-10 mb-4 flex flex-col sm:flex-row gap-4'>
                                <Link to="/recruiter/companies">
                                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow h-12 px-6 flex items-center gap-2">
                                        <Building2 className="w-5 h-5" /> Manage Companies
                                    </Button>
                                </Link>
                                <Link to="/recruiter/jobs">
                                    <Button variant="outline" className="w-full sm:w-auto h-12 px-6 border-border hover:bg-secondary text-foreground flex items-center gap-2">
                                        <Briefcase className="w-5 h-5" /> Manage Posted Jobs
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <div>Loading...</div>  // This will show if user is not yet defined.
                )}
            </div>
            
            {user?.role === 'student' && (
                <>
                {/* AI Dashboards */}
                <StudentAIDashboard />
                <div className='max-w-4xl mx-auto bg-card rounded-2xl p-6 shadow-glass border border-border mb-20'>
                    <div className='flex flex-col sm:flex-row items-center justify-between mb-6 gap-4'>
                        <h1 className='font-bold text-xl text-card-foreground'>Applied Jobs</h1>
                        <div className='flex items-center gap-3'>
                            <Link to="/application-tracker">
                                <Button variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm">
                                    <BarChart2 className="w-4 h-4" /> Track Applications
                                </Button>
                            </Link>
                            <Link to="/saved-jobs">
                                <Button variant="outline" className="flex items-center gap-2 border-border text-foreground hover:bg-secondary transition-colors shadow-sm">
                                    <Bookmark className="w-4 h-4" /> View Saved Jobs
                                </Button>
                            </Link>
                        </div>
                    </div>
                    {/* Applied Job Table */}
                    <AppliedJobTable />
                </div>
                </>
            )}
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile;
