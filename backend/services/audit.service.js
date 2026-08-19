import { AuditLog } from "../models/auditLog.model.js";

/**
 * createAuditLog - Centralized helper to securely track system activities.
 * It catches errors internally so it doesn't break the main execution flow.
 */
export const createAuditLog = async ({
    actor,
    actorRole,
    action,
    targetType,
    targetId,
    targetName,
    description,
    metadata,
    ipAddress
}) => {
    try {
        if (!actor || !actorRole || !action || !targetType || !description) {
            console.error("AuditLog Error: Missing required fields", { actor, actorRole, action, targetType, description });
            return null;
        }

        const log = await AuditLog.create({
            actor,
            actorRole,
            action,
            targetType,
            targetId: targetId ? targetId.toString() : undefined,
            targetName,
            description,
            metadata,
            ipAddress
        });
        
        return log;
    } catch (error) {
        console.error("AuditLog Creation Failed:", error);
        // We do not throw here, because auditing should not crash the main feature flow.
        return null;
    }
};
