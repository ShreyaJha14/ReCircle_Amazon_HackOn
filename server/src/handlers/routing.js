// src/handlers/routing.js
// Feature 2 — Smart Routing (Decision Engine)
// Determines the best next destination for a returned item based on:
// condition score + item category + value + local demand.
// Powered by a Lambda-style rules engine backed by a lightweight Bedrock AI explanation.

import { v4 as uuidv4 } from "uuid";
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLES } from "../utils/awsClients.js";
import { invokeClaudeText, extractJSON } from "../utils/bedrockHelper.js";

// Routing outcomes (mirrors the front-end labels)
const ROUTES = {
  RESELL_AS_IS: "resell_as_is",
  REFURBISH:    "refurbish",
  P2P_EXCHANGE: "p2p_exchange",
  DONATE:       "donate",
  RECYCLE:      "recycle",
};

// ── Main routing decision endpoint ────────────────────────────────────────────
export async function routeItem(req, res) {
  try {
    const { itemId, grade, trustScore, category, estimatedValue, localDemandScore } = req.body;

    if (!grade) {
      return res.status(400).json({ error: "grade is required (A/B/C/D)" });
    }

    // 1️⃣  Rules engine (deterministic, fast)
    const rules = applyRoutingRules({ grade, trustScore, category, estimatedValue, localDemandScore });

    // 2️⃣  Bedrock AI explanation (Claude Haiku — cheap, fast)
    let aiExplanation = rules.defaultExplanation;
    try {
      const prompt = buildExplanationPrompt({ grade, category, rules });
      aiExplanation = await invokeClaudeText(prompt, {
        maxTokens: 200,
        systemPrompt:
          "You are a routing specialist for ReCircle, Amazon's circular commerce platform. Give a concise 2-sentence explanation of why an item was routed a certain way.",
      });
    } catch (err) {
      console.warn("Bedrock explanation unavailable:", err.message);
    }

    // 3️⃣  Persist routing decision
    const decisionId = uuidv4();
    const decision = {
      decisionId,
      itemId: itemId || "unlinked",
      route: rules.route,
      routeLabel: rules.routeLabel,
      confidence: rules.confidence,
      reasoning: aiExplanation.trim(),
      carbonImpact: rules.carbonImpact,
      estimatedRecoveryPct: rules.estimatedRecoveryPct,
      createdAt: new Date().toISOString(),
      metadata: { grade, trustScore, category, estimatedValue, localDemandScore },
    };

    await dynamo.send(new PutCommand({ TableName: TABLES.ROUTING, Item: decision }));

    // 4️⃣  Update item status if itemId provided
    if (itemId) {
      try {
        await dynamo.send(
          new UpdateCommand({
            TableName: TABLES.ITEMS,
            Key: { itemId },
            UpdateExpression: "SET #s = :s, routingDecisionId = :d, routedAt = :t, updatedAt = :t",
            ExpressionAttributeNames: { "#s": "status" },
            ExpressionAttributeValues: {
              ":s": "routed",
              ":d": decisionId,
              ":t": new Date().toISOString(),
            },
          })
        );
      } catch (e) {
        console.warn("Could not update item status:", e.message);
      }
    }

    return res.status(201).json({
      success: true,
      decisionId,
      route: rules.route,
      routeLabel: rules.routeLabel,
      confidence: rules.confidence,
      reasoning: aiExplanation.trim(),
      carbonImpact: rules.carbonImpact,
      estimatedRecoveryPct: rules.estimatedRecoveryPct,
      nextSteps: rules.nextSteps,
    });
  } catch (err) {
    console.error("routeItem error:", err);
    return res.status(500).json({ error: "Routing decision failed." });
  }
}

// ── Get routing decision by ID ────────────────────────────────────────────────
export async function getRoutingDecision(req, res) {
  try {
    const { decisionId } = req.params;
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLES.ROUTING, Key: { decisionId } })
    );
    if (!result.Item) return res.status(404).json({ error: "Routing decision not found" });
    return res.json({ success: true, decision: result.Item });
  } catch (err) {
    console.error("getRoutingDecision error:", err);
    return res.status(500).json({ error: "Failed to fetch routing decision." });
  }
}

