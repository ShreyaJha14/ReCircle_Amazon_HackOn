
// src/services/routingEngine.js
// Smart Routing Decision Engine
// Determines the optimal circular-economy path for returned products.
// Pure, deterministic, fully unit-testable — no AWS dependencies.

// ── Route constants ───────────────────────────────────────────────────────────
export const ROUTES = {
  RESELL_AS_IS:  { id: "resell_as_is",  label: "Resell As-Is",        emoji: "🏪", color: "emerald" },
  REFURBISH:     { id: "refurbish",     label: "Refurbish & Resell",   emoji: "🔧", color: "orange"  },
  P2P_EXCHANGE:  { id: "p2p_exchange",  label: "Peer-to-Peer Exchange",emoji: "🔄", color: "teal"    },
  DONATE:        { id: "donate",        label: "Donate",               emoji: "🎁", color: "blue"    },
  RECYCLE:       { id: "recycle",       label: "Recycle",              emoji: "♻️", color: "slate"   },
};

// Fashion / apparel categories that qualify for P2P exchange
const FASHION_CATEGORIES = new Set([
  "clothing", "fashion", "apparel", "shoes", "footwear",
  "accessories", "sportswear", "kids clothing",
]);

// Return reasons that indicate a sizing/fit issue (eligible for P2P)
const FIT_REASONS = new Set([
  "wrong size", "doesnt fit", "doesn't fit", "too small",
  "too big", "too large", "size issue", "fit issue",
]);

/**
 * calculateRecoveryValue
 * Estimates the net monetary recovery for each possible route.
 *
 * @param {object} params
 * @param {number} params.conditionScore     0–100
 * @param {number} params.originalPrice      USD
 * @param {number} params.estimatedRepairCost USD
 * @param {string} params.demandLevel        "high" | "medium" | "low"
 * @returns {object} recoveryValues keyed by route id
 */
export function calculateRecoveryValue({ conditionScore, originalPrice, estimatedRepairCost, demandLevel }) {
  const price     = Number(originalPrice)      || 0;
  const repair    = Number(estimatedRepairCost) || 0;
  const condition = Number(conditionScore)      || 0;

  // Demand multiplier
  const demandMult = demandLevel === "high" ? 1.15 : demandLevel === "medium" ? 1.0 : 0.80;

  // Each route recovers a different fraction of original price
  const condFraction = condition / 100;

  return {
    resell_as_is:  +(price * condFraction * 0.75 * demandMult).toFixed(2),
    refurbish:     +(Math.max(0, price * condFraction * 0.65 * demandMult - repair)).toFixed(2),
    p2p_exchange:  +(price * condFraction * 0.55 * demandMult).toFixed(2),
    donate:        +(price * 0.10).toFixed(2),      // tax-credit equivalent
    recycle:       +(price * 0.03).toFixed(2),      // materials recovery
  };
}

/**
 * calculateConfidence
 * Returns a 0–100 confidence score for a chosen route given the inputs.
 *
 * @param {string} routeId
 * @param {object} params full input params
 * @returns {number}
 */
export function calculateConfidence(routeId, params) {
  const {
    conditionScore = 70,
    estimatedRepairCost = 0,
    originalPrice = 50,
    demandLevel = "medium",
    returnReason = "",
  } = params;

  const score = Number(conditionScore);

  switch (routeId) {
    case "resell_as_is": {
      let c = 70;
      if (score > 95) c = 98;
      else if (score > 90) c = 93;
      else if (score > 85) c = 88;
      if (demandLevel === "high")   c = Math.min(99, c + 5);
      if (demandLevel === "low")    c = Math.max(50, c - 10);
      return c;
    }
    case "refurbish": {
      const roi = originalPrice - estimatedRepairCost;
      let c = score >= 75 ? 88 : score >= 60 ? 82 : 72;
      if (roi > 30 && demandLevel !== "low")  c = Math.min(96, c + 6);
      if (estimatedRepairCost > originalPrice * 0.5) c = Math.max(55, c - 15);
      return c;
    }
    case "p2p_exchange": {
      let c = 80;
      if (score > 90) c = 90;
      const lowerReason = returnReason.toLowerCase();
      if ([...FIT_REASONS].some(r => lowerReason.includes(r))) c = Math.min(97, c + 8);
      return c;
    }
    case "donate": {
      return score >= 40 && score < 65 ? 85 : 78;
    }
    case "recycle": {
      return score < 30 ? 95 : score < 40 ? 88 : 75;
    }
    default:
      return 70;
  }
}

/**
 * calculateRoute  (main export)
 * Applies the decision tree and returns the best route with full metadata.
 *
 * @param {object} input
 * @param {number} input.conditionScore       0–100
 * @param {string} input.category             e.g. "Electronics"
 * @param {number} input.originalPrice        USD
 * @param {number} input.estimatedRepairCost  USD
 * @param {string} input.demandLevel          "high" | "medium" | "low"
 * @param {string} input.returnReason         free text
 *
 * @returns {{ route, confidence, reasons, expectedRecoveryValue }}
 */
