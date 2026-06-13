import { motion } from "framer-motion";
import {
  PageHeader,
  FeatureCard,
  CarbonSavingIndicator,
  AnimatedSection,
  GlassCard,
  GradientBorderCard,
  StatCard,
  FloatingBackground,
  PageHero,
} from "../components";

const lifecycle = [
  { icon: "🏭", label: "Manufacture" },
  { icon: "🛒", label: "Purchase" },
  { icon: "↩️", label: "Return" },
  { icon: "🤖", label: "AI Grade" },
  { icon: "♻️", label: "ReCircle" },
  { icon: "🔁", label: "Resale" },
];

const monthlyTrend = [40, 55, 48, 62, 70, 65, 78, 85, 80, 92, 88, 96];

const SustainabilityPage = () => {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">
          <PageHero
            eyebrow="Executive Sustainability Dashboard"
            title="Sustainability Impact"
            subtitle="ReCircle is part of Amazon's commitment to reducing waste and carbon emissions across the marketplace — measured, verified, and improving every quarter."
            visual={
              <GlassCard className="p-6 h-[280px] flex flex-col" hover={false}>
                <div className="text-sm xl:text-base font-semibold text-white mb-3">
                  Carbon Saved — Monthly Trend
                </div>
                <div className="flex-1 flex items-end gap-1.5">
                  {monthlyTrend.map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${v}%` }}
                      transition={{ duration: 0.7, delay: i * 0.04 }}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-500/40 to-emerald-400"
                    />
                  ))}
                </div>
                <div className="text-xs xl:text-sm text-white/50 mt-2">Jan – Dec · trending up 140% YoY</div>
              </GlassCard>
            }
          />

          {/* Environmental Impact Hero KPIs */}
          <AnimatedSection>
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Environmental Impact</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard value={1.2} decimals={1} suffix="M kg" label="Carbon Saved" icon="🌍" accent="emerald-400" delay={0} />
              <StatCard value={480} suffix="K" label="Waste Reduced (items)" icon="🗑️" accent="orange-400" delay={0.1} />
              <StatCard value={3.8} decimals={1} suffix="M $" label="Circular Revenue" icon="💰" accent="teal-400" delay={0.2} />
              <StatCard value={92} suffix="%" label="Product Recovery Rate" icon="♻️" accent="emerald-400" delay={0.3} />
            </div>
          </AnimatedSection>

          {/* Sustainability Analytics */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Sustainability Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Area chart */}
              <GlassCard className="p-6 sm:col-span-2" delay={0}>
                <div className="text-sm xl:text-base font-semibold text-white mb-3">Carbon Savings Over Time</div>
                <svg viewBox="0 0 400 140" className="w-full h-36">
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0,120 L33,100 L66,108 L100,85 L133,70 L166,78 L200,58 L233,45 L266,52 L300,30 L333,38 L366,18 L400,15 L400,140 L0,140 Z"
                    fill="url(#areaFill)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                  />
                  <motion.path
                    d="M0,120 L33,100 L66,108 L100,85 L133,70 L166,78 L200,58 L233,45 L266,52 L300,30 L333,38 L366,18 L400,15"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                  />
                </svg>
              </GlassCard>

              {/* Donut chart */}
              <GlassCard className="p-6 flex flex-col items-center justify-center" delay={0.1}>
                <div className="text-sm xl:text-base font-semibold text-white mb-3 self-start">Returns Outcome Split</div>
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
                    {/* Resale 45% */}
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none" stroke="#FF9900" strokeWidth="14"
                      strokeDasharray={`${0.45 * 251.2} 251.2`}
                      initial={{ strokeDasharray: "0 251.2" }}
                      whileInView={{ strokeDasharray: `${0.45 * 251.2} 251.2` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                    />
                    {/* Recycle 30% */}
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="14"
                      strokeDasharray={`${0.30 * 251.2} 251.2`}
                      strokeDashoffset={`${-0.45 * 251.2}`}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                    {/* Donate 25% */}
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none" stroke="#14b8a6" strokeWidth="14"
                      strokeDasharray={`${0.25 * 251.2} 251.2`}
                      strokeDashoffset={`${-0.75 * 251.2}`}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                    100%
                  </div>
                </div>
                <div className="flex gap-3 mt-4 text-xs text-white/60">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF9900]" />Resale</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Recycle</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400" />Donate</span>
                </div>
              </GlassCard>
            </div>

            {/* Trend chart */}
            <GlassCard className="p-6 mt-4" delay={0.2}>
              <div className="text-sm xl:text-base font-semibold text-white mb-3">Items Diverted From Landfill (Quarterly)</div>
              <div className="flex items-end gap-3 h-28">
                {[120, 145, 168, 190].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${(v / 190) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: i * 0.1 }}
                      className="w-full rounded-t-md bg-gradient-to-t from-teal-500/40 to-teal-400"
                      style={{ minHeight: 4 }}
                    />
                    <span className="text-xs text-white/50">Q{i + 1}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Circular Economy Visualization */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Circular Economy Lifecycle</h2>
            <GlassCard className="p-8" hover={false}>
              <div className="relative flex items-center justify-center min-h-[260px]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[260px] h-[260px] rounded-full border-2 border-dashed border-emerald-400/30"
                />
                <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-[#FF9900]/30 border border-white/20 backdrop-blur-xl flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(16,185,129,0.35)]">
                  ♻️
                </div>
                {lifecycle.map((item, i) => {
                  const angle = (i / lifecycle.length) * 2 * Math.PI - Math.PI / 2;
                  const r = 150;
                  const x = Math.cos(angle) * r;
                  const y = Math.sin(angle) * r;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                      className="absolute flex flex-col items-center gap-1 rounded-xl border border-white/15 bg-white/[0.07] backdrop-blur-xl px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs font-semibold text-white">{item.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Impact Summary */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Impact Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard
                icon="♻️"
                title="Circular by design"
                description="Items that can't be resold are repaired, recycled, or donated instead of discarded."
                delay={0}
              />
              <FeatureCard
                icon="📊"
                title="Track your impact"
                description="Look for the carbon saving indicator on eligible products to see your personal contribution."
                delay={0.05}
              />
            </div>
          </AnimatedSection>

          {/* CTA */}
          <AnimatedSection className="mt-10 mb-6">
            <GradientBorderCard>
              <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-base xl:text-lg font-semibold text-white mb-1">Your personal contribution</div>
                  <div className="text-sm xl:text-base text-white/60">Every ReCircle purchase adds to the impact above.</div>
                </div>
                <CarbonSavingIndicator kg={2.3} />
              </div>
            </GradientBorderCard>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityPage;