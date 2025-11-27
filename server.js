import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

// Validate environment variables
import { validateEnv } from "./config/validateEnv.js";
validateEnv();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";

import logger from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import db from "./models/index.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import blogRoutes from "./routes/blogs.js";
import announcementRoutes from "./routes/announcement.js";

const app = express();

// CORS configuration with specific allowed origins (MUST be first!)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : ["http://localhost:5173"];

// Log for debugging in Vercel
console.log("🔧 CORS Allowed Origins:", allowedOrigins);
console.log("🔧 NODE_ENV:", process.env.NODE_ENV);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log("✅ CORS allowed origin:", origin);
      callback(null, true);
    } else {
      console.log("❌ CORS blocked origin:", origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// HTTPS enforcement in production (applied AFTER CORS)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    // Skip HTTPS redirect for OPTIONS requests (CORS preflight)
    if (req.method === "OPTIONS") {
      return next();
    }
    
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// Body parser with size limits
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});

// Routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/announcements", announcementRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Error handler (must be last)
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);

// Initialize database connection
(async () => {
  try {
    await db.sequelize.authenticate();
    logger.info("✅ Successfully connected to Supabase PostgreSQL database");
    
    // Auto-sync schema to create/update tables
    await db.sequelize.sync({ alter: true });
    logger.info("✅ Database schema synced successfully");
  } catch (err) {
    logger.error("❌ Failed to connect to database");
    logger.error(err);
    logger.warn("Server will continue but database operations may fail");
  }
})();

// For local development
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`CORS allowed origins: ${process.env.ALLOWED_ORIGINS}`);
  });
}

// Export for Vercel serverless
export default app;
