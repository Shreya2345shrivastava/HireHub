import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isRecruiter } from "../middlewares/isAuthorized.js";
import { createLead, getLeadsByCompany, updateLeadStatus, addLeadNote } from "../controllers/crm.controller.js";

const router = express.Router();

router.route("/").post(isAuthenticated, isRecruiter, createLead);
router.route("/company/:companyId").get(isAuthenticated, isRecruiter, getLeadsByCompany);
router.route("/:id/status").put(isAuthenticated, isRecruiter, updateLeadStatus);
router.route("/:id/note").post(isAuthenticated, isRecruiter, addLeadNote);

export default router;
