import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";

import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import notificationRoute from "./routes/notification.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import adminRoute from "./routes/admin.route.js";
import auditRoute from "./routes/audit.route.js";
import errorHandler from "./middlewares/errorHandler.js";

import { Server } from "socket.io";
import http from "http";

// Fix for ES Modules + dotenv path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// ─── Security Headers (Helmet) ────────────────────────────────────────────────
// Helmet sets secure HTTP headers by default. We customise contentSecurityPolicy
// to allow Cloudinary images and Google Fonts used by the frontend.
// We DISABLE it in development to avoid blocking Vite HMR.
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com",   // Cloudinary profile photos / logos
          "https://www.shutterstock.com",  // Default avatar fallback
        ],
        fontSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
        ],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_URL || "http://localhost:5173",
        ],
      },
    } : false, // Disable CSP in development to allow Vite HMR
    crossOriginEmbedderPolicy: false, // Required for Cloudinary to work
  })
);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, { cors: corsOptions });

export { io }; // Exported for use in controllers (static import, not dynamic)

io.on("connection", (socket) => {
    socket.on("join", (userId) => {
        socket.join(userId);
    });

    socket.on("disconnect", () => {
        // Socket cleanup handled automatically by Socket.IO
    });
});

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // Limit request body size to prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(cors(corsOptions));

const PORT = process.env.PORT || 8000;

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "HireHub API is running." });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/notification", notificationRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/audit", auditRoute);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
// MUST be the last middleware — Express identifies it by its 4-argument signature
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ HireHub Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  });