import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { io } from "../index.js"; 
import { createAuditLog } from "../services/audit.service.js";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

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

        const user = await User.findById(userId);

        // Generate AI Metrics
        const candidateSkills = user.profile?.parsedResumeData?.extractedSkills?.length > 0 
            ? user.profile.parsedResumeData.extractedSkills 
            : (user.profile?.skills || []);
        
        const experience = user.profile?.parsedResumeData?.experienceYears || 0;
        const education = user.profile?.parsedResumeData?.education || "";
        const jobRequirements = job.requirements || [];

        let matchScore = 0;
        let aiSummary = "No AI summary available.";
        let missingSkills = [];
        let hiringRecommendation = 'Pending';

        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const schema = {
                    type: SchemaType.OBJECT,
                    properties: {
                        matchScore: {
                            type: SchemaType.NUMBER,
                            description: "Match percentage between 0 and 100"
                        },
                        aiSummary: {
                            type: SchemaType.STRING,
                            description: "A 1-2 sentence justification for the score"
                        },
                        missingSkills: {
                            type: SchemaType.ARRAY,
                            description: "Important skills missing from the candidate's profile based on job requirements",
                            items: { type: SchemaType.STRING }
                        },
                        hiringRecommendation: {
                            type: SchemaType.STRING,
                            description: "Recommendation: 'Strong Hire', 'Consider', or 'Reject'"
                        }
                    },
                    required: ["matchScore", "aiSummary", "missingSkills", "hiringRecommendation"]
                };

                const model = genAI.getGenerativeModel({
                    model: "gemini-3.6-flash",
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                    }
                });

                const prompt = `Evaluate the candidate's fit for this job based on their skills and experience.
Job Title: ${job.title}
Job Description: ${job.description}
Job Requirements: ${jobRequirements.join(', ')}

Candidate Skills: ${candidateSkills.join(', ')}
Candidate Experience: ${experience} years
Candidate Education: ${education}

Return a JSON object containing the matchScore (0-100) and aiSummary.`;

                const result = await model.generateContent(prompt);
                const parsedAI = JSON.parse(result.response.text());
                
                matchScore = parsedAI.matchScore || 0;
                aiSummary = parsedAI.aiSummary || "Evaluation completed.";
                missingSkills = parsedAI.missingSkills || [];
                
                const validRecommendations = ['Strong Hire', 'Consider', 'Reject'];
                hiringRecommendation = validRecommendations.includes(parsedAI.hiringRecommendation) 
                    ? parsedAI.hiringRecommendation 
                    : 'Pending';
            } catch (err) {
                console.error("Gemini AI evaluation failed:", err);
                matchScore = Math.floor(Math.random() * (95 - 60 + 1) + 60);
                aiSummary = `${experience} years experience. Failed to generate AI insights.`;
                missingSkills = jobRequirements.filter(req => !candidateSkills.includes(req));
                hiringRecommendation = matchScore > 80 ? 'Strong Hire' : (matchScore > 60 ? 'Consider' : 'Reject');
            }
        } else {
            // Basic fallback logic
            let overlap = 0;
            const reqStr = jobRequirements.map((r) => r.toLowerCase()).join(" ");
            candidateSkills.forEach((skill) => {
                if (reqStr.includes(skill.toLowerCase())) overlap++;
            });

            matchScore = candidateSkills.length > 0 && jobRequirements.length > 0
                ? Math.min(Math.round((overlap / Math.max(jobRequirements.length, 1)) * 100) + (experience > 0 ? 20 : 0), 99)
                : Math.floor(Math.random() * (95 - 60 + 1) + 60);

            aiSummary = `${experience} years experience.`;
            if (matchScore > 80) aiSummary += ` Excellent fit with ${overlap} matched skills.`;
            else if (matchScore > 60) aiSummary += ` Good candidate. Meets core requirements.`;
            else aiSummary += ` Missing key skills but could be considered.`;
            
            missingSkills = jobRequirements.filter(req => !candidateSkills.includes(req));
            hiringRecommendation = matchScore > 80 ? 'Strong Hire' : (matchScore > 60 ? 'Consider' : 'Reject');
        }

        const rankScore = (matchScore * 0.7) + (experience * 3);

        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
            status: 'applied',
            matchScore,
            rankScore,
            aiSummary,
            missingSkills,
            hiringRecommendation,
            timeline: [{ status: 'applied', date: new Date() }]
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
            options: { sort: { rankScore: -1, createdAt: -1 } },
            populate: [
                { path: "applicant" },
                { path: "interviews" }
            ],
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
export const getApplicationDetails = async (req, res, next) => {
    try {
        const applicationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Invalid Application ID.", success: false });
        }

        const application = await Application.findById(applicationId)
            .populate({
                path: 'applicant',
                select: '-password' // don't return password
            })
            .populate('job')
            .populate('interviews');

        if (!application) {
            return res.status(404).json({ message: "Application not found.", success: false });
        }

        // SECURITY: Only the recruiter who created the job can view candidate details
        if (application.job.created_by.toString() !== req.id.toString()) {
            return res.status(403).json({
                message: "Access denied. You do not own this job posting.",
                success: false,
            });
        }

        return res.status(200).json({ application, success: true });
    } catch (error) {
        next(error);
    }
};

