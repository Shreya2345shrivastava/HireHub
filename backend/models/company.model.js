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
  }
}, { timestamps: true });

export const Company = mongoose.model("Company", companySchema);
