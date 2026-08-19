import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Prevents duplicate company names
  },
  description: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
    type: String,
  },
  logo: {
    type: String, // Cloudinary URL (or static path)
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // --- Verification Fields ---
  verificationStatus: {
    type: String,
    enum: ["unverified", "pending", "verified", "rejected", "suspended"],
    default: "unverified",
  },
  verificationSubmittedAt: {
    type: Date,
  },
  verificationReviewedAt: {
    type: Date,
  },
  verificationNotes: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  verificationDate: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  officialCompanyEmail: {
    type: String,
  },
  linkedinUrl: {
    type: String,
  },
  supportingDocuments: [{
    type: String,
  }],
  registrationNumber: {
    type: String,
  },
  trustScore: {
    type: Number,
    default: 0,
  },
  companySize: {
    type: String,
    enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
  },
  industry: {
    type: String,
  },
  headquarters: {
    type: String,
  },
  // --- Phase 7: Enterprise Features ---
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["admin", "recruiter", "hiring_manager", "interviewer"], default: "recruiter" }
  }],
  customCareerPage: {
    slug: { type: String, unique: true, sparse: true },
    banner: { type: String }, // Cloudinary URL
    aboutUs: { type: String },
    culture: { type: String },
    benefits: [{ type: String }],
    galleryImages: [{ type: String }]
  }
}, { timestamps: true });

export const Company = mongoose.model("Company", companySchema);
