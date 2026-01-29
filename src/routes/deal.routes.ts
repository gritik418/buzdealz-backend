import { Router } from "express";
import { getDeals } from "../controllers/deal.controller.js";

const router = Router();

router.get("/", getDeals);

export default router;
