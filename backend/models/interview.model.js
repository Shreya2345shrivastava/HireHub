import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    roundName: {
        type: String,
        enum: ['HR Round', 'Technical Round', 'Manager Round', 'Final Round'],
        required: true
    },
    interviewType: {
        type: String,
        enum: ['Online', 'Offline'],
        required: true
    },
    interviewDate: {
        type: String,
        required: true
    },
    interviewTime: {
        type: String,
        required: true
    },
    duration: {
        type: String, // e.g., '30 mins', '1 hour'
    },
    location: {
        type: String // for offline
    },
    meetingLink: {
        type: String // for online
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
        default: 'Scheduled'
    },
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        recommendation: { type: String, enum: ['Reject', 'Consider', 'Strong Hire'] },
        comments: { type: String }
    },
    aiPrepSheet: {
        strengths: [String],
        weaknesses: [String],
        suggestedQuestions: [String],
        hiringRecommendation: String
    }
}, { timestamps: true });

export const Interview = mongoose.model("Interview", interviewSchema);
