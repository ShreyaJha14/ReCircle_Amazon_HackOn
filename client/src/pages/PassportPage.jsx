import { motion } from "framer-motion";
import {
  PageHeader,
  FeatureCard,
  AnimatedSection,
  GlassCard,
  GradientBorderCard,
  FloatingBackground,
  PageHero,
} from "../components";

const journeySteps = [
  { icon: "🏭", label: "Manufacturing" },
  { icon: "🏬", label: "Warehouse" },
  { icon: "🛒", label: "Customer" },
  { icon: "↩️", label: "Return" },
  { icon: "♻️", label: "ReCircle" },
  { icon: "🏷️", label: "Resale" },
];

const badges = [
  { icon: "🔗", label: "Blockchain Verified" },
  { icon: "🌱", label: "Carbon Tracked" },
  { icon: "🛡️", label: "AI Inspected" },
];

const PassportPage = () => {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">
          <PageHero
            eyebrow="Digital Identity · Blockchain-inspired"
            title="Product Passport"
            subtitle="A digital record that travels with each ReCircle product, giving buyers full transparency from manufacturing to resale."
            visual={
              <GradientBorderCard>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-3xl flex-shrink-0">
                      🎧
                    </div>
                    <div>
                      <div className="text-white font-semibold text-base xl:text-lg">Wireless Headphones</div>
                      <div className="text-xs xl:text-sm text-white/50">ID: RC-882194-AX</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="w-20 h-20 rounded-lg bg-white p-1.5 flex-shrink-0">
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, #0f172a 0 4px, transparent 4px 8px), repeating-linear-gradient(-45deg, #0f172a 0 4px, transparent 4px 8px)",
                          backgroundColor: "white",
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs xl:text-sm text-white/50 mb-1">Sustainability Score</div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "87%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                          className="h-full rounded-full bg-emerald-400"
                        />
                      </div>
                      <div className="text-emerald-400 text-sm font-semibold mt-1">87 / 100</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    {badges.map((b) => (
                      <span
                        key={b.label}
                        className="text-xs xl:text-sm bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-white/70"
                      >
                        {b.icon} {b.label}
                      </span>
                    ))}
                  </div>
                </div>
              </GradientBorderCard>
            }
          />

          {/* Feature grid */}
          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <FeatureCard
              icon="🌍"
              title="Origin"
              description="See where a product was manufactured and how far it has travelled."
              delay={0}
            />
            <FeatureCard
              icon="🧵"
              title="Materials"
              description="View a breakdown of the materials used, including recycled content."
              delay={0.05}
            />
            <FeatureCard
              icon="🔧"
              title="Repair history"
              description="Check whether an item has been repaired or refurbished, and what was done."
              delay={0.1}
            />
            <FeatureCard
              icon="♻️"
              title="Recyclability"
              description="Find out how the product (or its packaging) can be recycled at end of life."
              delay={0.15}
            />
          </AnimatedSection>

          {/* Product Journey Timeline */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Product Journey</h2>
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2">
              <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent -z-0" />
              {journeySteps.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="relative z-10 flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:border-emerald-400/40 transition-colors duration-300 min-w-[120px]"
                >
                  <span className="text-2xl xl:text-3xl">{step.icon}</span>
                  <span className="text-xs xl:text-sm font-semibold text-white text-center">
                    {step.label}
                  </span>
                  {i < journeySteps.length - 1 && (
                    <span className="sm:hidden text-emerald-400 text-lg">↓</span>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* Trust & Verification */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Trust &amp; Verification</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: "🔗", title: "Blockchain Ledger", desc: "Every ownership and condition change is recorded on an immutable ledger." },
                { icon: "🤖", title: "AI Verified", desc: "Condition and authenticity confirmed by ReCircle's AI grading system." },
                { icon: "🌱", title: "Carbon Certified", desc: "Verified carbon savings recorded at each stage of the product lifecycle." },
              ].map((item, i) => (
                <GlassCard key={item.title} className="p-6" delay={i * 0.1} glowColor="emerald-400">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-base xl:text-lg font-semibold text-white">{item.title}</span>
                  </div>
                  <div className="text-sm xl:text-base text-white/60">{item.desc}</div>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs xl:text-sm text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified
                  </div>
                </GlassCard>
              ))}
            </div>
          </AnimatedSection>

          {/* Footer note */}
          <AnimatedSection className="mt-10">
            <GlassCard className="p-6 text-sm xl:text-base text-white/60">
              Look for the &quot;View Product Passport (ReCircle)&quot; link on eligible
              product pages to see this information for a specific item.
            </GlassCard>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default PassportPage;