// src/routes.js
// All API routes for ReCircle backend

import { Router } from "express";
import rateLimit from "express-rate-limit";

import { multerMiddleware } from "./middleware/upload.js";

import * as grading from "./handlers/grading.js";
import * as routing from "./handlers/routing.js";
import * as passport from "./handlers/passport.js";
import * as prevention from "./handlers/prevention.js";
import * as sustainability from "./handlers/sustainability.js";
import * as listings from "./handlers/listings.js";
import * as products from "./handlers/products.js";
import * as auth from "./handlers/auth.js";

const router = Router();

// ── Rate limiters ─────────────────────────────────────────────────────────────
const gradingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { error: "Too many grading requests — please wait a moment." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many AI requests — please slow down." },
});

// ── Health check ──────────────────────────────────────────────────────────────
router.get("/health", (req, res) =>
  res.json({ status: "ok", service: "ReCircle API", timestamp: new Date().toISOString() })
);

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/auth/signup",         auth.signup);
router.post("/auth/login",          auth.login);
router.get("/auth/me",              auth.getMe);
router.post("/auth/credits/add",    auth.addCredits);
router.post("/auth/credits/redeem", auth.redeemCredits);

// ── Products (Amazon catalogue) ───────────────────────────────────────────────
router.get("/products", products.getProducts);
router.get("/products/search", products.searchProducts);
router.get("/products/categories", products.getCategories);
router.get("/products/:id", products.getProduct);

// ── AI Grading — Feature 1 ────────────────────────────────────────────────────
// POST /api/grading/grade  (multipart/form-data: photo + productName + category)
router.post("/grading/grade", gradingLimiter, multerMiddleware("single"), grading.gradeItem);
router.get("/grading/items", grading.listRecentItems);
router.get("/grading/items/:itemId", grading.getGradedItem);
router.post("/grading/items/:itemId/regrade", gradingLimiter, multerMiddleware("single"), grading.regradeItem);

// ── Smart Routing — Feature 2 ─────────────────────────────────────────────────
// POST /api/routing/decide  { itemId?, grade, trustScore, category, estimatedValue, localDemandScore }
router.post("/routing/decide", aiLimiter, routing.routeItem);
router.get("/routing/decisions/:decisionId", routing.getRoutingDecision);
router.get("/routing/metrics", routing.getRoutingMetrics);

// ── Product Passport — Feature 3 ─────────────────────────────────────────────
// POST /api/passport/create  { itemId?, productName, grade, ... }
router.post("/passport/create", passport.createPassport);
router.get("/passport/:passportId", passport.getPassport);
router.get("/passport/:passportId/qr", passport.getPassportQR);
router.post("/passport/:passportId/events", passport.addPassportEvent);

// ── Return Prevention — Feature 4 ────────────────────────────────────────────
// POST /api/prevention/predict  { productName, category, customerHistory }
router.post("/prevention/predict", aiLimiter, prevention.predictReturnRisk);
router.post("/prevention/assistant", aiLimiter, prevention.conversationalAssistant);
router.post("/prevention/price", aiLimiter, prevention.suggestPrice);
router.get("/prevention/metrics", prevention.getPreventionMetrics);

// ── Sustainability Dashboard ───────────────────────────────────────────────────
router.get("/sustainability/dashboard", sustainability.getDashboard);
router.post("/sustainability/events", sustainability.recordSustainabilityEvent);
router.post("/sustainability/insight", aiLimiter, sustainability.getSustainabilityInsight);
router.get("/sustainability/users/:userId", sustainability.getUserImpact);

// ── Marketplace Listings (P2P + Bulk Seller) ──────────────────────────────────
router.get("/listings", listings.getListings);
router.post("/listings", listings.createListing);
router.get("/listings/nearby", listings.findNearbyMatches);
router.post("/listings/bulk", listings.bulkCreateListings);
router.get("/listings/:listingId", listings.getListing);
router.patch("/listings/:listingId", listings.updateListing);

export default router;
