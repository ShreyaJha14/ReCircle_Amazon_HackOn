import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import GlassCard from "./GlassCard";

/**
 * StatCard
 * KPI card with animated counting number + label.
 *
 * Props:
 *  - value (number): final numeric value to count up to
 *  - prefix / suffix (string): e.g. prefix="$" suffix="%" or suffix="K"
 *  - decimals (number): decimal places (default 0)
 *  - label (string): description under the number
 *  - icon (string/node): optional icon
 *  - accent (string): tailwind color fragment e.g. "emerald-400"
 */
const StatCard = ({
  value = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
  label,
  icon,
  accent = "orange-400",
  delay = 0,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, delay]);

  return (
    <GlassCard delay={delay} className="p-6 flex flex-col gap-2" glowColor={accent}>
      {icon && (
        <div
          className={`text-2xl xl:text-3xl mb-1 text-${accent} drop-shadow-[0_0_12px_currentColor]`}
        >
          {icon}
        </div>
      )}
      <div ref={ref} className={`text-3xl xl:text-4xl font-bold text-${accent}`}>
        {prefix}
        {display.toFixed(decimals)}
        {suffix}
      </div>
      <div className="text-sm xl:text-base text-white/60">{label}</div>
    </GlassCard>
  );
};

export default StatCard;