import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import {
  PageHeader,
  FeatureCard,
  AnimatedSection,
  GlassCard,
  MetricCard,
  StatCard,
  FloatingBackground,
  PageHero,
} from "../components";

// ─── Dummy data ───────────────────────────────────────────────────────────────

const recommendations = [
  {
    icon: "📏",
    title: "Sizing accuracy improved",
    detail:
      "Customers ordering this item now see a fit confidence score before purchase, reducing fit-related returns by 31%.",
    confidence: 92,
  },
  {
    icon: "🖼️",
    title: "Listing enriched",
    detail:
      "Added 4 lifestyle photos and a size comparison chart, improving pre-purchase clarity for shoppers.",
    confidence: 88,
  },
  {
    icon: "💬",
    title: "Q&A coverage expanded",
    detail:
      "AI-generated answers now cover 96% of common pre-purchase questions for this category.",
    confidence: 95,
  },
];

const SCORE_DATA = {
  score: 82,
  customerHistory: 88,
  categoryRisk: 74,
  sellerRating: 94,
  reviewSentiment: 81,
  sizeConfidence: 76,
};

const RETURN_REASONS = [
  {
    label: "Size Issue",
    pct: 42,
    color: "#FF9900",
    glow: "rgba(255,153,0,0.45)",
    icon: "📏",
    detail: "Customer measurements didn't match listed sizing chart",
  },
  {
    label: "Color Mismatch",
    pct: 28,
    color: "#34d399",
    glow: "rgba(52,211,153,0.45)",
    icon: "🎨",
    detail: "Product color appeared different on screen vs. in-person",
  },
  {
    label: "Quality Expectation",
    pct: 18,
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.45)",
    icon: "⭐",
    detail: "Perceived quality below listing photos and description",
  },
  {
    label: "Delivery Related",
    pct: 12,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.45)",
    icon: "📦",
    detail: "Item damaged or delayed during shipping",
  },
];

// ─── Feature 3: Smart Return Simulation data ──────────────────────────────────

const SIMULATION_DATA = [
  {
    label: "Keep Product",
    value: 83,
    icon: "✅",
    color: "#10b981",
    glow: "rgba(16,185,129,0.35)",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    description: "Satisfied with quality & fit",
  },
  {
    label: "Exchange Size",
    value: 11,
    icon: "🔄",
    color: "#FF9900",
    glow: "rgba(255,153,0,0.35)",
    bg: "rgba(255,153,0,0.08)",
    border: "rgba(255,153,0,0.25)",
    description: "Same product, different size",
  },
  {
    label: "Return Completely",
    value: 6,
    icon: "↩️",
    color: "#f43f5e",
    glow: "rgba(244,63,94,0.35)",
    bg: "rgba(244,63,94,0.08)",
    border: "rgba(244,63,94,0.25)",
    description: "Full return requested",
  },
];

const AI_INSIGHT = {
  summary:
    "Customers with similar purchasing behavior and return history are highly likely to keep this item.",
  confidence: 87,
  trend: +14,
  riskLevel: "Low",
  factors: [
    { label: "Purchase history match", score: 94, icon: "🛒" },
    { label: "Size profile accuracy",  score: 96, icon: "📏" },
    { label: "Category familiarity",   score: 81, icon: "🏷️" },
    { label: "Review sentiment score", score: 89, icon: "⭐" },
  ],
};

// ─── Shared count-up hook ─────────────────────────────────────────────────────

function useCountUp(target, inView, delay = 0, duration = 1.5) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, target, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [inView, target, delay, duration]);
  return val;
}

// ─── Return Prevention Score components ───────────────────────────────────────

