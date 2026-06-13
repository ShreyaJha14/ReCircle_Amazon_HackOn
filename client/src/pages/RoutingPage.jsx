import { motion } from "framer-motion";
import {
  PageHeader,
  ProcessStepCard,
  AnimatedSection,
  GlassCard,
  StatCard,
  FloatingBackground,
  PageHero,
} from "../components";

const nodes = [
  { x: 60, y: 60, label: "Return Hub" },
  { x: 240, y: 40, label: "Processing Center" },
  { x: 360, y: 120, label: "Resale Hub" },
  { x: 180, y: 180, label: "Recycle Facility" },
  { x: 320, y: 220, label: "Donation Center" },
];

const connections = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 4],
];

const RoutingPage = () => {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">
          <PageHero
            eyebrow="Logistics Command Center · Live"
            title="Smart Routing"
            subtitle="Every returned item is automatically routed to its best next destination — reducing waste and recovering value across the network."
            visual={
              <GlassCard className="p-4 h-[280px] relative overflow-hidden" hover={false}>
                <svg viewBox="0 0 400 260" className="w-full h-full">
                  {/* connection lines */}
                  {connections.map(([a, b], i) => {
                    const n1 = nodes[a];
                    const n2 = nodes[b];
                    return (
                      <motion.line
                        key={i}
                        x1={n1.x}
                        y1={n1.y}
                        x2={n2.x}
                        y2={n2.y}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{ duration: 1.2, delay: i * 0.2 }}
                      />
                    );
                  })}
                  {/* animated dots traveling on lines */}
                  {connections.map(([a, b], i) => {
                    const n1 = nodes[a];
                    const n2 = nodes[b];
                    return (
                      <motion.circle
                        key={`dot-${i}`}
                        r="3.5"
                        fill="#FF9900"
                        initial={{ cx: n1.x, cy: n1.y, opacity: 0 }}
                        animate={{
                          cx: [n1.x, n2.x],
                          cy: [n1.y, n2.y],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: i * 0.6,
                          ease: "easeInOut",
                        }}
                      />
                    );
                  })}
                  {/* nodes */}
                  {nodes.map((n, i) => (
                    <g key={n.label}>
                      <motion.circle
                        cx={n.x}
                        cy={n.y}
                        r="14"
                        fill="rgba(255,255,255,0.06)"
                        stroke="#FF9900"
                        strokeWidth="1.5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      />
                      <motion.circle
                        cx={n.x}
                        cy={n.y}
                        r="14"
                        fill="none"
                        stroke="#FF9900"
                        strokeWidth="1"
                        animate={{ r: [14, 22], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      />
                      <text
                        x={n.x}
                        y={n.y + 28}
                        textAnchor="middle"
                        fill="white"
                        fontSize="9"
                        opacity="0.7"
                      >
                        {n.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </GlassCard>
            }
          />

          {/* KPI Metrics */}
          <AnimatedSection>
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Routing Metrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard value={94} suffix="%" label="Route Efficiency" icon="🧭" accent="orange-400" delay={0} />
              <StatCard value={1.4} decimals={1} suffix="s" label="Processing Time" icon="⚡" accent="emerald-400" delay={0.1} />
              <StatCard value={38} suffix="K km" label="Distance Saved" icon="📍" accent="teal-400" delay={0.2} />
              <StatCard value={62} suffix="%" label="Carbon Reduction" icon="🌍" accent="orange-400" delay={0.3} />
            </div>
          </AnimatedSection>

          {/* AI Routing Engine - process flow */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-2">AI Routing Engine</h2>
            <p className="text-sm xl:text-base text-white/60 mb-4 max-w-2xl">
              Each return flows through the engine below, where AI grading
              results determine its optimal next destination.
            </p>
            <div className="flex flex-col">
              <ProcessStepCard
                step={1}
                title="Item received"
                description="A returned item arrives at a ReCircle processing centre and is scanned."
              />
              <ProcessStepCard
                step={2}
                title="AI condition check"
                description="The AI Grading system assesses condition, completeness, and functionality."
              />
              <ProcessStepCard
                step={3}
                title="Routing decision"
                description="Based on the grade, the item is routed to resale, repair, recycling, or donation."
              />
              <ProcessStepCard
                step={4}
                title="Outcome tracked"
                description="The outcome is logged in the item's Product Passport and counted toward sustainability savings."
                isLast
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default RoutingPage;