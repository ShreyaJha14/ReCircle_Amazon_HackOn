import { motion } from "framer-motion";
import FloatingBackground from "./FloatingBackground";

/**
 * PageHero
 * Premium page-top hero with glow background, eyebrow tag, title,
 * subtitle, and optional right-side visual content.
 *
 * Props:
 *  - eyebrow (string): small label above title
 *  - title (node)
 *  - subtitle (node)
 *  - actions (node): buttons row
 *  - visual (node): right-side illustration/graphic
 */
const PageHero = ({ eyebrow, title, subtitle, actions, visual }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-2xl mb-8 text-white">
      <FloatingBackground variant="grid" />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-6 sm:px-10 py-12 lg:py-16">
        <div>
          {eyebrow && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs xl:text-sm font-semibold text-emerald-400 mb-3 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {eyebrow}
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl sm:text-4xl xl:text-5xl font-bold text-white leading-tight mb-4"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-sm xl:text-base text-white/65 max-w-xl mb-6"
            >
              {subtitle}
            </motion.p>
          )}
          {actions && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-wrap gap-3"
            >
              {actions}
            </motion.div>
          )}
        </div>
        {visual && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            {visual}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PageHero;