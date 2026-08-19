import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isRecruiter } from "../middlewares/isAuthorized.js";
import { submitReferral, getReferralsByCompany, updateReferralStatus } from "../controllers/referral.controller.js";
import { singleUpload } from "../middlewares/mutler.js";

const router = express.Router();

router.route("/").post(isAuthenticated, singleUpload, submitReferral);
router.route("/company/:companyId").get(isAuthenticated, isRecruiter, getReferralsByCompany);
router.route("/:id/status").put(isAuthenticated, isRecruiter, updateReferralStatus);

export default router;
