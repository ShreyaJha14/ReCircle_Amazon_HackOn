import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../redux/authSlice";
import { getMe, redeemGreenCredits } from "../utils/CallApi";
import { motion } from "framer-motion";
import {
  AnimatedSection,
  GlassCard,
  StatCard,
  FloatingBackground,
  PageHero,
  FeatureCard,
} from "../components";

const OUTCOME_BARS = [
  { label: "Resold (P2P)",   count: "3 items", pct: 60, accent: "emerald-500" },
  { label: "Amazon Renewed", count: "2 items", pct: 40, accent: "teal-500"    },
  { label: "Donated",        count: "1 item",  pct: 20, accent: "orange-400"  },
  { label: "Recycled",       count: "1 item",  pct: 20, accent: "slate-400"   },
];

const MILESTONES = [
  { icon: "🌱", label: "First Resell",   sub: "Earned!",      done: true  },
  { icon: "♻️", label: "Zero Waste Week", sub: "Earned!",      done: true  },
  { icon: "📦", label: "10 Items Saved",  sub: "3 more to go", done: false },
  { icon: "🏆", label: "50kg CO₂ Hero",   sub: "31.6kg to go", done: false },
];

/* ── Redeem Modal ── */
const RedeemModal = ({ credits, discountINR, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.5)] w-full max-w-md mx-4 overflow-hidden"
    >
      <div className="bg-gradient-to-br from-emerald-900/80 to-slate-900/80 border-b border-white/10 px-8 pt-8 pb-6 text-center text-white">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold mb-1">Credits Redeemed!</h2>
        <p className="text-emerald-300 text-sm">Congratulations on going green</p>
      </div>
      <div className="px-8 py-6 text-center">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-5">
          <p className="text-sm text-white/80 leading-relaxed">
            <strong className="text-white">{credits} Green Credits</strong> have been applied to your account.
            You will receive a <strong className="text-emerald-400">₹{discountINR} discount</strong> on your{" "}
            <strong className="text-white">next Amazon purchase</strong> — automatically deducted at checkout.
          </p>
        </div>
        <div className="flex items-center gap-3 justify-center mb-5 text-sm text-white/60">
          <span className="flex items-center gap-1"><span className="text-emerald-400 font-bold text-base">✓</span>Discount saved</span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1"><span className="text-emerald-400 font-bold text-base">✓</span>Valid 90 days</span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1"><span className="text-emerald-400 font-bold text-base">✓</span>Auto-applied</span>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold py-3 rounded-lg transition-colors text-sm"
        >
          Continue Shopping
        </button>
        <p className="text-xs text-white/30 mt-3">Credits applied · Check your account wallet for details</p>
      </div>
    </motion.div>
  </div>
);

/* ── Login Prompt ── */
const LoginPrompt = ({ onLogin }) => (
  <GlassCard className="p-10 text-center max-w-md mx-auto mt-16" hover={false}>
    <div className="text-5xl mb-4">🔒</div>
    <h2 className="text-xl font-bold text-white mb-2">Sign in to view your impact</h2>
    <p className="text-sm text-white/60 mb-6">
      Track your Green Credits, CO₂ savings, and sustainability milestones.
    </p>
    <button
      onClick={onLogin}
      className="bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold px-8 py-3 rounded-lg text-sm transition-colors"
    >
      Sign in / Create account
    </button>
  </GlassCard>
);

