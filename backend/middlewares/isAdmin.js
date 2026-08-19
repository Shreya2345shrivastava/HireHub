import { User } from "../models/user.model.js";

/**
 * isAdmin — Verifies the authenticated user has the 'admin' role.
 * Built for Phase 1C admin dashboard, but allows backend endpoints to be protected now.
 */
export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.id).select("role");

        if (!user) {
            return res.status(401).json({
                message: "Authentication failed. User not found.",
                success: false,
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin privileges required.",
                success: false,
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
