import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProcessStepCard,
  AnimatedSection,
  GlassCard,
  StatCard,
  FloatingBackground,
  PageHero,
  GlowButton,
} from "../components";
import RoutingDecisionCard from "../components/RoutingDecisionCard";

// ── Network visualisation nodes (unchanged from original) ─────────────────────
const nodes = [
  { x: 60,  y: 60,  label: "Return Hub"        },
  { x: 240, y: 40,  label: "Processing Center"  },
  { x: 360, y: 120, label: "Resale Hub"         },
  { x: 180, y: 180, label: "Recycle Facility"   },
  { x: 320, y: 220, label: "Donation Center"    },
];
const connections = [[0, 1],[1, 2],[1, 3],[3, 4]];

// ── Preset scenarios ──────────────────────────────────────────────────────────
const PRESETS = [
  {
    label:    "Like-New Electronics",
    emoji:    "🎧",
    values: { conditionScore: 95, category: "Electronics", originalPrice: 120,
              estimatedRepairCost: 0, demandLevel: "high", returnReason: "Changed mind" },
  },
  {
    label:    "Wrong-Size Trainers",
    emoji:    "👟",
    values: { conditionScore: 92, category: "Shoes", originalPrice: 80,
              estimatedRepairCost: 0, demandLevel: "medium", returnReason: "Wrong size" },
  },
  {
    label:    "Damaged Laptop",
    emoji:    "💻",
    values: { conditionScore: 55, category: "Electronics", originalPrice: 700,
              estimatedRepairCost: 120, demandLevel: "high", returnReason: "Screen cracked" },
  },
  {
    label:    "Worn Clothing",
    emoji:    "👕",
    values: { conditionScore: 35, category: "Clothing", originalPrice: 40,
              estimatedRepairCost: 0, demandLevel: "low", returnReason: "Doesn't fit" },
  },
];

const CATEGORIES  = ["Electronics","Clothing","Shoes","Home & Kitchen","Baby Products","Sports","Fashion","General"];
const DEMAND_OPTS = ["high","medium","low"];

