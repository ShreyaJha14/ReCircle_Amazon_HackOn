// src/services/impactEngine.js
// Impact Intelligence Module
// Calculates financial breakdown (revenue / costs / net recovery)
// and sustainability scores (carbon, waste, circularity).
// Pure — no AWS deps, fully unit-testable.

// ── Logistics cost table by category ─────────────────────────────────────────
const LOGISTICS_COST_BY_CATEGORY = {
  Electronics:       8.5,
  Clothing:          4.0,
  Fashion:           4.0,
  Shoes:             5.0,
  "Home & Kitchen":  9.0,
  "Baby Products":   5.5,
  Sports:            6.5,
  General:           6.0,
};

// ── Carbon saved per category per item (kg CO₂) ───────────────────────────────
const CARBON_SAVED_BY_CATEGORY = {
  Electronics:       28.0,
  Clothing:           6.5,
  Fashion:            6.5,
  Shoes:              8.0,
  "Home & Kitchen":  12.0,
  "Baby Products":    5.5,
  Sports:             9.0,
  General:            7.5,
};

// ── Waste weight estimates per category (kg) ──────────────────────────────────
const WASTE_WEIGHT_BY_CATEGORY = {
  Electronics:        1.8,
  Clothing:           0.6,
  Fashion:            0.5,
  Shoes:              0.9,
  "Home & Kitchen":   2.2,
  "Baby Products":    0.8,
  Sports:             1.4,
  General:            1.0,
};

// ── Route revenue multipliers (fraction of original price recovered) ──────────
const ROUTE_REVENUE_MULT = {
  resell_as_is:  0.75,
  refurbish:     0.65,
  p2p_exchange:  0.55,
  donate:        0.10,   // tax-credit equivalent
  recycle:       0.03,   // materials only
};

// ── Circularity contribution per route (0–100 scale) ─────────────────────────
const ROUTE_CIRCULARITY = {
  resell_as_is:  95,
  refurbish:     88,
  p2p_exchange:  85,
  donate:        72,
  recycle:       55,
};

/**
 * calculateImpact
 * Main export. Returns full financial breakdown + sustainability metrics.
 *
 * @param {object} params
 * @param {string} params.route               e.g. "refurbish"
 * @param {number} params.conditionScore      0–100
 * @param {string} params.category
 * @param {number} params.originalPrice       USD
 * @param {number} params.estimatedRepairCost USD
 * @param {string} params.demandLevel         "high" | "medium" | "low"
 *
 * @returns {{ financial, sustainability }}
 */
export function calculateImpact({
  route            = "resell_as_is",
  conditionScore   = 70,
  category         = "General",
  originalPrice    = 50,
  estimatedRepairCost = 0,
  demandLevel      = "medium",
}) {
  const price    = Number(originalPrice)       || 0;
  const repair   = Number(estimatedRepairCost) || 0;
  const score    = Number(conditionScore)      || 0;

  const demandMult = demandLevel === "high" ? 1.15
                   : demandLevel === "low"  ? 0.80
                   : 1.0;

  const condFraction = score / 100;

  // ── Financial breakdown ───────────────────────────────────────────────────
  const revenueMult     = ROUTE_REVENUE_MULT[route] ?? 0.5;
  const expectedRevenue = +(price * condFraction * revenueMult * demandMult).toFixed(2);

  const repairCost   = route === "refurbish" ? repair : 0;
  const logisticsCat = LOGISTICS_COST_BY_CATEGORY[category] ?? 6.0;
  // Logistics scaled by route — recycle & donate have lower logistics
  const logisticsScale = route === "recycle" ? 0.6
                       : route === "donate"  ? 0.5
                       : 1.0;
  const logisticsCost = +(logisticsCat * logisticsScale).toFixed(2);

  const netRecovery = +(Math.max(0, expectedRevenue - repairCost - logisticsCost)).toFixed(2);

  const recoveryPct = price > 0
    ? Math.min(100, Math.round((netRecovery / price) * 100))
    : 0;

  // ── Sustainability metrics ────────────────────────────────────────────────
  const baseCarbonSaved   = CARBON_SAVED_BY_CATEGORY[category] ?? 7.5;
  const baseWaste         = WASTE_WEIGHT_BY_CATEGORY[category] ?? 1.0;
  const circularityBase   = ROUTE_CIRCULARITY[route] ?? 70;

  // Scale carbon saved by condition — better condition → more life extended
  const carbonSaved       = +(baseCarbonSaved * condFraction).toFixed(1);
  const wastePrevented    = +(baseWaste * condFraction).toFixed(2);

  // Circularity score: base + demand bonus + condition bonus
  const demandBonus       = demandLevel === "high" ? 4 : demandLevel === "low" ? -3 : 0;
  const condBonus         = score > 85 ? 3 : score > 65 ? 1 : -2;
  const circularityScore  = Math.min(100, Math.max(0, circularityBase + demandBonus + condBonus));

  return {
    financial: {
      expectedRevenue,
      repairCost,
      logisticsCost,
      netRecovery,
      recoveryPct,
    },
    sustainability: {
      carbonSaved,
      wastePrevented,
      circularityScore,
    },
  };
}

/**
 * buildAISummaryPrompt
 * Constructs the Bedrock prompt for the human-readable summary paragraph.
 */
export function buildAISummaryPrompt({
  productName,
  category,
  conditionScore,
  routeLabel,
  financial,
  sustainability,
  returnReason,
  demandLevel,
}) {
  const { expectedRevenue, repairCost, logisticsCost, netRecovery, recoveryPct } = financial;
  const { carbonSaved, wastePrevented, circularityScore } = sustainability;

  return `You are a sustainability advisor for ReCircle, Amazon's circular commerce platform.
Write a concise, friendly 3–4 sentence summary for a seller about their returned item.

Item details:
- Product: ${productName || category || "item"}
- Condition score: ${conditionScore}/100
- Return reason: ${returnReason || "not specified"}
- Market demand: ${demandLevel}
- Recommended route: ${routeLabel}

Financial impact:
- Expected revenue: $${expectedRevenue}
- Repair cost: $${repairCost}
- Logistics cost: $${logisticsCost}
- Net recovery: $${netRecovery} (${recoveryPct}% of original value)

Sustainability impact:
- CO₂ saved: ${carbonSaved} kg
- Waste prevented: ${wastePrevented} kg
- Circularity score: ${circularityScore}/100

Write the summary in this style (adapt the numbers and route naturally):
"This [product] has [condition description]. [Demand/repair context sentence]. Recommended Action: [Route]. Expected Recovery: [X%]"

Be warm, specific, and encouraging. Use ₹ for repair costs if they are small (under $20), otherwise use $. Keep it under 100 words.`;
}
