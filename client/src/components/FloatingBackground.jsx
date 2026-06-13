import { motion } from "framer-motion";

/**
 * FloatingBackground
 * Ambient gradient glows + floating particles for premium page backdrops.
 * Render as the first child of a `relative` positioned container.
 */
const FloatingBackground = ({ variant = "default" }) => {
  const particles = Array.from({ length: 12 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
      {/* Ambient gradient glows */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-amazonclone-orange/20 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] bg-emerald-500/15 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 left-1/4 w-[360px] h-[360px] bg-teal-500/15 rounded-full blur-[120px]" />

      {variant === "grid" && (
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      )}

      {/* Floating particles */}
      {particles.map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/30"
          style={{
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            left: `${(i * 8.3) % 100}%`,
            top: `${(i * 13.7) % 100}%`,
          }}
          animate={{
            y: [0, -24, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: 6 + (i % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingBackground;
