import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
    clearNotifications, 
    getNotifications, 
    markAllAsRead, 
    markAsRead 
} from "../controllers/notification.controller.js";

const router = express.Router();

router.route("/get").get(isAuthenticated, getNotifications);
router.route("/read/:id").put(isAuthenticated, markAsRead);
router.route("/read-all").put(isAuthenticated, markAllAsRead);
router.route("/clear").delete(isAuthenticated, clearNotifications);

export default router;
