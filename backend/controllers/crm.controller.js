import { Lead } from "../models/lead.model.js";
import { Company } from "../models/company.model.js";

// Create a new Lead
export const createLead = async (req, res, next) => {
    try {
        const { candidateId, companyId } = req.body;

        // Ensure recruiter has access to this company
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found", success: false });
        }

        // Basic authorization check (simplified for demo, typically check if req.id is in members)
        if (company.userId.toString() !== req.id.toString()) {
            const isMember = company.members.find(m => m.user.toString() === req.id.toString());
            if (!isMember) return res.status(403).json({ message: "Unauthorized", success: false });
        }

        const existingLead = await Lead.findOne({ candidateId, companyId });
        if (existingLead) {
            return res.status(400).json({ message: "Candidate is already a lead for this company", success: false });
        }

        const lead = await Lead.create({
            candidateId,
            companyId,
            recruiterId: req.id
        });

        return res.status(201).json({
            message: "Lead created successfully",
            lead,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

// Get all leads for a specific company
export const getLeadsByCompany = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const leads = await Lead.find({ companyId })
            .populate('candidateId', 'fullname email profile.profilePhoto profile.skills profile.aiCareerProfile')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            leads,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

// Update lead status
export const updateLeadStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true });
        if (!lead) return res.status(404).json({ message: "Lead not found", success: false });

        return res.status(200).json({
            message: "Lead status updated",
            lead,
            success: true
        });
    } catch (error) {
        next(error);
    }
};

// Add note to lead
export const addLeadNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const lead = await Lead.findById(id);
        if (!lead) return res.status(404).json({ message: "Lead not found", success: false });

        lead.notes.push({ text, addedBy: req.id });
        await lead.save();

        return res.status(200).json({
            message: "Note added successfully",
            lead,
            success: true
        });
    } catch (error) {
        next(error);
    }
};
