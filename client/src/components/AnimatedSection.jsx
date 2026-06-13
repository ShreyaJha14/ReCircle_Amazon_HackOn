import { motion } from "framer-motion";

/**
 * AnimatedSection
 * Generic scroll-reveal wrapper for page sections.
 *
 * Props:
 *  - direction: "up" | "down" | "left" | "right" (default "up")
 *  - delay: animation delay in seconds
 */
const AnimatedSection = ({
  children,
  className = "",
  direction = "up",
  delay = 0,
  ...props
}) => {
  const offsets = {
    up: { y: 32, x: 0 },
    down: { y: -32, x: 0 },
    left: { y: 0, x: 32 },
    right: { y: 0, x: -32 },
  };
  const { x, y } = offsets[direction] || offsets.up;

  return (
    <motion.section
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
};

export default AnimatedSection;
