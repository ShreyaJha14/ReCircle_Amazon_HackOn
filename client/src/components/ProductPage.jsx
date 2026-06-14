import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { ProductDetails, ProductPassportPanel } from "./";
import { GB_CURRENCY } from "../utils/constants";
import { callAPI } from "../utils/CallApi";
import { addToCart } from "../redux/cartSlice";

// ── RECOMMENDED / SIMILAR PRODUCTS (fallback demo data) ──
const RECOMMENDED_PRODUCTS = [
  {
    id: "r1",
    title: "Nike Air Max 270 — Pre-owned, Grade A",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=60",
    price: 6999,
    oldPrice: 15000,
    rating: 4.3,
    ratings: 218,
  },
  {
    id: "r2",
    title: "Philips Baby Monitor — Renewed",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=60",
    price: 999,
    oldPrice: 3499,
    rating: 4.0,
    ratings: 64,
  },
  {
    id: "r3",
    title: "Prestige Induction Cooktop — Grade A",
    image: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&auto=format&fit=crop&q=60",
    price: 1599,
    oldPrice: 4200,
    rating: 4.5,
    ratings: 132,
  },
  {
    id: "r4",
    title: "iPhone 14 — Renewed, Grade A",
    image: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=400&auto=format&fit=crop&q=60",
    price: 45999,
    oldPrice: 69999,
    rating: 4.6,
    ratings: 980,
  },
  {
    id: "r5",
    title: "Samsung Galaxy S23 — Renewed, Grade B",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=60",
    price: 32999,
    oldPrice: 54999,
    rating: 4.2,
    ratings: 540,
  },
  {
    id: "r6",
    title: "Sony WH-1000XM4 — Renewed, Grade A",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&auto=format&fit=crop&q=60",
    price: 11999,
    oldPrice: 29999,
    rating: 4.7,
    ratings: 1240,
  },
];

