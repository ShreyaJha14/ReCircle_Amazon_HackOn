import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { ProductDetails, ProductPassportPanel } from "./";
import { GB_CURRENCY } from "../utils/constants";
import { callAPI } from "../utils/CallApi";
import { addToCart } from "../redux/cartSlice";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("1");
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
      </div>
    </div>
  );
};

export default ProductPage;
