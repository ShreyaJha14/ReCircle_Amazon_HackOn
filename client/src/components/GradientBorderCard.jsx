import { motion } from "framer-motion";

/**
 * GradientBorderCard
 * Glass card with an animated gradient border ring (conic gradient mask).
 */
const GradientBorderCard = ({ children, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className={`relative rounded-2xl p-[1.5px] overflow-hidden group ${className}`}
    >
      <div
        className="absolute -inset-[50%] opacity-60 group-hover:opacity-100
          transition-opacity duration-500 bg-[conic-gradient(from_0deg,_#FF9900,_#10b981,_#14b8a6,_#FF9900)]
          animate-[spin_8s_linear_infinite]"
      />
      <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-xl h-full text-white">
        {children}
      </div>
    </motion.div>
  );
};

export default GradientBorderCard;