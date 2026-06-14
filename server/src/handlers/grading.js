// src/handlers/grading.js
// Feature 1 — AI Grading (Condition Assessment)
// Uses Amazon Bedrock (Claude vision) to grade returned items from uploaded photos.
// Image is sent directly as base64 — no S3 required.

import { v4 as uuidv4 } from "uuid";
import { invokeClaudeVision, extractJSON } from "../utils/bedrockHelper.js";

// ── Grade a returned item via photo upload ────────────────────────────────────
export async function gradeItem(req, res) {
  try {
    const { productName, category, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No photo uploaded. Please attach an image." });
    }

    const itemId = uuidv4();

    // ── AI Vision grading via Bedrock (Claude) ────────────────────────────────
    const gradingPrompt = `
You are grading a returned/pre-owned product for ReCircle, Amazon's circular commerce platform.

Product: ${productName || "Unknown"}
Category: ${category || "General"}
${description ? `Description: ${description}` : ""}

Analyse the product photo carefully and respond ONLY with valid JSON (no markdown, no explanation):

{
  "grade": "A" | "B" | "C" | "D",
  "conditionLabel": "Like New" | "Good" | "Fair" | "Poor",
  "trustScore": <integer 0–100>,
  "defects": [<list of specific defect strings seen in the image, empty array if none>],
  "summary": "<2-sentence plain-English condition summary based on what you actually see in the image>",
  "recommendedAction": "resell" | "refurbish" | "donate" | "recycle",
  "estimatedResaleDiscountPct": <integer 10–90>,
  "carbonSavedKg": <number, estimated kg CO2 saved vs landfill>
}

Grading rubric:
- A (Like New, 85–100): No visible wear, all parts present, original condition
- B (Good, 65–84): Minor cosmetic wear only, fully functional
- C (Fair, 40–64): Visible wear/minor damage, functional but reduced value
- D (Poor, 0–39): Significant damage or missing parts, may not be functional

IMPORTANT: Base your assessment ONLY on what you can actually see in the uploaded image. Do not guess.
`;

    let gradingResult = null;

    try {
      const aiText = await invokeClaudeVision(gradingPrompt, file.buffer, file.mimetype);
      gradingResult = extractJSON(aiText);
      if (!gradingResult) {
        // Claude replied but JSON parse failed — try to extract grade manually
        console.warn("Claude replied but JSON parse failed. Raw:", aiText?.slice(0, 200));
      }
    } catch (bedrockErr) {
      console.warn("Bedrock vision failed:", bedrockErr.message);
      gradingResult = null;
    }

    // ── Fallback: simple heuristic (only if Bedrock completely fails) ─────────
    if (!gradingResult) {
      console.warn("Using fallback grade — Bedrock vision unavailable");
      gradingResult = buildFallbackGrade(false, productName, category);
      gradingResult._fallback = true;
    }

    const carbonSaved = gradingResult.carbonSavedKg || estimateCarbonSaved(category);

    return res.status(201).json({
      success: true,
      itemId,
      usedFallback: !!gradingResult._fallback,
      grading: {
        grade:                      gradingResult.grade,
        conditionLabel:             gradingResult.conditionLabel,
        trustScore:                 gradingResult.trustScore,
        defects:                    gradingResult.defects || [],
        summary:                    gradingResult.summary,
        recommendedAction:          gradingResult.recommendedAction,
        estimatedResaleDiscountPct: gradingResult.estimatedResaleDiscountPct,
        carbonSavedKg:              carbonSaved,
      },
      photoUrl: null, // S3 not required — image analysed in-memory
    });

  } catch (err) {
    console.error("gradeItem error:", err);
    return res.status(500).json({ error: "AI grading failed. Please try again." });
  }
}

// ── Re-grade an existing item ─────────────────────────────────────────────────
export async function regradeItem(req, res) {
  try {
    const { itemId } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No photo provided for re-grading." });

    const prompt = `Re-grade this returned product carefully based on the image.
Respond ONLY with JSON: {"grade","conditionLabel","trustScore","defects","summary","recommendedAction","estimatedResaleDiscountPct","carbonSavedKg"}`;

    const aiText = await invokeClaudeVision(prompt, file.buffer, file.mimetype);
    const newGrading = extractJSON(aiText) || buildFallbackGrade(false, "Unknown", "General");

    return res.json({ success: true, itemId, grading: newGrading });
  } catch (err) {
    console.error("regradeItem error:", err);
    return res.status(500).json({ error: "Re-grading failed." });
  }
}

// ── List recent items (stub — no DynamoDB required) ───────────────────────────
export async function getGradedItem(req, res) {
  return res.json({ success: true, item: null });
}

export async function listRecentItems(req, res) {
  return res.json({ success: true, items: [] });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildFallbackGrade(hasDamage, productName, category) {
  return {
    grade:                      hasDamage ? "C" : "B",
    conditionLabel:             hasDamage ? "Fair" : "Good",
    trustScore:                 hasDamage ? 65 : 82,
    defects:                    hasDamage ? ["Visible wear detected"] : [],
    summary:                    hasDamage
      ? `${productName || "This item"} shows signs of wear. Suitable for resale at a discount.`
      : `${productName || "This item"} appears to be in good condition. Ready for resale.`,
    recommendedAction:          hasDamage ? "refurbish" : "resell",
    estimatedResaleDiscountPct: hasDamage ? 55 : 35,
    carbonSavedKg:              estimateCarbonSaved(category),
  };
}

function estimateCarbonSaved(category) {
  const carbonMap = {
    Electronics:     12.5,
    Shoes:           6.8,
    Clothing:        4.2,
    "Home & Kitchen":8.1,
    "Baby Products": 3.9,
    Other:           5.0,
    General:         5.0,
  };
  return carbonMap[category] || 5.0;
}