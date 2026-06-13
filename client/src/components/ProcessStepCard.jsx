import { motion } from "framer-motion";

const ProcessStepCard = ({ step, title, description, isLast = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (step - 1) * 0.08, ease: "easeOut" }}
      className="relative flex items-start gap-4 m-3"
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="relative h-12 w-12 rounded-full flex items-center justify-center font-bold text-[#0F172A]
            bg-[#FF9900] shadow-[0_0_24px_rgba(255,153,0,0.45)]"
        >
          {step}
          <span className="absolute inset-0 rounded-full border-2 border-[#FF9900]/40 animate-ping" />
        </motion.div>
        {!isLast && (
          <div className="w-px flex-1 min-h-[24px] bg-gradient-to-b from-[#FF9900]/50 to-transparent mt-2" />
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-5 flex-1 text-white hover:border-[#FF9900]/40 transition-colors duration-300">
        <div className="text-lg xl:text-xl font-semibold text-white mb-1">{title}</div>
        <div className="text-sm xl:text-base text-white/60">{description}</div>
      </div>
    </motion.div>
  );
};

export default ProcessStepCard;