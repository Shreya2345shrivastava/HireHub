import { z } from "zod";

/**
 * Job Post Schema
 * 
 * - salary: must be a positive number — no negative salaries
 * - position: must be at least 1 — can't post 0-vacancy job
 * - experience: must be non-negative (0 = fresher)
 * - jobType: constrained to known enum values to prevent garbage data
 * - requirements: comma-separated string (controller splits into array)
 */
export const jobSchema = z.object({
    title: z
        .string({ required_error: "Job title is required." })
        .trim()
        .min(3, "Job title must be at least 3 characters.")
        .max(150, "Job title cannot exceed 150 characters."),
    description: z
        .string({ required_error: "Job description is required." })
        .trim()
        .min(20, "Description must be at least 20 characters.")
        .max(5000, "Description cannot exceed 5000 characters."),
    requirements: z
        .string({ required_error: "Requirements are required." })
        .trim()
        .min(1, "At least one requirement is needed."),
    salary: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0, {
            message: "Salary must be a positive number.",
        }),
    location: z
        .string({ required_error: "Location is required." })
        .trim()
        .min(2, "Location must be at least 2 characters.")
        .max(100, "Location cannot exceed 100 characters."),
    jobType: z.enum(
        ["Full-time", "Part-time", "Internship", "Contract"],
        { errorMap: () => ({ message: "Job type must be Full-time, Part-time, Internship, or Contract." }) }
    ),
    experience: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= 0, {
            message: "Experience level must be a non-negative number.",
        }),
    position: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= 1, {
            message: "Position count must be at least 1.",
        }),
    companyId: z
        .string({ required_error: "Company ID is required." })
        .trim()
        .min(1, "Company ID is required."),
});
