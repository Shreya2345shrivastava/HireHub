import rateLimit from "express-rate-limit";

/**
 * authLimiter — Applied to Login and OTP verification routes.
 * 
 * Reasoning: An OTP has 900,000 possible values (6-digit). At 10 attempts
 * per 15 minutes, a brute-force attack would take ~937,500 minutes to exhaust
 * all values. This is an effective deterrent.
 * 
 * Human impact: A real user only needs 1 attempt. 10 is more than generous.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again in 15 minutes.",
    },
    skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * signupLimiter — Applied to the registration route.
 * 
 * Reasoning: Account creation requires a unique email + phone. 5 signups
 * per hour is more than sufficient for a real user and stops bulk account
 * creation scripts.
 */
export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many accounts created from this IP. Please try again in an hour.",
    },
});

/**
 * apiLimiter — Applied to general authenticated API routes.
 * 
 * Reasoning: 100 requests per 15 minutes is ~6.7 req/min, which is generous
 * for any normal user browsing jobs or managing companies. This stops automated
 * scrapers and denial-of-service attempts.
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please slow down.",
    },
});
