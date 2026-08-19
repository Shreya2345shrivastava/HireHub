import { User } from "../models/user.model.js";

/**
 * isRecruiter — Verifies the authenticated user has the 'recruiter' role.
 * Fetches the user from the DB to prevent stale JWT role data.
 * Supports future 'admin' role by allowing admin access to recruiter routes.
 */
export const isRecruiter = async (req, res, next) => {
    try {
        const user = await User.findById(req.id).select("role");

        if (!user) {
            return res.status(401).json({
                message: "Authentication failed. User not found.",
                success: false,
            });
        }

        // Allow 'admin' role here in the future (admin can do everything a recruiter can)
        if (user.role !== "recruiter" && user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Recruiter privileges required.",
                success: false,
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * isStudent — Verifies the authenticated user has the 'student' role.
 * Fetches the user from the DB to prevent stale JWT role data.
 */
export const isStudent = async (req, res, next) => {
    try {
        const user = await User.findById(req.id).select("role");

        if (!user) {
            return res.status(401).json({
                message: "Authentication failed. User not found.",
                success: false,
            });
        }

        if (user.role !== "student") {
            return res.status(403).json({
                message: "Access denied. Student privileges required.",
                success: false,
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * isAdmin - Verifies the authenticated user has the "admin" role.
 * Used for platform-wide Super Admin operations.
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
                message: "Access denied. Super Admin privileges required.",
                success: false,
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
