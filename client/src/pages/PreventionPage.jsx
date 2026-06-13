import { motion } from "framer-motion";
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

const recommendations = [
  {
    icon: "📏",
    title: "Sizing accuracy improved",
    detail: "Customers ordering this item now see a fit confidence score before purchase, reducing fit-related returns by 31%.",
    confidence: 92,
  },
  {
    icon: "🖼️",
    title: "Listing enriched",
    detail: "Added 4 lifestyle photos and a size comparison chart, improving pre-purchase clarity for shoppers.",
    confidence: 88,
  },
  {
    icon: "💬",
    title: "Q&A coverage expanded",
    detail: "AI-generated answers now cover 96% of common pre-purchase questions for this category.",
    confidence: 95,
  },
];

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
                    { label: "Quality", val: "94%" },
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
            <FeatureCard
              icon="📏"
              title="Smart sizing"
              description="AI-powered size recommendations based on past orders and reviews reduce fit-related returns."
              delay={0}
            />
            <FeatureCard
              icon="🖼️"
              title="Richer listings"
              description="Enhanced photos, videos, and detailed specs help customers know exactly what they're buying."
              delay={0.05}
            />
            <FeatureCard
              icon="💬"
              title="Pre-purchase Q&A"
              description="AI-assisted answers to common questions help avoid mismatched expectations."
              delay={0.1}
            />
          </AnimatedSection>

          {/* Prediction Dashboard */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Prediction Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard title="Size Accuracy" value={96} subtitle="Predicted vs. actual fit" accent="emerald-400" delay={0} />
              <MetricCard title="Customer Confidence" value={91} subtitle="Pre-purchase confidence score" accent="orange-400" delay={0.1} />
              <MetricCard title="Recommendation Quality" value={94} subtitle="Relevance of AI suggestions" accent="teal-400" delay={0.2} />
              <MetricCard title="Return Risk Score" value={18} subtitle="Lower is better" accent="blue-400" delay={0.3} />
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
              <StatCard value={31} suffix="%" label="Fewer fit-related returns" icon="📏" accent="emerald-400" delay={0} />
              <StatCard value={2.4} decimals={1} suffix="M" label="Avoidable returns prevented" icon="🛡️" accent="orange-400" delay={0.1} />
              <StatCard value={18} suffix="K t" label="Packaging waste avoided" icon="📦" accent="teal-400" delay={0.2} />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default PreventionPage;