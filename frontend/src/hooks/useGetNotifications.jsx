import { setNotifications } from "@/redux/notificationSlice";
import { NOTIFICATION_API_END_POINT } from "@/utils/constant";
import axiosInstance from "@/api/axiosInstance";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetNotifications = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const res = await axiosInstance.get(`${NOTIFICATION_API_END_POINT}/get?page=1&limit=10`);
                if (res.data.success) {
                    dispatch(setNotifications({
                        notifications: res.data.notifications,
                        unreadCount: res.data.unreadCount,
                        currentPage: res.data.currentPage,
                        totalPages: res.data.totalPages,
                        totalNotifications: res.data.totalNotifications
                    }));
                }
            } catch (error) {
                console.log("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, [user, dispatch]);
};

export default useGetNotifications;
