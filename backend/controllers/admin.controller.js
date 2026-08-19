import { Company } from "../models/company.model.js";
import { Notification } from "../models/notification.model.js";
import { createAuditLog } from "../services/audit.service.js";

export const getPendingCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find({ verificationStatus: "pending" })
            .populate("userId", "fullname email")
            .sort({ verificationSubmittedAt: 1 }); // Oldest first

        return res.status(200).json({
            companies,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllCompaniesAdmin = async (req, res, next) => {
    try {
        const companies = await Company.find({})
            .populate("userId", "fullname email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            companies,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const approveCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: "Company not found", success: false });
        }

        company.verificationStatus = "verified";
        company.verificationReviewedAt = new Date();
        company.verificationNotes = "";
        company.isVerified = true;
        company.approvedBy = req.id;
        company.verificationDate = new Date();
        await company.save();

        await company.save();

        if (company.userId) {
            await Notification.create({
                recipient: company.userId,
                sender: req.id,
                title: "Company Approved",
                message: `Your company "${company.name}" has been approved!`,
                type: "company_approved",
                link: `/recruiter/companies/${company._id}`,
            });
        }

        // Audit Log
        await createAuditLog({
            actor: req.id,
            actorRole: 'admin',
            action: "ADMIN_APPROVAL",
            targetType: "company",
            targetId: company._id,
            targetName: company.name,
            description: `Admin approved company: ${company.name}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            message: "Company approved successfully.",
            company,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const rejectCompany = async (req, res, next) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: "Rejection reason is required.", success: false });
        }

        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: "Company not found", success: false });
        }

        company.verificationStatus = "rejected";
        company.verificationReviewedAt = new Date();
        company.verificationNotes = reason;
        company.isVerified = false;
        company.rejectionReason = reason;
        await company.save();

        await company.save();

        if (company.userId) {
            await Notification.create({
                recipient: company.userId,
                sender: req.id,
                title: "Company Rejected",
                message: `Your company "${company.name}" verification was rejected. Reason: ${reason}`,
                type: "company_rejected",
                link: `/recruiter/companies/${company._id}`,
            });
        }

        // Audit Log
        await createAuditLog({
            actor: req.id,
            actorRole: 'admin',
            action: "ADMIN_REJECTION",
            targetType: "company",
            targetId: company._id,
            targetName: company.name,
            description: `Admin rejected company: ${company.name}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            message: "Company rejected.",
            company,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

export const suspendCompany = async (req, res, next) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: "Suspension reason is required.", success: false });
        }

        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: "Company not found", success: false });
        }

        company.verificationStatus = "suspended";
        company.verificationReviewedAt = new Date();
        company.verificationNotes = reason;
        await company.save();

        await company.save();

        if (company.userId) {
            await Notification.create({
                recipient: company.userId,
                sender: req.id,
                title: "Company Suspended",
                message: `Your company "${company.name}" has been suspended. Reason: ${reason}`,
                type: "company_suspended",
                link: `/recruiter/companies/${company._id}`,
            });
        }

        // Audit Log
        await createAuditLog({
            actor: req.id,
            actorRole: 'admin',
            action: "ADMIN_SUSPENSION",
            targetType: "company",
            targetId: company._id,
            targetName: company.name,
            description: `Admin suspended company: ${company.name}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            message: "Company suspended.",
            company,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
