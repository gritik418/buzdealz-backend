import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(isAuthenticated);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:dealId", removeFromWishlist);

export default router;
