import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", isAuthenticated, getNotifications);
router.post("/mark-as-read", isAuthenticated, markAsRead);

export default router;
