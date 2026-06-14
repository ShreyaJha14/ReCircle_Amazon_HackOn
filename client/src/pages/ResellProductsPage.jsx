import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PageHero,
  AnimatedSection,
  GlassCard,
  GlowButton,
  GradeBadge,
  FloatingBackground,
} from "../components";
import { GB_CURRENCY } from "../utils/constants";

const listings = [
  {
    id: 1,
    title: "Nike Air Max 270",
    image: "data:image/jpeg;base64,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",
    grade: "A",
    price: 6999,
    oldPrice: 15000,
    distanceKm: 2.1,
    discount: 78,
  },
  {
    id: 2,
    title: "Philips Baby Monitor",
    image: "data:image/jpeg;base64,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",
    grade: "B",
    price: 999,
    oldPrice: 3499,
    distanceKm: 1.4,
    discount: 74,
  },
  {
    id: 3,
    title: "Prestige Induction Cooktop",
    image: "data:image/jpeg;base64,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",
    grade: "A",
    price: 1599,
    oldPrice: 4200,
    distanceKm: 3.0,
    discount: 62,
  },
];

const ResellProductsPage = () => {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">
          <PageHero
            eyebrow="ReCircle · Pre-owned"
            title="Browse AI-verified Pre-owned Products"
            subtitle="Shop responsibly — each item is AI-graded and comes with a Product Health Card™. Find great deals near you."
            actions={
              <Link to="/recircle">
                <GlowButton variant="secondary">Back to ReCircle</GlowButton>
              </Link>
            }
            visual={null}
          />

          <AnimatedSection className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <GlassCard className="p-4 h-full flex flex-col">
                    <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 mb-3 h-[220px] flex items-center justify-center">
                      <img src={item.image} alt={item.title} className="h-full w-full object-contain" />
                      <div className="absolute top-2 left-2">
                        <GradeBadge grade={item.grade} />
                      </div>
                    </div>

                    <div className="text-sm xl:text-base font-semibold text-white mb-2">
                      {item.title}
                    </div>

                    <div className="text-xs xl:text-sm text-gray-300 mb-3">
                      {item.distanceKm} km away • {item.discount}% off
                    </div>

                    <div className="flex items-end justify-between mt-auto">
                      <div>
                        <div className="text-lg xl:text-xl font-bold text-[#FF9900]">
                          {GB_CURRENCY.format(item.price)}
                        </div>
                        <div className="text-xs xl:text-sm text-white/40 line-through">
                          {GB_CURRENCY.format(item.oldPrice)}
                        </div>
                      </div>
                      <Link to={`/product/${item.id}`}>
                        <GlowButton variant="primary">View Product</GlowButton>
                      </Link>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default ResellProductsPage;
