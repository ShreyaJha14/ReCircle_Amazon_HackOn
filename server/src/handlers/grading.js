// src/handlers/grading.js
// Feature 1 — AI Grading (Condition Assessment)
// Uses Amazon Bedrock (Claude vision) to grade returned items from uploaded photos.
// Falls back to Rekognition for object / damage detection labels if needed.

import { v4 as uuidv4 } from "uuid";
import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { dynamo, s3, rekognition, TABLES, S3_BUCKET } from "../utils/awsClients.js";
import { invokeClaudeVision, invokeClaudeText, extractJSON } from "../utils/bedrockHelper.js";

// ── Grade a returned item via photo upload ────────────────────────────────────
export async function gradeItem(req, res) {
  try {
    const { productName, category, description } = req.body;
    const file = req.file; // multer puts the uploaded file here

    if (!file) {
      return res.status(400).json({ error: "No photo uploaded. Please attach an image." });
    }

    const itemId = uuidv4();
    const s3Key = `items/${itemId}/${Date.now()}-${file.originalname}`;

    // 1️⃣  Store image in S3
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: { itemId, productName: productName || "unknown" },
      })
    );

    const photoUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`;

    // 2️⃣  AI Vision grading via Bedrock (Claude)
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
  "defects": [<list of specific defect strings, empty array if none>],
  "summary": "<2-sentence plain-English condition summary>",
  "recommendedAction": "resell" | "refurbish" | "donate" | "recycle",
  "estimatedResaleDiscountPct": <integer 10–90>,
  "carbonSavedKg": <number, estimated kg CO2 saved vs landfill>
}

Grading rubric:
- A (Like New, 85–100): No visible wear, all parts present, original condition
- B (Good, 65–84): Minor cosmetic wear only, fully functional
- C (Fair, 40–64): Visible wear/minor damage, functional but reduced value
- D (Poor, 0–39): Significant damage or missing parts, may not be functional
`;

    let gradingResult;
    try {
      const aiText = await invokeClaudeVision(gradingPrompt, file.buffer, file.mimetype);
      gradingResult = extractJSON(aiText);
    } catch (bedrockErr) {
      console.warn("Bedrock vision failed, falling back to Rekognition labels:", bedrockErr.message);
      gradingResult = null;
    }

    // 3️⃣  Rekognition fallback — use label confidence to estimate condition
    let rekognitionLabels = [];
    if (!gradingResult) {
      try {
        const rekResult = await rekognition.send(
          new DetectLabelsCommand({
            Image: { Bytes: file.buffer },
            MinConfidence: parseFloat(process.env.REKOGNITION_MIN_CONFIDENCE || "70"),
          })
        );
        rekognitionLabels = rekResult.Labels?.map((l) => l.Name) || [];

        // Simple heuristic fallback grading
        const damagePhrases = ["Damaged", "Broken", "Torn", "Scratched", "Stain"];
        const hasDamage = rekognitionLabels.some((l) =>
          damagePhrases.some((d) => l.toLowerCase().includes(d.toLowerCase()))
        );
        gradingResult = buildFallbackGrade(hasDamage, productName, category);
      } catch (rekErr) {
        console.error("Rekognition also failed:", rekErr.message);
        gradingResult = buildFallbackGrade(false, productName, category);
      }
    }

    // 4️⃣  Persist to DynamoDB
    const now = new Date().toISOString();
    const item = {
      itemId,
      productName: productName || "Unknown Item",
      category: category || "General",
      description: description || "",
      photoUrl,
      s3Key,
      grade: gradingResult.grade,
      conditionLabel: gradingResult.conditionLabel,
      trustScore: gradingResult.trustScore,
      defects: gradingResult.defects || [],
      summary: gradingResult.summary,
      recommendedAction: gradingResult.recommendedAction,
      estimatedResaleDiscountPct: gradingResult.estimatedResaleDiscountPct,
      carbonSavedKg: gradingResult.carbonSavedKg || estimateCarbonSaved(category),
      rekognitionLabels,
      status: "graded",
      createdAt: now,
      updatedAt: now,
    };

    await dynamo.send(new PutCommand({ TableName: TABLES.ITEMS, Item: item }));

    // 5️⃣  Update sustainability aggregate (fire-and-forget)
    updateSustainabilityAggregate(item).catch(console.error);

    return res.status(201).json({
      success: true,
      itemId,
      grading: {
        grade: item.grade,
        conditionLabel: item.conditionLabel,
        trustScore: item.trustScore,
        defects: item.defects,
        summary: item.summary,
        recommendedAction: item.recommendedAction,
        estimatedResaleDiscountPct: item.estimatedResaleDiscountPct,
        carbonSavedKg: item.carbonSavedKg,
      },
      photoUrl,
    });
  } catch (err) {
    console.error("gradeItem error:", err);
    return res.status(500).json({ error: "AI grading failed. Please try again." });
  }
}

