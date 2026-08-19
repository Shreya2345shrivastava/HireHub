import { AuditLog } from "../models/auditLog.model.js";

// ✅ Get Paginated and Filtered Audit Logs
export const getAuditLogs = async (req, res) => {
    try {
        const { role, action, startDate, endDate, search, page = 1, limit = 20 } = req.query;

        const query = {};

        // Filtering
        if (role) query.actorRole = role;
        if (action) query.action = action;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        if (search) {
            query.$or = [
                { targetName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { action: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const logs = await AuditLog.find(query)
            .populate('actor', 'fullname email profile.profilePhoto')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalLogs = await AuditLog.countDocuments(query);

        return res.status(200).json({
            success: true,
            logs,
            totalLogs,
            totalPages: Math.ceil(totalLogs / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ✅ Get Audit Analytics
export const getAuditAnalytics = async (req, res) => {
    try {
        const totalActivities = await AuditLog.countDocuments();
        
        const jobsCreated = await AuditLog.countDocuments({ action: "JOB_CREATED" });
        const appsSubmitted = await AuditLog.countDocuments({ action: "APPLICATION_SUBMITTED" });
        const companiesApproved = await AuditLog.countDocuments({ action: "ADMIN_APPROVAL" });
        const companiesRejected = await AuditLog.countDocuments({ action: "ADMIN_REJECTION" });

        return res.status(200).json({
            success: true,
            analytics: {
                totalActivities,
                jobsCreated,
                appsSubmitted,
                companiesApproved,
                companiesRejected
            }
        });
    } catch (error) {
        console.error("Error fetching audit analytics:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};
