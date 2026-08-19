import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isRecruiter } from "../middlewares/isAuthorized.js";
import { getAdminJobs, getAllJobs, getJobById, getTotalJobPostedLast30Days, postJob } from "../controllers/job.controller.js";
import { validate } from "../middlewares/validate.js";
import { jobSchema } from "../validators/job.validator.js";

const router = express.Router();

// Recruiter-only routes
router.route("/post").post(isAuthenticated, isRecruiter, validate(jobSchema), postJob);
router.route("/getadminjobs").get(isAuthenticated, isRecruiter, getAdminJobs);

// Student / general authenticated routes
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);

// Protected analytics route (was previously fully public — now requires auth)
router.route("/getTotalJobPostedLast30Days").get(isAuthenticated, getTotalJobPostedLast30Days);

export default router;
