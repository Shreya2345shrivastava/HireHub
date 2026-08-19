import express from "express";
import { getStudentAnalytics, getRecruiterAnalytics } from "../controllers/analytics.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isRecruiter, isStudent } from "../middlewares/isAuthorized.js";

const router = express.Router();

// Role-segregated analytics — each role can only see their own analytics
router.route("/student").get(isAuthenticated, isStudent, getStudentAnalytics);
router.route("/recruiter").get(isAuthenticated, isRecruiter, getRecruiterAnalytics);

export default router;
