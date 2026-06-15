// src/handlers/listings.js
// Bonus Feature — P2P Matching + Marketplace Listings
// Match items to nearby interested buyers using geospatial search.
// Dynamic pricing, push notifications via SNS.

import { v4 as uuidv4 } from "uuid";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { PublishCommand } from "@aws-sdk/client-sns";
import { dynamo, sns, TABLES } from "../utils/awsClients.js";
import { invokeClaudeText, extractJSON } from "../utils/bedrockHelper.js";
import { BEDROCK_MODELS } from "../utils/awsClients.js";

// ── Create a marketplace listing ──────────────────────────────────────────────
export async function createListing(req, res) {
  try {
    const {
      itemId,
      sellerId,
      productName,
      category,
      grade,
      trustScore,
      photoUrl,
      originalPrice,
      suggestedPrice,
      location,
      description,
      passportId,
      routeLabel,
      returnReason,
      conditionLabel,
      carbonSavedKg,
    } = req.body;

    if (!productName || !grade) {
      return res.status(400).json({ error: "productName and grade are required" });
    }

    const listingId = uuidv4();
    const now = new Date().toISOString();

    // Auto-price if not provided
    const price = suggestedPrice || computeAutoPrice(grade, originalPrice);

    // AI-generated listing description
    let aiDescription = description;
    if (!description) {
      try {
        aiDescription = await invokeClaudeText(
          `Write a compelling 2-sentence marketplace listing description for:
Product: ${productName} (${category || "General"}), Condition Grade: ${grade}
Price: £${price}. Be honest about condition, highlight value. No markdown.`,
          {
            model: BEDROCK_MODELS.CLAUDE_HAIKU,
            maxTokens: 150,
            systemPrompt: "You write short, honest, compelling product listing descriptions.",
          }
        );
      } catch (e) {
        aiDescription = `${productName} in ${gradeToLabel(grade)} condition — AI verified by ReCircle. Listed at ${Math.round((1 - price / (originalPrice || price * 2)) * 100)}% off the original price.`;
      }
    }

    const listing = {
      listingId,
      itemId: itemId || listingId,
      sellerId: sellerId || "anonymous",
      productName,
      category: category || "General",
      grade,
      trustScore: trustScore || 80,
      photoUrl: photoUrl || null,
      originalPrice: parseFloat(originalPrice) || null,
      price: parseFloat(price),
      description: aiDescription,
      passportId: passportId || null,
      location: location || { city: "UK", postcode: "Unknown" },
      routeLabel: routeLabel || "AI Verified → ReCircle Zone",
      returnReason: returnReason || "Listed via Sell page",
      conditionLabel: conditionLabel || "Like New",
      carbonSavedKg: parseFloat(carbonSavedKg) || 0,
      status: "active",
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    await dynamo.send(new PutCommand({ TableName: TABLES.LISTINGS, Item: listing }));

    // Try P2P matching immediately (fire-and-forget)
    triggerP2PMatch(listing).catch(console.error);

    return res.status(201).json({ success: true, listingId, listing });
  } catch (err) {
    console.error("createListing error:", err);
    return res.status(500).json({ error: "Failed to create listing." });
  }
}

// ── Get all active listings (with optional category/grade/today filters) ───────
export async function getListings(req, res) {
  try {
    const { category, grade, limit = "20", today } = req.query;

    // For hackathon: scan with optional filter
    const filterParts = ["#s = :active"];
    const exprNames = { "#s": "status" };
    const exprVals = { ":active": "active" };

    if (category) {
      filterParts.push("category = :cat");
      exprVals[":cat"] = category;
    }
    if (grade) {
      filterParts.push("grade = :grade");
      exprVals[":grade"] = grade;
    }

    // Filter to listings published on the current calendar day (UTC)
    if (today === "true") {
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);
      filterParts.push("createdAt >= :startOfDay");
      exprVals[":startOfDay"] = startOfDay.toISOString();
    }

    // Paginate through ALL pages of the table so FilterExpression sees every item.
    // (DynamoDB's Limit caps *reads*, not *results*, so a Limit would skip items.)
    let allItems = [];
    let lastKey = undefined;
    do {
      const params = {
        TableName: TABLES.LISTINGS,
        FilterExpression: filterParts.join(" AND "),
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: exprVals,
      };
      if (lastKey) params.ExclusiveStartKey = lastKey;

      const page = await dynamo.send(new ScanCommand(params));
      allItems = allItems.concat(page.Items || []);
      lastKey = page.LastEvaluatedKey;
    } while (lastKey);

    // Sort by createdAt desc and honour the limit *after* filtering
    const maxItems = parseInt(limit) || 100;
    const items = allItems
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, maxItems);

    return res.json({ success: true, listings: items, count: items.length });
  } catch (err) {
    console.error("getListings error:", err);
    return res.status(500).json({ error: "Failed to fetch listings." });
  }
}

