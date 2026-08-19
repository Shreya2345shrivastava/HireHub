import { Referral } from "../models/referral.model.js";
import { Job } from "../models/job.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const submitReferral = async (req, res, next) => {
    try {
        const { jobId, candidateName, candidateEmail, relationship, endorsement } = req.body;
        const file = req.file;

        if (!jobId || !candidateName || !candidateEmail || !relationship || !endorsement || !file) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found", success: false });

        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

        const referral = await Referral.create({
            jobId,
            companyId: job.company,
            referrerId: req.id,
            candidateName,
            candidateEmail,
            relationship,
            endorsement,
            resume: cloudResponse.secure_url
        });

        return res.status(201).json({
            message: "Referral submitted successfully",
            referral,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const getReferralsByCompany = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const referrals = await Referral.find({ companyId })
            .populate('referrerId', 'fullname email profile.profilePhoto')
            .populate('jobId', 'title')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            referrals,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

export const updateReferralStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const referral = await Referral.findByIdAndUpdate(id, { status }, { new: true });
        if (!referral) return res.status(404).json({ message: "Referral not found", success: false });

        return res.status(200).json({
            message: "Referral status updated",
            referral,
            success: true
        });
    } catch (error) {
        next(error);
    }
};
