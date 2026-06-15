// src/handlers/auth.js
// Auth: signup / login — stores users in a local JSON file (no external DB needed)

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH   = path.resolve(__dirname, "../../data/users.json");
const JWT_SECRET = process.env.JWT_SECRET || "recircle-secret-2025";
const JWT_EXPIRES = "7d";

// ── Helpers ───────────────────────────────────────────────────────────────────
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeDB(users) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function safeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email and password are required" });

    const users = readDB();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id:           `user-${Date.now()}`,
      name:         name.trim(),
      email:        email.toLowerCase().trim(),
      passwordHash,
      greenCredits: 0,
      creditHistory:[],
      createdAt:    new Date().toISOString(),
    };

    users.push(user);
    writeDB(users);

    const token = makeToken(user);
    return res.status(201).json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({ error: "Signup failed" });
  }
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password are required" });

    const users = readDB();
    const user  = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: "Invalid email or password" });

    const token = makeToken(user);
    return res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
}

// ── GET /api/auth/me  (Bearer token required) ─────────────────────────────────
export function getMe(req, res) {
  try {
    const header = req.headers.authorization || "";
    const token  = header.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "No token provided" });

    const payload = jwt.verify(token, JWT_SECRET);
    const users   = readDB();
    const user    = users.find((u) => u.id === payload.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ success: true, user: safeUser(user) });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── POST /api/auth/credits/add  { userId, amount, reason } ────────────────────
export function addCredits(req, res) {
  try {
    const { userId, amount, reason } = req.body;
    if (!userId || !amount)
      return res.status(400).json({ error: "userId and amount required" });

    const users = readDB();
    const user  = users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const credits = parseInt(amount, 10);
    user.greenCredits = (user.greenCredits || 0) + credits;
    user.creditHistory = user.creditHistory || [];
    user.creditHistory.push({
      type:   "earn",
      amount: credits,
      reason: reason || "ReCircle activity",
      date:   new Date().toISOString(),
    });

    // Build structured activity entry from reason string
    user.activityHistory = user.activityHistory || [];
    const meta = req.body.meta || {};
    user.activityHistory.push({
      id:          `act-${Date.now()}`,
      activityType: req.body.activityType || "other",
      reason:      reason || "ReCircle activity",
      credits,
      productName: meta.productName || null,
      category:    meta.category    || null,
      size:        meta.size        || null,
      photoUrl:    meta.photoUrl    || null,
      price:       meta.price       || null,
      date:        new Date().toISOString(),
    });

    writeDB(users);
    return res.json({ success: true, greenCredits: user.greenCredits, user: safeUser(user) });
  } catch (err) {
    console.error("addCredits error:", err);
    return res.status(500).json({ error: "Failed to add credits" });
  }
}

// ── POST /api/auth/credits/redeem  { userId, amount } ─────────────────────────
export function redeemCredits(req, res) {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount)
      return res.status(400).json({ error: "userId and amount required" });

    const users  = readDB();
    const user   = users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const credits = parseInt(amount, 10);
    if ((user.greenCredits || 0) < credits)
      return res.status(400).json({ error: "Insufficient credits" });

    user.greenCredits -= credits;
    user.creditHistory = user.creditHistory || [];
    user.creditHistory.push({
      type:   "redeem",
      amount: credits,
      reason: "Redeemed for discount",
      date:   new Date().toISOString(),
    });

    writeDB(users);
    const discountINR = Math.floor(credits * 0.1); // 10p per credit  
    return res.json({ success: true, greenCredits: user.greenCredits, discountINR });
  } catch (err) {
    console.error("redeemCredits error:", err);
    return res.status(500).json({ error: "Failed to redeem credits" });
  }
}

// ── GET /api/auth/history/:userId  (Bearer token required) ───────────────────
export function getUserHistory(req, res) {
  try {
    const header = req.headers.authorization || "";
    const token  = header.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "No token provided" });

    const jwt     = require("jsonwebtoken");
    const payload = jwt.verify(token, JWT_SECRET);
    const users   = readDB();
    const user    = users.find((u) => u.id === req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.id !== payload.id)
      return res.status(403).json({ error: "Forbidden" });

    return res.json({
      success: true,
      activityHistory: user.activityHistory || [],
      creditHistory:   user.creditHistory   || [],
      greenCredits:    user.greenCredits    || 0,
    });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}