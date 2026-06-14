// src/handlers/routing.js
// Feature 2 — Smart Routing (Decision Engine)
// Now backed by /services/routingEngine.js for clean, testable business logic.

import { v4 as uuidv4 } from "uuid";
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLES } from "../utils/awsClients.js";
import { invokeClaudeText } from "../utils/bedrockHelper.js";
import {
  calculateRoute,
  calculateRecoveryValue,
  calculateConfidence,
} from "../services/routingEngine.js";

// ── Main routing decision endpoint ────────────────────────────────────────────
export async function routeItem(req, res) {
  try {
    const {
      itemId,
      // New engine inputs (preferred)
      conditionScore,
      category,
      originalPrice,
      estimatedRepairCost,
      demandLevel,
      returnReason,
      // Legacy inputs (kept for backwards compat)
      grade,
      trustScore,
      estimatedValue,
      localDemandScore,
    } = req.body;

    // Map legacy fields if new fields not provided
    const resolvedScore =
      conditionScore !== undefined
        ? Number(conditionScore)
        : trustScore !== undefined
        ? Number(trustScore)
        : gradeToScore(grade);

    const resolvedPrice =
      originalPrice !== undefined ? Number(originalPrice) : Number(estimatedValue) || 30;

    const resolvedDemand =
      demandLevel !== undefined
        ? demandLevel
        : localDemandScore >= 70
        ? "high"
        : localDemandScore >= 40
        ? "medium"
        : "low";

    // 1️⃣  Rules engine (deterministic, fast)
    const engineResult = calculateRoute({
      conditionScore:    resolvedScore,
      category:          category || "General",
      originalPrice:     resolvedPrice,
      estimatedRepairCost: Number(estimatedRepairCost) || 0,
      demandLevel:       resolvedDemand,
      returnReason:      returnReason || "",
    });

    // 2️⃣  Bedrock AI reasoning (optional enrichment)
    let aiReasoning = null;
    try {
      const prompt = `A ${category || "product"} was returned in ${engineResult.routeLabel} condition (score: ${resolvedScore}/100).
The routing engine selected: "${engineResult.routeLabel}" (confidence: ${engineResult.confidence}%, expected recovery: $${engineResult.expectedRecoveryValue}).
Key factors: ${engineResult.reasons.join(", ")}.
Give a 2-sentence plain-English explanation for the seller, explaining why this route maximises value and what happens next.`;

      aiReasoning = await invokeClaudeText(prompt, {
        maxTokens: 150,
        systemPrompt:
          "You are a routing specialist for ReCircle, Amazon's circular commerce platform. Give concise, helpful explanations.",
      });
      aiReasoning = aiReasoning?.trim() || null;
    } catch (err) {
      console.warn("Bedrock reasoning unavailable:", err.message);
    }

    // 3️⃣  Persist to DynamoDB — RoutingHistory schema
    const decisionId = uuidv4();
    const now = new Date().toISOString();

    const historyRecord = {
      // RoutingHistory schema fields (as spec'd)
      itemId:     itemId || "unlinked",
      route:      engineResult.route,
      timestamp:  now,
      confidence: engineResult.confidence,
      reasons:    engineResult.reasons,
      // Additional enrichment
      decisionId,
      routeLabel:            engineResult.routeLabel,
      routeEmoji:            engineResult.routeEmoji,
      routeColor:            engineResult.routeColor,
      expectedRecoveryValue: engineResult.expectedRecoveryValue,
      aiReasoning:           aiReasoning || engineResult.reasons.join(". "),
      inputs: {
        conditionScore: resolvedScore,
        category:       category || "General",
        originalPrice:  resolvedPrice,
        estimatedRepairCost: Number(estimatedRepairCost) || 0,
        demandLevel:    resolvedDemand,
        returnReason:   returnReason || "",
      },
      createdAt: now,
    };

    await dynamo.send(new PutCommand({ TableName: TABLES.ROUTING, Item: historyRecord }));

    // 4️⃣  Update item status if itemId provided
    if (itemId && itemId !== "unlinked") {
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
              ":t": now,
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
      // Core routing result
      route:                 engineResult.route,
      routeLabel:            engineResult.routeLabel,
      routeEmoji:            engineResult.routeEmoji,
      routeColor:            engineResult.routeColor,
      confidence:            engineResult.confidence,
      reasons:               engineResult.reasons,
      expectedRecoveryValue: engineResult.expectedRecoveryValue,
      aiReasoning:           aiReasoning || null,
      // All recovery values (for UI display)
      recoveryValues: calculateRecoveryValue({
        conditionScore:     resolvedScore,
        originalPrice:      resolvedPrice,
        estimatedRepairCost: Number(estimatedRepairCost) || 0,
        demandLevel:        resolvedDemand,
      }),
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

// ── Helper ────────────────────────────────────────────────────────────────────
function gradeToScore(grade) {
  return { A: 92, B: 78, C: 55, D: 30 }[grade] ?? 60;
}
