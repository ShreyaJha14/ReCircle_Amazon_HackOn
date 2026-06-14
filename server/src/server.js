// src/server.js
// ReCircle Backend — Express server entry point
// Amazon Hackathon 2025 | "Second Life Commerce: AI-Powered Returns & Sustainable Resale"

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import routes from "./routes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security & CORS ───────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, mobile apps, Postman)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── API routes (all under /api) ───────────────────────────────────────────────
app.use("/api", routes);

// ── Root ──────────────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({
    service: "ReCircle API",
    version: "1.0.0",
    tagline: "AI-Powered Returns & Sustainable Resale",
    docs: "/api/health",
    features: [
      "AI Grading (Bedrock Vision)",
      "Smart Routing (Rules Engine + AI)",
      "Product Passport (DynamoDB + QR)",
      "Return Prevention (Predictive AI)",
      "Sustainability Dashboard",
      "P2P Marketplace",
      "Conversational Assistant (Bedrock Chat)",
    ],
  })
);

// ── 404 & error handlers ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n♻️  ReCircle API running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`   AWS Region  : ${process.env.AWS_REGION || "us-east-1"}`);
  console.log(`   CORS origin : ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`\n   Routes:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/grading/grade          (multipart: photo + productName + category)`);
  console.log(`   POST /api/routing/decide         (JSON: grade, category, ...)`);
  console.log(`   POST /api/passport/create        (JSON: productName, grade, ...)`);
  console.log(`   POST /api/prevention/assistant   (JSON: message, conversationHistory)`);
  console.log(`   GET  /api/sustainability/dashboard`);
  console.log(`   GET  /api/listings\n`);
});

export default app;