// ── Get a single graded item ──────────────────────────────────────────────────
export async function getGradedItem(req, res) {
  try {
    const { itemId } = req.params;
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLES.ITEMS, Key: { itemId } })
    );
    if (!result.Item) {
      return res.status(404).json({ error: "Item not found" });
    }
    return res.json({ success: true, item: result.Item });
  } catch (err) {
    console.error("getGradedItem error:", err);
    return res.status(500).json({ error: "Failed to fetch item." });
  }
}

// ── Re-grade an existing item (e.g. after better photo) ───────────────────────
export async function regradeItem(req, res) {
  try {
    const { itemId } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No photo provided for re-grading." });

    // Fetch existing item
    const existing = await dynamo.send(
      new GetCommand({ TableName: TABLES.ITEMS, Key: { itemId } })
    );
    if (!existing.Item) return res.status(404).json({ error: "Item not found" });

    // Overwrite photo in S3
    const s3Key = `items/${itemId}/regrade-${Date.now()}-${file.originalname}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // Re-run AI grading
    const prompt = `Re-grade this returned product: ${existing.Item.productName} (${existing.Item.category}). 
Respond ONLY with JSON: {"grade","conditionLabel","trustScore","defects","summary","recommendedAction","estimatedResaleDiscountPct","carbonSavedKg"}`;

    const aiText = await invokeClaudeVision(prompt, file.buffer, file.mimetype);
    const newGrading = extractJSON(aiText) || buildFallbackGrade(false, existing.Item.productName, existing.Item.category);

    const updatedItem = {
      ...existing.Item,
      ...newGrading,
      s3Key,
      photoUrl: `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
      updatedAt: new Date().toISOString(),
    };

    await dynamo.send(new PutCommand({ TableName: TABLES.ITEMS, Item: updatedItem }));

    return res.json({ success: true, itemId, grading: newGrading });
  } catch (err) {
    console.error("regradeItem error:", err);
    return res.status(500).json({ error: "Re-grading failed." });
  }
}

// ── List recently graded items (for "Today's Returns" page) ───────────────────
export async function listRecentItems(req, res) {
  try {
    const limit = parseInt(req.query.limit || "20");
    // DynamoDB scan with limit (use GSI on createdAt for production scale)
    const result = await dynamo.send(
      new QueryCommand({
        TableName: TABLES.ITEMS,
        IndexName: "status-createdAt-index",
        KeyConditionExpression: "#s = :status",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":status": "graded" },
        ScanIndexForward: false,
        Limit: limit,
      })
    );
    return res.json({ success: true, items: result.Items || [] });
  } catch (err) {
    // Fallback if GSI not set up yet
    console.warn("GSI query failed, using scan fallback:", err.message);
    const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");
    const result = await dynamo.send(new ScanCommand({ TableName: TABLES.ITEMS, Limit: 20 }));
    return res.json({ success: true, items: result.Items || [] });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildFallbackGrade(hasDamage, productName, category) {
  return {
    grade: hasDamage ? "C" : "B",
    conditionLabel: hasDamage ? "Fair" : "Good",
    trustScore: hasDamage ? 65 : 82,
    defects: hasDamage ? ["Visible wear detected"] : [],
    summary: hasDamage
      ? `${productName || "This item"} shows signs of wear. Suitable for resale at a discount.`
      : `${productName || "This item"} appears to be in good condition. Ready for resale.`,
    recommendedAction: hasDamage ? "refurbish" : "resell",
    estimatedResaleDiscountPct: hasDamage ? 55 : 35,
    carbonSavedKg: estimateCarbonSaved(category),
  };
}

function estimateCarbonSaved(category) {
  const carbonMap = {
    Electronics: 12.5,
    Shoes: 6.8,
    Clothing: 4.2,
    "Home & Kitchen": 8.1,
    "Baby Products": 3.9,
    Other: 5.0,
    General: 5.0,
  };
  return carbonMap[category] || 5.0;
}

async function updateSustainabilityAggregate(item) {
  const { UpdateCommand } = await import("@aws-sdk/lib-dynamodb");
  await dynamo.send(
    new UpdateCommand({
      TableName: TABLES.SUSTAINABILITY,
      Key: { aggregateId: "global" },
      UpdateExpression:
        "ADD totalItemsGraded :one, totalCarbonSavedKg :carbon SET updatedAt = :now",
      ExpressionAttributeValues: {
        ":one": 1,
        ":carbon": item.carbonSavedKg || 0,
        ":now": new Date().toISOString(),
      },
    })
  );
}
