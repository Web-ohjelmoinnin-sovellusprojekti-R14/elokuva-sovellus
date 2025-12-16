import { Router } from "express";
import logoutController from "../controllers/logoutController.js";

const router = Router();
router.post("/logout", logoutController);

export default router; 