// ── RECOMMENDED PRODUCTS CAROUSEL (Amazon-style) ──
const RecommendedCarousel = ({ title = "Customers also bought", items = RECOMMENDED_PRODUCTS }) => {
  return (
    <div className="rounded-[1.75rem] bg-white border border-slate-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {items.map((p) => {
          const discount = Math.round(100 - (p.price / p.oldPrice) * 100);
          return (
            <Link
              to={`/product/${p.id}`}
              key={p.id}
              className="group flex-shrink-0 w-[180px] rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 p-3 bg-white"
            >
              <div className="h-32 w-full rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center mb-3">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-xs font-medium text-slate-800 leading-snug line-clamp-2 mb-1 h-8">
                {p.title}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                <span className="font-semibold text-slate-800">{p.rating}</span>
                <span>★</span>
                <span className="text-slate-400">({p.ratings})</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-slate-900">{GB_CURRENCY.format(p.price)}</span>
                <span className="text-[11px] text-slate-400 line-through">{GB_CURRENCY.format(p.oldPrice)}</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 mt-1">{discount}% off</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ── PRODUCT PASSPORT MODAL ──
const ProductPassportModal = ({ product, onClose }) => {
  const passport = product.reCircle?.passport;

  // Fallback demo data if no passport data exists on the product
  const ownerHistory = passport?.ownerHistory || [
    { owner: "Original Owner", duration: "0 - 14 months", notes: "Purchased new, light personal use" },
    { owner: "ReCircle Verified", duration: "Current", notes: "Inspected, cleaned, and certified for resale" },
  ];

  const repairLog = passport?.repairLog || [
    { date: "—", item: "Full diagnostic check", result: "Passed all functional tests" },
    { date: "—", item: "Battery / component health", result: "Within acceptable performance range" },
    { date: "—", item: "Cosmetic inspection", result: "Minor wear consistent with Grade A condition" },
  ];

  const conditionGrade = passport?.conditionGrade || "Grade A — Excellent";
  const carbonSaved = passport?.carbonSaved || "12.4 kg CO₂e";
  const certifiedBy = passport?.certifiedBy || "ReCircle AI Quality Team";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[1.75rem] max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between rounded-t-[1.75rem]">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-emerald-700 font-semibold mb-1">
              Product Passport
            </div>
            <h2 className="text-xl font-bold text-slate-900">{product.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-lg transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-1">Condition</div>
              <div className="text-sm font-bold text-slate-900">{conditionGrade}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-1">CO₂ Saved</div>
              <div className="text-sm font-bold text-slate-900">{carbonSaved}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="text-xs uppercase tracking-wide text-emerald-700 font-semibold mb-1">Certified By</div>
              <div className="text-sm font-bold text-slate-900">{certifiedBy}</div>
            </div>
          </div>

          {/* Ownership history */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Ownership History</h3>
            <div className="space-y-3">
              {ownerHistory.map((o, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-700 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{o.owner}</div>
                    <div className="text-xs text-slate-500">{o.duration}</div>
                    <div className="text-sm text-slate-600 mt-1">{o.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Repair & inspection log */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Repair & Inspection Log</h3>
            <div className="space-y-3">
              {repairLog.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{r.item}</div>
                    <div className="text-sm text-slate-600 mt-1">{r.result}</div>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap">{r.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Extra details */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600 space-y-2">
            <div>
              <span className="font-semibold text-slate-800">Brand:</span> {product.brand}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Format:</span> {product.attribute}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Traceability:</span> Every step of this product's journey — from original purchase to resale — has been logged and AI-verified for full transparency.
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-white font-semibold hover:bg-emerald-700 transition"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [showPassport, setShowPassport] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    callAPI("data/products.json").then((productResults) => {
      setProduct(productResults[id]);
    });
  }, [id]);

  const addQuantityToProduct = () => {
    const updatedProduct = { ...product, quantity };
    setProduct(updatedProduct);
    return updatedProduct;
  };

  if (!product?.title) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-lg font-semibold text-slate-700">Loading product details...</div>
      </div>
    );
  }

  const discount = Math.round(100 - (product.price / product.oldPrice) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="min-w-[1000px] max-w-[1500px] mx-auto px-4 py-6">
        <nav className="text-sm text-slate-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/recircle" className="hover:underline">ReCircle</Link>
          <span className="mx-2">/</span>
          <Link to="/recircle/resale" className="hover:underline">Pre-owned</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.95fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white border border-slate-200 shadow-sm p-6">
              <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-6">
                <div className="rounded-[1.75rem] bg-slate-100 p-6 flex items-center justify-center">
                  <img src={product.image} alt={product.title} className="max-h-[560px] object-contain" />
                </div>
                <div className="flex flex-col justify-between gap-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-emerald-700 font-semibold mb-3">
                      Renewed & Green
                    </div>
                    <h1 className="text-3xl xl:text-4xl font-bold text-slate-900 mb-4">
                      {product.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-900">{product.avgRating || 4}</span>
                        <span>/ 5</span>
                      </div>
                      <div>{product.ratings || 0} ratings</div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 text-xs font-semibold uppercase tracking-[0.18em]">
                        AI Verified
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                      <div>
                        <div className="font-semibold text-slate-800">Brand</div>
                        <div>{product.brand}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Format</div>
                        <div>{product.attribute}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] bg-emerald-50 border border-emerald-100 p-5">
                    <div className="text-xs uppercase tracking-[0.20em] text-emerald-700 font-semibold mb-3">
                      ReCircle Highlights
                    </div>
                    <ul className="space-y-3 text-sm text-slate-700">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-700" />
                        AI-verified quality and condition checks.
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-700" />
                        Sustainable pre-owned product with trusted grading.
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-700" />
                        Delivered quickly with free returns.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ── PRODUCT PASSPORT CTA ── */}
            <div className="rounded-[1.75rem] bg-white border border-slate-200 shadow-sm p-6 flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
                  📜
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Product Passport</h2>
                  <p className="text-sm text-slate-600">
                    Get to know this product's full story — past owners, condition history, repairs, and how much CO₂ it has saved.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPassport(true)}
                className="rounded-2xl bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 transition whitespace-nowrap"
              >
                View Passport →
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-[1.75rem] bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Product description</h2>
                <p className="text-sm leading-7 text-slate-600">{product.description}</p>
                <div className="mt-6 text-sm text-slate-600 space-y-3">
                  <div>
                    <span className="font-semibold text-slate-800">Condition grade:</span> Grade A
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Seller:</span> ReCircle Renewed
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Delivery:</span> Free 2-4 business day shipping
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-white border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Product details</h2>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>Secure packaging with condition verification.</li>
                  <li>AI grading for trustworthy pre-owned products.</li>
                  <li>Fast delivery and free returns available.</li>
                  <li>Perfect for sustainable shopping and low-carbon choices.</li>
                </ul>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-slate-900 border border-slate-700 shadow-xl p-6">
              <div className="text-sm uppercase tracking-[0.24em] text-emerald-400 font-semibold mb-4">
                Buy now
              </div>
              <div className="text-4xl font-bold text-emerald-400">{GB_CURRENCY.format(product.price)}</div>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                <span className="line-through">{GB_CURRENCY.format(product.oldPrice)}</span>
                <span className="font-semibold text-emerald-400">Save {discount}%</span>
              </div>
              <div className="mt-5 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-emerald-200">
                <div className="font-semibold">In stock</div>
                <div className="text-sm text-emerald-100/70">Usually dispatched within 1 business day.</div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2 text-sm text-slate-600">
                  <div>Quantity</div>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </select>
                </div>

                <button
                  onClick={() => dispatch(addToCart(addQuantityToProduct()))}
                  className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-slate-950 font-semibold hover:bg-emerald-500 transition"
                >
                  Add to Cart
                </button>
                <button className="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-white font-semibold hover:bg-emerald-800 transition">
                  Buy Now
                </button>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-900/50 border border-slate-700 p-4 text-sm text-slate-300">
                <div className="font-semibold text-emerald-400 mb-2">Shipping & return</div>
                <div>FREE delivery and FREE returns within 30 days.</div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white border border-slate-200 shadow-sm p-6">
              <ProductPassportPanel passport={product.reCircle?.passport} />
            </div>
          </aside>
        </div>

        {/* ── RECOMMENDED PRODUCTS ── */}
        <div className="mt-8 space-y-6">
          <RecommendedCarousel title="Similar items you might like" items={RECOMMENDED_PRODUCTS} />
          <RecommendedCarousel title="Customers also bought" items={[...RECOMMENDED_PRODUCTS].reverse()} />
        </div>

        {showPassport && (
          <ProductPassportModal product={product} onClose={() => setShowPassport(false)} />
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer className="mt-12 bg-[#131A22] text-white">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-full bg-[#37475A] hover:bg-[#485769] text-white text-sm py-3 transition-colors"
        >
          Back to top
        </button>

        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-gray-700 pb-10">
            <div>
              <h3 className="font-bold mb-4">Get to Know Us</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>About ReCircle</li>
                <li>Careers</li>
                <li>Press Releases</li>
                <li>Sustainability</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Connect With Us</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Facebook</li>
                <li>Instagram</li>
                <li>Twitter</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Sell on ReCircle</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Become Seller</li>
                <li>Affiliate Program</li>
                <li>Business Accounts</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Let Us Help You</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Your Account</li>
                <li>Returns Centre</li>
                <li>100% Purchase Protection</li>
                <li>Help</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 text-sm text-gray-400">
            <div>
              <p className="font-semibold text-white">AWS Cloud</p>
              <p>Powered by AWS Free Tier</p>
            </div>
            <div>
              <p className="font-semibold text-white">AI Verification</p>
              <p>Product Health Cards™</p>
            </div>
            <div>
              <p className="font-semibold text-white">Eco Rewards</p>
              <p>Earn Green Credits</p>
            </div>
            <div>
              <p className="font-semibold text-white">Sustainability</p>
              <p>Reduce E-Waste</p>
            </div>
          </div>

          <div className="text-center text-gray-500 text-xs py-4">
            © 2026 ReCircle. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductPage;
