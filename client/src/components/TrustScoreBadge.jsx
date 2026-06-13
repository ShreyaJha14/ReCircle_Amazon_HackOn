import { motion } from "framer-motion";

const TrustScoreBadge = ({ score = 90 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-xs xl:text-sm bg-blue-500/10 text-blue-300 border border-blue-400/30
        px-3 py-1.5 rounded-full font-semibold inline-flex items-center gap-1.5 mr-1 mt-1
        shadow-[0_0_16px_rgba(59,130,246,0.25)]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
      Trust Score: {score}/100
    </motion.span>
  );
};

export default TrustScoreBadge;