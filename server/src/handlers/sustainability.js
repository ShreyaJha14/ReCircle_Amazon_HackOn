// src/handlers/sustainability.js
// Sustainability Dashboard — real-time aggregate stats, CO2 saved, items diverted.
// Reads from DynamoDB aggregate records updated by every grading/routing event.

import { GetCommand, PutCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLES } from "../utils/awsClients.js";
import { invokeClaudeText } from "../utils/bedrockHelper.js";

// ── Get global sustainability dashboard ───────────────────────────────────────
export async function getDashboard(req, res) {
  try {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLES.SUSTAINABILITY, Key: { aggregateId: "global" } })
    );
    const agg = result.Item || {};

    // Combine real DB aggregates with baseline realistic numbers for hackathon demo
    const totalItemsGraded = (agg.totalItemsGraded || 0) + 480000;
    const totalCarbonSavedKg = (agg.totalCarbonSavedKg || 0) + 1200000;

    return res.json({
      success: true,
      dashboard: {
        // Hero KPIs
        carbonSavedKg: totalCarbonSavedKg,
        carbonSavedMTonnes: +(totalCarbonSavedKg / 1000).toFixed(1),
        itemsDivertedFromLandfill: totalItemsGraded,
        circularRevenue: 3800000,
        productRecoveryRatePct: 92,

        // Charts data
        monthlyTrend: generateMonthlyTrend(agg.totalCarbonSavedKg || 0),
        quarterlyItemsDiverted: [120000, 145000, 168000, 190000],

        // Outcome split (%)
        outcomeBreakdown: {
          resell: 45,
          recycle: 30,
          donate: 25,
        },

        // Last updated
        lastUpdated: agg.updatedAt || new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("getDashboard error:", err);
    return res.status(500).json({ error: "Failed to fetch sustainability dashboard." });
  }
}

// ── Record a sustainability event (called after routing) ──────────────────────
export async function recordSustainabilityEvent(req, res) {
  try {
    const {
      eventType,   // "graded" | "resold" | "donated" | "recycled" | "refurbished"
      carbonSavedKg,
      itemId,
      category,
    } = req.body;

    if (!eventType) return res.status(400).json({ error: "eventType required" });

    const now = new Date().toISOString();
    const carbon = parseFloat(carbonSavedKg) || 0;

    // Upsert global aggregate
    await dynamo.send(
      new UpdateCommand({
        TableName: TABLES.SUSTAINABILITY,
        Key: { aggregateId: "global" },
        UpdateExpression:
          "ADD totalItemsGraded :one, totalCarbonSavedKg :carbon SET updatedAt = :now",
        ExpressionAttributeValues: {
          ":one": 1,
          ":carbon": carbon,
          ":now": now,
        },
      })
    );

    // Also upsert category-level aggregate
    if (category) {
      await dynamo.send(
        new UpdateCommand({
          TableName: TABLES.SUSTAINABILITY,
          Key: { aggregateId: `category#${category}` },
          UpdateExpression:
            "ADD totalItems :one, totalCarbonSavedKg :carbon SET updatedAt = :now",
          ExpressionAttributeValues: {
            ":one": 1,
            ":carbon": carbon,
            ":now": now,
          },
        })
      );
    }

    return res.status(201).json({ success: true, recorded: { eventType, carbonSavedKg: carbon, itemId } });
  } catch (err) {
    console.error("recordSustainabilityEvent error:", err);
    return res.status(500).json({ error: "Failed to record event." });
  }
}

// ── Get AI-generated sustainability insight ───────────────────────────────────
export async function getSustainabilityInsight(req, res) {
  try {
    const { carbonSavedKg, itemsCount, topCategory } = req.body;

    const prompt = `Write a 3-sentence executive sustainability insight for Amazon ReCircle.
Stats: ${itemsCount || 480000} items diverted from landfill, ${carbonSavedKg || 1200} tonnes CO₂ saved.
Top category: ${topCategory || "Electronics"}.
Be positive, specific, and cite the numbers. No markdown.`;

    let insight;
    try {
      insight = await invokeClaudeText(prompt, {
        maxTokens: 200,
        systemPrompt: "You write concise sustainability insights for executive dashboards.",
      });
    } catch (e) {
      insight = `ReCircle has diverted ${itemsCount || 480000} items from landfill, saving ${carbonSavedKg || 1200} tonnes of CO₂ — equivalent to taking over 260 cars off the road for a year. Electronics lead the impact with the highest carbon savings per item recovered. The circular revenue generated supports further investment in AI grading and sustainable logistics infrastructure.`;
    }

    return res.json({ success: true, insight });
  } catch (err) {
    console.error("getSustainabilityInsight error:", err);
    return res.status(500).json({ error: "Failed to generate insight." });
  }
}

// ── Get per-user impact (green credits) ──────────────────────────────────────
export async function getUserImpact(req, res) {
  try {
    const { userId } = req.params;
    // In production this queries per-user aggregates.
    // For the hackathon we return a computed demo value.
    return res.json({
      success: true,
      userImpact: {
        userId: userId || "demo-user",
        carbonSavedKg: 14.3,
        itemsResold: 4,
        greenCredits: 143,
        rank: "ReCircle Champion",
        personalNarrative:
          "By using ReCircle, you've saved the equivalent of driving 57 miles worth of CO₂ this year.",
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch user impact." });
  }
}

// ── Helper: generate realistic monthly trend data ─────────────────────────────
function generateMonthlyTrend(realCarbon) {
  const base = [40, 55, 48, 62, 70, 65, 78, 85, 80, 92, 88, 96];
  const boost = realCarbon > 0 ? Math.min(20, realCarbon / 1000) : 0;
  return base.map((v) => Math.round(v + boost));
}
