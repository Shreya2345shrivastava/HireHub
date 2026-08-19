import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { generateInterviewPrep, getCareerIntelligence, getResumeOptimizer, generateCoverLetter, getJobRecommendations } from "../controllers/ai.controller.js";
import { generateOfferLetter } from "../controllers/offer.controller.js";
import { isRecruiter } from "../middlewares/isAuthorized.js";

const router = express.Router();

router.route("/generate-interview-prep/:id").post(isAuthenticated, generateInterviewPrep);
router.route("/career-intelligence").post(isAuthenticated, getCareerIntelligence);
router.route("/resume-optimizer").post(isAuthenticated, getResumeOptimizer);
router.route("/cover-letter").post(isAuthenticated, generateCoverLetter);
router.route("/job-recommendations").post(isAuthenticated, getJobRecommendations);

// Phase 7: CRM
router.route("/generate-offer").post(isAuthenticated, isRecruiter, generateOfferLetter);

export default router;
