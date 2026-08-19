import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isRecruiter, isStudent } from "../middlewares/isAuthorized.js";
import { 
    scheduleInterview, 
    getStudentInterviews, 
    getInterviewDetails, 
    updateInterviewStatus, 
    submitFeedback 
} from "../controllers/interview.controller.js";

const router = express.Router();

// Both Student & Recruiter
router.route("/:id").get(isAuthenticated, getInterviewDetails);

// Student only
router.route("/student/all").get(isAuthenticated, isStudent, getStudentInterviews);

// Recruiter only
router.route("/schedule").post(isAuthenticated, isRecruiter, scheduleInterview);
router.route("/:id/status").put(isAuthenticated, isRecruiter, updateInterviewStatus);
router.route("/:id/feedback").post(isAuthenticated, isRecruiter, submitFeedback);

export default router;
