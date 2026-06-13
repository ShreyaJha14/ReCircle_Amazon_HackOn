import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const FeatureCard = ({ title, description, icon, link, linkText, delay = 0 }) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -6, boxShadow: "0 20px 60px -10px rgba(255,153,0,0.25)" }}
      className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl
        shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-6 m-3 flex flex-col h-full text-white
        hover:border-[#FF9900]/40 transition-colors duration-300 group"
    >
      {icon && (
        <div className="text-3xl mb-3 w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-[#FF9900]/40 transition-colors duration-300">
          {icon}
        </div>
      )}
      <div className="text-lg xl:text-xl font-semibold text-white mb-2">{title}</div>
      <div className="text-sm xl:text-base text-white/60 flex-grow">{description}</div>
      {link && (
        <div className="text-xs xl:text-sm text-[#FF9900] mt-4 font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          {linkText || "Learn more"}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      )}
    </motion.div>
  );

  return link ? (
    <Link to={link} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
};

export default FeatureCard;