function getRisk(score) {
  if (score >= 80) return { label: "Low Risk", color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)", text: "This purchase is unlikely to be returned." };
  if (score >= 60) return { label: "Medium Risk", color: "#FF9900", bg: "rgba(255,153,0,0.12)", border: "rgba(255,153,0,0.3)", text: "Some return indicators detected. See recommendations below." };
  return { label: "High Risk", color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", text: "Multiple return signals detected. Review listing details carefully." };
}

const SIGNAL_LABELS = [
  { key: "customerHistory", label: "Customer History", icon: "👤" },
  { key: "categoryRisk",    label: "Category Risk",   icon: "🏷️" },
  { key: "sellerRating",    label: "Seller Rating",   icon: "⭐" },
  { key: "reviewSentiment", label: "Review Sentiment",icon: "💬" },
  { key: "sizeConfidence",  label: "Size Confidence", icon: "📏" },
];

function CircularScore({ score, color }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, score, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => ctrl.stop();
  }, [inView, score]);

  const offset = circ - (display / 100) * circ;

  return (
    <div ref={ref} className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-36 h-36 -rotate-90 absolute inset-0" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 10px ${color})`, transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white leading-none" style={{ textShadow: `0 0 20px ${color}` }}>
          {Math.round(display)}
        </span>
        <span className="text-xs text-white/40 mt-0.5 font-medium">/ 100</span>
      </div>
    </div>
  );
}

function SignalBar({ label, icon, value, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [w, setW] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, value, {
      duration: 1,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setW(v),
    });
    return () => ctrl.stop();
  }, [inView, value, delay]);

  const barColor = value >= 80 ? "#34d399" : value >= 60 ? "#FF9900" : "#f87171";

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
      <span className="text-xs text-white/55 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-75"
          style={{ width: `${w}%`, background: barColor, boxShadow: `0 0 6px ${barColor}` }}
        />
      </div>
      <span className="text-xs font-semibold text-white/70 w-8 text-right">{Math.round(w)}</span>
    </div>
  );
}

function ReturnPreventionScoreCard() {
  const risk = getRisk(SCORE_DATA.score);

  return (
    <AnimatedSection className="mt-10">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl xl:text-2xl font-bold text-white">Return Prevention Score</h2>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{ background: "rgba(255,153,0,0.15)", color: "#FF9900", border: "1px solid rgba(255,153,0,0.3)" }}>
          AI-Powered
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <GlassCard className="lg:col-span-2 p-8 flex flex-col items-center gap-6" hover={false}
          style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.75) 100%)" }}>

          <CircularScore score={SCORE_DATA.score} color={risk.color} />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: risk.bg, border: `1px solid ${risk.border}`, color: risk.color }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: risk.color }} />
            {risk.label}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center text-sm text-white/60 max-w-[220px]"
          >
            {risk.text}
          </motion.p>
        </GlassCard>

        <GlassCard className="lg:col-span-3 p-8 flex flex-col gap-5" hover={false}>
          <div>
            <div className="text-base font-semibold text-white mb-1">Score Signals</div>
            <div className="text-xs text-white/40">Factors contributing to the overall return risk assessment</div>
          </div>

          <div className="flex flex-col gap-4">
            {SIGNAL_LABELS.map((s, i) => (
              <SignalBar
                key={s.key}
                icon={s.icon}
                label={s.label}
                value={SCORE_DATA[s.key]}
                delay={0.1 + i * 0.08}
              />
            ))}
          </div>

          <div className="border-t border-white/8 pt-4 mt-auto">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Low Risk",    range: "80–100", color: "#34d399" },
                { label: "Medium Risk", range: "60–79",  color: "#FF9900" },
                { label: "High Risk",   range: "0–59",   color: "#f87171" },
              ].map((tier) => (
                <div key={tier.label}
                  className="rounded-xl px-3 py-2 text-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: tier.color }} />
                  <div className="text-[10px] font-semibold" style={{ color: tier.color }}>{tier.label}</div>
                  <div className="text-[10px] text-white/35">{tier.range}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </AnimatedSection>
  );
}

// ─── AI Return Reason Predictor components ────────────────────────────────────