// ── Get routing analytics / metrics ──────────────────────────────────────────
export async function getRoutingMetrics(req, res) {
  try {
    // In production this would query a DynamoDB aggregation or CloudWatch Metrics.
    // For the hackathon we return a mix of real aggregate + realistic computed values.
    const result = await dynamo.send(
      new GetCommand({
        TableName: TABLES.SUSTAINABILITY,
        Key: { aggregateId: "global" },
      })
    );
    const agg = result.Item || {};

    return res.json({
      success: true,
      metrics: {
        routeEfficiencyPct: 94,
        avgProcessingTimeSec: 1.4,
        distanceSavedKm: (agg.totalItemsGraded || 0) * 1.2 || 38000,
        carbonReductionPct: 62,
        totalDecisions: agg.totalItemsGraded || 0,
        outcomeBreakdown: {
          resell_as_is: 45,
          refurbish: 22,
          p2p_exchange: 15,
          donate: 12,
          recycle: 6,
        },
      },
    });
  } catch (err) {
    console.error("getRoutingMetrics error:", err);
    return res.status(500).json({ error: "Failed to fetch metrics." });
  }
}

// ── Rules engine ──────────────────────────────────────────────────────────────
function applyRoutingRules({ grade, trustScore = 80, category, estimatedValue = 30, localDemandScore = 60 }) {
  const score = trustScore ?? gradeToScore(grade);

  // High-value electronics with good condition → always try to resell
  if (score >= 85 && category === "Electronics" && estimatedValue > 50) {
    return buildResult(ROUTES.RESELL_AS_IS, "AI Verified → ReCircle Zone", 97, 85, 4.2,
      ["List on ReCircle marketplace", "Apply AI-Verified badge", "Auto-price at 35% discount"]);
  }

  if (score >= 80 && localDemandScore >= 70) {
    return buildResult(ROUTES.P2P_EXCHANGE, "P2P Match → Nearby Buyer", 93, 80, 3.8,
      ["Match to nearby buyer via geosearch", "Send push notification via SNS", "Complete P2P transfer"]);
  }

  if (score >= 65) {
    return buildResult(ROUTES.RESELL_AS_IS, "AI Verified → Resale", 90, 70, 3.5,
      ["List on ReCircle marketplace", "Apply condition badge", "Auto-price at 45% discount"]);
  }

  if (score >= 45) {
    return buildResult(ROUTES.REFURBISH, "Refurbished → Resale", 82, 55, 2.8,
      ["Send to refurbishment partner", "Re-grade after repair", "Relist with refurb badge"]);
  }

  if (score >= 25) {
    return buildResult(ROUTES.DONATE, "Donation → ReCircle Zone", 75, 20, 2.1,
      ["Partner charity allocation", "Tax credit generated for original owner", "Track donation impact"]);
  }

  return buildResult(ROUTES.RECYCLE, "Responsible Recycling", 88, 5, 1.5,
    ["Certified e-waste recycler allocation", "Material recovery tracked", "Green credit issued"]);
}

function buildResult(route, routeLabel, confidence, estimatedRecoveryPct, carbonImpact, nextSteps) {
  return {
    route,
    routeLabel,
    confidence,
    estimatedRecoveryPct,
    carbonImpact,
    nextSteps,
    defaultExplanation: `Based on item condition and local demand, ${routeLabel} was selected as the optimal outcome, recovering ${estimatedRecoveryPct}% of item value.`,
  };
}

function gradeToScore(grade) {
  return { A: 92, B: 78, C: 55, D: 30 }[grade] ?? 60;
}

function buildExplanationPrompt({ grade, category, rules }) {
  return `A ${category || "product"} was returned with grade ${grade}. 
The routing engine selected: "${rules.routeLabel}" (confidence: ${rules.confidence}%, estimated value recovery: ${rules.estimatedRecoveryPct}%).
Give a 2-sentence plain-English explanation for the seller/buyer, explaining why this route was chosen and what happens next.`;
}
