import { motion } from "framer-motion";

/**
 * GlassCard
 * Premium glassmorphism card: backdrop blur, translucent bg, soft border,
 * layered shadow, optional hover lift + glow.
 *
 * Props:
 *  - hover (bool): enable hover lift/glow (default true)
 *  - glowColor (string): tailwind color class fragment for hover glow, e.g. "orange-500"
 *  - as (motion component override): defaults to motion.div
 *  - delay (number): animation delay for entrance
 */
const GlassCard = ({
  children,
  className = "",
  hover = true,
  glowColor = "orange-400",
  delay = 0,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={
        hover
          ? {
              y: -6,
              boxShadow: `0 20px 60px -10px rgba(255,153,0,0.25)`,
            }
          : undefined
      }
      className={`relative rounded-2xl border border-white/10 bg-slate-900/60
        backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]
        transition-colors duration-300 text-white
        ${hover ? `hover:border-${glowColor}/40` : ""}
        ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;