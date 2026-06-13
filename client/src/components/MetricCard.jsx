import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";
import GlassCard from "./GlassCard";

/**
 * MetricCard
 * Dashboard metric card with an animated circular progress ring.
 *
 * Props:
 *  - title (string)
 *  - value (number 0-100): percentage value shown in ring
 *  - subtitle (string)
 *  - accent (string): tailwind color fragment e.g. "emerald-400"
 *  - icon (string/node)
 */
const MetricCard = ({
  title,
  value = 0,
  subtitle,
  accent = "orange-400",
  icon,
  delay = 0,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, delay]);

  const offset = circumference - (display / 100) * circumference;

  return (
    <GlassCard delay={delay} className="p-6 flex items-center gap-5" glowColor={accent}>
      <div ref={ref} className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
          />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`text-${accent} drop-shadow-[0_0_8px_currentColor] transition-[stroke-dashoffset] duration-150`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm xl:text-base font-bold text-white">
          {Math.round(display)}%
        </div>
      </div>
      <div>
        {icon && <div className="text-xl mb-1">{icon}</div>}
        <div className="text-base xl:text-lg font-semibold text-white">{title}</div>
        {subtitle && (
          <div className="text-xs xl:text-sm text-white/55 mt-0.5">{subtitle}</div>
        )}
      </div>
    </GlassCard>
  );
};

export default MetricCard;