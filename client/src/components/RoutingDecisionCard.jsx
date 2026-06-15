// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { routeItem } from "../utils/CallApi";

// // ── Route metadata (mirrors server constants) ─────────────────────────────────
// const ROUTE_META = {
//   resell_as_is: {
//     label:       "Resell As-Is",
//     emoji:       "🏪",
//     tagline:     "Ready for the marketplace",
//     gradient:    "from-emerald-500/20 to-teal-600/10",
//     border:      "border-emerald-500/30",
//     badge:       "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
//     glow:        "rgba(16,185,129,0.25)",
//     icon:        "✦",
//   },
//   refurbish: {
//     label:       "Refurbish & Resell",
//     emoji:       "🔧",
//     tagline:     "Small fixes, big value",
//     gradient:    "from-orange-500/20 to-amber-600/10",
//     border:      "border-orange-500/30",
//     badge:       "bg-orange-500/20 text-orange-300 border-orange-500/30",
//     glow:        "rgba(249,115,22,0.25)",
//     icon:        "⚙",
//   },
//   p2p_exchange: {
//     label:       "Peer-to-Peer Exchange",
//     emoji:       "🔄",
//     tagline:     "Direct to someone who needs it",
//     gradient:    "from-teal-500/20 to-cyan-600/10",
//     border:      "border-teal-500/30",
//     badge:       "bg-teal-500/20 text-teal-300 border-teal-500/30",
//     glow:        "rgba(20,184,166,0.25)",
//     icon:        "⇄",
//   },
//   donate: {
//     label:       "Donate",
//     emoji:       "🎁",
//     tagline:     "Maximise social impact",
//     gradient:    "from-blue-500/20 to-indigo-600/10",
//     border:      "border-blue-500/30",
//     badge:       "bg-blue-500/20 text-blue-300 border-blue-500/30",
//     glow:        "rgba(59,130,246,0.25)",
//     icon:        "♡",
//   },
//   recycle: {
//     label:       "Recycle",
//     emoji:       "♻️",
//     tagline:     "Close the loop responsibly",
//     gradient:    "from-slate-500/20 to-slate-600/10",
//     border:      "border-slate-500/30",
//     badge:       "bg-slate-500/20 text-slate-300 border-slate-500/30",
//     glow:        "rgba(100,116,139,0.2)",
//     icon:        "↻",
//   },
// };

// // ── Confidence Arc SVG ────────────────────────────────────────────────────────
// function ConfidenceArc({ value, color }) {
//   const r = 38;
//   const circ = 2 * Math.PI * r;
//   const dash = (value / 100) * circ;

//   return (
//     <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
//       {/* track */}
//       <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
//       {/* progress */}
//       <motion.circle
//         cx="48"
//         cy="48"
//         r={r}
//         fill="none"
//         stroke={color}
//         strokeWidth="7"
//         strokeLinecap="round"
//         strokeDasharray={`${circ}`}
//         initial={{ strokeDashoffset: circ }}
//         animate={{ strokeDashoffset: circ - dash }}
//         transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
//         transform="rotate(-90 48 48)"
//       />
//       {/* label */}
//       <text x="48" y="44" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
//         {value}
//       </text>
//       <text x="48" y="60" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">
//         CONFIDENCE
//       </text>
//     </svg>
//   );
// }

// // ── Recovery value bar ────────────────────────────────────────────────────────
// function RecoveryBar({ label, value, maxValue, emoji, highlight }) {
//   const pct = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;
//   return (
//     <div className={`flex items-center gap-3 py-1.5 px-3 rounded-lg transition-all ${highlight ? "bg-white/5" : ""}`}>
//       <span className="text-base w-5 text-center">{emoji}</span>
//       <span className={`text-xs w-28 shrink-0 ${highlight ? "text-white font-semibold" : "text-white/50"}`}>
//         {label}
//       </span>
//       <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
//         <motion.div
//           className={`h-full rounded-full ${highlight ? "bg-[#FF9900]" : "bg-white/20"}`}
//           initial={{ width: 0 }}
//           animate={{ width: `${pct}%` }}
//           transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
//         />
//       </div>
//       <span className={`text-xs w-12 text-right tabular-nums ${highlight ? "text-white font-semibold" : "text-white/40"}`}>
//         ${value.toFixed(0)}
//       </span>
//     </div>
//   );
// }

