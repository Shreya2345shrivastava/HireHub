import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Notification } from "../models/notification.model.js";
import { createAuditLog } from "../services/audit.service.js";

// ✅ Register Company — Recruiters only (enforced by isRecruiter middleware on route)
export const registerCompany = async (req, res, next) => {
    try {
        const { companyName } = req.validatedData || req.body;

        // Check if this recruiter already registered a company with this name
        const existing = await Company.findOne({ name: companyName, userId: req.id });
        if (existing) {
            return res.status(409).json({
                message: "You already have a company registered with this name.",
                success: false,
            });
        }

        const company = await Company.create({
            name: companyName,
            userId: req.id,
        });

        // Audit Log
        await createAuditLog({
            actor: req.id,
            actorRole: 'recruiter',
            action: "COMPANY_CREATED",
            targetType: "company",
            targetId: company._id,
            targetName: company.name,
            description: `Recruiter created company: ${company.name}`,
            ipAddress: req.ip
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Get All Companies for the Logged-in Recruiter — scoped to req.id
export const getCompany = async (req, res, next) => {
    try {
        const companies = await Company.find({ userId: req.id });

        return res.status(200).json({
            companies: companies || [],
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Get Company by ID — any authenticated user can view (needed for job listings)
export const getCompanyById = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: "Company not found.", success: false });
        }

        return res.status(200).json({ company, success: true });
    } catch (error) {
        next(error);
    }
};

// ✅ Get Public Company Profile (Sanitized + Job Stats)
export const getCompanyPublicProfile = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: "Company not found.", success: false });
        }

        // Fetch active jobs for this company
        const jobs = await Job.find({ company: company._id }).sort({ createdAt: -1 });

        // Calculate Stats
        const totalJobsPosted = jobs.length;
        const activeJobs = jobs.length; // Assuming all fetched jobs are active
        const totalApplicationsReceived = jobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0);

        // Sanitize company data (Do not send sensitive KYC/Admin fields)
        const publicCompany = {
            _id: company._id,
            name: company.name,
            description: company.description,
            website: company.website,
            location: company.location,
            logo: company.logo,
            createdAt: company.createdAt,
            isVerified: company.isVerified,
            verificationStatus: company.verificationStatus,
            trustScore: company.trustScore,
            industry: company.industry,
            headquarters: company.headquarters,
            companySize: company.companySize,
            linkedinUrl: company.linkedinUrl,
            userId: company.userId
        };

        return res.status(200).json({ 
            company: publicCompany, 
            jobs,
            stats: {
                totalJobsPosted,
                activeJobs,
                totalApplicationsReceived
            },
            success: true 
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Update Company — OWNERSHIP CHECK: only the company's creator can update it
export const updateCompany = async (req, res, next) => {
    try {
        const { name, description, website, location } = req.validatedData || req.body;

        // Fetch the company first to perform ownership check
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: "Company not found.", success: false });
        }

        // SECURITY: Verify the requesting user owns this company
        // Without this, any recruiter could update any other recruiter's company
        if (company.userId.toString() !== req.id.toString()) {
            return res.status(403).json({
                message: "Access denied. You do not own this company.",
                success: false,
            });
        }

        const file = req.file;
        let logo = company.logo; // Keep existing logo if no new file uploaded

        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            logo = cloudResponse.secure_url;
        }

        const updateData = { logo };
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (website !== undefined) updateData.website = website;
        if (location !== undefined) updateData.location = location;

        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        // Audit Log
        await createAuditLog({
            actor: req.id,
            actorRole: 'recruiter',
            action: "COMPANY_UPDATED",
            targetType: "company",
            targetId: updatedCompany._id,
            targetName: updatedCompany.name,
            description: `Recruiter updated company details for: ${updatedCompany.name}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            message: "Company information updated successfully.",
            company: updatedCompany,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Submit Company for Verification — OWNERSHIP CHECK: only creator can submit
export const submitVerification = async (req, res, next) => {
    try {
        const { officialCompanyEmail, linkedinUrl, companySize, industry, headquarters, registrationNumber } = req.validatedData || req.body;

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: "Company not found.", success: false });
        }

        if (company.userId.toString() !== req.id.toString()) {
            return res.status(403).json({
                message: "Access denied. You do not own this company.",
                success: false,
            });
        }

        // Only unverified or rejected companies can be submitted
        if (company.verificationStatus === "pending") {
            return res.status(400).json({
                message: "Verification is already pending review.",
                success: false,
            });
        }
        
        if (company.verificationStatus === "verified") {
            return res.status(400).json({
                message: "Company is already verified.",
                success: false,
            });
        }

        if (company.verificationStatus === "suspended") {
            return res.status(403).json({
                message: "Company is suspended and cannot be submitted for verification.",
                success: false,
            });
        }

        // Handle supporting documents upload
        let supportingDocuments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileUri = getDataUri(file);
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                supportingDocuments.push(cloudResponse.secure_url);
            }
        }

        // Update fields and status
        company.officialCompanyEmail = officialCompanyEmail;
        company.linkedinUrl = linkedinUrl;
        company.companySize = companySize;
        company.industry = industry;
        company.headquarters = headquarters;
        if (registrationNumber) {
            company.registrationNumber = registrationNumber;
        }
        if (supportingDocuments.length > 0) {
            company.supportingDocuments = supportingDocuments;
        }
        company.verificationStatus = "pending";
        company.verificationSubmittedAt = new Date();

        // Calculate Trust Score (Max 100)
        let score = 0;
        if (company.website) score += 20;
        if (company.linkedinUrl) score += 20;
        if (company.officialCompanyEmail) score += 20;
        if (company.registrationNumber) score += 20;
        if (company.supportingDocuments && company.supportingDocuments.length > 0) score += 20;
        company.trustScore = score;

        await company.save();

        // Notify admins
        const admins = await User.find({ role: 'admin' });
        const notifications = admins.map(admin => ({
            recipient: admin._id,
            sender: req.id,
            title: "Company Verification Request",
            message: `Company "${company.name}" has submitted verification documents.`,
            type: "verification_request_submitted",
            link: "/admin/companies",
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        // Audit Log
        await createAuditLog({
            actor: req.id,
            actorRole: 'recruiter',
            action: "VERIFICATION_SUBMITTED",
            targetType: "company",
            targetId: company._id,
            targetName: company.name,
            description: `Verification submitted for company: ${company.name}`,
            ipAddress: req.ip
        });

        return res.status(200).json({
            message: "Company verification submitted successfully. We will review it shortly.",
            company,
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

// --- PHASE 7: ENTERPRISE FEATURES ---

export const inviteMember = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const company = await Company.findById(req.params.id);

        if (!company) return res.status(404).json({ message: "Company not found", success: false });

        // Ensure user is the creator (Super Admin logic)
        if (company.userId.toString() !== req.id.toString()) {
            return res.status(403).json({ message: "Only the company creator can invite members", success: false });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) return res.status(404).json({ message: "User with this email not found", success: false });

        // Check if already a member
        if (company.members.some(member => member.user.toString() === userToInvite._id.toString())) {
            return res.status(400).json({ message: "User is already a member", success: false });
        }

        company.members.push({ user: userToInvite._id, role: role || 'recruiter' });
        await company.save();

        return res.status(200).json({ message: "Member invited successfully", company, success: true });
    } catch (error) {
        next(error);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        const { memberId } = req.body;
        const company = await Company.findById(req.params.id);

        if (!company) return res.status(404).json({ message: "Company not found", success: false });

        if (company.userId.toString() !== req.id.toString()) {
            return res.status(403).json({ message: "Only the company creator can remove members", success: false });
        }

        company.members = company.members.filter(member => member.user.toString() !== memberId);
        await company.save();

        return res.status(200).json({ message: "Member removed successfully", company, success: true });
    } catch (error) {
        next(error);
    }
};

export const updateCareerPage = async (req, res, next) => {
    try {
        const { slug, aboutUs, culture, benefits } = req.body;
        const company = await Company.findById(req.params.id);

        if (!company) return res.status(404).json({ message: "Company not found", success: false });

        // Check ownership or admin role
        if (company.userId.toString() !== req.id.toString()) {
            const isMember = company.members.find(m => m.user.toString() === req.id.toString() && m.role === 'admin');
            if (!isMember) return res.status(403).json({ message: "Not authorized to update career page", success: false });
        }

        if (!company.customCareerPage) company.customCareerPage = {};

        // Unique slug check
        if (slug && slug !== company.customCareerPage.slug) {
            const existingSlug = await Company.findOne({ 'customCareerPage.slug': slug });
            if (existingSlug) return res.status(400).json({ message: "Slug is already taken", success: false });
            company.customCareerPage.slug = slug;
        }

        if (aboutUs) company.customCareerPage.aboutUs = aboutUs;
        if (culture) company.customCareerPage.culture = culture;
        if (benefits) company.customCareerPage.benefits = Array.isArray(benefits) ? benefits : JSON.parse(benefits);

        // Upload banner if present
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            company.customCareerPage.banner = cloudResponse.secure_url;
        }

        await company.save();

        return res.status(200).json({ message: "Career page updated successfully", company, success: true });
    } catch (error) {
        next(error);
    }
};

export const getCareerPageBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const company = await Company.findOne({ 'customCareerPage.slug': slug });

        if (!company) return res.status(404).json({ message: "Career page not found", success: false });

        const jobs = await Job.find({ company: company._id }).sort({ createdAt: -1 });

        return res.status(200).json({ company, jobs, success: true });
    } catch (error) {
        next(error);
    }
};
