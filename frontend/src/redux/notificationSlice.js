import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        notifications: [],
        unreadCount: 0
    },
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload.notifications;
            state.unreadCount = action.payload.unreadCount;
        },
        markNotificationAsReadState: (state, action) => {
            const notificationId = action.payload;
            const notification = state.notifications.find(item => item._id === notificationId);
            if (notification && !notification.read) {
                notification.read = true;
                if (state.unreadCount > 0) {
                    state.unreadCount -= 1;
                }
            }
        },
        markAllNotificationsAsReadState: (state) => {
            state.notifications.forEach(item => { item.read = true; });
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
    markNotificationAsReadState,
    markAllNotificationsAsReadState,
    clearNotificationsState
} = notificationSlice.actions;

export default notificationSlice.reducer;