// // ── Main component ─────────────────────────────────────────────────────────────
// /**
//  * RoutingDecisionCard
//  *
//  * Shows the smart routing result after AI grading completes.
//  *
//  * Props:
//  *  gradingResult  – response from POST /api/grading/grade
//  *  itemMeta       – { category, originalPrice, returnReason }  (optional)
//  *  onDecision     – callback(decisionResult) (optional)
//  */
// const RoutingDecisionCard = ({ gradingResult, itemMeta = {}, onDecision }) => {
//   const [decision, setDecision]   = useState(null);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState(null);
//   const [revealed, setRevealed]   = useState(false);

//   useEffect(() => {
//     if (!gradingResult) return;

//     const grading = gradingResult.grading || gradingResult;

//     const payload = {
//       itemId:              gradingResult.itemId,
//       conditionScore:      grading.trustScore ?? grading.conditionScore ?? 70,
//       category:            itemMeta.category  || "General",
//       originalPrice:       itemMeta.originalPrice || 50,
//       estimatedRepairCost: itemMeta.estimatedRepairCost || 0,
//       demandLevel:         itemMeta.demandLevel || "medium",
//       returnReason:        itemMeta.returnReason || "",
//     };

//     setLoading(true);
//     setError(null);

//     routeItem(payload)
//       .then((data) => {
//         setDecision(data);
//         onDecision?.(data);
//         // slight delay before revealing for dramatic effect
//         setTimeout(() => setRevealed(true), 100);
//       })
//       .catch((err) => {
//         console.error("Routing error:", err);
//         // Graceful fallback — show a client-side decision
//         const fallback = buildClientFallback(payload);
//         setDecision(fallback);
//         setTimeout(() => setRevealed(true), 100);
//       })
//       .finally(() => setLoading(false));
//   }, [gradingResult]);

//   if (loading) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 flex items-center gap-4"
//       >
//         <motion.div
//           className="w-10 h-10 rounded-full border-2 border-[#FF9900] border-t-transparent"
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//         />
//         <div>
//           <p className="text-white font-semibold text-sm">Analysing best route…</p>
//           <p className="text-white/40 text-xs mt-0.5">Running decision engine</p>
//         </div>
//       </motion.div>
//     );
//   }

//   if (error && !decision) {
//     return (
//       <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 text-sm">
//         {error}
//       </div>
//     );
//   }

//   if (!decision) return null;

//   const meta          = ROUTE_META[decision.route] || ROUTE_META.recycle;
//   const reasons       = decision.reasons || [];
//   const recovery      = decision.recoveryValues || {};
//   const maxRecovery   = Math.max(...Object.values(recovery), 1);
//   const arcColor      = meta.glow.replace("0.25", "1").replace("rgba", "rgb").replace(/,\s*\d\.?\d*\)/, ")");

//   const allRoutes = [
//     { id: "resell_as_is", label: "Resell As-Is",        emoji: "🏪", value: recovery.resell_as_is || 0 },
//     { id: "refurbish",    label: "Refurbish & Resell",   emoji: "🔧", value: recovery.refurbish    || 0 },
//     { id: "p2p_exchange", label: "Peer-to-Peer Exchange",emoji: "🔄", value: recovery.p2p_exchange || 0 },
//     { id: "donate",       label: "Donate",               emoji: "🎁", value: recovery.donate       || 0 },
//     { id: "recycle",      label: "Recycle",              emoji: "♻️", value: recovery.recycle      || 0 },
//   ];

//   return (
//     <AnimatePresence>
//       {revealed && (
//         <motion.div
//           key="routing-card"
//           initial={{ opacity: 0, y: 24, scale: 0.97 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, y: -16 }}
//           transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
//           className={`relative rounded-2xl border ${meta.border} bg-gradient-to-br ${meta.gradient}
//             backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.4)] overflow-hidden`}
//           style={{ boxShadow: `0 16px 48px ${meta.glow}` }}
//         >
//           {/* Animated shimmer line */}
//           <motion.div
//             className="absolute top-0 left-0 right-0 h-px"
//             style={{
//               background: `linear-gradient(90deg, transparent, ${arcColor}, transparent)`,
//             }}
//             initial={{ scaleX: 0, opacity: 0 }}
//             animate={{ scaleX: 1, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           />

