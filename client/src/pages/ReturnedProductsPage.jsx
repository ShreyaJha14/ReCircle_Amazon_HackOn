import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ClockIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  PageHero,
  AnimatedSection,
  GlassCard,
  GlowButton,
  StatCard,
  GradeBadge,
  TrustScoreBadge,
  ProductBadge,
  FloatingBackground,
} from "../components";
import { GB_CURRENCY } from "../utils/constants";

const todaysReturns = [
  {
    id: 0,
    title: "Wireless Noise-Cancelling Headphones",
    image: "../images/product_0_small.jpg",
    category: "Electronics",
    grade: "A",
    trust: 96,
    price: 39.99,
    oldPrice: 89.99,
    reason: "Changed mind",
    returnedAt: "08:42",
    route: "AI Verified → ReCircle Zone",
  },
  {
    id: 1,
    title: "Running Shoes — Size 9",
    image: "../images/product_1_small.jpg",
    category: "Shoes",
    grade: "A",
    trust: 93,
    price: 24.99,
    oldPrice: 64.99,
    reason: "Wrong size",
    returnedAt: "09:15",
    route: "AI Verified → Resale",
  },
  {
    id: 2,
    title: "Smart Home Hub",
    image: "../images/product_2_small.jpg",
    category: "Electronics",
    grade: "B",
    trust: 88,
    price: 29.99,
    oldPrice: 59.99,
    reason: "Found a better deal",
    returnedAt: "09:47",
    route: "Refurbished → Resale",
  },
  {
    id: 3,
    title: "Stainless Steel Cookware Set",
    image: "../images/product_3_small.jpg",
    category: "Home & Kitchen",
    grade: "A",
    trust: 97,
    price: 49.99,
    oldPrice: 109.99,
    reason: "Unwanted gift",
    returnedAt: "10:03",
    route: "AI Verified → ReCircle Zone",
  },
  {
    id: 4,
    title: "Baby Monitor with Night Vision",
    image: "../images/product_4_small.jpg",
    category: "Baby Products",
    grade: "B",
    trust: 90,
    price: 19.99,
    oldPrice: 44.99,
    reason: "Item defective",
    returnedAt: "10:21",
    route: "Repair → Resale",
  },
  {
    id: 5,
    title: "Men's Bomber Jacket",
    image: "../images/product_5_small.jpg",
    category: "Clothing",
    grade: "C",
    trust: 78,
    price: 12.99,
    oldPrice: 39.99,
    reason: "Didn't match description",
    returnedAt: "10:58",
    route: "Donation → ReCircle Zone",
  },
  {
    id: 6,
    title: "Bluetooth Portable Speaker",
    image: "../images/product_6_small.jpg",
    category: "Electronics",
    grade: "A",
    trust: 95,
    price: 22.99,
    oldPrice: 49.99,
    reason: "Changed mind",
    returnedAt: "11:30",
    route: "AI Verified → Resale",
  },
  {
    id: 7,
    title: "Yoga Mat & Resistance Band Set",
    image: "../images/product_7_small.jpg",
    category: "Sports",
    grade: "A",
    trust: 94,
    price: 14.99,
    oldPrice: 34.99,
    reason: "No longer needed",
    returnedAt: "11:52",
    route: "AI Verified → ReCircle Zone",
  },
];

const ReturnedProductsPage = () => {
  const totalToday = todaysReturns.length;
  const avgDiscount = Math.round(
    (todaysReturns.reduce(
      (acc, p) => acc + (1 - p.price / p.oldPrice) * 100,
      0
    ) /
      totalToday)
  );

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">
          <PageHero
            eyebrow="Live · Updated Today"
            title="Today's Returned Products"
            subtitle="Every item returned to Amazon today, instantly graded by AI and routed back into the ReCircle Zone — resold, repaired, recycled, or donated."
            actions={
              <Link to="/recircle">
                <GlowButton variant="secondary">
                  <ArrowPathIcon className="h-4 w-4" />
                  Back to ReCircle
                </GlowButton>
              </Link>
            }
            visual={
              <div className="relative h-[220px] rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden flex flex-col items-center justify-center gap-3">
                <ClockIcon className="h-12 w-12 text-emerald-400" />
                <div className="text-3xl font-bold text-white">
                  {totalToday} items
                </div>
                <div className="text-sm text-white/60">
                  returned and re-graded so far today
                </div>
              </div>
            }
          />

          {/* Quick stats */}
          <AnimatedSection className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatCard value={totalToday} label="Returned Today" icon="📦" accent="orange-400" delay={0} />
            <StatCard value={avgDiscount} suffix="%" label="Avg. Discount" icon="🏷️" accent="emerald-400" delay={0.05} />
            <StatCard value={92} suffix="%" label="Re-circulation Rate" icon="♻️" accent="teal-400" delay={0.1} />
            <StatCard value={1.4} suffix="s" decimals={1} label="Avg. Grading Time" icon="🤖" accent="orange-400" delay={0.15} />
          </AnimatedSection>

          {/* Product grid */}
          <AnimatedSection>
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">
              Just In — Live Feed
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {todaysReturns.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
              >
                <GlassCard className="p-4 h-full flex flex-col" delay={0}>
                  <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 mb-3 h-[140px] flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute top-2 left-2">
                      <GradeBadge grade={product.grade} />
                    </div>
                    <div className="absolute top-2 right-2 text-[10px] xl:text-xs bg-black/50 text-white/80 px-2 py-1 rounded-full flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {product.returnedAt}
                    </div>
                  </div>

                  <div className="text-xs xl:text-sm text-white/50 mb-1">
                    {product.category}
                  </div>
                  <div className="text-sm xl:text-base font-semibold text-white mb-2 flex-grow">
                    {product.title}
                  </div>

                  <TrustScoreBadge score={product.trust} />

                  <div className="mt-2 mb-2">
                    <ProductBadge badge="ai-verified" />
                  </div>

                  <div className="text-xs xl:text-sm text-white/50 mb-1">
                    Return reason: <span className="text-white/70">{product.reason}</span>
                  </div>
                  <div className="text-xs xl:text-sm text-emerald-400 mb-3">
                    {product.route}
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <div className="text-lg xl:text-xl font-bold text-[#FF9900]">
                        {GB_CURRENCY.format(product.price)}
                      </div>
                      <div className="text-xs xl:text-sm text-white/40 line-through">
                        {GB_CURRENCY.format(product.oldPrice)}
                      </div>
                    </div>
                    <Link to={`/product/${product.id}`}>
                      <GlowButton variant="secondary" className="!px-3 !py-2 !text-xs">
                        View
                      </GlowButton>
                    </Link>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnedProductsPage;
