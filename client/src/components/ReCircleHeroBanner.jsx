import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlowButton from "./GlowButton";
import FloatingBackground from "./FloatingBackground";

const lifecycleNodes = [
  { label: "Return", icon: "📦", top: "8%", left: "8%" },
  { label: "AI Grade", icon: "🤖", top: "20%", left: "62%" },
  { label: "Route", icon: "🧭", top: "55%", left: "78%" },
  { label: "ReCircle Zone", icon: "♻️", top: "70%", left: "18%" },
  { label: "Resale", icon: "🛍️", top: "42%", left: "38%" },
];

const ReCircleHeroBanner = ({ onOpenZone }) => {
  return (
    <div className="relative min-h-[480px] overflow-hidden rounded-b-3xl border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <FloatingBackground variant="grid" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-6 sm:px-12 py-16 lg:py-20">
        {/* Left side */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs xl:text-sm font-semibold text-emerald-400 mb-4 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            A new Amazon circular commerce initiative
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-5xl xl:text-6xl font-bold mb-4 leading-tight"
          >
            Re<span className="text-[#FF9900]">Circle</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base xl:text-lg text-white/65 max-w-lg mb-8"
          >
            Smarter returns, AI-verified quality, transparent product
            histories, and a measurably more sustainable Amazon — every
            return becomes an opportunity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap gap-3"
          >
            <GlowButton variant="primary" onClick={onOpenZone}>
              Explore ReCircle Zone
            </GlowButton>
            <Link to={"/sustainability"}>
              <GlowButton variant="secondary">View Impact</GlowButton>
            </Link>
          </motion.div>
        </div>

        {/* Right side: animated circular economy illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative h-[340px] sm:h-[400px]"
        >
          {/* Central rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 m-auto w-[260px] h-[260px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-emerald-400/30"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 m-auto w-[340px] h-[340px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF9900]/20"
          />

          {/* Core icon */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full
              bg-gradient-to-br from-emerald-500/30 to-[#FF9900]/30 border border-white/20
              backdrop-blur-xl flex items-center justify-center text-5xl shadow-[0_0_60px_rgba(16,185,129,0.35)]"
          >
            ♻️
          </motion.div>

          {/* Floating ecosystem cards */}
          {lifecycleNodes.map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.3 + i * 0.1 },
                y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
              }}
              style={{ top: node.top, left: node.left }}
              className="absolute rounded-xl border border-white/15 bg-white/[0.07] backdrop-blur-xl
                shadow-[0_8px_24px_rgba(0,0,0,0.3)] px-3 py-2 flex items-center gap-2 text-xs xl:text-sm font-semibold"
            >
              <span className="text-base">{node.icon}</span>
              {node.label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ReCircleHeroBanner;