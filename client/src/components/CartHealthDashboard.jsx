import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import { analyzeCart } from "../utils/CallApi";

// ─── Sub-components ───────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, suffix = "", prefix = "", duration = 1.4, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, value, { duration, delay, ease: "easeOut", onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => ctrl.stop();
  }, [inView, value, duration, delay]);
  return <span ref={ref} className={className}>{prefix}{display}{suffix}</span>;
};

const ScoreGauge = ({ score }) => {
  const color = score >= 75 ? "#10b981" : score >= 55 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Excellent" : score >= 55 ? "Fair" : "At Risk";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber value={score} suffix="%" delay={0.3} className="text-3xl font-bold text-white" />
          <span className="text-xs text-white/50 mt-0.5">health</span>
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ color, backgroundColor: `${color}22`, border: `1px solid ${color}44` }}
      >
        {label}
      </motion.span>
    </div>
  );
};

const MiniBar = ({ value, color = "emerald" }) => {
  const colorMap = { emerald: "#10b981", amber: "#f59e0b", rose: "#f43f5e", sky: "#38bdf8" };
  const hex = colorMap[color] || colorMap.emerald;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full" style={{ backgroundColor: hex }}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-white/50 w-8 text-right">{value}%</span>
    </div>
  );
};

const factorColor = (v) => v >= 75 ? "emerald" : v >= 55 ? "amber" : "rose";

