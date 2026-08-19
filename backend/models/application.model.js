import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'hired', 'pending', 'accepted'],
    default: 'applied'
  },
  interviewDate: {
    type: String, // YYYY-MM-DD
  },
  interviewTime: {
    type: String, // HH:MM AM/PM
  },
  meetingLink: {
    type: String,
  },
  notes: {
    type: String,
  },
  timeline: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  matchScore: {
    type: Number,
    default: 0
  },
  rankScore: {
    type: Number,
    default: 0
  },
  aiSummary: {
    type: String,
    default: ""
  },
  missingSkills: [{
    type: String
  }],
  hiringRecommendation: {
    type: String,
    enum: ['Strong Hire', 'Consider', 'Reject', 'Pending'],
    default: 'Pending'
  },
  interviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  }],
  aiCoverLetter: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);
