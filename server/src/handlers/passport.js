// src/handlers/passport.js
// Feature 3 — Trust Layer (Product Health Card / Product Passport)
// A digital "passport" per item showing verified condition, refurb history,
// warranty status, QR code. Accessible via QR code for the next buyer.

import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { dynamo, s3, TABLES, S3_BUCKET } from "../utils/awsClients.js";
import { invokeClaudeText } from "../utils/bedrockHelper.js";

const PASSPORT_BASE_URL = process.env.PASSPORT_BASE_URL || "http://localhost:5173/passport";

// ── Create a new Product Passport ─────────────────────────────────────────────
export async function createPassport(req, res) {
  try {
    const {
      itemId,
      productName,
      category,
      brand,
      modelNumber,
      origin,
      materials,
      manufacturingYear,
      grade,
      trustScore,
      defects,
      repairHistory,
      recyclability,
      sustainabilityScore,
      carbonSavedKg,
    } = req.body;

    if (!productName) {
      return res.status(400).json({ error: "productName is required" });
    }

    const passportId = itemId || uuidv4();
    const passportCode = `RC-${passportId.slice(0, 6).toUpperCase()}-AX`;

    // 1️⃣  Generate QR code PNG (base64 data URL → store in S3)
    const passportUrl = `${PASSPORT_BASE_URL}/${passportId}`;
    const qrDataUrl = await QRCode.toDataURL(passportUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    // Store QR PNG in S3
    const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
    const qrS3Key = `passports/${passportId}/qr.png`;
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: qrS3Key,
        Body: qrBuffer,
        ContentType: "image/png",
      })
    );
    const qrUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${qrS3Key}`;

    // 2️⃣  AI-generated sustainability narrative (Bedrock Claude)
    let sustainabilityNarrative = "";
    try {
      sustainabilityNarrative = await invokeClaudeText(
        `Write a 2-sentence sustainability narrative for a ReCircle Product Passport.
Product: ${productName} (${category || "General"})
Grade: ${grade || "B"}, Carbon saved: ${carbonSavedKg || 5}kg vs landfill.
Make it positive and factual. Do NOT use markdown.`,
        {
          maxTokens: 150,
          systemPrompt: "You write concise, positive sustainability summaries for product passports.",
        }
      );
    } catch (e) {
      sustainabilityNarrative = `This ${productName} has been verified by ReCircle AI and is ready for its next chapter, saving an estimated ${carbonSavedKg || 5}kg of CO₂ compared to disposal.`;
    }

    // 3️⃣  Build passport object
    const now = new Date().toISOString();
    const passport = {
      passportId,
      passportCode,
      itemId: itemId || passportId,
      productName,
      category: category || "General",
      brand: brand || "Unknown",
      modelNumber: modelNumber || null,
      origin: origin || "Not specified",
      materials: materials || "Not specified",
      manufacturingYear: manufacturingYear || null,
      recyclability: recyclability || "Check local guidelines",
      grade: grade || "B",
      trustScore: trustScore || 80,
      defects: defects || [],
      repairHistory: repairHistory || "None — first resale",
      sustainabilityScore: sustainabilityScore || computeSustainabilityScore(grade, carbonSavedKg),
      carbonSavedKg: carbonSavedKg || 5,
      sustainabilityNarrative,
      qrCodeUrl: qrUrl,
      passportUrl,
      verifications: [
        { type: "AI Inspected", verifiedAt: now, verifiedBy: "ReCircle AI (Bedrock)" },
        { type: "Carbon Tracked", verifiedAt: now, verifiedBy: "ReCircle Sustainability Engine" },
      ],
      warrantyStatus: grade === "A" || grade === "B" ? "ReCircle 90-day guarantee" : "Sold as-is",
      ownershipHistory: [{ ownedAt: now, event: "ReCircle verified — available for resale" }],
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    await dynamo.send(new PutCommand({ TableName: TABLES.PASSPORTS, Item: passport }));

    // 4️⃣  If itemId links to an item record, update it
    if (itemId) {
      try {
        await dynamo.send(
          new UpdateCommand({
            TableName: TABLES.ITEMS,
            Key: { itemId },
            UpdateExpression: "SET passportId = :pid, passportCode = :pc, updatedAt = :t",
            ExpressionAttributeValues: {
              ":pid": passportId,
              ":pc": passportCode,
              ":t": now,
            },
          })
        );
      } catch (e) {
        console.warn("Could not update item with passportId:", e.message);
      }
    }

    return res.status(201).json({
      success: true,
      passportId,
      passportCode,
      passportUrl,
      qrCodeUrl: qrUrl,
      passport,
    });
  } catch (err) {
    console.error("createPassport error:", err);
    return res.status(500).json({ error: "Failed to create Product Passport." });
  }
}

// ── Get passport by ID ────────────────────────────────────────────────────────
export async function getPassport(req, res) {
  try {
    const { passportId } = req.params;
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLES.PASSPORTS, Key: { passportId } })
    );
    if (!result.Item) return res.status(404).json({ error: "Passport not found" });
    return res.json({ success: true, passport: result.Item });
  } catch (err) {
    console.error("getPassport error:", err);
    return res.status(500).json({ error: "Failed to fetch passport." });
  }
}

// ── Add a repair/ownership event to passport history ─────────────────────────
export async function addPassportEvent(req, res) {
  try {
    const { passportId } = req.params;
    const { event, eventType } = req.body; // eventType: "repair" | "ownership" | "inspection"

    if (!event) return res.status(400).json({ error: "event description required" });

    const result = await dynamo.send(
      new GetCommand({ TableName: TABLES.PASSPORTS, Key: { passportId } })
    );
    if (!result.Item) return res.status(404).json({ error: "Passport not found" });

    const now = new Date().toISOString();
    const newEvent = { ownedAt: now, event, eventType: eventType || "inspection" };

    const history = [...(result.Item.ownershipHistory || []), newEvent];

    await dynamo.send(
      new UpdateCommand({
        TableName: TABLES.PASSPORTS,
        Key: { passportId },
        UpdateExpression: "SET ownershipHistory = :h, updatedAt = :t",
        ExpressionAttributeValues: { ":h": history, ":t": now },
      })
    );

    return res.json({ success: true, passportId, event: newEvent });
  } catch (err) {
    console.error("addPassportEvent error:", err);
    return res.status(500).json({ error: "Failed to add event." });
  }
}

// ── Get QR code PNG inline (redirect to S3 URL) ───────────────────────────────
export async function getPassportQR(req, res) {
  try {
    const { passportId } = req.params;
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLES.PASSPORTS, Key: { passportId } })
    );
    if (!result.Item) return res.status(404).json({ error: "Passport not found" });
    return res.redirect(result.Item.qrCodeUrl);
  } catch (err) {
    return res.status(500).json({ error: "Failed to get QR code." });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function computeSustainabilityScore(grade, carbonSavedKg) {
  const gradeScore = { A: 40, B: 30, C: 20, D: 10 }[grade] || 25;
  const carbonScore = Math.min(40, (carbonSavedKg || 5) * 3);
  const baseScore = 20;
  return Math.min(100, gradeScore + carbonScore + baseScore);
}
