// routes/user.js
import { Router } from "express";
import { getMembers, getPublicUser, getUserProfile } from "../controllers/user.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Get all team members (Strategy Board and Executive Team)
router.get("/members", getMembers);

// Get public user profile (no auth required)
router.get("/public-profile/:id", getPublicUser);

// Get user profile (auth required - shows more info for logged-in users)
router.get("/profile/:id", requireAuth, getUserProfile);

export default router;