// ── Get single listing ────────────────────────────────────────────────────────
export async function getListing(req, res) {
  try {
    const { listingId } = req.params;
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLES.LISTINGS, Key: { listingId } })
    );
    if (!result.Item) return res.status(404).json({ error: "Listing not found" });

    // Increment view count
    dynamo
      .send(
        new UpdateCommand({
          TableName: TABLES.LISTINGS,
          Key: { listingId },
          UpdateExpression: "ADD #v :one",
          ExpressionAttributeNames: { "#v": "views" },
          ExpressionAttributeValues: { ":one": 1 },
        })
      )
      .catch(() => {});

    return res.json({ success: true, listing: result.Item });
  } catch (err) {
    console.error("getListing error:", err);
    return res.status(500).json({ error: "Failed to fetch listing." });
  }
}

// ── Update listing (e.g. mark as sold) ───────────────────────────────────────
export async function updateListing(req, res) {
  try {
    const { listingId } = req.params;
    const { status, price } = req.body;

    const updates = [];
    const names = {};
    const vals = { ":t": new Date().toISOString() };

    if (status) {
      updates.push("#s = :s");
      names["#s"] = "status";
      vals[":s"] = status;
    }
    if (price) {
      updates.push("price = :p");
      vals[":p"] = parseFloat(price);
    }
    updates.push("updatedAt = :t");

    await dynamo.send(
      new UpdateCommand({
        TableName: TABLES.LISTINGS,
        Key: { listingId },
        UpdateExpression: `SET ${updates.join(", ")}`,
        ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
        ExpressionAttributeValues: vals,
      })
    );

    return res.json({ success: true, listingId, updated: { status, price } });
  } catch (err) {
    console.error("updateListing error:", err);
    return res.status(500).json({ error: "Failed to update listing." });
  }
}

// ── P2P geospatial match ──────────────────────────────────────────────────────
export async function findNearbyMatches(req, res) {
  try {
    const { lat, lng, category, radiusKm = 10 } = req.query;

    // Simplified: scan listings for same category (in production use OpenSearch geospatial)
    const result = await dynamo.send(
      new ScanCommand({
        TableName: TABLES.LISTINGS,
        FilterExpression: "#s = :active AND category = :cat",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":active": "active", ":cat": category || "Electronics" },
        Limit: 10,
      })
    );

    const matches = (result.Items || []).map((item) => ({
      ...item,
      distanceKm: +(Math.random() * parseFloat(radiusKm || 10)).toFixed(1), // simulated distance
    }));

    return res.json({ success: true, matches, count: matches.length });
  } catch (err) {
    console.error("findNearbyMatches error:", err);
    return res.status(500).json({ error: "P2P match search failed." });
  }
}

// ── Bulk seller mode — batch upload endpoint ──────────────────────────────────
export async function bulkCreateListings(req, res) {
  try {
    const { items } = req.body; // array of listing objects
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items array required" });
    }

    const results = [];
    for (const item of items.slice(0, 50)) { // cap at 50 per batch
      const listingId = uuidv4();
      const now = new Date().toISOString();
      const listing = {
        listingId,
        ...item,
        price: item.price || computeAutoPrice(item.grade, item.originalPrice),
        status: "active",
        views: 0,
        createdAt: now,
        updatedAt: now,
      };
      await dynamo.send(new PutCommand({ TableName: TABLES.LISTINGS, Item: listing }));
      results.push({ listingId, productName: item.productName });
    }

    return res.status(201).json({ success: true, created: results.length, listings: results });
  } catch (err) {
    console.error("bulkCreateListings error:", err);
    return res.status(500).json({ error: "Bulk create failed." });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function computeAutoPrice(grade, originalPrice) {
  const discounts = { A: 0.30, B: 0.45, C: 0.60, D: 0.75 };
  const disc = discounts[grade] || 0.45;
  const orig = parseFloat(originalPrice) || 50;
  return +(orig * (1 - disc)).toFixed(2);
}

function gradeToLabel(grade) {
  return { A: "Like New", B: "Good", C: "Fair", D: "Poor" }[grade] || "Good";
}

async function triggerP2PMatch(listing) {
  if (!process.env.SNS_TOPIC_ARN) return;
  try {
    await sns.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: "ReCircle — New P2P Match Available",
        Message: JSON.stringify({
          type: "new_listing",
          listingId: listing.listingId,
          productName: listing.productName,
          category: listing.category,
          grade: listing.grade,
          price: listing.price,
          location: listing.location,
        }),
      })
    );
  } catch (e) {
    console.warn("SNS notification skipped:", e.message);
  }
}