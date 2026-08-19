import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import {
    getPendingCompanies,
    getAllCompaniesAdmin,
    approveCompany,
    rejectCompany,
    suspendCompany,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.route("/companies/pending").get(isAuthenticated, isAdmin, getPendingCompanies);
router.route("/companies").get(isAuthenticated, isAdmin, getAllCompaniesAdmin);
router.route("/company/:id/approve").put(isAuthenticated, isAdmin, approveCompany);
router.route("/company/:id/reject").put(isAuthenticated, isAdmin, rejectCompany);
router.route("/company/:id/suspend").put(isAuthenticated, isAdmin, suspendCompany);

export default router;