//           <div className="p-6">
//             {/* Header */}
//             <div className="flex items-start justify-between mb-5">
//               <div>
//                 <div className="flex items-center gap-2 mb-1">
//                   <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5
//                     rounded-full border ${meta.badge}`}>
//                     Recommended Route
//                   </span>
//                 </div>
//                 <h3 className="text-white text-xl xl:text-2xl font-bold mt-2 flex items-center gap-2">
//                   <span>{meta.emoji}</span>
//                   {meta.label}
//                 </h3>
//                 <p className="text-white/50 text-sm mt-0.5">{meta.tagline}</p>
//               </div>

//               {/* Confidence arc */}
//               <ConfidenceArc value={decision.confidence} color={arcColor} />
//             </div>

//             {/* Decision factors */}
//             <div className="mb-5">
//               <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">
//                 Decision Factors
//               </p>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {reasons.map((reason, i) => (
//                   <motion.div
//                     key={reason}
//                     initial={{ opacity: 0, x: -10 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.3 + i * 0.08 }}
//                     className="flex items-center gap-2.5"
//                   >
//                     <span className="text-emerald-400 text-sm font-bold shrink-0">✔</span>
//                     <span className="text-white/80 text-sm">{reason}</span>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>

//             {/* Recovery value comparison */}
//             {Object.keys(recovery).length > 0 && (
//               <div className="border-t border-white/8 pt-4 mb-5">
//                 <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">
//                   Expected Recovery Value
//                 </p>
//                 <div className="space-y-0.5">
//                   {allRoutes.map((r) => (
//                     <RecoveryBar
//                       key={r.id}
//                       label={r.label}
//                       value={r.value}
//                       maxValue={maxRecovery}
//                       emoji={r.emoji}
//                       highlight={r.id === decision.route}
//                     />
//                   ))}
//                 </div>
//                 <div className="mt-3 flex items-center justify-between">
//                   <span className="text-white/40 text-xs">Best route recovery</span>
//                   <span className="text-[#FF9900] font-bold text-lg">
//                     ${decision.expectedRecoveryValue?.toFixed(2) ?? "—"}
//                   </span>
//                 </div>
//               </div>
//             )}

//             {/* AI reasoning (if available) */}
//             {decision.aiReasoning && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.8 }}
//                 className="border-t border-white/8 pt-4"
//               >
//                 <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-2">
//                   AI Reasoning
//                 </p>
//                 <p className="text-white/70 text-sm leading-relaxed italic">
//                   "{decision.aiReasoning}"
//                 </p>
//               </motion.div>
//             )}
//           </div>

//           {/* Bottom accent strip */}
//           <div className={`h-1 bg-gradient-to-r ${meta.gradient.replace("/20", "/60").replace("/10", "/40")}`} />
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// // ── Client-side fallback (no backend needed) ──────────────────────────────────
// function buildClientFallback({ conditionScore, originalPrice, demandLevel }) {
//   const score = Number(conditionScore) || 70;
//   const price = Number(originalPrice)  || 50;

//   let route, confidence, reasons, expectedRecoveryValue;

//   if (score > 90 && demandLevel === "high") {
//     route = "resell_as_is"; confidence = 94;
//     reasons = ["Excellent condition (>90)", "High market demand", "No significant defects detected"];
//     expectedRecoveryValue = price * 0.65;
//   } else if (score >= 60) {
//     route = "refurbish"; confidence = 85;
//     reasons = ["Condition in refurb range (60–90)", "Repair cost is manageable", "Positive post-repair recovery"];
//     expectedRecoveryValue = price * 0.45;
//   } else if (score >= 40) {
//     route = "donate"; confidence = 78;
//     reasons = ["Usable condition", "Low resale value", "Donation maximises social value"];
//     expectedRecoveryValue = price * 0.10;
//   } else {
//     route = "recycle"; confidence = 90;
//     reasons = ["Condition below recovery threshold", "Recycling maximises material recovery"];
//     expectedRecoveryValue = price * 0.03;
//   }

//   return {
//     route,
//     confidence,
//     reasons,
//     expectedRecoveryValue,
//     recoveryValues: {
//       resell_as_is: price * 0.65,
//       refurbish:    price * 0.45,
//       p2p_exchange: price * 0.40,
//       donate:       price * 0.10,
//       recycle:      price * 0.03,
//     },
//   };
// }

