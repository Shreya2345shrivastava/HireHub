import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,  // Must be String — Number destroys leading zeros (e.g. +91 0123... → 123...)
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'recruiter', 'admin'],
    required: true
  },
  profile: {
    bio: { type: String },
    skills: [{ type: String }],
    resume: { type: String }, // URL to resume file
    resumeOriginalName: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    profilePhoto: { type: String, default: "" },
    parsedResumeData: {
      extractedSkills: [{ type: String }],
      experienceYears: { type: Number, default: 0 },
      education: { type: String, default: "" },
      projects: [{ type: String }],
      certifications: [{ type: String }],
      strengths: [{ type: String }],
      summary: { type: String, default: "" },
      links: {
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        portfolio: { type: String, default: "" }
      }
    },
    aiCareerProfile: {
      careerScore: { type: Number },
      topSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      growthSuggestions: [{ type: String }],
      learningRoadmap: [{ step: String, description: String }],
      lastUpdated: { type: Date }
    },
    aiResumeOptimizer: {
      atsScore: { type: Number },
      missingKeywords: [{ type: String }],
      weaknesses: [{ type: String }],
      formattingIssues: [{ type: String }],
      improvements: [{ type: String }],
      lastUpdated: { type: Date }
    },
    aiJobRecommendations: [{
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
      matchPercentage: { type: Number },
      matchReasoning: { type: String },
      generatedAt: { type: Date, default: Date.now }
    }]
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  otp: { // Store the OTP value
    type: String,
    default: null
  },
  otpExpiry: { // Store OTP expiration time
    type: Date,
    default: null
  },
  
  // Store the timestamp of the last login
  lastLogin: {
    type: Date,
    default: null
  },

  // Flags to track login status in the last 30 days
  studentLogin: {
    type: Boolean,
    default: false
  },
  recruiterLogin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Method to update login flags based on last login
userSchema.methods.trackLogin = function () {
  const now = new Date();
  
  // Set the lastLogin field to the current time
  this.lastLogin = now;
  
  // Set the login flags to true based on the role
  if (this.role === 'student') {
    this.studentLogin = true;
  } else if (this.role === 'recruiter') {
    this.recruiterLogin = true;
  }
};

// Pre-save hook to check if the user has logged in within the last 30 days
userSchema.pre('save', function (next) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  // If lastLogin is older than 30 days, reset login flags
  if (this.lastLogin && this.lastLogin < thirtyDaysAgo) {
    if (this.role === 'student') {
      this.studentLogin = false;
    } else if (this.role === 'recruiter') {
      this.recruiterLogin = false;
    }
  }

  next();
});

export const User = mongoose.model('User', userSchema);
