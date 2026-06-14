// src/handlers/prevention.js
// Feature 4 — Prevention (Predictive Returns)
// At checkout, analyse a customer's past returns/preferences (size, fit, fabric issues)
// to suggest better-matched products and cut future returns.
// Also includes conversational assistant: "what should I do with this item?"

import { v4 as uuidv4 } from "uuid";
import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLES } from "../utils/awsClients.js";
import {
  invokeClaudeText,
  extractJSON,
} from "../utils/bedrockHelper.js";
import { BEDROCK_MODELS } from "../utils/awsClients.js";

// ── Predict return risk at checkout ──────────────────────────────────────────
export async function predictReturnRisk(req, res) {
  try {
    const { userId, productId, productName, category, size, customerHistory } = req.body;

    if (!productName) {
      return res.status(400).json({ error: "productName is required" });
    }

    // Build customer history context
    const historyContext = customerHistory
      ? JSON.stringify(customerHistory)
      : "No prior returns on record.";

    const prompt = `
You are a return-prevention AI for ReCircle on Amazon.

Customer is about to purchase: "${productName}" (${category || "General"})${size ? `, size: ${size}` : ""}.

Customer return history: ${historyContext}

Analyse the likelihood of this purchase being returned and respond ONLY with JSON:
{
  "returnRiskScore": <integer 0–100, where 0=very unlikely to return>,
  "riskLevel": "Low" | "Medium" | "High",
  "topRiskFactors": [<up to 3 risk factor strings>],
  "sizeFitConfidence": <integer 0–100>,
  "qualityConfidence": <integer 0–100>,
  "overallConfidence": <integer 0–100>,
  "recommendations": [
    {
      "type": "size" | "description" | "qa" | "image",
      "message": "<short actionable tip for the buyer>"
    }
  ],
  "checkoutWarning": "<optional short warning to show at checkout, or null if risk is low>"
}
`;

    let prediction;
    try {
      const aiText = await invokeClaudeText(prompt, {
        model: BEDROCK_MODELS.CLAUDE_HAIKU,
        maxTokens: 512,
        systemPrompt: "You predict return risk for e-commerce purchases. Respond only in JSON.",
      });
      prediction = extractJSON(aiText);
    } catch (e) {
      console.warn("Bedrock prediction failed, using heuristic:", e.message);
      prediction = buildHeuristicPrediction(category, customerHistory);
    }

    if (!prediction) prediction = buildHeuristicPrediction(category, customerHistory);

    // Store prediction event
    const predictionId = uuidv4();
    await dynamo.send(
      new PutCommand({
        TableName: TABLES.ITEMS, // reuse items table with different pk prefix for hackathon
        Item: {
          itemId: `prediction#${predictionId}`,
          type: "return_prediction",
          userId: userId || "anonymous",
          productId: productId || "unknown",
          productName,
          category,
          prediction,
          createdAt: new Date().toISOString(),
        },
      })
    ).catch(() => {}); // fire-and-forget

    return res.json({ success: true, predictionId, prediction });
  } catch (err) {
    console.error("predictReturnRisk error:", err);
    return res.status(500).json({ error: "Return prediction failed." });
  }
}

// ── Conversational Assistant: "what should I do with this item?" ──────────────
// This is the key bonus feature — Bedrock/Claude as a chat interface for sellers.
export async function conversationalAssistant(req, res) {
  try {
    const { message, itemContext, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    // Build conversation messages array for multi-turn chat
    const messages = [];

    // Add prior turns
    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory) {
        if (turn.role && turn.content) {
          messages.push({ role: turn.role, content: turn.content });
        }
      }
    }

    // Add new user message
    messages.push({ role: "user", content: message });

    const systemPrompt = `You are ReCircle Assistant, an AI helper built into Amazon's circular commerce platform.

Your role:
- Help sellers decide what to do with returned, unused, or pre-owned items
- Suggest: resell, refurbish, donate, recycle, or peer-to-peer exchange
- Provide dynamic pricing advice based on condition and comparable listings
- Be friendly, concise, and actionable
- Reference ReCircle features (AI Grading, Smart Routing, Product Passport) when relevant

${itemContext ? `Current item context: ${JSON.stringify(itemContext)}` : ""}

Always end responses with a clear, actionable next step.`;

    // Call Bedrock with full conversation history
    const { InvokeModelCommand } = await import("@aws-sdk/client-bedrock-runtime");
    const { bedrock, BEDROCK_MODELS } = await import("../utils/awsClients.js");

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 512,
      system: systemPrompt,
      messages,
    };

    const cmd = new InvokeModelCommand({
      modelId: BEDROCK_MODELS.CLAUDE_HAIKU,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    const response = await bedrock.send(cmd);
    const parsed = JSON.parse(new TextDecoder().decode(response.body));
    const assistantMessage = parsed.content?.[0]?.text || "I'm here to help! Tell me about your item.";

    return res.json({
      success: true,
      message: assistantMessage,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: "user", content: message },
        { role: "assistant", content: assistantMessage },
      ],
    });
  } catch (err) {
    console.error("conversationalAssistant error:", err);
    return res.status(500).json({
      error: "Assistant temporarily unavailable.",
      message: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
    });
  }
}