// export default RoutingDecisionCard;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { routeItem } from "../utils/CallApi";

// ── Route metadata ────────────────────────────────────────────────────────────
const ROUTE_META = {
  resell_as_is: {
    label:    "Resell As-Is",
    emoji:    "🏪",
    tagline:  "Ready for the marketplace",
    gradient: "from-emerald-500/20 to-teal-600/10",
    border:   "border-emerald-500/30",
    badge:    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    glow:     "rgba(16,185,129,0.25)",
    arcColor: "#10b981",
  },
  refurbish: {
    label:    "Refurbish & Resell",
    emoji:    "🔧",
    tagline:  "Small fixes, big value",
    gradient: "from-orange-500/20 to-amber-600/10",
    border:   "border-orange-500/30",
    badge:    "bg-orange-500/20 text-orange-300 border-orange-500/30",
    glow:     "rgba(249,115,22,0.25)",
    arcColor: "#f97316",
  },
  p2p_exchange: {
    label:    "Peer-to-Peer Exchange",
    emoji:    "🔄",
    tagline:  "Direct to someone who needs it",
    gradient: "from-teal-500/20 to-cyan-600/10",
    border:   "border-teal-500/30",
    badge:    "bg-teal-500/20 text-teal-300 border-teal-500/30",
    glow:     "rgba(20,184,166,0.25)",
    arcColor: "#14b8a6",
  },
  donate: {
    label:    "Donate",
    emoji:    "🎁",
    tagline:  "Maximise social impact",
    gradient: "from-blue-500/20 to-indigo-600/10",
    border:   "border-blue-500/30",
    badge:    "bg-blue-500/20 text-blue-300 border-blue-500/30",
    glow:     "rgba(59,130,246,0.25)",
    arcColor: "#3b82f6",
  },
  recycle: {
    label:    "Recycle",
    emoji:    "♻️",
    tagline:  "Close the loop responsibly",
    gradient: "from-slate-500/20 to-slate-600/10",
    border:   "border-slate-500/30",
    badge:    "bg-slate-500/20 text-slate-300 border-slate-500/30",
    glow:     "rgba(100,116,139,0.2)",
    arcColor: "#64748b",
  },
};

// ── Confidence Arc ────────────────────────────────────────────────────────────
function ConfidenceArc({ value, color }) {
  const r    = 38;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
      <motion.circle
        cx="48" cy="48" r={r}
        fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (value / 100) * circ }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        transform="rotate(-90 48 48)"
      />
      <text x="48" y="44" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">{value}</text>
      <text x="48" y="60" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">CONFIDENCE</text>
    </svg>
  );
}

// ── Financial row ─────────────────────────────────────────────────────────────
function FinancialRow({ label, value, icon, highlight, isDeduct }) {
  return (
    <div className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${highlight ? "bg-white/5" : ""}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className={`text-xs ${highlight ? "text-white font-semibold" : "text-white/55"}`}>{label}</span>
      </div>
      <span className={`text-xs font-mono tabular-nums ${
        highlight   ? "text-[#FF9900] font-bold text-sm"
        : isDeduct  ? "text-red-400/80"
        : "text-white/50"
      }`}>
        {isDeduct ? "−" : ""}${value.toFixed(2)}
      </span>
    </div>
  );
}

