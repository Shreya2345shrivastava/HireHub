import { z } from "zod";

/**
 * Register Company Schema
 * 
 * - companyName: 2-100 chars, trimmed.
 *   Max 100 prevents absurdly long names that could break UI layouts.
 */
export const registerCompanySchema = z.object({
    companyName: z
        .string({ required_error: "Company name is required." })
        .trim()
        .min(2, "Company name must be at least 2 characters.")
        .max(100, "Company name cannot exceed 100 characters."),
});

/**
 * Update Company Schema — all fields are optional (partial update)
 * 
 * - website: must be a valid URL format if provided
 * - location: max 100 chars
 */
export const updateCompanySchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Company name must be at least 2 characters.")
        .max(100, "Company name cannot exceed 100 characters.")
        .optional(),
    description: z
        .string()
        .trim()
        .max(1000, "Description cannot exceed 1000 characters.")
        .optional(),
    website: z
        .string()
        .trim()
        .url("Please provide a valid website URL (e.g. https://example.com).")
        .optional()
        .or(z.literal("")), // Allow empty string to clear the field
    location: z
        .string()
        .trim()
        .max(100, "Location cannot exceed 100 characters.")
        .optional(),
});

/**
 * Verify Company Schema
 * 
 * Used when a recruiter submits a company for verification.
 */
export const verifyCompanySchema = z.object({
    officialCompanyEmail: z
        .string({ required_error: "Official company email is required." })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address."),
    linkedinUrl: z
        .string({ required_error: "LinkedIn URL is required." })
        .trim()
        .url("Please provide a valid LinkedIn URL.")
        .refine((url) => url.includes("linkedin.com/"), {
            message: "Must be a valid LinkedIn URL.",
        }),
    companySize: z
        .enum(["1-10", "11-50", "51-200", "201-500", "500+"], {
            required_error: "Company size is required.",
            invalid_type_error: "Invalid company size.",
        }),
    industry: z
        .string({ required_error: "Industry is required." })
        .trim()
        .min(2, "Industry must be at least 2 characters."),
    headquarters: z
        .string({ required_error: "Headquarters location is required." })
        .trim()
        .min(2, "Headquarters must be at least 2 characters."),
});
