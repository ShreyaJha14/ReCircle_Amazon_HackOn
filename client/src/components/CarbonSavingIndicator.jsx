import { motion } from "framer-motion";

const CarbonSavingIndicator = ({ kg = 2.3 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-xs xl:text-sm bg-emerald-500/10 text-emerald-300 border border-emerald-400/30
        px-3 py-1.5 rounded-full font-semibold inline-flex items-center gap-1.5 mr-1 mt-1
        shadow-[0_0_16px_rgba(16,185,129,0.25)]"
    >
      🌱 {kg}kg CO₂ saved with ReCircle
    </motion.span>
  );
};

export default CarbonSavingIndicator;