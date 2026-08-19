import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        notifications: [],
        unreadCount: 0,
        currentPage: 1,
        totalPages: 1,
        totalNotifications: 0
    },
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload.notifications;
            state.unreadCount = action.payload.unreadCount;
            state.currentPage = action.payload.currentPage;
            state.totalPages = action.payload.totalPages;
            state.totalNotifications = action.payload.totalNotifications;
        },
        appendNotifications: (state, action) => {
            state.notifications = [...state.notifications, ...action.payload.notifications];
            state.currentPage = action.payload.currentPage;
            state.totalPages = action.payload.totalPages;
            state.totalNotifications = action.payload.totalNotifications;
        },
        markNotificationAsReadState: (state, action) => {
            const notificationId = action.payload;
            const notification = state.notifications.find(item => item._id === notificationId);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                if (state.unreadCount > 0) {
                    state.unreadCount -= 1;
                }
            }
        },
        markAllNotificationsAsReadState: (state) => {
            state.notifications.forEach(item => { item.isRead = true; });
            state.unreadCount = 0;
        },
        clearNotificationsState: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        }
    }
});

export const {
    setNotifications,
    appendNotifications,
    markNotificationAsReadState,
    markAllNotificationsAsReadState,
    clearNotificationsState
} = notificationSlice.actions;

export default notificationSlice.reducer;
