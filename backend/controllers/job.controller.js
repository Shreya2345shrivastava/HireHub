import { Job } from "../models/job.model.js";
import mongoose from "mongoose";
import { createAuditLog } from "../services/audit.service.js";

// ✅ Admin posts a job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Some fields are missing.",
                success: false
            });
        }

        const company = await mongoose.model("Company").findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }

        if (company.verificationStatus !== "verified") {
            return res.status(403).json({
                message: "You can only post jobs for verified companies.",
                success: false
            });
        }

        // SECURITY FIX: Prevent IDOR (Insecure Direct Object Reference)
        // Ensure the logged-in user actually owns the company they are posting a job for.
        if (company.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "Access denied. You do not own this company.",
                success: false
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });

        // Audit Log
        await createAuditLog({
            actor: userId,
            actorRole: 'recruiter',
            action: "JOB_CREATED",
            targetType: "job",
            targetId: job._id,
            targetName: job.title,
            description: `Recruiter created job: ${job.title}`,
            ipAddress: req.ip
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
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

// ✅ Student: Get all jobs
export const getAllJobs = async (req, res) => {
    try {
        const { keyword, location, jobType, salaryMin, salaryMax } = req.query;

        const query = {};
        if (keyword) {
            query.$text = { $search: keyword };
        }
        if (location) {
            query.location = { $regex: location, $options: "i" };
        }
        if (jobType) {
            query.jobType = { $regex: jobType, $options: "i" };
        }
        if (salaryMin || salaryMax) {
            query.salary = {};
            if (salaryMin) query.salary.$gte = Number(salaryMin);
            if (salaryMax) query.salary.$lte = Number(salaryMax);
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalJobs = await Job.countDocuments(query);
        
        const jobs = await Job.find(query)
            .populate({
                path: "company"
            })
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit);

        // ✅ RETURN EMPTY ARRAY INSTEAD OF 404
        return res.status(200).json({
            jobs: jobs || [],
            totalJobs,
            currentPage: page,
            totalPages: Math.ceil(totalJobs / limit),
            success: true,
            message:
                jobs.length === 0
                    ? "No jobs available yet."
                    : "Jobs fetched successfully."
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

// ✅ Student: Get job by ID
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                message: "Invalid job ID.",
                success: false
            });
        }

        const job = await Job.findById(jobId)
            .populate("applications");

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            job,
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

// ✅ Admin jobs
export const getAdminJobs = async (req, res) => {
    try {

        const adminId = req.id;

        const jobs = await Job.find({
            created_by: adminId
        })
        .populate("company")
        .sort({
            createdAt: -1
        });

        // ✅ RETURN EMPTY ARRAY INSTEAD OF 404
        return res.status(200).json({
            jobs: jobs || [],
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

// ✅ Total jobs posted
export const getTotalJobPostedLast30Days = async (req, res) => {
    try {

        const now = new Date();
        const thirtyDaysAgo = new Date(
            now.setDate(now.getDate() - 30)
        );

        const jobs = await Job.find({
            $or: [
                {
                    jobPosted: true
                },
                {
                    lastPost: {
                        $gte: thirtyDaysAgo
                    }
                }
            ]
        });

        return res.status(200).json({
            success: true,
            totalJobPosted: jobs.length,
            message: `Total jobs posted in last 30 days: ${jobs.length}`
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error retrieving jobs count"
        });

    }
};