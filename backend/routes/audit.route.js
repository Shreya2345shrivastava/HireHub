import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { getAuditLogs, getAuditAnalytics } from "../controllers/audit.controller.js";

const router = express.Router();

router.route("/get").get(isAuthenticated, isAdmin, getAuditLogs);
router.route("/analytics").get(isAuthenticated, isAdmin, getAuditAnalytics);

export default router;
