import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isRecruiter } from "../middlewares/isAuthorized.js";
import { getCompany, getCompanyById, getCompanyPublicProfile, registerCompany, updateCompany, submitVerification } from "../controllers/company.controller.js";
import { singleUpload, multipleUpload } from "../middlewares/mutler.js";
import { validate } from "../middlewares/validate.js";
import { registerCompanySchema, updateCompanySchema, verifyCompanySchema } from "../validators/company.validator.js";

const router = express.Router();

// All company management routes require Recruiter role
router.route("/register").post(isAuthenticated, isRecruiter, validate(registerCompanySchema), registerCompany);
router.route("/get").get(isAuthenticated, isRecruiter, getCompany);
router.route("/get/:id").get(isAuthenticated, getCompanyById); // Any auth user can view a company (for job listings)
router.route("/public/:id").get(isAuthenticated, getCompanyPublicProfile); // Public profile with stats and sanitized data
router.route("/update/:id").put(isAuthenticated, isRecruiter, singleUpload, validate(updateCompanySchema), updateCompany);
router.route("/verify/:id").post(isAuthenticated, isRecruiter, multipleUpload, validate(verifyCompanySchema), submitVerification);

export default router;
