import { motion } from "framer-motion";
import {
  PageHeader,
  FeatureCard,
  TrustScoreBadge,
  AnimatedSection,
  GlassCard,
  MetricCard,
  FloatingBackground,
  PageHero,
} from "../components";

const AIGradingPage = () => {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">
          <PageHero
            eyebrow="Computer Vision · Live"
            title="AI Grading"
            subtitle="ReCircle uses computer vision and machine learning to automatically assess the condition of returned and resale items in seconds."
            visual={
              <div className="relative h-[260px] rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden flex items-center justify-center">
                {/* neural network background */}
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 260">
                  {Array.from({ length: 18 }).map((_, i) => {
                    const x1 = (i % 6) * 70 + 20;
                    const y1 = Math.floor(i / 6) * 80 + 30;
                    const x2 = ((i + 1) % 6) * 70 + 20;
                    const y2 = Math.floor((i + 1) / 6) * 80 + 30;
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#10b981"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                  {Array.from({ length: 18 }).map((_, i) => (
                    <circle
                      key={i}
                      cx={(i % 6) * 70 + 20}
                      cy={Math.floor(i / 6) * 80 + 30}
                      r="3"
                      fill="#FF9900"
                    />
                  ))}
                </svg>

                {/* product silhouette */}
                <div className="relative w-32 h-32 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-5xl">
                  🎧
                </div>

                {/* radar scan sweep */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "conic-gradient(from 0deg, rgba(16,185,129,0.35), transparent 60%)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* pulsing rings */}
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute rounded-full border border-emerald-400/40"
                    style={{ width: 80, height: 80 }}
                    animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            }
          />

          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-3 gap-1">
            <FeatureCard
              icon="📸"
              title="Photo-based assessment"
              description="When an item is returned, our AI analyses uploaded photos to detect wear, damage, and missing parts."
              delay={0}
            />
            <FeatureCard
              icon="⭐"
              title="Condition scoring"
              description="Items are scored from 'Like New' to 'Heavily Used', helping set fair resale pricing automatically."
              delay={0.05}
            />
            <FeatureCard
              icon="✅"
              title="AI Verified badge"
              description="Items that pass grading display an AI Verified badge so buyers can shop pre-owned with confidence."
              delay={0.1}
            />
          </AnimatedSection>

          {/* AI Insights */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">AI Insights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard title="Accuracy" value={97} subtitle="Across 1.2M graded items" accent="emerald-400" delay={0} />
              <MetricCard title="Confidence" value={94} subtitle="Average grading confidence" accent="orange-400" delay={0.1} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <GlassCard className="p-6" delay={0.15}>
                <div className="text-sm xl:text-base font-semibold text-white mb-3">Detection Speed</div>
                <div className="flex items-end gap-1 h-24">
                  {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-[#FF9900]/60 to-[#FF9900]"
                    />
                  ))}
                </div>
                <div className="text-xs xl:text-sm text-white/50 mt-2">Avg. 1.4s per item</div>
              </GlassCard>

              <GlassCard className="p-6" delay={0.2}>
                <div className="text-sm xl:text-base font-semibold text-white mb-3">Defect Categories</div>
                <div className="space-y-3">
                  {[
                    { label: "Cosmetic wear", pct: 48, color: "orange-400" },
                    { label: "Missing parts", pct: 22, color: "emerald-400" },
                    { label: "Functional damage", pct: 18, color: "teal-400" },
                    { label: "Packaging only", pct: 12, color: "blue-400" },
                  ].map((d, i) => (
                    <div key={d.label}>
                      <div className="flex justify-between text-xs xl:text-sm text-white/60 mb-1">
                        <span>{d.label}</span>
                        <span>{d.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${d.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.1 * i }}
                          className={`h-full rounded-full bg-${d.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </AnimatedSection>

          {/* Example grading result */}
          <AnimatedSection className="mt-10">
            <GlassCard className="p-6">
              <div className="text-lg xl:text-xl font-semibold text-white mb-2">
                Example grading result
              </div>
              <div className="text-sm xl:text-base text-white/60 mb-3">
                Wireless Headphones — minor cosmetic wear, fully functional
              </div>
              <TrustScoreBadge score={94} />
            </GlassCard>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default AIGradingPage;