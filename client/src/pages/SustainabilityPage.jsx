import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  PageHero,
  FeatureCard,
  AnimatedSection,
  GlassCard,
  StatCard,
  FloatingBackground,
} from "../components";

const STATS = [
  { value: 1.2, decimals: 1, suffix: "M kg", label: "CO₂ saved this year", icon: "🌍", accent: "emerald-400" },
  { value: 480, decimals: 0, suffix: "K", label: "Items diverted from landfill", icon: "♻️", accent: "teal-400" },
  { value: 92, decimals: 0, suffix: "%", label: "Returns successfully re-routed", icon: "📦", accent: "orange-400" },
  { value: 840, decimals: 0, prefix: "₹", suffix: " Cr", label: "Value recovered for customers", icon: "💰", accent: "yellow-400" },
];

const STORIES = [
  {
    img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=60",
    name: "Priya",
    headline: "Saved 15 kg CO₂",
    body: "By reselling her old laptop through ReCircle instead of discarding it.",
    tag: "Electronics",
    tagColor: "emerald",
  },
  {
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60",
    name: "Rahul",
    headline: "Diverted 5 items from landfill",
    body: "Donated a baby monitor and 4 outgrown appliances, earning 600 Green Credits.",
    tag: "Donations",
    tagColor: "teal",
  },
  {
    img: "https://images.unsplash.com/photo-1558694924-78bf8ba63670?w=600&auto=format&fit=crop&q=60",
    name: "Anita",
    headline: "Earned ₹12,000 from returns",
    body: "Sold 3 returned smartphones via P2P Resell in under 48 hours each.",
    tag: "P2P Resell",
    tagColor: "orange",
  },
];

const ARTICLES = [
  {
    img: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=60",
    title: "How Refurbished Electronics Reduce Waste",
    body: "Learn how extending product lifecycles helps reduce e-waste and lowers environmental impact.",
  },
  {
    img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=60",
    title: "Understanding the Circular Economy",
    body: "Discover how products can be reused, repaired, refurbished, and recycled instead of discarded.",
  },
  {
    img: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&auto=format&fit=crop&q=60",
    title: "Amazon's Journey to Net-Zero Carbon",
    body: "Explore Amazon's sustainability goals and how ReCircle contributes to reducing emissions.",
  },
];