export function calculateRoute({
  conditionScore    = 70,
  category          = "General",
  originalPrice     = 50,
  estimatedRepairCost = 0,
  demandLevel       = "medium",
  returnReason      = "",
}) {
  const score        = Number(conditionScore);
  const price        = Number(originalPrice);
  const repairCost   = Number(estimatedRepairCost);
  const catLower     = (category || "").toLowerCase();
  const reasonLower  = (returnReason || "").toLowerCase();
  const isFashion    = FASHION_CATEGORIES.has(catLower);
  const isFitReturn  = [...FIT_REASONS].some(r => reasonLower.includes(r));
  const highDemand   = demandLevel === "high";
  const lowDemand    = demandLevel === "low";

  const recoveryValues = calculateRecoveryValue({ conditionScore, originalPrice, estimatedRepairCost, demandLevel });

  // ── Rule evaluation (in priority order) ───────────────────────────────────

  // 1. Recycle — condition too low or recovery would be negative
  if (score < 40 || recoveryValues.refurbish < 0) {
    const reasons = buildReasons({
      score, price, repairCost, highDemand, lowDemand, isFashion,
      flags: {
        "Condition below recovery threshold": score < 40,
        "Repair cost exceeds resale value": recoveryValues.refurbish < 0,
        "Non-repairable state": score < 25,
        "Negative resale recovery": recoveryValues.resell_as_is < 0,
      },
    });
    return makeResult(ROUTES.RECYCLE, reasons, recoveryValues.recycle, "recycle", {
      conditionScore, category, originalPrice, estimatedRepairCost, demandLevel, returnReason,
    });
  }

  // 2. Resell As-Is — excellent condition + high demand
  if (score > 90 && highDemand) {
    const reasons = buildReasons({
      score, price, repairCost, highDemand, lowDemand, isFashion,
      flags: {
        "Excellent condition (>90)": true,
        "High market demand": highDemand,
        "No significant defects detected": score > 92,
        "Strong resale recovery value": recoveryValues.resell_as_is > price * 0.5,
      },
    });
    return makeResult(ROUTES.RESELL_AS_IS, reasons, recoveryValues.resell_as_is, "resell_as_is", {
      conditionScore, category, originalPrice, estimatedRepairCost, demandLevel, returnReason,
    });
  }

  // 3. Peer-to-Peer Exchange — fashion / fit-return with good condition
  if ((isFashion || isFitReturn) && score > 85) {
    const reasons = buildReasons({
      score, price, repairCost, highDemand, lowDemand, isFashion,
      flags: {
        "Fashion/apparel category": isFashion,
        "Wrong size / fit return": isFitReturn,
        "Good condition for direct transfer": score > 85,
        "P2P avoids processing overhead": true,
      },
    });
    return makeResult(ROUTES.P2P_EXCHANGE, reasons, recoveryValues.p2p_exchange, "p2p_exchange", {
      conditionScore, category, originalPrice, estimatedRepairCost, demandLevel, returnReason,
    });
  }

  // 4. Resell As-Is — high condition score (no demand restriction)
  if (score > 90) {
    const reasons = buildReasons({
      score, price, repairCost, highDemand, lowDemand, isFashion,
      flags: {
        "Excellent condition (>90)": true,
        "Suitable for direct resale": true,
        "Positive resale recovery value": recoveryValues.resell_as_is > 0,
        "Medium-to-low demand noted": !highDemand,
      },
    });
    return makeResult(ROUTES.RESELL_AS_IS, reasons, recoveryValues.resell_as_is, "resell_as_is", {
      conditionScore, category, originalPrice, estimatedRepairCost, demandLevel, returnReason,
    });
  }

  // 5. Refurbish & Resell — repairable, good ROI
  if (score >= 60 && score <= 90) {
    const repairROI = recoveryValues.refurbish;
    const repairCostLow = repairCost < price * 0.35;

    // Donate if resale value is very low even after refurb
    if (repairROI < 5 || (lowDemand && repairROI < 15)) {
      const reasons = buildReasons({
        score, price, repairCost, highDemand, lowDemand, isFashion,
        flags: {
          "Usable condition for donation": score >= 40,
          "Low resale recovery value": repairROI < 15,
          "Low market demand": lowDemand,
          "Social impact route preferred": true,
        },
      });
      return makeResult(ROUTES.DONATE, reasons, recoveryValues.donate, "donate", {
        conditionScore, category, originalPrice, estimatedRepairCost, demandLevel, returnReason,
      });
    }

    const reasons = buildReasons({
      score, price, repairCost, highDemand, lowDemand, isFashion,
      flags: {
        "Condition in refurb range (60–90)": true,
        "Repair cost is manageable": repairCostLow,
        "Positive post-repair recovery": repairROI > 0,
        "High resale value after repair": repairROI > price * 0.4,
      },
    });
    return makeResult(ROUTES.REFURBISH, reasons, recoveryValues.refurbish, "refurbish", {
      conditionScore, category, originalPrice, estimatedRepairCost, demandLevel, returnReason,
    });
  }

  // 6. Donate — low value, still usable
  if (score >= 40) {
    const reasons = buildReasons({
      score, price, repairCost, highDemand, lowDemand, isFashion,
      flags: {
        "Usable condition": true,
        "Low resale value": true,
        "Low market demand": lowDemand,
        "Donation maximises social value": true,
      },
    });
    return makeResult(ROUTES.DONATE, reasons, recoveryValues.donate, "donate", {
      conditionScore, category, originalPrice, estimatedRepairCost, demandLevel, returnReason,
    });
  }

  // Fallback — recycle
  const reasons = ["Condition below usable threshold", "Recycling maximises material recovery"];
  return makeResult(ROUTES.RECYCLE, reasons, recoveryValues.recycle, "recycle", {
    conditionScore, category, originalPrice, estimatedRepairCost, demandLevel, returnReason,
  });
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function makeResult(routeDef, reasons, expectedRecoveryValue, routeId, params) {
  const confidence = calculateConfidence(routeId, params);
  return {
    route:                 routeDef.id,
    routeLabel:            routeDef.label,
    routeEmoji:            routeDef.emoji,
    routeColor:            routeDef.color,
    confidence,
    reasons,
    expectedRecoveryValue: Math.max(0, expectedRecoveryValue),
  };
}

/**
 * Returns an array of human-readable reason strings based on truthy flags.
 * Always returns 2–4 concise reasons.
 */
function buildReasons({ flags }) {
  return Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .slice(0, 4);
}
