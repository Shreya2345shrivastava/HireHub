import mongoose from "mongoose";
import { Interview } from "../models/interview.model.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Notification } from "../models/notification.model.js";
import { createAuditLog } from "../services/audit.service.js";
import { io } from "../index.js";

export const scheduleInterview = async (req, res, next) => {
    try {
        const { applicationId, roundName, interviewType, interviewDate, interviewTime, duration, location, meetingLink, notes } = req.body;
        const recruiterId = req.id;

        const application = await Application.findById(applicationId).populate('job');
        if (!application) {
            return res.status(404).json({ message: "Application not found.", success: false });
        }

        if (application.job.created_by.toString() !== recruiterId.toString()) {
            return res.status(403).json({ message: "Access denied.", success: false });
        }

        const newInterview = await Interview.create({
            applicationId,
            jobId: application.job._id,
            candidateId: application.applicant,
            recruiterId,
            companyId: application.job.company,
            roundName,
            interviewType,
            interviewDate,
            interviewTime,
            duration,
            location,
            meetingLink,
            notes
        });

        application.interviews.push(newInterview._id);
        application.status = 'interview_scheduled';
        application.timeline.push({ status: 'interview_scheduled', date: new Date() });
        await application.save();

        await Notification.create({
            recipient: application.applicant,
            sender: recruiterId,
            title: "Interview Scheduled!",
            message: `Your ${roundName} for ${application.job.title} is scheduled on ${interviewDate} at ${interviewTime}.`,
            type: "interview_scheduled",
            link: `/interviews/${newInterview._id}`,
        });

        if (io) {
            io.to(application.applicant.toString()).emit("status_updated", {
                applicationId: application._id,
                status: 'interview_scheduled',
                jobTitle: application.job.title,
            });
        }

        await createAuditLog({
            actor: recruiterId,
            actorRole: 'recruiter',
            action: 'INTERVIEW_CREATED',
            targetType: "interview",
            targetId: newInterview._id,
            targetName: `Interview for ${application.job.title}`,
            description: `Recruiter scheduled a ${roundName}`,
            ipAddress: req.ip
        });

        return res.status(201).json({ message: "Interview scheduled successfully.", success: true, interview: newInterview });
    } catch (error) {
        next(error);
    }
};

export const getStudentInterviews = async (req, res, next) => {
    try {
        const studentId = req.id;
        const interviews = await Interview.find({ candidateId: studentId })
            .populate({ path: 'jobId', populate: { path: 'company' } })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, interviews });
    } catch (error) {
        next(error);
    }
};

export const getInterviewDetails = async (req, res, next) => {
    try {
        const interviewId = req.params.id;
        const userId = req.id;

        const interview = await Interview.findById(interviewId)
            .populate({ path: 'jobId', populate: { path: 'company' } })
            .populate('candidateId')
            .populate('recruiterId');

        if (!interview) {
            return res.status(404).json({ message: "Interview not found.", success: false });
        }

        // Security check: Only candidate or assigned recruiter can view
        if (interview.candidateId._id.toString() !== userId && interview.recruiterId._id.toString() !== userId) {
            return res.status(403).json({ message: "Access denied.", success: false });
        }

        return res.status(200).json({ success: true, interview });
    } catch (error) {
        next(error);
    }
};

export const updateInterviewStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const interviewId = req.params.id;
        const recruiterId = req.id;

        const interview = await Interview.findById(interviewId).populate('jobId');
        if (!interview) return res.status(404).json({ message: "Interview not found.", success: false });

        if (interview.recruiterId.toString() !== recruiterId.toString()) {
            return res.status(403).json({ message: "Access denied.", success: false });
        }

        interview.status = status;
        await interview.save();

        await createAuditLog({
            actor: recruiterId,
            actorRole: 'recruiter',
            action: 'INTERVIEW_UPDATED',
            targetType: "interview",
            targetId: interview._id,
            targetName: `Interview for ${interview.jobId.title}`,
            description: `Interview status changed to ${status}`,
            ipAddress: req.ip
        });

        return res.status(200).json({ message: "Interview status updated.", success: true, interview });
    } catch (error) {
        next(error);
    }
};

export const submitFeedback = async (req, res, next) => {
    try {
        const { rating, recommendation, comments } = req.body;
        const interviewId = req.params.id;
        const recruiterId = req.id;

        const interview = await Interview.findById(interviewId).populate('jobId');
        if (!interview) return res.status(404).json({ message: "Interview not found.", success: false });

        if (interview.recruiterId.toString() !== recruiterId.toString()) {
            return res.status(403).json({ message: "Access denied.", success: false });
        }

        interview.feedback = { rating, recommendation, comments };
        interview.status = 'Completed'; // Auto-mark completed if feedback provided
        await interview.save();

        // Optionally, update the Application status if it's a final round or strong hire
        if (recommendation === 'Reject') {
            await Application.findByIdAndUpdate(interview.applicationId, { status: 'rejected' });
        } else if (recommendation === 'Strong Hire' && interview.roundName === 'Final Round') {
            await Application.findByIdAndUpdate(interview.applicationId, { status: 'selected' });
        }

        await createAuditLog({
            actor: recruiterId,
            actorRole: 'recruiter',
            action: 'INTERVIEW_COMPLETED',
            targetType: "interview",
            targetId: interview._id,
            targetName: `Interview for ${interview.jobId.title}`,
            description: `Recruiter submitted feedback: ${recommendation}`,
            ipAddress: req.ip
        });

        return res.status(200).json({ message: "Feedback submitted successfully.", success: true, interview });
    } catch (error) {
        next(error);
    }
};
