import { Notification } from "../models/notification.model.js";

// ✅ Get all notifications for logged-in user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });
        const totalNotifications = await Notification.countDocuments({ recipient: userId });

        return res.status(200).json({
            notifications: notifications || [],
            unreadCount,
            totalNotifications,
            totalPages: Math.ceil(totalNotifications / limit),
            currentPage: page,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

// ✅ Mark single notification as read
export const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                message: "Notification not found.",
                success: false
            });
        }

        notification.isRead = true;
        await notification.save();

        return res.status(200).json({
            message: "Notification marked as read.",
            success: true,
            notification
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

// ✅ Mark all notifications as read for logged-in user
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.id;

        await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

        return res.status(200).json({
            message: "All notifications marked as read.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

// ✅ Clear all notifications for logged-in user
export const clearNotifications = async (req, res) => {
    try {
        const userId = req.id;

        await Notification.deleteMany({ recipient: userId });

        return res.status(200).json({
            message: "Notifications cleared.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};
