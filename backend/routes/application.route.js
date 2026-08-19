import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isRecruiter, isStudent } from "../middlewares/isAuthorized.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus, getAIMatchScore } from "../controllers/application.controller.js";

const router = express.Router();

// Student-only routes
router.route("/apply/:id").get(isAuthenticated, isStudent, applyJob);
router.route("/get").get(isAuthenticated, isStudent, getAppliedJobs);

// Recruiter-only routes
router.route("/:id/applicants").get(isAuthenticated, isRecruiter, getApplicants);
router.route("/status/:id/update").post(isAuthenticated, isRecruiter, updateStatus);

// Accessible by both roles (recruiter viewing match for their job, student checking own match)
router.route("/:id/ai-match").get(isAuthenticated, getAIMatchScore);

export default router;
