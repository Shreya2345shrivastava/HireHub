import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Bell, Bookmark, CheckCheck, LogOut, Trash2, User2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '@/api/axiosInstance'
import { NOTIFICATION_API_END_POINT, USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { 
    clearNotificationsState, 
    markAllNotificationsAsReadState, 
    markNotificationAsReadState 
} from '@/redux/notificationSlice'
import useGetNotifications from '@/hooks/useGetNotifications'
import { toast } from 'sonner'

const Navbar = () => {
    useGetNotifications();
    const { user } = useSelector(store => store.auth);
    const { notifications, unreadCount } = useSelector(store => store.notification);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const res = await axiosInstance.get(`${USER_API_END_POINT}/logout`);
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Logout failed");
        }
    };

    const markNotificationAsReadHandler = async (id, link) => {
        try {
            await axiosInstance.put(`${NOTIFICATION_API_END_POINT}/read/${id}`);
            dispatch(markNotificationAsReadState(id));
            if (link) {
                navigate(link);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const markAllReadHandler = async () => {
        try {
            const res = await axiosInstance.put(`${NOTIFICATION_API_END_POINT}/read-all`);
            if (res.data.success) {
                dispatch(markAllNotificationsAsReadState());
                toast.success("All notifications marked as read.");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const clearNotificationsHandler = async () => {
        try {
            const res = await axiosInstance.delete(`${NOTIFICATION_API_END_POINT}/clear`);
            if (res.data.success) {
                dispatch(clearNotificationsState());
                toast.success("Notifications cleared.");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='bg-white border-b border-gray-100 sticky top-0 z-50'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4'>
                <div>
                    <h1 className='text-2xl font-bold cursor-pointer' onClick={() => navigate('/')}>
                        Hire<span className='text-[#F83002]'>Hub</span>
                    </h1>
                </div>
                <div className='flex items-center gap-6'>
                    <ul className='flex font-medium items-center gap-5'>
                        {
                            user && user.role === 'recruiter' ? (
                                <>
                                    <li><Link to="/admin/companies" className="hover:text-[#6A38C2]">Companies</Link></li>
                                    <li><Link to="/admin/jobs" className="hover:text-[#6A38C2]">Jobs</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/" className="hover:text-[#6A38C2]">Home</Link></li>
                                    <li><Link to="/jobs" className="hover:text-[#6A38C2]">Jobs</Link></li>
                                    <li><Link to="/browse" className="hover:text-[#6A38C2]">Browse</Link></li>
                                    {user && user.role === 'student' && (
                                        <li><Link to="/saved-jobs" className="hover:text-[#6A38C2]">Saved Jobs</Link></li>
                                    )}
                                </>
                            )
                        }
                    </ul>

                    {
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="outline">Login</Button></Link>
                                <Link to="/signup"><Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">Signup</Button></Link>
                            </div>
                        ) : (
                            <div className='flex items-center gap-4'>
                                {/* ⭐ Notification Center Bell */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className='relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition'>
                                            <Bell className='w-6 h-6 text-gray-700' />
                                            {unreadCount > 0 && (
                                                <span className='absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse'>
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 md:w-96 p-0 border border-gray-200 shadow-xl rounded-xl">
                                        <div className='p-4 border-b flex items-center justify-between bg-gray-50 rounded-t-xl'>
                                            <div className='flex items-center gap-2'>
                                                <Bell className='w-5 h-5 text-[#6A38C2]' />
                                                <h3 className='font-bold text-gray-800'>Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <span className='bg-purple-100 text-[#6A38C2] text-xs font-semibold px-2 py-0.5 rounded-full'>
                                                        {unreadCount} new
                                                    </span>
                                                )}
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                {notifications?.length > 0 && (
                                                    <>
                                                        <Button onClick={markAllReadHandler} variant="ghost" size="icon" title="Mark all as read" className="h-8 w-8 text-gray-500 hover:text-green-600">
                                                            <CheckCheck className='w-4 h-4' />
                                                        </Button>
                                                        <Button onClick={clearNotificationsHandler} variant="ghost" size="icon" title="Clear all" className="h-8 w-8 text-gray-500 hover:text-red-600">
                                                            <Trash2 className='w-4 h-4' />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className='max-h-80 overflow-y-auto divide-y divide-gray-100'>
                                            {!notifications || notifications.length === 0 ? (
                                                <div className='p-6 text-center text-gray-400 text-sm'>
                                                    No notifications yet
                                                </div>
                                            ) : (
                                                notifications.map((item) => (
                                                    <div 
                                                        key={item._id}
                                                        onClick={() => markNotificationAsReadHandler(item._id, item.link)}
                                                        className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition ${!item.read ? 'bg-purple-50/50' : ''}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!item.read ? 'bg-[#6A38C2]' : 'bg-transparent'}`} />
                                                        <div className='flex-1'>
                                                            <h4 className={`text-sm font-semibold ${!item.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                                {item.title}
                                                            </h4>
                                                            <p className='text-xs text-gray-600 mt-0.5 leading-snug'>
                                                                {item.message}
                                                            </p>
                                                            <span className='text-[10px] text-gray-400 mt-1 block'>
                                                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {/* User Profile Popover */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Avatar className="cursor-pointer">
                                            <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                        </Avatar>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div>
                                            <div className='flex gap-2 space-y-2'>
                                                <Avatar className="cursor-pointer">
                                                    <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                                </Avatar>
                                                <div>
                                                    <h4 className='font-medium'>{user?.fullname}</h4>
                                                    <p className='text-sm text-muted-foreground'>{user?.profile?.bio}</p>
                                                </div>
                                            </div>
                                            <div className='flex flex-col my-2 text-gray-600'>
                                                {
                                                    user && user.role === 'student' && (
                                                        <>
                                                            <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                                <User2 />
                                                                <Button variant="link"> <Link to="/profile">View Profile</Link></Button>
                                                            </div>
                                                            <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                                <Bookmark />
                                                                <Button variant="link"> <Link to="/saved-jobs">Saved Jobs</Link></Button>
                                                            </div>
                                                        </>
                                                    )
                                                }

                                                <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                                    <LogOut />
                                                    <Button onClick={logoutHandler} variant="link">Logout</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Link to="/payment">
                                    <Button className="bg-[#5aa621] hover:bg-[#2e7d20] text-xs md:text-sm">Get Personalized Help</Button>
                                </Link>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Navbar;