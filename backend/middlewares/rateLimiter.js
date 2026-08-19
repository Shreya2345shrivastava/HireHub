import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for login and otp
    message: {
        success: false,
        message: "Too many authentication attempts from this IP. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for registration
    message: {
        success: false,
        message: "Too many accounts created from this IP. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