// ✅ Update applicant status — Recruiters only + OWNERSHIP CHECK
export const updateStatus = async (req, res, next) => {
    try {
        const { status, interviewDate, interviewTime, meetingLink, notes } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({ message: "Status is required.", success: false });
        }

        const allowedStatuses = ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'hired', 'pending', 'accepted'];
        if (!allowedStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({
                message: "Invalid status.",
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
        
        if (status.toLowerCase() === 'interview_scheduled') {
            if (interviewDate) application.interviewDate = interviewDate;
            if (interviewTime) application.interviewTime = interviewTime;
            if (meetingLink) application.meetingLink = meetingLink;
            if (notes !== undefined) application.notes = notes;
        }

        application.timeline.push({ status: status.toLowerCase(), date: new Date() });
        await application.save();

        // Send notification to the applicant
        if (application.applicant) {
            let notifType = "info";
            let notifTitle = "Application Updated";
            let notifMessage = `Your application for ${application?.job?.title || "a job"} has been updated to: ${status.replace('_', ' ').toUpperCase()}`;

            if (status.toLowerCase() === "accepted" || status.toLowerCase() === "selected") {
                notifType = "application_accepted";
                notifTitle = "Application Selected!";
                notifMessage = `Congratulations! You have been selected for ${application?.job?.title || "a job"}.`;
            } else if (status.toLowerCase() === "rejected") {
                notifType = "application_rejected";
                notifTitle = "Application Rejected";
                notifMessage = `Unfortunately, your application for ${application?.job?.title || "a job"} was not selected.`;
            } else if (status.toLowerCase() === "interview_scheduled") {
                notifType = "interview_scheduled";
                notifTitle = "Interview Scheduled!";
                notifMessage = `An interview has been scheduled for ${application?.job?.title || "a job"} on ${interviewDate} at ${interviewTime}.`;
            }

            await Notification.create({
                recipient: application.applicant,
                sender: req.id,
                title: notifTitle,
                message: notifMessage,
                type: notifType,
                link: `/application-tracker`,
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
        let auditAction = "APPLICATION_STATUS_CHANGED";
        if (status.toLowerCase() === "accepted" || status.toLowerCase() === "selected") auditAction = "CANDIDATE_SELECTED";
        if (status.toLowerCase() === "rejected") auditAction = "CANDIDATE_REJECTED";
        if (status.toLowerCase() === "interview_scheduled") auditAction = "INTERVIEW_SCHEDULED";

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
            application
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