const RiskBadge = ({ level }) => {
  const cfg = {
    safe:   { label: "✓ Safe Purchase", bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-400" },
    medium: { label: "⚡ Medium Risk",  bg: "bg-amber-500/15",   border: "border-amber-500/30",   text: "text-amber-400"   },
    high:   { label: "⚠ High Risk",    bg: "bg-rose-500/15",    border: "border-rose-500/30",    text: "text-rose-400"    },
  };
  const c = cfg[level] || cfg.safe;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full border ${c.bg} ${c.border} ${c.text}`}>
      {c.label}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 animate-pulse">
    <div className="flex gap-3 mb-3">
      <div className="w-12 h-12 rounded-lg bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-white/10 rounded w-3/4" />
        <div className="h-2.5 bg-white/10 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-2 bg-white/10 rounded" />
      <div className="h-2 bg-white/10 rounded w-5/6" />
    </div>
  </div>
);

const RiskDistributionChart = ({ safe, medium, high, total }) => {
  const bars = [
    { label: "Safe",      count: safe,   color: "#10b981", pct: total ? (safe / total) * 100 : 0 },
    { label: "Medium",    count: medium, color: "#f59e0b", pct: total ? (medium / total) * 100 : 0 },
    { label: "High Risk", count: high,   color: "#f43f5e", pct: total ? (high / total) * 100 : 0 },
  ];
  return (
    <div className="space-y-3">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/60">{b.label}</span>
            <span style={{ color: b.color }} className="font-semibold">{b.count} item{b.count !== 1 ? "s" : ""}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full" style={{ backgroundColor: b.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${b.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const ItemCard = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      whileHover={{ y: -3, boxShadow: "0 16px 48px -8px rgba(0,0,0,0.4)" }}
      className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 cursor-pointer transition-colors duration-200 hover:border-white/20"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start gap-3 mb-3">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-white/5" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xl flex-shrink-0">🛍️</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
          <div className="mt-1.5"><RiskBadge level={item.riskLevel} /></div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className={`text-xl font-bold ${item.safeScore >= 75 ? "text-emerald-400" : item.safeScore >= 55 ? "text-amber-400" : "text-rose-400"}`}>
            {item.safeScore}%
          </div>
          <div className="text-xs text-white/30">score</div>
        </div>
      </div>

      {item.riskLevel !== "safe" && item.reasons?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {item.reasons.map((r) => (
            <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/50 border border-white/10">{r}</span>
          ))}
        </div>
      )}

      {item.recommendation && item.riskLevel !== "safe" && (
        <p className="text-xs text-amber-300/70 mb-2 italic">💡 {item.recommendation}</p>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-2">Score Factors</p>
              <div>
                <p className="text-xs text-white/50 mb-1">Return probability (inverse)</p>
                <MiniBar value={100 - item.returnProbability} color={factorColor(100 - item.returnProbability)} />
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">Size confidence</p>
                <MiniBar value={item.sizeConfidence} color={factorColor(item.sizeConfidence)} />
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">Seller quality</p>
                <MiniBar value={item.sellerQuality} color={factorColor(item.sellerQuality)} />
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">Customer history match</p>
                <MiniBar value={item.customerHistoryScore} color={factorColor(item.customerHistoryScore)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-end mt-2">
        <span className="text-xs text-white/25">{expanded ? "▲ less" : "▼ details"}</span>
      </div>
    </motion.div>
  );
};

const StatPill = ({ icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.03 }}
    className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 text-center"
  >
    <span className="text-2xl">{icon}</span>
    <AnimatedNumber value={value} className={`text-2xl font-bold ${color}`} />
    <span className="text-xs text-white/40">{label}</span>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CartHealthDashboard = () => {
  const products = useSelector((state) => state.cart.products);
  const userId   = useSelector((state) => state.auth?.user?.userId ?? null);

  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Build a stable cache-key from product ids + quantities
  const cartKey = products.map((p) => `${p.id}:${p.quantity}`).join("|");

  const runAnalysis = useCallback(async () => {
    if (products.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const items = products.map((p) => ({
        id:       p.id,
        name:     p.title || p.name || "Unknown item",
        category: p.category || "",
        price:    p.price,
        image:    p.image_small || p.image || null,
      }));
      const { analysis: result } = await analyzeCart(items, userId);
      // Merge images back in (API may not echo them)
      result.items = result.items.map((r, i) => ({
        ...r,
        image: r.image || items[i]?.image || null,
        name:  r.name  || items[i]?.name  || "Item",
      }));
      setAnalysis(result);
    } catch (err) {
      console.error("Cart analysis error:", err);
      setError("Could not load cart analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cartKey, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  if (products.length === 0) return null;

  const items      = analysis?.items ?? [];
  const cartScore  = analysis?.cartHealthScore ?? 0;
  const summary    = analysis?.cartSummary ?? "";
  const safeCount  = items.filter((a) => a.riskLevel === "safe").length;
  const medCount   = items.filter((a) => a.riskLevel === "medium").length;
  const highCount  = items.filter((a) => a.riskLevel === "high").length;
  const total      = items.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.7)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
        <span className="text-lg">🧠</span>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">AI Cart Health Dashboard</h2>
          <p className="text-xs text-white/40">Powered by ReCircle Intelligence · Claude via Amazon Bedrock</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {!loading && !error && (
            <button
              onClick={runAnalysis}
              className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
            >
              Re-analyse
            </button>
          )}
          <div className="flex items-center gap-1.5">
            {loading
              ? <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              : error
              ? <span className="w-2 h-2 rounded-full bg-rose-400" />
              : <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            }
            <span className="text-xs text-white/40">
              {loading ? "Analysing…" : error ? "Error" : "Live analysis"}
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="p-6 text-center">
          <p className="text-rose-400 text-sm mb-3">{error}</p>
          <button
            onClick={runAnalysis}
            className="text-xs px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {!error && (
        <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="xl:col-span-1 flex flex-col gap-5">
            {/* Gauge */}
            <div className="rounded-2xl border border-white/10 bg-white/4 p-5 flex flex-col items-center gap-4">
              {loading ? (
                <div className="w-36 h-36 rounded-full bg-white/10 animate-pulse" />
              ) : (
                <ScoreGauge score={cartScore} />
              )}
              {!loading && summary && (
                <p className="text-xs text-white/40 text-center max-w-[200px]">{summary}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatPill icon="🛒" label="Total Items"  value={loading ? 0 : total}      color="text-sky-400"     />
              <StatPill icon="✅" label="Safe Items"   value={loading ? 0 : safeCount}  color="text-emerald-400" />
              <StatPill icon="⚡" label="Medium Risk"  value={loading ? 0 : medCount}   color="text-amber-400"   />
              <StatPill icon="⚠️" label="High Risk"    value={loading ? 0 : highCount}  color="text-rose-400"    />
            </div>

            {/* Risk distribution */}
            <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-4">Risk Distribution</p>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-2 rounded-full bg-white/10 animate-pulse" />)}
                </div>
              ) : (
                <RiskDistributionChart safe={safeCount} medium={medCount} high={highCount} total={total} />
              )}
            </div>
          </div>

          {/* RIGHT — Item cards */}
          <div className="xl:col-span-2">
            <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-4">Item Analysis</p>
            {loading ? (
              <div className="grid grid-cols-1 gap-3">
                {products.map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {items.map((item, i) => (
                  <ItemCard key={item.id ?? i} item={item} index={i} />
                ))}
              </div>
            )}

            {/* Recommendation footer */}
            {!loading && highCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/8 p-4"
              >
                <p className="text-xs font-semibold text-rose-400 mb-1">⚠ Recommendation</p>
                <p className="text-xs text-white/50">
                  {highCount} item{highCount !== 1 ? "s" : ""} in your cart {highCount !== 1 ? "have" : "has"} high return risk. Consider reviewing size guides or checking seller ratings before purchasing.
                </p>
              </motion.div>
            )}

            {!loading && highCount === 0 && medCount === 0 && total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4"
              >
                <p className="text-xs font-semibold text-emerald-400 mb-1">✓ Cart looks great</p>
                <p className="text-xs text-white/50">All items have low return risk. You're good to proceed with confidence.</p>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CartHealthDashboard;
