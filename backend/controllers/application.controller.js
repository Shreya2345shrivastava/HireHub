import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Notification } from "../models/notification.model.js";
import { io } from "../index.js"; // ✅ FIXED: Static import at module load time, not inside a request handler
import { createAuditLog } from "../services/audit.service.js";

// ✅ Apply for a job — Students only (enforced by isStudent middleware on route)
export const applyJob = async (req, res, next) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid Job ID.", success: false });
        }

        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(409).json({
                message: "You have already applied for this job.",
                success: false,
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found.", success: false });
        }

        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
        });

        job.applications.push(newApplication._id);
        await job.save();

        // Notify the recruiter who created the job
        if (job.created_by) {
            await Notification.create({
                recipient: job.created_by,
                sender: userId,
                title: "New Job Application Received",
                message: `A candidate has applied for your job posting: "${job.title}".`,
                type: "new_application_received",
                link: `/recruiter/jobs/${job._id}/applicants`,
            });
        }

        // Audit Log
        await createAuditLog({
            actor: userId,
            actorRole: 'student',
            action: "APPLICATION_SUBMITTED",
            targetType: "application",
            targetId: newApplication._id,
            targetName: `Application for ${job.title}`,
            description: `Student applied for job: ${job.title}`,
            ipAddress: req.ip
        });

        return res.status(201).json({
            message: "Application submitted successfully.",
            success: true,
            application: newApplication,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Get all applied jobs for the logged-in student
export const getAppliedJobs = async (req, res, next) => {
    try {
        const userId = req.id;

        const applications = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "job",
                populate: { path: "company" },
            });

        return res.status(200).json({ applications: applications || [], success: true });
    } catch (error) {
        next(error);
    }
};

// ✅ Get all applicants for a job — Recruiters only + OWNERSHIP CHECK
export const getApplicants = async (req, res, next) => {
    try {
        const jobId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid Job ID.", success: false });
        }

        const job = await Job.findById(jobId).populate({
            path: "applications",
            options: { sort: { createdAt: -1 } },
            populate: { path: "applicant" },
        });

        if (!job) {
            return res.status(404).json({ message: "Job not found.", success: false });
        }

        // SECURITY: Only the recruiter who created this job can view its applicants
        if (job.created_by.toString() !== req.id.toString()) {
            return res.status(403).json({
                message: "Access denied. You do not own this job posting.",
                success: false,
            });
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        next(error);
    }
};

// ✅ Update applicant status — Recruiters only + OWNERSHIP CHECK
export const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({ message: "Status is required.", success: false });
        }

        const allowedStatuses = ["pending", "accepted", "rejected"];
        if (!allowedStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                message: "Invalid status. Must be pending, accepted, or rejected.",
                success: false,
            });
        }

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Invalid Application ID.", success: false });
        }

        const application = await Application.findById(applicationId).populate("job");
        if (!application) {
            return res.status(404).json({ message: "Application not found.", success: false });
        }

        // SECURITY: Only the recruiter who created the job can update its applications
        if (application.job.created_by.toString() !== req.id.toString()) {
            return res.status(403).json({
                message: "Access denied. You do not own this job posting.",
                success: false,
            });
        }

        application.status = status.toLowerCase();
        await application.save();

        // Send notification to the applicant
        if (application.applicant) {
            let notifType = "info";
            if (status.toLowerCase() === "accepted") notifType = "application_accepted";
            if (status.toLowerCase() === "rejected") notifType = "application_rejected";

            await Notification.create({
                recipient: application.applicant,
                sender: req.id,
                title: "Application Status Update",
                message: `Your application for "${application?.job?.title || "a job"}" has been updated to: ${status.toUpperCase()}.`,
                type: notifType,
                link: "/profile",
            });

            // ✅ FIXED: Use statically-imported `io` — no dynamic import inside request handler
            if (io) {
                io.to(application.applicant.toString()).emit("status_updated", {
                    applicationId: application._id,
                    status: status.toLowerCase(),
                    jobTitle: application?.job?.title || "a job",
                });
            }
        }

        // Audit Log
        let auditAction = "APPLICATION_UPDATED";
        if (status.toLowerCase() === "accepted") auditAction = "APPLICATION_ACCEPTED";
        if (status.toLowerCase() === "rejected") auditAction = "APPLICATION_REJECTED";

        await createAuditLog({
            actor: req.id,
            actorRole: 'recruiter',
            action: auditAction,
            targetType: "application",
            targetId: application._id,
            targetName: `Application for ${application?.job?.title || "a job"}`,
            description: `Recruiter marked application as ${status.toUpperCase()}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            message: "Application status updated successfully.",
            success: true,
            updatedApplication: application,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ AI Match Score (mock implementation — ownership not required, just authentication)
export const getAIMatchScore = async (req, res, next) => {
    try {
        const applicationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Invalid Application ID.", success: false });
        }

        const application = await Application.findById(applicationId)
            .populate("job")
            .populate("applicant");

        if (!application) {
            return res.status(404).json({ message: "Application not found.", success: false });
        }

        const candidateSkills = application.applicant?.profile?.skills || [];
        const jobRequirements = application.job?.requirements || [];

        let overlap = 0;
        const reqStr = jobRequirements.map((r) => r.toLowerCase()).join(" ");
        candidateSkills.forEach((skill) => {
            if (reqStr.includes(skill.toLowerCase())) overlap++;
        });

        const baseScore =
            candidateSkills.length > 0 && jobRequirements.length > 0
                ? Math.min(Math.round((overlap / Math.max(jobRequirements.length, 1)) * 100) + 40, 99)
                : Math.floor(Math.random() * (95 - 60 + 1) + 60);

        return res.status(200).json({
            success: true,
            score: baseScore,
            feedback:
                baseScore > 80
                    ? "Excellent match! The candidate's skills closely align with the job requirements."
                    : baseScore > 60
                    ? "Good match. The candidate meets many core requirements but may need training in some areas."
                    : "Weak match. The candidate's profile lacks key skills mentioned in the job description.",
        });
    } catch (error) {
        next(error);
    }
};