// ── Slider with label ─────────────────────────────────────────────────────────
function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unit = "" }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-white/60 text-xs uppercase tracking-widest font-semibold">{label}</label>
        <span className="text-[#FF9900] font-bold text-sm tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#FF9900] h-1.5 rounded-full cursor-pointer"
      />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-white/60 text-xs uppercase tracking-widest font-semibold mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm
          focus:outline-none focus:border-[#FF9900]/50 transition-colors cursor-pointer"
      >
        {options.map(o => (
          <option key={o} value={o} className="bg-slate-900">{o.charAt(0).toUpperCase() + o.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const RoutingPage = () => {
  const [form, setForm] = useState({
    conditionScore:     80,
    category:           "Electronics",
    originalPrice:      150,
    estimatedRepairCost: 20,
    demandLevel:        "medium",
    returnReason:       "Changed mind",
  });
  const [gradingResult, setGradingResult] = useState(null);
  const [running, setRunning]             = useState(false);

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const applyPreset = (preset) => {
    setForm(preset.values);
    setGradingResult(null);
  };

  const runEngine = () => {
    setRunning(true);
    setGradingResult(null);
    // Simulate grading result shape so RoutingDecisionCard picks up the right fields
    setTimeout(() => {
      setGradingResult({
        itemId: null,
        grading: { trustScore: form.conditionScore },
      });
      setRunning(false);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">
          {/* ── Hero ── */}
          <PageHero
            eyebrow="Logistics Command Center · Live"
            title="Smart Routing"
            subtitle="Every returned item is automatically routed to its best next destination — reducing waste and recovering value across the network."
            visual={
              <GlassCard className="p-4 h-[280px] relative overflow-hidden" hover={false}>
                <svg viewBox="0 0 400 260" className="w-full h-full">
                  {connections.map(([a, b], i) => {
                    const n1 = nodes[a], n2 = nodes[b];
                    return (
                      <motion.line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                        stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{ duration: 1.2, delay: i * 0.2 }} />
                    );
                  })}
                  {connections.map(([a, b], i) => {
                    const n1 = nodes[a], n2 = nodes[b];
                    return (
                      <motion.circle key={`dot-${i}`} r="3.5" fill="#FF9900"
                        initial={{ cx: n1.x, cy: n1.y, opacity: 0 }}
                        animate={{ cx: [n1.x, n2.x], cy: [n1.y, n2.y], opacity: [0, 1, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }} />
                    );
                  })}
                  {nodes.map((n, i) => (
                    <g key={n.label}>
                      <motion.circle cx={n.x} cy={n.y} r="14"
                        fill="rgba(255,255,255,0.06)" stroke="#FF9900" strokeWidth="1.5"
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }} />
                      <motion.circle cx={n.x} cy={n.y} r="14"
                        fill="none" stroke="#FF9900" strokeWidth="1"
                        animate={{ r: [14, 22], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                      <text x={n.x} y={n.y + 28} textAnchor="middle"
                        fill="white" fontSize="9" opacity="0.7">{n.label}</text>
                    </g>
                  ))}
                </svg>
              </GlassCard>
            }
          />

          {/* ── KPI Metrics ── */}
          <AnimatedSection>
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Routing Metrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard value={94} suffix="%" label="Route Efficiency" icon="🧭" accent="orange-400" delay={0} />
              <StatCard value={1.4} decimals={1} suffix="s" label="Processing Time" icon="⚡" accent="emerald-400" delay={0.1} />
              <StatCard value={38}  suffix="K km" label="Distance Saved" icon="📍" accent="teal-400" delay={0.2} />
              <StatCard value={62}  suffix="%" label="Carbon Reduction" icon="🌍" accent="orange-400" delay={0.3} />
            </div>
          </AnimatedSection>

          {/* ── Decision Engine (Interactive) ── */}
          <AnimatedSection className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl xl:text-2xl font-bold text-white">Decision Engine</h2>
                <p className="text-white/50 text-sm mt-1">Configure product attributes and run the routing engine live.</p>
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full
                border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Engine
              </span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-white/40 text-xs uppercase tracking-widest font-semibold self-center mr-1">Quick test:</span>
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                    border border-white/10 bg-white/5 text-white/70 hover:bg-white/10
                    hover:text-white hover:border-white/20 transition-all"
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input panel */}
              <GlassCard className="p-6" hover={false}>
                <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-widest">Product Parameters</h3>

                <div className="space-y-5">
                  <Slider label="Condition Score" value={form.conditionScore}
                    onChange={set("conditionScore")} unit="/100" />
                  <Slider label="Original Price" value={form.originalPrice}
                    onChange={set("originalPrice")} min={5} max={2000} step={5} unit=" $" />
                  <Slider label="Estimated Repair Cost" value={form.estimatedRepairCost}
                    onChange={set("estimatedRepairCost")} min={0} max={500} step={5} unit=" $" />

                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Category" value={form.category}
                      onChange={set("category")} options={CATEGORIES} />
                    <Select label="Demand Level" value={form.demandLevel}
                      onChange={set("demandLevel")} options={DEMAND_OPTS} />
                  </div>

                  <div>
                    <label className="block text-white/60 text-xs uppercase tracking-widest font-semibold mb-1.5">
                      Return Reason
                    </label>
                    <input
                      type="text"
                      value={form.returnReason}
                      onChange={e => set("returnReason")(e.target.value)}
                      placeholder="e.g. Wrong size, Changed mind…"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white
                        text-sm placeholder-white/25 focus:outline-none focus:border-[#FF9900]/50 transition-colors"
                    />
                  </div>
                </div>

                <motion.div className="mt-6" whileTap={{ scale: 0.98 }}>
                  <GlowButton
                    onClick={runEngine}
                    className="w-full"
                    disabled={running}
                  >
                    {running ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          className="w-4 h-4 rounded-full border-2 border-current border-t-transparent inline-block"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                        Running engine…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>⚡</span> Run Routing Engine
                      </span>
                    )}
                  </GlowButton>
                </motion.div>
              </GlassCard>

              {/* Output panel */}
              <div className="flex flex-col gap-4">
                <AnimatePresence mode="wait">
                  {gradingResult ? (
                    <RoutingDecisionCard
                      key="decision"
                      gradingResult={gradingResult}
                      itemMeta={{
                        category:            form.category,
                        originalPrice:       form.originalPrice,
                        estimatedRepairCost: form.estimatedRepairCost,
                        demandLevel:         form.demandLevel,
                        returnReason:        form.returnReason,
                      }}
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] h-full min-h-[300px]
                        flex flex-col items-center justify-center text-center p-8"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="text-5xl mb-4"
                      >
                        🧭
                      </motion.div>
                      <p className="text-white/50 text-sm">
                        Configure the parameters and run the engine to see the recommended route.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Process Flow ── */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-2">AI Routing Engine</h2>
            <p className="text-sm xl:text-base text-white/60 mb-4 max-w-2xl">
              Each return flows through the engine below, where AI grading results determine its optimal next destination.
            </p>
            <div className="flex flex-col">
              <ProcessStepCard step={1} title="Item received"
                description="A returned item arrives at a ReCircle processing centre and is scanned." />
              <ProcessStepCard step={2} title="AI condition check"
                description="The AI Grading system assesses condition, completeness, and functionality." />
              <ProcessStepCard step={3} title="Routing decision"
                description="Based on the grade, the item is routed to resale, repair, recycling, or donation." />
              <ProcessStepCard step={4} title="Outcome tracked"
                description="The outcome is logged in the item's Product Passport and counted toward sustainability savings."
                isLast />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default RoutingPage;
