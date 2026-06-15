import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target, { duration = 1.8, delay = 0, decimals = 0 } = {}) {
  const [val, setVal] = useState(0);
  const ref           = useRef(null);
  const inView        = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, target, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setVal(decimals ? +v.toFixed(decimals) : Math.round(v)),
    });
    return () => ctrl.stop();
  }, [inView, target, duration, delay, decimals]);

  return [val, ref];
}

// ── SVG Progress Ring ─────────────────────────────────────────────────────────
function ProgressRing({ value, max = 100, size = 88, stroke = 7, color, label, sublabel }) {
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;
  const [count, ref] = useCounter(value, { duration: 1.6 });

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* track */}
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
          {/* fill */}
          <motion.circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        {/* centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-bold text-lg leading-none">{count}</span>
          {sublabel && <span className="text-white/40 text-[9px] mt-0.5">{sublabel}</span>}
        </div>
      </div>
      {label && <span className="text-white/60 text-xs text-center leading-tight">{label}</span>}
    </div>
  );
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function BarChart({ data, title }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      {title && (
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-3">{title}</p>
      )}
      <div className="space-y-2.5">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-base w-5 shrink-0 text-center">{item.emoji}</span>
            <span className="text-white/60 text-xs w-28 shrink-0 truncate">{item.label}</span>
            <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: item.color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${(item.value / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.07, ease: "easeOut" }}
              />
            </div>
            <span className="text-white/50 text-xs w-10 text-right tabular-nums shrink-0">
              {item.pct != null ? `${item.pct}%` : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Donut chart (route distribution) ─────────────────────────────────────────
function DonutChart({ segments, size = 120 }) {
  const r       = size / 2 - 12;
  const circ    = 2 * Math.PI * r;
  let cumAngle  = -90; // start from top

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          const angle    = (seg.pct / 100) * 360;
          const start    = (cumAngle * Math.PI) / 180;
          cumAngle      += angle;
          const end      = (cumAngle * Math.PI) / 180;
          const cx       = size / 2;
          const cy       = size / 2;
          const x1       = cx + r * Math.cos(start);
          const y1       = cy + r * Math.sin(start);
          const x2       = cx + r * Math.cos(end);
          const y2       = cy + r * Math.sin(end);
          const large    = angle > 180 ? 1 : 0;
          const dash     = (seg.pct / 100) * circ;

          return (
            <motion.path
              key={seg.label}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={seg.color}
              fillOpacity={0.85}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
            />
          );
        })}
        {/* centre hole */}
        <circle cx={size / 2} cy={size / 2} r={r * 0.55} fill="rgba(15,23,42,0.85)" />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">5</text>
        <text x={size / 2} y={size / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">ROUTES</text>
      </svg>
      {/* legend */}
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-white/60 text-xs">{seg.label}</span>
            <span className="text-white/40 text-xs ml-auto pl-3 tabular-nums">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Metric pill ───────────────────────────────────────────────────────────────
function MetricPill({ label, value, unit = "", prefix = "", color, icon, delay = 0 }) {
  const [count, ref] = useCounter(value, { delay, decimals: value % 1 !== 0 ? 1 : 0 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5
        flex flex-col gap-1 overflow-hidden"
      style={{ boxShadow: `0 0 40px -12px ${color}55` }}
    >
      {/* glow blob */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20"
        style={{ background: color }} />
      <span className="text-xl">{icon}</span>
      <div className="text-2xl xl:text-3xl font-bold text-white mt-1 tabular-nums">
        {prefix}{count}{unit}
      </div>
      <div className="text-white/50 text-xs">{label}</div>
      <div className="mt-2 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </motion.div>
  );
}

// ── Main ImpactInsightsPanel ──────────────────────────────────────────────────
/**
 * ImpactInsightsPanel
 *
 * Standalone dashboard section showing financial + environmental impact.
 * Can operate in two modes:
 *   1. `decision` prop  — shows impact for a specific routing decision (post-engine)
 *   2. No prop          — shows aggregate platform-level metrics
 *
 * Props:
 *   decision  {object}  Full response from POST /api/routing/decide (optional)
 *   className {string}
 */
const ImpactInsightsPanel = ({ decision, className = "" }) => {
  // ── Data source: specific decision or aggregated platform stats ─────────────
  const fin   = decision?.financial;
  const sust  = decision?.sustainability;
  const route = decision?.route;

  // If we have a live decision, show its data; otherwise show platform aggregates
  const revenueValue       = fin?.expectedRevenue    ?? 84000;
  const repairCostValue    = fin?.repairCost         ?? 9200;
  const logisticsCostValue = fin?.logisticsCost      ?? 3800;
  const netRecoveryValue   = fin?.netRecovery        ?? 71000;
  const recoveryPct        = fin?.recoveryPct        ?? 84;
  const carbonSaved        = sust?.carbonSaved       ?? 1240;
  const wastePrevented     = sust?.wastePrevented    ?? 480;
  const circularityScore   = sust?.circularityScore  ?? 87;
  const isLive             = !!decision;

  // ── Route distribution data ───────────────────────────────────────────────
  const routeSegments = [
    { label: "Resell As-Is",  pct: 45, color: "#10b981" },
    { label: "Refurbish",     pct: 22, color: "#f97316" },
    { label: "P2P Exchange",  pct: 15, color: "#14b8a6" },
    { label: "Donate",        pct: 12, color: "#3b82f6" },
    { label: "Recycle",       pct:  6, color: "#64748b" },
  ];

  // ── Revenue recovery bars ─────────────────────────────────────────────────
  const revenueData = [
    { label: "Resell As-Is",  value: 75, pct: 75, emoji: "🏪", color: "#10b981" },
    { label: "Refurbish",     value: 58, pct: 58, emoji: "🔧", color: "#f97316" },
    { label: "P2P Exchange",  value: 50, pct: 50, emoji: "🔄", color: "#14b8a6" },
    { label: "Donate",        value: 10, pct: 10, emoji: "🎁", color: "#3b82f6" },
    { label: "Recycle",       value:  3, pct:  3, emoji: "♻️", color: "#64748b" },
  ].map((d) => ({ ...d, color: route === d.label.toLowerCase().replace(/ /g, "_") ? d.color : `${d.color}99` }));

  // ── Environmental bars ────────────────────────────────────────────────────
  const envData = [
    { label: "Electronics", value: 28, pct: 100, emoji: "💻", color: "#10b981" },
    { label: "Home & Kitchen", value: 12, pct: 43, emoji: "🏠", color: "#14b8a6" },
    { label: "Shoes", value: 8, pct: 29, emoji: "👟", color: "#f97316" },
    { label: "Clothing", value: 6.5, pct: 23, emoji: "👕", color: "#3b82f6" },
    { label: "Baby Products", value: 5.5, pct: 20, emoji: "🍼", color: "#8b5cf6" },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl xl:text-2xl font-bold text-white">Impact Insights</h2>
          <p className="text-white/50 text-sm mt-0.5">
            {isLive ? "Live decision analysis" : "Platform-wide circular economy metrics"}
          </p>
        </div>
        {isLive && (
          <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full
            border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Analysis
          </span>
        )}
      </div>

      {/* ── Financial Breakdown (top 4 pills) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricPill
          label="Expected Revenue"
          value={isLive ? revenueValue : 84000}
          prefix={isLive ? "$" : "$"}
          unit={isLive ? "" : "+"}
          icon="💰" color="#10b981" delay={0}
        />
        <MetricPill
          label="Repair Cost"
          value={isLive ? repairCostValue : 9200}
          prefix="$" icon="🔧" color="#f97316" delay={0.07}
        />
        <MetricPill
          label="Logistics Cost"
          value={isLive ? logisticsCostValue : 3800}
          prefix="$" icon="🚚" color="#14b8a6" delay={0.14}
        />
        <MetricPill
          label="Net Recovery Value"
          value={isLive ? netRecoveryValue : 71000}
          prefix="$" icon="📈" color="#FF9900" delay={0.21}
        />
      </div>

      {/* ── Sustainability + Circularity rings ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 overflow-hidden"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
      >
        {/* decorative gradient blob */}
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #10b981, #14b8a6)" }} />

        <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-5">
          Sustainability Metrics
        </p>

        <div className="flex flex-wrap gap-8 items-center justify-around">
          <ProgressRing
            value={Math.round(isLive ? carbonSaved : 35)}
            max={isLive ? Math.max(50, Math.round(carbonSaved) + 15) : 50}
            color="#10b981"
            label="CO₂ Saved (kg)"
            sublabel="kg CO₂"
            size={96}
          />
          <ProgressRing
            value={isLive ? Math.round(wastePrevented * 10) : 24}
            max={isLive ? Math.max(30, Math.round(wastePrevented * 10) + 6) : 30}
            color="#14b8a6"
            label="Waste Prevented (kg)"
            sublabel="× 0.1 kg"
            size={96}
          />
          <ProgressRing
            value={Math.round(circularityScore)}
            max={100}
            color="#FF9900"
            label="Circularity Score"
            sublabel="/ 100"
            size={96}
          />
          <ProgressRing
            value={Math.round(recoveryPct)}
            max={100}
            color="#f97316"
            label="Revenue Recovery %"
            sublabel="%"
            size={96}
          />
        </div>

        {/* Formula breakdown */}
        <div className="mt-6 pt-5 border-t border-white/8">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-3">
            Net Recovery Formula
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono">
              ${isLive ? revenueValue.toFixed(2) : "84,000"} Revenue
            </span>
            <span className="text-white/30 font-bold">−</span>
            <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 font-mono">
              ${isLive ? repairCostValue.toFixed(2) : "9,200"} Repair
            </span>
            <span className="text-white/30 font-bold">−</span>
            <span className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono">
              ${isLive ? logisticsCostValue.toFixed(2) : "3,800"} Logistics
            </span>
            <span className="text-white/30 font-bold">=</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] font-mono font-bold">
              ${isLive ? netRecoveryValue.toFixed(2) : "71,000"} Net Recovery
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Route Distribution donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5"
        >
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-4">
            Route Distribution
          </p>
          <DonutChart segments={routeSegments} size={120} />
        </motion.div>

        {/* Revenue Recovery bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5"
        >
          <BarChart data={revenueData} title="Revenue Recovery by Route (%)" />
        </motion.div>

        {/* Environmental Impact bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5"
        >
          <BarChart data={envData} title="CO₂ Saved by Category (kg)" />
        </motion.div>
      </div>
    </div>
  );
};

export default ImpactInsightsPanel;
