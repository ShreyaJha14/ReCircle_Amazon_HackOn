import { motion } from "framer-motion";

/**
 * GlowButton
 * Premium CTA button with glow shadow on hover.
 *
 * Props:
 *  - variant: "primary" (orange filled) | "secondary" (glass outline)
 */
const GlowButton = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "relative px-6 py-3 rounded-xl font-semibold text-sm xl:text-base transition-all duration-300 inline-flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-amazonclone-orange text-amazonclone-navy shadow-[0_0_0_0_rgba(255,153,0,0.5)] hover:shadow-[0_0_30px_4px_rgba(255,153,0,0.45)]",
    secondary:
      "bg-white/5 text-white border border-white/20 backdrop-blur-md hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_24px_2px_rgba(255,255,255,0.15)]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default GlowButton;