// ── Dynamic pricing suggestion ────────────────────────────────────────────────
export async function suggestPrice(req, res) {
  try {
    const { productName, category, grade, originalPrice, defects, marketComparables } = req.body;

    if (!productName || !grade) {
      return res.status(400).json({ error: "productName and grade are required" });
    }

    const prompt = `
You are a pricing specialist for ReCircle, Amazon's pre-owned marketplace.

Item: "${productName}" (${category || "General"})
Condition grade: ${grade}
Original/RRP price: £${originalPrice || "unknown"}
Defects noted: ${(defects || []).join(", ") || "None"}
Market comparables: ${marketComparables ? JSON.stringify(marketComparables) : "Not provided"}

Suggest a fair resale price. Respond ONLY with JSON:
{
  "suggestedPricePct": <integer, % of original price to charge>,
  "suggestedPrice": <number, estimated GBP price if original known>,
  "priceRangeMin": <number>,
  "priceRangeMax": <number>,
  "rationale": "<one sentence explanation>",
  "competitivenessScore": <integer 0–100, how competitive vs market>
}
`;

    let pricing;
    try {
      const aiText = await invokeClaudeText(prompt, {
        model: BEDROCK_MODELS.CLAUDE_HAIKU,
        maxTokens: 300,
        systemPrompt: "You are a pricing expert. Respond only in JSON.",
      });
      pricing = extractJSON(aiText);
    } catch (e) {
      pricing = buildHeuristicPricing(grade, originalPrice);
    }

    if (!pricing) pricing = buildHeuristicPricing(grade, originalPrice);

    return res.json({ success: true, pricing });
  } catch (err) {
    console.error("suggestPrice error:", err);
    return res.status(500).json({ error: "Pricing suggestion failed." });
  }
}

// ── Get prevention dashboard metrics ─────────────────────────────────────────
export async function getPreventionMetrics(req, res) {
  return res.json({
    success: true,
    metrics: {
      sizeAccuracyPct: 96,
      customerConfidencePct: 91,
      recommendationQualityPct: 94,
      returnRiskScore: 18,
      fewerFitReturnsReductionPct: 31,
      avoidableReturnsPrevented: 2400000,
      packagingWasteAvoidedTonnes: 18000,
      recommendations: [
        {
          icon: "📏",
          title: "Sizing accuracy improved",
          detail: "Customers ordering this item now see a fit confidence score before purchase, reducing fit-related returns by 31%.",
          confidence: 92,
        },
        {
          icon: "🖼️",
          title: "Listing enriched",
          detail: "Added 4 lifestyle photos and a size comparison chart, improving pre-purchase clarity for shoppers.",
          confidence: 88,
        },
        {
          icon: "💬",
          title: "Q&A coverage expanded",
          detail: "AI-generated answers now cover 96% of common pre-purchase questions for this category.",
          confidence: 95,
        },
      ],
    },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildHeuristicPrediction(category, history) {
  const highReturnCategories = ["Clothing", "Shoes"];
  const isHighRisk = highReturnCategories.includes(category);
  return {
    returnRiskScore: isHighRisk ? 38 : 18,
    riskLevel: isHighRisk ? "Medium" : "Low",
    topRiskFactors: isHighRisk
      ? ["Sizing uncertainty", "Colour may differ from screen", "Fit varies by brand"]
      : [],
    sizeFitConfidence: isHighRisk ? 74 : 96,
    qualityConfidence: 91,
    overallConfidence: isHighRisk ? 78 : 94,
    recommendations: isHighRisk
      ? [
          { type: "size", message: "Check the size guide before ordering — this brand runs small." },
          { type: "image", message: "View all photos to check colour accuracy." },
        ]
      : [],
    checkoutWarning: isHighRisk
      ? "Heads up: sizing for this item varies. Check the guide before ordering."
      : null,
  };
}

function buildHeuristicPricing(grade, originalPrice) {
  const discounts = { A: 0.30, B: 0.45, C: 0.60, D: 0.75 };
  const disc = discounts[grade] || 0.45;
  const orig = parseFloat(originalPrice) || 50;
  const price = +(orig * (1 - disc)).toFixed(2);
  return {
    suggestedPricePct: Math.round((1 - disc) * 100),
    suggestedPrice: price,
    priceRangeMin: +(price * 0.9).toFixed(2),
    priceRangeMax: +(price * 1.1).toFixed(2),
    rationale: `Grade ${grade} items typically sell at ${Math.round((1 - disc) * 100)}% of original price on the ReCircle marketplace.`,
    competitivenessScore: 78,
  };
}