function ReasonBar({ reason, index, isLoading }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!inView || isLoading) return;
    const ctrl = animate(0, reason.pct, {
      duration: 1.0,
      delay: 0.15 * index,
      ease: "easeOut",
      onUpdate: (v) => setWidth(v),
    });
    return () => ctrl.stop();
  }, [inView, isLoading, reason.pct, index]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group cursor-default"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{reason.icon}</span>
          <span className="text-sm font-semibold text-white">{reason.label}</span>
          <AnimatePresence>
            {hovered && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-white/45 hidden sm:block"
              >
                — {reason.detail}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: reason.color }}>
          {isLoading ? "—" : `${Math.round(width)}%`}
        </span>
      </div>

      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        {isLoading && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
        )}
        {!isLoading && (
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${width}%`,
              background: `linear-gradient(90deg, ${reason.color}bb, ${reason.color})`,
              boxShadow: hovered ? `0 0 14px ${reason.glow}` : `0 0 6px ${reason.glow}55`,
              transition: "box-shadow 0.25s ease",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

function DonutChart({ reasons, isLoading }) {
  const [hovered, setHovered] = useState(null);
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 68;
  const innerR = 44;
  const gap = 3;

  let cumulative = 0;
  const slices = reasons.map((r_) => {
    const startAngle = (cumulative / 100) * 360 - 90;
    cumulative += r_.pct;
    const endAngle = (cumulative / 100) * 360 - 90;
    return { ...r_, startAngle, endAngle };
  });

  function polarToCart(angle, radius) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function slicePath(startAngle, endAngle) {
    const gapAngle = (gap / (2 * Math.PI * r)) * 360;
    const s = startAngle + gapAngle / 2;
    const e = endAngle - gapAngle / 2;
    const p1 = polarToCart(s, innerR + 2);
    const p2 = polarToCart(s, r);
    const p3 = polarToCart(e, r);
    const p4 = polarToCart(e, innerR + 2);
    const large = e - s > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r} ${r} 0 ${large} 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${innerR + 2} ${innerR + 2} 0 ${large} 0 ${p1.x} ${p1.y} Z`;
  }

  const active = hovered !== null ? reasons[hovered] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {isLoading ? (
            <circle cx={cx} cy={cy} r={r - 10} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="20" />
          ) : (
            slices.map((slice, i) => (
              <path
                key={slice.label}
                d={slicePath(slice.startAngle, slice.endAngle)}
                fill={slice.color}
                opacity={hovered === null || hovered === i ? 1 : 0.35}
                style={{
                  filter: hovered === i ? `drop-shadow(0 0 10px ${slice.glow})` : "none",
                  transition: "opacity 0.2s, filter 0.2s",
                  cursor: "pointer",
                  transform: hovered === i ? `scale(1.04)` : "scale(1)",
                  transformOrigin: `${cx}px ${cy}px`,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            ))
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div key={active.label} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center px-2">
                <div className="text-2xl font-black" style={{ color: active.color }}>{active.pct}%</div>
                <div className="text-[10px] text-white/50 leading-tight mt-0.5">{active.label}</div>
              </motion.div>
            ) : (
              <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <div className="text-lg font-bold text-white/30">Why</div>
                <div className="text-[10px] text-white/25">Hover slice</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
        {reasons.map((r_) => (
          <div key={r_.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: r_.color }} />
            <span className="text-[11px] text-white/55">{r_.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIReturnReasonPredictor() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatedSection className="mt-10">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl xl:text-2xl font-bold text-white">AI Return Reason Predictor</h2>
        <AnimatePresence>
          {isLoading && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)" }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Analysing…
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <GlassCard className="lg:col-span-3 p-8 flex flex-col gap-6" hover={false}>
          <div>
            <div className="text-base font-semibold text-white mb-1">Predicted Return Reasons</div>
            <div className="text-xs text-white/40">
              Hover a bar to learn more · Based on product category, reviews & historical patterns
            </div>
          </div>
          <div className="flex flex-col gap-5">
            {RETURN_REASONS.map((reason, i) => (
              <ReasonBar key={reason.label} reason={reason} index={i} isLoading={isLoading} />
            ))}
          </div>
          <AnimatePresence>
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-2 p-3 rounded-xl flex gap-3 items-start"
                style={{ background: "rgba(255,153,0,0.07)", border: "1px solid rgba(255,153,0,0.18)" }}
              >
                <span className="text-base flex-shrink-0 mt-0.5">💡</span>
                <p className="text-xs text-white/55 leading-relaxed">
                  <span className="text-[#FF9900] font-semibold">Top recommendation:</span>{" "}
                  Adding a detailed size guide and interactive fit tool could reduce the 42% sizing-related return risk for this item.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        <GlassCard className="lg:col-span-2 p-8 flex flex-col items-center justify-center gap-2" hover={false}>
          <div className="text-sm font-semibold text-white mb-3 self-start">Return Reason Mix</div>
          <DonutChart reasons={RETURN_REASONS} isLoading={isLoading} />
        </GlassCard>
      </div>
    </AnimatedSection>
  );
}

// ─── Feature 3: Smart Return Simulation components ────────────────────────────

function PersonGrid({ inView }) {
  const total = 100;
  const keepers = 83;
  const exchangers = 11;

  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
      {Array.from({ length: total }).map((_, i) => {
        let color, glow;
        if (i < keepers) {
          color = "#10b981";
          glow = "0 0 6px rgba(16,185,129,0.7)";
        } else if (i < keepers + exchangers) {
          color = "#FF9900";
          glow = "0 0 6px rgba(255,153,0,0.7)";
        } else {
          color = "#f43f5e";
          glow = "0 0 6px rgba(244,63,94,0.7)";
        }
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: inView ? i * 0.012 : 0, ease: "backOut" }}
            title={
              i < keepers
                ? "Keeps product"
                : i < keepers + exchangers
                ? "Exchanges size"
                : "Returns completely"
            }
            style={{ color, filter: inView ? glow : "none" }}
            className="flex items-center justify-center text-base cursor-default select-none"
          >
            👤
          </motion.div>
        );
      })}
    </div>
  );
}

function SimBar({ item, inView, index }) {
  const count = useCountUp(item.value, inView, index * 0.15 + 0.3);

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 + 0.2 }}
      className="flex items-center gap-4 group"
    >
      <div className="flex items-center gap-2 w-44 flex-shrink-0">
        <span className="text-xl">{item.icon}</span>
        <div>
          <div className="text-sm font-semibold text-white">{item.label}</div>
          <div className="text-xs text-white/40">{item.description}</div>
        </div>
      </div>

      <div className="flex-1 relative h-8 rounded-full overflow-hidden bg-white/5 border border-white/8">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${item.value}%` } : {}}
          transition={{ duration: 1.1, delay: index * 0.15 + 0.3, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${item.color}90, ${item.color})`,
            boxShadow: `0 0 16px ${item.glow}`,
          }}
        />
        {/* Pulse sweep at fill edge */}
        <motion.div
          animate={inView ? { opacity: [0, 0.8, 0] } : {}}
          transition={{ duration: 1.5, delay: index * 0.15 + 1.1 }}
          className="absolute top-0 bottom-0 w-6 rounded-full"
          style={{
            left: `calc(${item.value}% - 12px)`,
            background: `radial-gradient(ellipse, ${item.color}, transparent)`,
          }}
        />
      </div>

      <div
        className="w-16 text-right font-black text-2xl tabular-nums"
        style={{ color: item.color, textShadow: `0 0 12px ${item.glow}` }}
      >
        {count}
      </div>
    </motion.div>
  );
}