const MONTHLY_CO2 = [40, 55, 48, 62, 70, 65, 78, 85, 80, 92, 88, 96];
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const tagColorMap = {
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  teal: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  orange: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

const SustainabilityPage = () => {
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);
  const user = auth?.user;
  const credits = user?.greenCredits ?? 0;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">

          {/* ── HERO ── */}
          <PageHero
            eyebrow="Amazon ReCircle · Sustainability Hub"
            title={
              <>
                Give Products{" "}
                <span className="text-emerald-400">A Second Life</span>
              </>
            }
            subtitle="Every refurbished, reused, and recycled product contributes to a greener future. See the impact we're building together."
            actions={
              <>
                <button
                  onClick={() => navigate("/my-impact")}
                  className="bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
                >
                  View My Impact →
                </button>
                <button
                  onClick={() => navigate("/recircle")}
                  className="border border-white/20 hover:border-emerald-400/50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors bg-white/5 hover:bg-white/10"
                >
                  Explore ReCircle
                </button>
              </>
            }
            visual={
              <GlassCard className="p-6 flex flex-col gap-4 justify-center" hover={false}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">Global CO₂ Saved</span>
                  <span className="text-xs text-emerald-400 font-semibold">↑ 140% YoY</span>
                </div>
                {/* Mini bar chart preview */}
                <div className="flex items-end gap-1.5 h-20">
                  {MONTHLY_CO2.map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${v}%` }}
                      transition={{ duration: 0.6, delay: 0.05 * i, ease: "easeOut" }}
                      className="flex-1 rounded-t bg-gradient-to-t from-emerald-700 to-emerald-400 min-h-[4px]"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {[
                    { label: "Items Diverted", val: "480K" },
                    { label: "Re-route Rate", val: "92%" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                      <div className="text-xl font-bold text-[#FF9900]">{m.val}</div>
                      <div className="text-xs text-white/50 mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            }
          />

          {/* ── STAT CARDS ── */}
          <AnimatedSection className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {STATS.map((s, i) => (
              <StatCard
                key={s.label}
                value={s.value}
                decimals={s.decimals}
                prefix={s.prefix || ""}
                suffix={s.suffix}
                label={s.label}
                icon={s.icon}
                accent={s.accent}
                delay={i * 0.08}
              />
            ))}
          </AnimatedSection>

          {/* ── PERSONAL IMPACT CTA ── */}
          <AnimatedSection className="mb-10">
            <GlassCard className="p-6 flex items-center justify-between gap-8" hover={false}>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl flex-shrink-0">
                  🌱
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">
                    Track Your Personal Sustainability Journey
                  </h2>
                  <p className="text-sm text-white/60">
                    See how your choices contribute to a greener future. View your CO₂ savings, green credits, and milestone achievements.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                {user && (
                  <div
                    onClick={() => navigate("/my-impact")}
                    className="cursor-pointer rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-center hover:border-emerald-400/60 hover:bg-emerald-500/20 transition-all"
                  >
                    <div className="text-2xl font-black text-emerald-400">{credits}</div>
                    <div className="text-xs text-emerald-300 font-bold">Green Credits</div>
                    <div className="text-[10px] text-white/40 mt-0.5">≈ ₹{Math.floor(credits * 0.1)} off</div>
                  </div>
                )}
                <button
                  onClick={() => navigate("/my-impact")}
                  className="bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold px-7 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  View My Impact →
                </button>
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* ── WHAT WE DO FEATURES ── */}
          <AnimatedSection className="mb-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">How We Make It Happen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              <FeatureCard
                icon="♻️"
                title="Circular Routing"
                description="Returned items are automatically assessed and routed to the best second-life outcome — resale, refurbishment, donation, or responsible recycling."
                delay={0}
              />
              <FeatureCard
                icon="🤖"
                title="AI-Verified Quality"
                description="Every product is graded by AI so buyers know exactly what they're getting and waste from uncertainty is eliminated."
                delay={0.05}
              />
              <FeatureCard
                icon="🌱"
                title="Green Credits"
                description="Earn rewards every time you choose a sustainable action — resell, donate, or recycle — turning green choices into real savings."
                delay={0.1}
              />
            </div>
          </AnimatedSection>

          {/* ── CARBON SAVINGS CHART ── */}
          <AnimatedSection className="mb-10">
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Carbon Saved — Monthly Trend</h2>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                  ↑ 140% YoY
                </span>
              </div>
              <div className="flex items-end gap-2" style={{ height: "160px" }}>
                {MONTHLY_CO2.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                    <motion.div
                      className="w-full rounded-t bg-gradient-to-t from-emerald-700 to-emerald-400"
                      initial={{ height: "2%" }}
                      whileInView={{ height: `${v}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.07,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{ minHeight: "4px" }}
                    />
                    <span className="text-[9px] text-white/40">{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/30 mt-3">Jan – Dec · Platform-wide CO₂ reduction in tonnes</p>
            </GlassCard>
          </AnimatedSection>

          {/* ── CUSTOMER STORIES ── */}
          <AnimatedSection className="mb-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Customer Impact Stories</h2>
            <div className="grid grid-cols-3 gap-4">
              {STORIES.map((story, i) => (
                <motion.div
                  key={story.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6, boxShadow: "0 20px 60px -10px rgba(255,153,0,0.2)" }}
                  className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden cursor-pointer hover:border-[#FF9900]/40 transition-colors duration-300 group"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={story.img}
                      alt={story.headline}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* dark overlay so it feels part of dark theme */}
                    <div className="absolute inset-0 bg-slate-950/30" />
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded border ${tagColorMap[story.tagColor]}`}>
                      {story.tag}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wide mb-1">{story.name}</p>
                    <h3 className="font-bold text-sm text-white mb-2">{story.headline}</h3>
                    <p className="text-xs text-white/60 leading-relaxed">{story.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* ── ARTICLES ── */}
          <AnimatedSection className="mb-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">Our Sustainability Journey</h2>
            <div className="grid grid-cols-3 gap-4">
              {ARTICLES.map((a, i) => (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden cursor-pointer hover:border-[#FF9900]/40 transition-colors duration-300 group"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={a.img}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-white mb-2 leading-snug">{a.title}</h3>
                    <p className="text-xs text-white/60 leading-relaxed mb-3">{a.body}</p>
                    <span className="text-[#FF9900] text-xs font-bold group-hover:underline">
                      Read More →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* ── BOTTOM BANNER ── */}
          <AnimatedSection>
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20">
              <img
                src="https://images.unsplash.com/photo-1558694924-78bf8ba63670?w=1200&auto=format&fit=crop&q=60"
                alt="Sustainability banner"
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-slate-950/90 to-slate-950/80" />
              <FloatingBackground variant="grid" />
              <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-8 py-14">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-4 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Together We Make an Impact
                </span>
                <h2 className="text-2xl xl:text-3xl font-bold mb-3">
                  Together We Can Build A Greener Amazon
                </h2>
                <p className="text-white/60 text-sm max-w-xl mb-6">
                  Every return has a second life. Every customer can make a difference.
                </p>
                <button
                  onClick={() => navigate("/my-impact")}
                  className="bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold px-8 py-3 rounded-lg text-sm transition-colors"
                >
                  See Your Impact →
                </button>
              </div>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </div>
  );
};

export default SustainabilityPage;