const MyImpactPage = ({ onShowAuth }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth     = useSelector((s) => s.auth);
  const user     = auth?.user;
  const token    = auth?.token;

  const [credits,     setCredits]     = useState(user?.greenCredits ?? 0);
  const [showRedeem,  setShowRedeem]  = useState(false);
  const [discountINR, setDiscountINR] = useState(0);
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    if (!token) return;
    getMe(token)
      .then((d) => {
        dispatch(updateUser(d.user));
        setCredits(d.user.greenCredits ?? 0);
      })
      .catch(() => {});
  }, [token]);

  const handleRedeem = async () => {
    if (!credits || loading) return;
    setLoading(true);
    try {
      const data = await redeemGreenCredits(user.id, credits, token);
      setDiscountINR(data.discountINR ?? Math.floor(credits * 0.1));
      setCredits(data.greenCredits ?? 0);
      dispatch(updateUser({ ...user, greenCredits: data.greenCredits ?? 0 }));
      setShowRedeem(true);
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to redeem credits");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { value: 18.4, decimals: 1, suffix: " kg",  label: "CO₂ prevented this year",     icon: "🌿", accent: "emerald-400" },
    { value: 7,    decimals: 0, suffix: "",      label: "Items diverted from landfill", icon: "♻️", accent: "teal-400"   },
    { value: 240,  decimals: 0, suffix: " L",    label: "Water saved",                  icon: "💧", accent: "blue-400"   },
    { value: 6400, decimals: 0, prefix: "₹",     label: "Earned from returns",          icon: "💰", accent: "orange-400" },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      {showRedeem && (
        <RedeemModal
          credits={credits === 0 ? (user?.greenCredits ?? 0) : credits}
          discountINR={discountINR}
          onClose={() => setShowRedeem(false)}
        />
      )}

      <div className="min-w-[1000px] max-w-[1500px] mx-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">

          {/* ── HERO ── */}
          <PageHero
            eyebrow="My ReCircle Dashboard"
            title="Your Sustainability Impact"
            subtitle="Every ReCircle action keeps products out of landfill and reduces your carbon footprint. Here's what you've achieved."
            actions={
              <Link
                to="/sustainability"
                className="border border-white/20 hover:border-emerald-400/50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors bg-white/5 hover:bg-white/10"
              >
                ← Back to Sustainability Hub
              </Link>
            }
            visual={
              user ? (
                <GlassCard className="p-6 flex flex-col items-center justify-center text-center gap-2" hover={false}>
                  <div className="text-4xl mb-1">🌱</div>
                  <div className="text-5xl font-black text-emerald-400">{credits}</div>
                  <div className="text-sm font-bold text-white">Green Credits</div>
                  <div className="text-xs text-white/40">≈ ₹{Math.floor(credits * 0.1)} discount</div>
                  <button
                    onClick={handleRedeem}
                    disabled={credits === 0 || loading}
                    className={`mt-3 w-full py-2.5 rounded-lg text-sm font-bold transition-colors ${
                      credits === 0
                        ? "bg-white/10 cursor-not-allowed text-white/30"
                        : "bg-[#FF9900] hover:bg-[#E47911] text-[#111]"
                    }`}
                  >
                    {loading ? "Processing…" : credits === 0 ? "Redeemed ✓" : `Redeem ₹${Math.floor(credits * 0.1)} Discount`}
                  </button>
                </GlassCard>
              ) : null
            }
          />

          {!user ? (
            <LoginPrompt onLogin={() => navigate("/")} />
          ) : (
            <>
              {/* ── STAT CARDS ── */}
              <AnimatedSection className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {statCards.map((s, i) => (
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

              {/* ── OUTCOME BARS + GREEN CREDITS ── */}
              <AnimatedSection className="grid grid-cols-3 gap-4 mb-10">
                {/* Outcome bars */}
                <GlassCard className="col-span-2 p-6" hover={false}>
                  <h2 className="text-base font-bold text-white mb-5 pb-2 border-b border-white/10">Items by Outcome</h2>
                  <div className="space-y-5">
                    {OUTCOME_BARS.map((bar, i) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/70">{bar.label}</span>
                          <span className="font-bold text-white">{bar.count}</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${bar.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                            className={`bg-${bar.accent} h-2 rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Green Credits card */}
                <GlassCard className="p-6 flex flex-col items-center justify-center text-center gap-2" glowColor="emerald-400">
                  <div className="text-4xl mb-1">🌱</div>
                  <div className="text-5xl font-black text-emerald-400">{credits}</div>
                  <p className="text-sm font-bold text-white">
                    {credits > 0 ? "Green Credits" : "Credits Redeemed"}
                  </p>
                  <p className="text-xs text-white/40">1 credit = ₹0.10 discount</p>
                  {credits > 0 && (
                    <p className="text-xs text-emerald-400 font-semibold">
                      ≈ ₹{Math.floor(credits * 0.1)} off next purchase
                    </p>
                  )}
                  {credits === 0 && (
                    <p className="text-xs text-white/30">Sell or buy resell items to earn credits</p>
                  )}
                  <button
                    onClick={handleRedeem}
                    disabled={credits === 0 || loading}
                    className={`mt-2 w-full py-3 rounded-lg text-sm font-bold transition-colors ${
                      credits === 0
                        ? "bg-white/10 cursor-not-allowed text-white/30"
                        : "bg-[#FF9900] hover:bg-[#E47911] text-[#111]"
                    }`}
                  >
                    {loading ? "Processing…" : credits === 0 ? "Redeemed ✓" : `Redeem ₹${Math.floor(credits * 0.1)} Discount`}
                  </button>
                  <p className="text-xs text-white/30 mt-1">Earn credits by reselling & buying pre-owned</p>
                </GlassCard>
              </AnimatedSection>

              {/* ── HOW TO EARN ── */}
              <AnimatedSection className="mb-10">
                <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">💡 How to Earn Green Credits</h2>
                <div className="grid grid-cols-3 gap-1">
                  <FeatureCard
                    icon="🛒"
                    title="Sell a pre-owned item"
                    description="List an item on ReCircle P2P Resell and earn 100 Green Credits when it sells."
                    linkText="+100 credits"
                    delay={0}
                  />
                  <FeatureCard
                    icon="📦"
                    title="Buy from ReCircle Resell"
                    description="Choose a pre-owned product over new and earn 50 Green Credits on every qualifying purchase."
                    linkText="+50 credits"
                    delay={0.05}
                  />
                  <FeatureCard
                    icon="♻️"
                    title="Return & donate an item"
                    description="Donate a returned item through ReCircle instead of discarding it and earn 75 Green Credits."
                    linkText="+75 credits"
                    delay={0.1}
                  />
                </div>
              </AnimatedSection>

              {/* ── MILESTONES ── */}
              <AnimatedSection className="mb-10">
                <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">🏅 Sustainability Milestones</h2>
                <div className="grid grid-cols-4 gap-4">
                  {MILESTONES.map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      whileHover={{ y: -4 }}
                      className={`relative rounded-2xl border p-5 text-center transition-colors duration-300 ${
                        m.done
                          ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/60"
                          : "bg-white/5 border-white/10 opacity-50 hover:opacity-70"
                      }`}
                    >
                      <div className="text-2xl mb-2">{m.icon}</div>
                      <h3 className="font-bold text-sm text-white mb-1">{m.label}</h3>
                      <p className={`text-xs ${m.done ? "text-emerald-400 font-semibold" : "text-white/40"}`}>
                        {m.sub}
                      </p>
                      {m.done && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>

              {/* ── BOTTOM BANNER ── */}
              <AnimatedSection>
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20">
                  <img
                    src="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200&auto=format&fit=crop&q=60"
                    alt="Go green"
                    className="absolute inset-0 w-full h-full object-cover opacity-15"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-slate-950/90 to-slate-950/80" />
                  <FloatingBackground variant="grid" />
                  <div className="relative z-10 grid grid-cols-2 items-center">
                    <div className="p-10 text-white">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-4 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Amazon ReCircle
                      </span>
                      <h2 className="text-3xl font-bold text-white mb-3">Go Green with Amazon</h2>
                      <p className="text-white/50 text-sm leading-relaxed mb-6">
                        Every product you resell, refurbish, donate, or recycle contributes to a cleaner and more sustainable future.
                      </p>
                      <button
                        onClick={handleRedeem}
                        disabled={credits === 0}
                        className="bg-[#FF9900] hover:bg-[#E47911] disabled:bg-white/10 disabled:cursor-not-allowed disabled:text-white/30 text-[#111] font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
                      >
                        {credits > 0 ? `Redeem My ${credits} Credits →` : "No credits to redeem"}
                      </button>
                    </div>
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center text-white">
                        <div className="text-8xl font-black text-emerald-400 leading-none">{credits}</div>
                        <div className="text-xl font-bold mt-2">Green Credits</div>
                        <div className="text-xs text-white/40 mt-1">
                          {credits > 0 ? `≈ ₹${Math.floor(credits * 0.1)} discount` : "Earn by recycling & reselling"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyImpactPage;