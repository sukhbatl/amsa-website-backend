import { Router } from "express";
import { body, validationResult } from "express-validator";
import { signup, login, me } from "../controllers/auth.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

r.post("/signup", validate([
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
]), signup);

r.post("/login", validate([
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty()
]), login);

r.get("/me", requireAuth, me);

export default r;
