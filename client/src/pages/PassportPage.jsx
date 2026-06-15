
import { useNavigate } from "react-router-dom";
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
import { useState, useEffect } from "react";

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
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [repairDone, setRepairDone] = useState("No");
  const [repairDetails, setRepairDetails] = useState("");
  const [suggestedHistory, setSuggestedHistory] = useState([]);

  useEffect(() => {
    const recs = [
      { event: "Purchased new", ownedAt: new Date().toISOString() },
      { event: "ReCircle inspection", ownedAt: new Date().toISOString() },
      { event: "Refurbished - battery replaced", ownedAt: new Date().toISOString() },
    ];
    setSuggestedHistory(recs);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const addHistoryEntry = (entry) => {
    // keep suggestions lean: remove added entry
    setSuggestedHistory((s) => s.filter((x) => x.event !== entry.event));
    // save draft to localStorage so create page can pick it up
    const draft = JSON.parse(localStorage.getItem("passportDraft") || "{}");
    const ownershipHistory = Array.isArray(draft.ownershipHistory) ? [...draft.ownershipHistory] : [];
    ownershipHistory.push({ event: entry.event, ownedAt: entry.ownedAt || new Date().toISOString() });
    localStorage.setItem("passportDraft", JSON.stringify({ ...draft, ownershipHistory }));
  };

  const applyLocalUpdates = () => {
    const draft = JSON.parse(localStorage.getItem("passportDraft") || "{}");
    const next = { ...draft };
    if (imagePreview) next.image = imagePreview;
    if (repairDone === "Yes") {
      next.repairHistory = next.repairHistory ? [...next.repairHistory, repairDetails || "Repair reported"] : [repairDetails || "Repair reported"];
    }
    localStorage.setItem("passportDraft", JSON.stringify(next));
    navigate("/passport/create");
  };

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <GlassCard className="p-6 flex-1 text-sm xl:text-base text-white/60">
                Create a passport for your returned item, then preview the generated ReCircle passport card.
              </GlassCard>
              <button
                onClick={() => navigate("/passport/create")}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition"
              >
                Create Passport for ReCircle
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassportPage;