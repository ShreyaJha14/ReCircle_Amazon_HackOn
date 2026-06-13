import { motion } from "framer-motion";

const PageHeader = ({ title, subtitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="text-2xl xl:text-3xl font-bold text-white">{title}</div>
      {subtitle && (
        <div className="text-sm xl:text-base text-white/60 mt-2 max-w-2xl">
          {subtitle}
        </div>
      )}
    </motion.div>
  );
};

export default PageHeader;