// ── Recovery bar ──────────────────────────────────────────────────────────────
function RecoveryBar({ label, value, maxValue, emoji, highlight }) {
  const pct = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;
  return (
    <div className={`flex items-center gap-3 py-1 px-3 rounded-lg transition-all ${highlight ? "bg-white/5" : ""}`}>
      <span className="text-sm w-5 text-center shrink-0">{emoji}</span>
      <span className={`text-xs w-28 shrink-0 ${highlight ? "text-white font-semibold" : "text-white/50"}`}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${highlight ? "bg-[#FF9900]" : "bg-white/20"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
        />
      </div>
      <span className={`text-xs w-12 text-right tabular-nums ${highlight ? "text-white font-semibold" : "text-white/40"}`}>
        ${value.toFixed(0)}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
/**
 * RoutingDecisionCard
 * Shows routing result + impact intelligence after grading completes.
 *
 * Props:
 *   gradingResult  – response from POST /api/grading/grade
 *   itemMeta       – { category, originalPrice, estimatedRepairCost, demandLevel, returnReason, productName }
 *   onDecision     – callback(decisionResult)
 */
const RoutingDecisionCard = ({ gradingResult, itemMeta = {}, onDecision }) => {
  const [decision, setDecision] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!gradingResult) return;
    const grading = gradingResult.grading || gradingResult;

    const payload = {
      itemId:              gradingResult.itemId,
      productName:         itemMeta.productName || null,
      conditionScore:      grading.trustScore ?? grading.conditionScore ?? 70,
      category:            itemMeta.category || "General",
      originalPrice:       itemMeta.originalPrice || 50,
      estimatedRepairCost: itemMeta.estimatedRepairCost || 0,
      demandLevel:         itemMeta.demandLevel || "medium",
      returnReason:        itemMeta.returnReason || "",
    };

    setLoading(true);
    routeItem(payload)
      .then((data) => {
        setDecision(data);
        onDecision?.(data);
        setTimeout(() => setRevealed(true), 100);
      })
      .catch(() => {
        setDecision(buildClientFallback(payload));
        setTimeout(() => setRevealed(true), 100);
      })
      .finally(() => setLoading(false));
  }, [gradingResult]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 flex items-center gap-4"
      >
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-[#FF9900] border-t-transparent shrink-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <div>
          <p className="text-white font-semibold text-sm">Calculating best route…</p>
          <p className="text-white/40 text-xs mt-0.5">Running impact intelligence engine</p>
        </div>
      </motion.div>
    );
  }

  if (!decision) return null;

  const meta     = ROUTE_META[decision.route] || ROUTE_META.recycle;
  const reasons  = decision.reasons || [];
  const recovery = decision.recoveryValues || {};
  const fin      = decision.financial || {};
  const sust     = decision.sustainability || {};
  const maxRec   = Math.max(...Object.values(recovery), 1);

  const allRoutes = [
    { id: "resell_as_is", label: "Resell As-Is",        emoji: "🏪", value: recovery.resell_as_is || 0 },
    { id: "refurbish",    label: "Refurbish & Resell",   emoji: "🔧", value: recovery.refurbish    || 0 },
    { id: "p2p_exchange", label: "Peer-to-Peer Exchange",emoji: "🔄", value: recovery.p2p_exchange || 0 },
    { id: "donate",       label: "Donate",               emoji: "🎁", value: recovery.donate       || 0 },
    { id: "recycle",      label: "Recycle",              emoji: "♻️", value: recovery.recycle      || 0 },
  ];

  return (
    <AnimatePresence>
      {revealed && (
        <motion.div
          key="routing-card"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className={`relative rounded-2xl border ${meta.border} bg-gradient-to-br ${meta.gradient}
            backdrop-blur-xl overflow-hidden`}
          style={{ boxShadow: `0 16px 48px ${meta.glow}` }}
        >
          {/* shimmer line */}
          <motion.div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${meta.arcColor}, transparent)` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${meta.badge}`}>
                  Recommended Route
                </span>
                <h3 className="text-white text-xl xl:text-2xl font-bold mt-2 flex items-center gap-2">
                  <span>{meta.emoji}</span>{meta.label}
                </h3>
                <p className="text-white/50 text-sm mt-0.5">{meta.tagline}</p>
              </div>
              <ConfidenceArc value={decision.confidence} color={meta.arcColor} />
            </div>

            {/* Decision factors */}
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-3">Decision Factors</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reasons.map((r, i) => (
                  <motion.div key={r}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-emerald-400 text-sm font-bold shrink-0">✔</span>
                    <span className="text-white/80 text-sm">{r}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Financial breakdown */}
            {fin.expectedRevenue !== undefined && (
              <div className="border-t border-white/8 pt-4">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-2">
                  Financial Breakdown
                </p>
                <div className="space-y-0.5">
                  <FinancialRow icon="💰" label="Expected Revenue"  value={fin.expectedRevenue}  />
                  <FinancialRow icon="🔧" label="Repair Cost"       value={fin.repairCost}       isDeduct={fin.repairCost > 0} />
                  <FinancialRow icon="🚚" label="Logistics Cost"    value={fin.logisticsCost}    isDeduct />
                  <div className="border-t border-white/8 mt-1 pt-1">
                    <FinancialRow icon="📈" label="Net Recovery"    value={fin.netRecovery}      highlight />
                  </div>
                </div>
              </div>
            )}

            {/* Sustainability */}
            {sust.carbonSaved !== undefined && (
              <div className="border-t border-white/8 pt-4">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-3">
                  Sustainability Impact
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: "🌿", label: "CO₂ Saved",        value: `${sust.carbonSaved} kg`,     color: "emerald" },
                    { icon: "♻️", label: "Waste Prevented",   value: `${sust.wastePrevented} kg`,  color: "teal"    },
                    { icon: "🔄", label: "Circularity Score", value: `${sust.circularityScore}/100`,color: "orange"  },
                  ].map((s) => (
                    <div key={s.label}
                      className={`flex-1 min-w-[100px] px-3 py-2.5 rounded-xl bg-${s.color}-500/10 border border-${s.color}-500/20`}
                    >
                      <div className="text-lg">{s.icon}</div>
                      <div className={`text-${s.color}-300 font-bold text-sm mt-0.5`}>{s.value}</div>
                      <div className="text-white/40 text-[10px] mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recovery comparison */}
            {Object.keys(recovery).length > 0 && (
              <div className="border-t border-white/8 pt-4">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-2">
                  Recovery by Route
                </p>
                <div className="space-y-0.5">
                  {allRoutes.map((r) => (
                    <RecoveryBar key={r.id} label={r.label} value={r.value}
                      maxValue={maxRec} emoji={r.emoji} highlight={r.id === decision.route} />
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary */}
            {decision.aiSummary && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="border-t border-white/8 pt-4"
              >
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-2">
                  AI Summary
                </p>
                <p className="text-white/75 text-sm leading-relaxed italic">"{decision.aiSummary}"</p>
              </motion.div>
            )}
          </div>

          <div className={`h-1 bg-gradient-to-r ${meta.gradient.replace("/20", "/60").replace("/10", "/40")}`} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Client-side fallback ──────────────────────────────────────────────────────
function buildClientFallback({ conditionScore, originalPrice, demandLevel, estimatedRepairCost }) {
  const score   = Number(conditionScore) || 70;
  const price   = Number(originalPrice)  || 50;
  const repair  = Number(estimatedRepairCost) || 0;
  const logCost = 6.0;

  let route, confidence, reasons;
  if (score > 90 && demandLevel === "high") {
    route = "resell_as_is"; confidence = 94;
    reasons = ["Excellent condition (>90)", "High market demand", "No significant defects detected"];
  } else if (score >= 60) {
    route = "refurbish"; confidence = 85;
    reasons = ["Condition in refurb range (60–90)", "Repair cost is manageable", "Positive post-repair recovery"];
  } else if (score >= 40) {
    route = "donate"; confidence = 78;
    reasons = ["Usable condition", "Low resale value", "Donation maximises social value"];
  } else {
    route = "recycle"; confidence = 90;
    reasons = ["Condition below recovery threshold", "Recycling maximises material recovery"];
  }

  const mult = { resell_as_is: 0.75, refurbish: 0.65, p2p_exchange: 0.55, donate: 0.10, recycle: 0.03 };
  const frac = score / 100;
  const dMult = demandLevel === "high" ? 1.15 : demandLevel === "low" ? 0.80 : 1.0;
  const expRev = +(price * frac * (mult[route] || 0.5) * dMult).toFixed(2);
  const repCost = route === "refurbish" ? repair : 0;
  const netRec = Math.max(0, expRev - repCost - logCost);

  return {
    route, confidence, reasons,
    financial: {
      expectedRevenue: expRev,
      repairCost: repCost,
      logisticsCost: logCost,
      netRecovery: +netRec.toFixed(2),
      recoveryPct: price > 0 ? Math.round((netRec / price) * 100) : 0,
    },
    sustainability: {
      carbonSaved: +(28 * frac).toFixed(1),
      wastePrevented: +(1.8 * frac).toFixed(2),
      circularityScore: route === "resell_as_is" ? 95 : route === "refurbish" ? 88 : route === "recycle" ? 55 : 75,
    },
    recoveryValues: Object.fromEntries(
      Object.entries(mult).map(([k, m]) => [k, +(price * frac * m * dMult).toFixed(2)])
    ),
    expectedRecoveryValue: +netRec.toFixed(2),
  };
}

export default RoutingDecisionCard;

