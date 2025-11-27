// server/routes/profile.js
import express from "express";
import { getProfile, updateProfile, changePassword } from "../controllers/profile.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All profile routes require authentication
router.get("/", requireAuth, getProfile);
router.put("/", requireAuth, updateProfile);
router.post("/change-password", requireAuth, changePassword);

export default router;

