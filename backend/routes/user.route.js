import express from "express";
import { getSavedJobs, getAnalytics, login, logout, register, toggleSaveJob, updateProfile, verifyOTP } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";
import { authLimiter, signupLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema, otpSchema, updateProfileSchema } from "../validators/user.validator.js";

const router = express.Router();

// Public routes — rate limited
router.route("/register").post(signupLimiter, singleUpload, validate(registerSchema), register);
router.route("/login").post(authLimiter, validate(loginSchema), login);
router.route("/verify-otp").post(authLimiter, validate(otpSchema), verifyOTP);

// Authenticated routes
router.route("/logout").get(isAuthenticated, logout);
router.route("/profile/update").post(isAuthenticated, singleUpload, validate(updateProfileSchema), updateProfile);
router.route("/save-job/:id").post(isAuthenticated, toggleSaveJob);
router.route("/saved-jobs").get(isAuthenticated, getSavedJobs);
router.route("/analytics").get(isAuthenticated, getAnalytics);

export default router;
