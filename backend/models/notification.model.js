import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            'application_submitted', 
            'application_accepted', 
            'application_rejected', 
            'interview_scheduled', 
            'new_application_received', 
            'company_approved', 
            'company_rejected', 
            'company_suspended', 
            'verification_request_submitted', 
            'new_recruiter_registers', 
            'suspicious_activity_detected',
            'info'
        ],
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