function ConfidenceRing({ value, inView }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const display = useCountUp(value, inView, 0.4, 1.6);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, value, {
      duration: 1.6,
      delay: 0.4,
      ease: "easeOut",
      onUpdate: (v) => setProgress(v),
    });
    return () => ctrl.stop();
  }, [inView, value]);

  const offset = circ - (progress / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.7))", transition: "stroke-dashoffset 0.05s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-emerald-400 tabular-nums">{display}%</span>
          <span className="text-xs text-white/40 mt-0.5">confidence</span>
        </div>
      </div>
    </div>
  );
}

function InsightFactorBar({ factor, inView, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3"
    >
      <span className="text-base w-6 text-center">{factor.icon}</span>
      <span className="text-xs text-white/60 w-40 flex-shrink-0">{factor.label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${factor.score}%` } : {}}
          transition={{ duration: 0.9, delay: delay + 0.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #FF9900aa, #FF9900)",
            boxShadow: "0 0 8px rgba(255,153,0,0.5)",
          }}
        />
      </div>
      <span className="text-xs font-semibold text-[#FF9900] w-9 text-right tabular-nums">
        {factor.score}%
      </span>
    </motion.div>
  );
}

function OutcomeCard({ item, inView, index }) {
  const count = useCountUp(item.value, inView, index * 0.18 + 0.6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.13 + 0.4 }}
      whileHover={{ y: -4, boxShadow: `0 20px 50px -10px ${item.glow}` }}
      className="relative rounded-2xl p-5 flex flex-col items-center text-center cursor-default transition-all duration-300"
      style={{ background: item.bg, border: `1px solid ${item.border}`, backdropFilter: "blur(12px)" }}
    >
      {/* top glow orb */}
      <div
        className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 rounded-full blur-xl opacity-60"
        style={{ background: item.color }}
      />
      <div className="text-3xl mb-2 relative z-10">{item.icon}</div>
      <div
        className="text-5xl font-black tabular-nums relative z-10 mb-1"
        style={{ color: item.color, textShadow: `0 0 20px ${item.glow}` }}
      >
        {count}
      </div>
      <div className="text-sm font-semibold text-white relative z-10">{item.label}</div>
      <div className="text-xs text-white/40 mt-1 relative z-10">{item.description}</div>
    </motion.div>
  );
}

function SmartReturnSimulation() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const trendUp = AI_INSIGHT.trend >= 0;

  return (
    <AnimatedSection className="mt-10">
      <div ref={ref}>
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#FF9900] to-emerald-400" />
          <h2 className="text-xl xl:text-2xl font-bold text-white">Smart Return Simulation</h2>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium ml-1"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
          >
            Feature 3
          </span>
        </div>

        {/* Scenario headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-5 mb-5"
          style={{ background: "linear-gradient(90deg, rgba(30,41,59,0.7), rgba(15,23,42,0.7))", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🔭</span>
            <span className="text-xs text-white/50 font-medium uppercase tracking-wider">Simulation Scenario</span>
          </div>
          <p className="text-lg xl:text-xl font-semibold text-white">
            If{" "}
            <span className="text-[#FF9900] font-black">100 customers</span>{" "}
            similar to you buy this product…
          </p>
        </motion.div>

        {/* Outcome cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {SIMULATION_DATA.map((item, i) => (
            <OutcomeCard key={item.label} item={item} inView={inView} index={i} />
          ))}
        </div>

        {/* Infographic + Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          {/* Person grid infographic */}
          <div
            className="rounded-2xl p-5"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,23,42,0.5)", backdropFilter: "blur(16px)" }}
          >
            <div className="text-xs text-white/40 uppercase tracking-wider mb-3 font-medium">
              Animated Infographic · 100 Customers
            </div>
            <PersonGrid inView={inView} />
            <div className="flex flex-wrap gap-4 mt-4">
              {SIMULATION_DATA.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: item.color, boxShadow: `0 0 6px ${item.glow}` }}
                  />
                  <span className="text-xs text-white/50">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Horizontal progress bars */}
          <div
            className="rounded-2xl p-5 flex flex-col justify-center gap-5"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,23,42,0.5)", backdropFilter: "blur(16px)" }}
          >
            <div className="text-xs text-white/40 uppercase tracking-wider font-medium">
              Distribution Breakdown
            </div>
            {SIMULATION_DATA.map((item, i) => (
              <SimBar key={item.label} item={item} inView={inView} index={i} />
            ))}
          </div>
        </div>

        {/* AI Insight panel */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(15,23,42,0.85) 60%, rgba(255,153,0,0.04) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header stripe */}
          <div
            className="px-6 py-3 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <span className="text-sm">🤖</span>
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              AI Insight · Behavioural Analysis
            </span>
            {/* Trend chip */}
            <span
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: trendUp ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
                color: trendUp ? "#10b981" : "#f43f5e",
                border: `1px solid ${trendUp ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`,
              }}
            >
              {trendUp ? "↑" : "↓"} {Math.abs(AI_INSIGHT.trend)}% vs last month
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Confidence ring + risk badge + summary */}
            <div className="lg:col-span-2 flex flex-col items-center gap-4">
              <ConfidenceRing value={AI_INSIGHT.confidence} inView={inView} />

              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)" }}
              >
                <span className="text-emerald-400 font-semibold text-sm">
                  🛡️ {AI_INSIGHT.riskLevel} Return Risk
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="text-sm text-white/60 text-center leading-relaxed max-w-xs"
              >
                {AI_INSIGHT.summary}
              </motion.p>
            </div>

            {/* Factor bars + risk explanation */}
            <div className="lg:col-span-3 flex flex-col justify-center gap-4">
              <div className="text-xs text-white/40 uppercase tracking-wider font-medium">
                Confidence Factors
              </div>

              {AI_INSIGHT.factors.map((f, i) => (
                <InsightFactorBar key={f.label} factor={f} inView={inView} delay={i * 0.1 + 0.5} />
              ))}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 1.0 }}
                className="mt-2 rounded-xl p-4"
                style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
              >
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1.5 font-medium">
                  Risk Explanation
                </div>
                <p className="text-sm text-white/65 leading-relaxed">
                  This customer profile shows strong alignment with high-satisfaction purchasers.
                  Historical data from{" "}
                  <span className="text-[#FF9900] font-semibold">47,200+ similar orders</span> suggests
                  an{" "}
                  <span className="text-emerald-400 font-semibold">87% probability</span> of retention.
                  The primary risk vector is size variance, mitigated by our fit-confidence score.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PreventionPage = () => {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">
          <PageHero
            eyebrow="Recommendation Intelligence · AI-Powered"
            title="Return Prevention"
            subtitle="ReCircle helps stop unnecessary returns before they happen — saving time, money, and emissions through predictive intelligence."
            visual={
              <GlassCard className="p-6 h-[280px] flex flex-col gap-4 justify-center" hover={false}>
                <div className="flex items-center justify-between">
                  <span className="text-sm xl:text-base font-semibold text-white">Return Risk Score</span>
                  <span className="text-xs xl:text-sm text-emerald-400 font-semibold">Low Risk</span>
                </div>
                <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "18%" }}
                    transition={{ duration: 1.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { label: "Size Match", val: "96%" },
                    { label: "Confidence", val: "91%" },
                    { label: "Quality",    val: "94%" },
                  ].map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                      className="rounded-xl bg-white/5 border border-white/10 p-3 text-center"
                    >
                      <div className="text-lg xl:text-xl font-bold text-[#FF9900]">{m.val}</div>
                      <div className="text-xs text-white/50 mt-0.5">{m.label}</div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            }
          />

          {/* Feature grid */}
          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-3 gap-1">
            <FeatureCard icon="📏" title="Smart sizing" description="AI-powered size recommendations based on past orders and reviews reduce fit-related returns." delay={0} />
            <FeatureCard icon="🖼️" title="Richer listings" description="Enhanced photos, videos, and detailed specs help customers know exactly what they're buying." delay={0.05} />
            <FeatureCard icon="💬" title="Pre-purchase Q&A" description="AI-assisted answers to common questions help avoid mismatched expectations." delay={0.1} />
          </AnimatedSection>

          {/* Feature 1: Return Prevention Score */}
          <ReturnPreventionScoreCard />

          {/* Feature 2: AI Return Reason Predictor */}
          <AIReturnReasonPredictor />

          {/* Feature 3: Smart Return Simulation */}
          <SmartReturnSimulation />

          {/* Prediction Dashboard */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Prediction Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard title="Size Accuracy"          value={96} subtitle="Predicted vs. actual fit"          accent="emerald-400" delay={0}   />
              <MetricCard title="Customer Confidence"    value={91} subtitle="Pre-purchase confidence score"     accent="orange-400"  delay={0.1} />
              <MetricCard title="Recommendation Quality" value={94} subtitle="Relevance of AI suggestions"       accent="teal-400"    delay={0.2} />
              <MetricCard title="Return Risk Score"      value={18} subtitle="Lower is better"                   accent="blue-400"    delay={0.3} />
            </div>
          </AnimatedSection>

          {/* AI Recommendations */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">AI Recommendations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendations.map((rec, i) => (
                <GlassCard key={rec.title} className="p-6" delay={i * 0.1}>
                  <div className="text-2xl mb-3">{rec.icon}</div>
                  <div className="text-base xl:text-lg font-semibold text-white mb-2">{rec.title}</div>
                  <div className="text-sm xl:text-base text-white/60 mb-4">{rec.detail}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${rec.confidence}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 * i }}
                        className="h-full rounded-full bg-[#FF9900]"
                      />
                    </div>
                    <span className="text-xs xl:text-sm font-semibold text-[#FF9900]">{rec.confidence}%</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </AnimatedSection>

          {/* Impact so far */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Impact So Far</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard value={31}  suffix="%"   label="Fewer fit-related returns"    icon="📏" accent="emerald-400" delay={0}   />
              <StatCard value={2.4} decimals={1} suffix="M" label="Avoidable returns prevented" icon="🛡️" accent="orange-400" delay={0.1} />
              <StatCard value={18}  suffix="K t" label="Packaging waste avoided"      icon="📦" accent="teal-400"    delay={0.2} />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default PreventionPage;