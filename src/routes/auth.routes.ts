import { Router } from "express";
import { getMe, userLogin, userLogout, userRegister } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.get("/me", isAuthenticated, getMe);

export default router;
