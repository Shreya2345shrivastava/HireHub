import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actorRole: {
        type: String,
        required: true,
        enum: ['student', 'recruiter', 'admin']
    },
    action: {
        type: String,
        required: true
    },
    targetType: {
        type: String,
        required: true
    },
    targetId: {
        type: String, // String to handle generic cases, could be objectId
    },
    targetName: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    }
}, { timestamps: true });

// Indexes for fast filtering and timeline sorting
auditLogSchema.index({ actor: 1, action: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorRole: 1 });
auditLogSchema.index({ targetType: 1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
