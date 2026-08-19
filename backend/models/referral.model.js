import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    referrerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // The employee referring
        required: true
    },
    candidateName: {
        type: String,
        required: true
    },
    candidateEmail: {
        type: String,
        required: true
    },
    resume: {
        type: String, // Cloudinary URL
        required: true
    },
    relationship: {
        type: String, // e.g., "Former Colleague", "Friend"
        required: true
    },
    endorsement: {
        type: String, // Why are they a good fit?
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Reviewed", "Interviewing", "Hired", "Rejected"],
        default: "Pending"
    }
}, { timestamps: true });

export const Referral = mongoose.model("Referral", referralSchema);
