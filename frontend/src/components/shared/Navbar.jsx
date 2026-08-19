import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { BarChart2, Bell, Bookmark, CheckCheck, LineChart, LogOut, Trash2, User2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '@/api/axiosInstance'
import { NOTIFICATION_API_END_POINT, USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { 
    clearNotificationsState, 
    markAllNotificationsAsReadState, 
    markNotificationAsReadState,
    appendNotifications
} from '@/redux/notificationSlice'
import useGetNotifications from '@/hooks/useGetNotifications'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

const Navbar = () => {
    useGetNotifications();
    const { user } = useSelector(store => store.auth);
    const { notifications, unreadCount, currentPage, totalPages } = useSelector(store => store.notification);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

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

    const loadMoreNotifications = async () => {
        if (currentPage >= totalPages) return;
        setIsLoadingMore(true);
        try {
            const res = await axiosInstance.get(`${NOTIFICATION_API_END_POINT}/get?page=${currentPage + 1}&limit=10`);
            if (res.data.success) {
                dispatch(appendNotifications({
                    notifications: res.data.notifications,
                    currentPage: res.data.currentPage,
                    totalPages: res.data.totalPages,
                    totalNotifications: res.data.totalNotifications
                }));
            }
        } catch (error) {
            console.log("Error loading more notifications:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    return (
        <div className='sticky top-4 z-50 transition-all duration-300 w-full max-w-7xl mx-auto px-4'>
            <div className='w-full bg-background/40 backdrop-blur-2xl border border-border/50 shadow-glass rounded-full flex items-center justify-between h-16 px-8'>
                <div>
                    <h1 className='text-2xl font-bold cursor-pointer tracking-tight' onClick={() => navigate(user?.role === 'recruiter' ? '/recruiter/companies' : '/')}>
                        Hire<span className='text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400'>Hub</span>
                    </h1>
                </div>
                <div className='flex items-center gap-6'>
                    <ul className='flex font-medium items-center gap-5'>
                        {
                            user && user.role === 'admin' ? (
                                <>
                                    <li><Link to="/admin/companies" className="hover:text-primary transition-colors">Dashboard</Link></li>
                                </>
                            ) : user && user.role === 'recruiter' ? (
                                <>
                                    <li><Link to="/recruiter/companies" className="hover:text-primary transition-colors">Companies</Link></li>
                                    <li><Link to="/recruiter/jobs" className="hover:text-primary transition-colors">Jobs</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                                    <li><Link to="/jobs" className="hover:text-primary transition-colors">Jobs</Link></li>
                                    <li><Link to="/browse" className="hover:text-primary transition-colors">Browse</Link></li>
                                </>
                            )
                        }
                    </ul>

                    {
                        !user ? (
                            <div className='flex items-center gap-4'>
                                <Link to="/login"><Button variant="outline" className="border-border text-foreground hover:bg-secondary">Login</Button></Link>
                                <Link to="/signup"><Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">Signup</Button></Link>
                            </div>
                        ) : (
                            <div className='flex items-center gap-4'>
                                {/* ⭐ Notification Center Bell */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div className='relative cursor-pointer p-2 rounded-full hover:bg-secondary transition'>
                                            <Bell className='w-6 h-6 text-foreground' />
                                            {unreadCount > 0 && (
                                                <span className='absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-glow'>
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 md:w-96 p-0 border border-border bg-card shadow-2xl rounded-xl backdrop-blur-xl">
                                        <div className='p-4 border-b border-border flex items-center justify-between bg-secondary/50 rounded-t-xl'>
                                            <div className='flex items-center gap-2'>
                                                <Bell className='w-5 h-5 text-primary' />
                                                <h3 className='font-bold text-card-foreground'>Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <span className='bg-primary/20 text-primary text-xs font-semibold px-2 py-0.5 rounded-full'>
                                                        {unreadCount} new
                                                    </span>
                                                )}
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                {notifications?.length > 0 && (
                                                    <>
                                                        <Button onClick={markAllReadHandler} variant="ghost" size="icon" title="Mark all as read" className="h-8 w-8 text-muted-foreground hover:text-green-400">
                                                            <CheckCheck className='w-4 h-4' />
                                                        </Button>
                                                        <Button onClick={clearNotificationsHandler} variant="ghost" size="icon" title="Clear all" className="h-8 w-8 text-muted-foreground hover:text-red-400">
                                                            <Trash2 className='w-4 h-4' />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className='max-h-80 overflow-y-auto divide-y divide-border'>
                                            {!notifications || notifications.length === 0 ? (
                                                <div className='p-8 flex flex-col items-center justify-center text-center'>
                                                    <div className='w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3'>
                                                        <Bell className='w-6 h-6 text-muted-foreground' />
                                                    </div>
                                                    <p className='text-sm font-medium text-foreground'>No notifications yet</p>
                                                    <p className='text-xs text-muted-foreground mt-1'>We'll let you know when something happens.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {notifications.map((item) => (
                                                        <div 
                                                            key={item._id}
                                                            onClick={() => markNotificationAsReadHandler(item._id, item.link)}
                                                            className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-secondary/80 transition ${!item.isRead ? 'bg-primary/5' : ''}`}
                                                        >
                                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!item.isRead ? 'bg-primary shadow-[0_0_8px_rgba(106,56,194,0.8)]' : 'bg-transparent'}`} />
                                                            <div className='flex-1'>
                                                                <h4 className={`text-sm font-semibold ${!item.isRead ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                                                                    {item.title}
                                                                </h4>
                                                                <p className='text-xs text-muted-foreground mt-0.5 leading-snug'>
                                                                    {item.message}
                                                                </p>
                                                                <span className='text-[10px] text-muted-foreground/60 mt-1 block'>
                                                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {currentPage < totalPages && (
                                                        <div className='p-2 flex justify-center'>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={(e) => { e.stopPropagation(); loadMoreNotifications(); }}
                                                                disabled={isLoadingMore}
                                                                className='w-full text-xs text-muted-foreground'
                                                            >
                                                                {isLoadingMore ? "Loading..." : "Load More"}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {/* User Profile Popover */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Avatar className="cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all">
                                            <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                        </Avatar>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 bg-card border-border shadow-2xl backdrop-blur-xl">
                                        <div>
                                            <div className='flex gap-4 space-y-2 items-center'>
                                                <Avatar className="cursor-pointer h-12 w-12">
                                                    <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                                </Avatar>
                                                <div>
                                                    <h4 className='font-bold text-card-foreground'>{user?.fullname}</h4>
                                                    <p className='text-xs text-muted-foreground'>{user?.profile?.bio}</p>
                                                </div>
                                            </div>
                                            <div className='flex flex-col mt-4 text-muted-foreground'>
                                                {
                                                    user && user.role === 'student' && (
                                                        <>
                                                            <div className='flex w-full items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors'>
                                                                <User2 className='w-4 h-4 text-primary' />
                                                                <Link to="/profile" className='text-sm font-medium w-full'>View Profile</Link>
                                                            </div>
                                                            <div className='flex w-full items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors'>
                                                                <Bookmark className='w-4 h-4 text-primary' />
                                                                <Link to="/saved-jobs" className='text-sm font-medium w-full'>Saved Jobs</Link>
                                                            </div>
                                                            <div className='flex w-full items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors'>
                                                                <BarChart2 className='w-4 h-4 text-primary' />
                                                                <Link to="/application-tracker" className='text-sm font-medium w-full'>Track Applications</Link>
                                                            </div>
                                                            <div className='flex w-full items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors'>
                                                                <LineChart className='w-4 h-4 text-primary' />
                                                                <Link to="/analytics" className='text-sm font-medium w-full'>Analytics</Link>
                                                            </div>
                                                        </>
                                                    )
                                                }

                                                {/* Links for recruiter */}
                                                {user && user.role === 'recruiter' && (
                                                    <>
                                                        <div className='flex w-full items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors'>
                                                            <User2 className='w-4 h-4 text-primary' />
                                                            <Link to="/profile" className='text-sm font-medium w-full'>View Profile / Dashboard</Link>
                                                        </div>
                                                        <div className='flex w-full items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors'>
                                                            <LineChart className='w-4 h-4 text-primary' />
                                                            <Link to="/analytics" className='text-sm font-medium w-full'>Analytics</Link>
                                                        </div>
                                                    </>
                                                )}

                                                {user && user.role === 'admin' && (
                                                    <>
                                                        <div className='flex w-full items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors'>
                                                            <User2 className='w-4 h-4 text-primary' />
                                                            <Link to="/admin/companies" className='text-sm font-medium w-full'>Super Admin Dashboard</Link>
                                                        </div>
                                                    </>
                                                )}

                                                <div className='flex w-full items-center gap-3 p-2 rounded-md hover:bg-destructive/10 text-destructive cursor-pointer transition-colors mt-2' onClick={logoutHandler}>
                                                    <LogOut className='w-4 h-4' />
                                                    <span className='text-sm font-medium w-full'>Logout</span>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Link to="/payment">
                                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-glow text-xs md:text-sm border-none">Get Personalized Help</Button>
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