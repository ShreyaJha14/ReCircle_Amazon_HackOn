import { useState } from "react";
import { motion } from "framer-motion";
import {
  ReCircleHeroBanner,
  FeatureCard,
  PageHeader,
  ReCircleZoneModal,
  SellReturnModal,
  BuyPreOwnedModal,
  AIInspectionModal,
  AnimatedSection,
  GlassCard,
  GradientBorderCard,
  GlowButton,
  StatCard,
  FloatingBackground,
} from "../components";

const processSteps = [
  { icon: "📦", label: "Customer Return" },
  { icon: "🤖", label: "AI Grading" },
  { icon: "🧭", label: "Smart Routing" },
  { icon: "♻️", label: "ReCircle Zone" },
  { icon: "🛍️", label: "New Customer" },
];

const ReCirclePage = () => {
  // modal state machine: null | "zone" | "sell" | "buy" | "inspection"
  const [activeModal, setActiveModal] = useState(null);
  const [inspectionItem, setInspectionItem] = useState(null);

  const closeAll = () => setActiveModal(null);

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      <div className="min-w-[1000px] max-w-[1500px] m-auto">
        <ReCircleHeroBanner onOpenZone={() => setActiveModal("zone")} />

        <div className="relative p-6">
          <FloatingBackground />

          <div className="relative z-10">
            <AnimatedSection>
              <PageHeader
                title="What is ReCircle?"
                subtitle="Amazon's new circular commerce initiative: smarter returns, AI-verified quality, transparent product histories, and a measurable reduction in waste."
              />
            </AnimatedSection>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-1">
              <FeatureCard
                icon="🤖"
                title="AI Grading"
                description="Returned and pre-owned items are automatically graded for condition using AI image analysis."
                link="/ai-grading"
                delay={0}
              />
              <FeatureCard
                icon="📦"
                title="Smart Routing"
                description="Returns are routed to resale, repair, recycling, or donation — whichever creates the least waste."
                link="/routing"
                delay={0.05}
              />
              <FeatureCard
                icon="🪪"
                title="Product Passport"
                description="Every ReCircle product carries a digital passport with origin, materials, and repair history."
                link="/passport"
                delay={0.1}
              />
              <FeatureCard
                icon="🛡️"
                title="Return Prevention"
                description="Better descriptions, sizing tools, and AI recommendations reduce unnecessary returns before they happen."
                link="/prevention"
                delay={0.15}
              />
            </div>

            {/* Process flow */}
            <AnimatedSection className="mt-10">
              <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">
                The ReCircle Journey
              </h2>
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2">
                {/* connecting line */}
                <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF9900]/40 to-transparent -z-0" />
                {processSteps.map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="relative z-10 flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:border-[#FF9900]/40 transition-colors duration-300 min-w-[140px]"
                  >
                    <span className="text-2xl xl:text-3xl">{step.icon}</span>
                    <span className="text-xs xl:text-sm font-semibold text-white text-center">
                      {step.label}
                    </span>
                    {i < processSteps.length - 1 && (
                      <span className="sm:hidden text-[#FF9900] text-lg">↓</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>

            {/* Impact KPIs */}
            <AnimatedSection className="mt-10">
              <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">
                Our Impact
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard value={1280000} suffix="" decimals={0} label="Returns Processed" icon="📦" accent="orange-400" delay={0} />
                <StatCard value={1.2} suffix="M kg" decimals={1} label="Carbon Saved" icon="🌍" accent="emerald-400" delay={0.1} />
                <StatCard value={92} suffix="%" decimals={0} label="Waste Reduced" icon="♻️" accent="teal-400" delay={0.2} />
                <StatCard value={480} suffix="K" decimals={0} label="Products Reused" icon="🔁" accent="orange-400" delay={0.3} />
              </div>
            </AnimatedSection>

            {/* Sustainability + CTA */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard
                icon="🌍"
                title="Sustainability Impact"
                description="See how ReCircle reduces carbon emissions and landfill waste across the Amazon marketplace."
                link="/sustainability"
                linkText="View our impact"
              />
              <GradientBorderCard className="m-3">
                <div className="flex flex-col items-center justify-center text-center p-6 h-full">
                  <div className="text-lg xl:text-xl font-semibold text-white mb-2">
                    Ready to get started?
                  </div>
                  <div className="text-sm xl:text-base text-white/60 mb-4">
                    Sell an item, claim a return, or shop AI-verified pre-owned
                    products — all in one place.
                  </div>
                  <GlowButton variant="primary" onClick={() => setActiveModal("zone")}>
                    Open ReCircle Zone
                  </GlowButton>
                </div>
              </GradientBorderCard>
            </div>
          </div>
        </div>
      </div>

      {/* Modal flow */}
      {activeModal === "zone" && (
        <ReCircleZoneModal
          onClose={closeAll}
          onSelectSell={() => setActiveModal("sell")}
          onSelectBuy={() => setActiveModal("buy")}
        />
      )}
      {activeModal === "sell" && (
        <SellReturnModal
          onClose={closeAll}
          onStartInspection={(item) => {
            setInspectionItem(item);
            setActiveModal("inspection");
          }}
        />
      )}
      {activeModal === "buy" && <BuyPreOwnedModal onClose={closeAll} />}
      {activeModal === "inspection" && (
        <AIInspectionModal onClose={closeAll} item={inspectionItem} />
      )}
    </div>
  );
};

export default ReCirclePage;