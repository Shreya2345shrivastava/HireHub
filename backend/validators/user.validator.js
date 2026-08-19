import { z } from "zod";

/**
 * User Registration Schema
 * 
 * - fullname: 2-100 chars, no purely numeric names
 * - email: must be a valid email format
 * - phoneNumber: exactly 10 digits (stored as string to preserve leading zeros)
 * - password: min 8 chars, must contain uppercase, lowercase, and a number
 * - role: must be 'student' or 'recruiter' only
 */
export const registerSchema = z.object({
    fullname: z
        .string({ required_error: "Full name is required." })
        .trim()
        .min(2, "Full name must be at least 2 characters.")
        .max(100, "Full name cannot exceed 100 characters."),
    email: z
        .string({ required_error: "Email is required." })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address."),
    phoneNumber: z
        .string({ required_error: "Phone number is required." })
        .trim()
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits."),
    password: z
        .string({ required_error: "Password is required." })
        .min(8, "Password must be at least 8 characters.")
        .max(128, "Password is too long.")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
        .regex(/[0-9]/, "Password must contain at least one number."),
    role: z.enum(["student", "recruiter", "admin"], {
        errorMap: () => ({ message: "Role must be either 'student', 'recruiter', or 'admin'." }),
    }),
});

/**
 * Login Schema
 * 
 * Intentionally simpler than register — we validate format, not strength,
 * so wrong-format inputs fail fast without hitting the database.
 */
export const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required." })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address."),
    password: z
        .string({ required_error: "Password is required." })
        .min(1, "Password is required."),
    role: z.enum(["student", "recruiter", "admin"], {
        errorMap: () => ({ message: "Role must be either 'student', 'recruiter', or 'admin'." }),
    }),
});

/**
 * OTP Verification Schema
 * 
 * OTP must be exactly 6 digits. No more, no less.
 * This prevents partial OTP submissions.
 */
export const otpSchema = z.object({
    email: z
        .string({ required_error: "Email is required." })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address."),
    otp: z
        .string({ required_error: "OTP is required." })
        .trim()
        .regex(/^\d{6}$/, "OTP must be exactly 6 digits."),
});

/**
 * Update Profile Schema — all fields optional since this is a partial update
 */
export const updateProfileSchema = z.object({
    fullname: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters.")
        .max(100, "Full name cannot exceed 100 characters.")
        .optional(),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address.")
        .optional(),
    phoneNumber: z
        .string()
        .trim()
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits.")
        .optional(),
    bio: z
        .string()
        .trim()
        .max(500, "Bio cannot exceed 500 characters.")
        .optional(),
    skills: z
        .string()
        .optional(), // Comma-separated string; controller splits into array
    otp: z
        .string()
        .trim()
        .optional(), // OTP required for profile update per existing flow
});
