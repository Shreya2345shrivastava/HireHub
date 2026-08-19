import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["New Lead", "Contacted", "Interested", "Interviewing", "Hired", "Archived"],
        default: "New Lead"
    },
    notes: [{
        text: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    reminders: [{
        text: String,
        date: Date,
        completed: { type: Boolean, default: false }
    }]
}, { timestamps: true });

// Prevent duplicate leads for the same candidate in the same company
leadSchema.index({ candidateId: 1, companyId: 1 }, { unique: true });

export const Lead = mongoose.model("Lead", leadSchema);
