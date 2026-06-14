import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCartIcon, XMarkIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { GradeBadge, TrustScoreBadge, CarbonSavingIndicator, FloatingBackground } from "../components";
import { addToCart } from "../redux/cartSlice";
import { GB_CURRENCY } from "../utils/constants";
import { publishedListings } from "./SellPage";
import { useGreenCredits } from "../utils/useGreenCredits";
import { redeemGreenCredits } from "../utils/CallApi";
import { updateUser } from "../redux/authSlice";

const staticListings = [
  {
    id: "static-1",
    title: "Nike Air Max 270",
    category: "Shoes",
    photo: null,
    grade: "A",
    trustScore: 94,
    conditionLabel: "Like New",
    summary: "Worn twice, excellent condition. No scuffs.",
    carbonSavedKg: 5.2,
    price: 1299,
  },
  {
    id: "static-2",
    title: "Philips Baby Monitor",
    category: "Baby Products",
    photo: null,
    grade: "B",
    trustScore: 81,
    conditionLabel: "Good",
    summary: "Fully functional, minor scratch on back panel.",
    carbonSavedKg: 3.1,
    price: 899,
  },
  {
    id: "static-3",
    title: "Prestige Induction Cooktop",
    category: "Home & Kitchen",
    photo: null,
    grade: "A",
    trustScore: 97,
    conditionLabel: "Like New",
    summary: "Used only a handful of times. Original box included.",
    carbonSavedKg: 7.4,
    price: 1599,
  },
];

const categoryEmoji = {
  Shoes: "👟",
  Electronics: "📱",
  "Home & Kitchen": "🍳",
  "Baby Products": "🍼",
  Clothing: "👕",
  Other: "📦",
};

const CartDrawer = ({ cartItems, onRemove, onCheckout, onClose }) => {
  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-[360px] bg-slate-900 border-l border-white/10 z-50 flex flex-col shadow-2xl"
    >
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5 text-[#FF9900]" />
          ReCircle Cart ({cartItems.length})
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {cartItems.length === 0 ? (
          <div className="text-center text-white/40 mt-10">Your cart is empty</div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-3xl">{categoryEmoji[item.category] || "📦"}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="text-xs text-white/50">{item.conditionLabel}</div>
                <div className="text-[#FF9900] font-bold text-sm">{GB_CURRENCY.format(item.price)}</div>
              </div>
              <button onClick={() => onRemove(item.id)} className="text-white/30 hover:text-red-400 text-xs">✕</button>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-5 border-t border-white/10">
          <div className="flex justify-between text-white/70 text-sm mb-1">
            <span>Subtotal</span>
            <span className="font-semibold text-white">{GB_CURRENCY.format(total)}</span>
          </div>
          <p className="text-xs text-green-400 mb-3">✅ Qualifies for FREE ReCircle Delivery</p>
          <button
            onClick={onCheckout}
            className="w-full py-3 rounded-xl bg-[#FF9900] text-white font-bold hover:bg-[#e68a00] transition"
          >
            Proceed to Checkout →
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ─── Order Modal ────────────────────────────────────────────────────────────
const OrderModal = ({ item, onClose }) => {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const user = auth?.user;
  const token = auth?.token;
  const availableCredits = user?.greenCredits ?? 0;

  const [orderStage, setOrderStage] = useState("confirm"); // confirm | placing | done
  const [address, setAddress] = useState("");
  const [useCredits, setUseCredits] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online"); // online | cod
  const [creditsEarned, setCreditsEarned] = useState(0);
  const [finalBill, setFinalBill] = useState(item.price);

  const { awardCredits } = useGreenCredits();

  // Recalculate bill whenever toggle changes
  const discount = useCredits ? Math.min(availableCredits, item.price) : 0;
  const billAfterCredits = Math.max(0, item.price - discount);

  const handlePlace = async () => {
    if (!address.trim()) return;
    setFinalBill(billAfterCredits);
    setOrderStage("placing");

    setTimeout(async () => {
      // Deduct credits if used
      if (useCredits && discount > 0 && user && token) {
        try {
          const data = await redeemGreenCredits(user.id, discount, token);
          dispatch(updateUser({ ...user, greenCredits: data.greenCredits }));
        } catch (err) {
          // Fallback: deduct locally
          dispatch(updateUser({ ...user, greenCredits: Math.max(0, availableCredits - discount) }));
        }
      }

      // Award +100 credits for buying
      const earned = await awardCredits("buy_resell", `Purchased pre-owned item: ${item.title}`);
      setCreditsEarned(earned || 100);
      setOrderStage("done");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-[500px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white z-10">
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* ── CONFIRM STAGE ── */}
        {orderStage === "confirm" && (
          <>
            <div className="text-xl font-bold text-white mb-1">Complete Your Order</div>
            <div className="text-white/50 text-sm mb-5">
              You're buying: <span className="text-white font-semibold">{item.title}</span>
            </div>

            {/* Credits earn reminder */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5 mb-5 text-sm text-emerald-300">
              🌱 This purchase will earn you <span className="font-black text-emerald-400 ml-1">+100 Green Credits</span>!
            </div>

            {/* Item summary */}
            <div className="flex gap-4 items-center bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
              {item.photo ? (
                <img src={item.photo} alt={item.title} className="h-16 w-16 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="text-4xl">{categoryEmoji[item.category] || "📦"}</div>
              )}
              <div>
                <div className="font-bold text-white">{item.title}</div>
                <div className="text-sm text-white/50">{item.conditionLabel} · {item.category}</div>
                <div className="text-[#FF9900] font-bold text-lg">{GB_CURRENCY.format(item.price)}</div>
              </div>
            </div>

            {/* ── Green Credits Redeem Checkbox ── */}
            {availableCredits > 0 && (
              <label
                className={`flex items-start gap-3 rounded-xl p-4 mb-5 cursor-pointer border transition-all ${
                  useCredits
                    ? "bg-emerald-500/15 border-emerald-500/50"
                    : "bg-white/5 border-white/10 hover:border-emerald-500/30"
                }`}
              >
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={useCredits}
                    onChange={(e) => setUseCredits(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                      useCredits ? "bg-emerald-500 border-emerald-500" : "border-white/30 bg-white/5"
                    }`}
                  >
                    {useCredits && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Use Green Credits</span>
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">
                    You have <span className="text-emerald-400 font-bold">{availableCredits} credits</span> —
                    redeem <span className="text-emerald-400 font-bold">{discount} credits</span> to save{" "}
                    <span className="text-emerald-400 font-bold">{GB_CURRENCY.format(discount)}</span> off this order
                  </div>
                </div>
              </label>
            )}

            {/* Delivery Address */}
            <label className="block text-sm font-semibold mb-2 text-white/80">Delivery Address</label>
            <textarea
              rows={3}
              placeholder="Enter your full delivery address…"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 mb-5 focus:outline-none focus:border-[#FF9900] resize-none"
            />

            {/* ── Payment Method ── */}
            <label className="block text-sm font-semibold mb-3 text-white/80">Payment Method</label>
            <div className="flex gap-3 mb-5">
              {/* Online Payment */}
              <button
                onClick={() => setPaymentMethod("online")}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  paymentMethod === "online"
                    ? "bg-[#FF9900]/15 border-[#FF9900] text-[#FF9900]"
                    : "bg-white/5 border-white/15 text-white/60 hover:border-white/30"
                }`}
              >
                <span className="text-base">💳</span>
                <div className="text-left">
                  <div>Pay Online</div>
                  <div className="text-[10px] font-normal opacity-70">UPI / Card / Net Banking</div>
                </div>
                {paymentMethod === "online" && (
                  <CheckCircleIcon className="h-4 w-4 ml-auto flex-shrink-0" />
                )}
              </button>
              {/* Cash on Delivery */}
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  paymentMethod === "cod"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                    : "bg-white/5 border-white/15 text-white/60 hover:border-white/30"
                }`}
              >
                <span className="text-base">💵</span>
                <div className="text-left">
                  <div>Cash on Delivery</div>
                  <div className="text-[10px] font-normal opacity-70">Pay when you receive</div>
                </div>
                {paymentMethod === "cod" && (
                  <CheckCircleIcon className="h-4 w-4 ml-auto flex-shrink-0" />
                )}
              </button>
            </div>

            {/* Bill summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Item Price</span>
                <span>{GB_CURRENCY.format(item.price)}</span>
              </div>
              {useCredits && discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-400 mb-2">
                  <span>🌱 Green Credits Discount</span>
                  <span>− {GB_CURRENCY.format(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-white/60 mb-3">
                <span>Delivery</span>
                <span className="text-green-400">FREE (ReCircle)</span>
              </div>
              <div className="flex justify-between font-bold text-white text-base border-t border-white/10 pt-3">
                <span>Total to Pay</span>
                <span className={useCredits && discount > 0 ? "text-emerald-400" : "text-[#FF9900]"}>
                  {GB_CURRENCY.format(billAfterCredits)}
                </span>
              </div>
              {paymentMethod === "cod" && (
                <div className="mt-2 text-xs text-amber-400/80 bg-amber-400/10 rounded-lg px-3 py-2">
                  💵 Pay <span className="font-bold">{GB_CURRENCY.format(billAfterCredits)}</span> in cash at the time of delivery.
                </div>
              )}
            </div>

            <button
              onClick={handlePlace}
              disabled={!address.trim()}
              className="w-full py-3 rounded-xl bg-[#FF9900] text-white font-bold hover:bg-[#e68a00] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {paymentMethod === "cod" ? "Place Order — Pay on Delivery →" : "Place Order & Pay →"}
            </button>
          </>
        )}

        {/* ── PLACING STAGE ── */}
        {orderStage === "placing" && (
          <div className="text-center py-10">
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-lg font-semibold text-white mb-2">Placing your order…</div>
            <div className="text-white/50 text-sm">Confirming with seller and reserving item</div>
          </div>
        )}

        {/* ── DONE STAGE ── */}
        {orderStage === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.4 }} className="text-5xl mb-4">
              🎉
            </motion.div>
            <div className="text-xl font-bold text-white mb-1">Order Confirmed!</div>
            <div className="text-white/60 text-sm mb-1">{item.title} is on its way to you.</div>
            <div className="text-green-400 text-xs mb-4">
              🌱 You saved approximately {item.carbonSavedKg} kg CO₂ by buying pre-owned!
            </div>

            {/* Credits awarded */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 mb-4"
            >
              <span className="text-xl">🌱</span>
              <div className="text-left">
                <div className="text-emerald-400 font-black text-lg">+{creditsEarned || 100} Green Credits</div>
                <div className="text-white/50 text-xs">Awarded for buying pre-owned</div>
              </div>
            </motion.div>

            {/* COD message */}
            {paymentMethod === "cod" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-amber-400/10 border border-amber-400/30 rounded-2xl px-5 py-4 mb-5 text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💵</span>
                  <span className="text-amber-400 font-bold text-sm">Cash on Delivery</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  Amount <span className="text-amber-400 font-black text-base">{GB_CURRENCY.format(finalBill)}</span> to be paid at the time of delivering.
                </p>
                <p className="text-emerald-400 font-semibold text-sm mt-2">Happy Shopping! 🛍️</p>
              </motion.div>
            )}

            {/* Online success message */}
            {paymentMethod === "online" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#FF9900]/10 border border-[#FF9900]/30 rounded-2xl px-5 py-4 mb-5 text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💳</span>
                  <span className="text-[#FF9900] font-bold text-sm">Payment Successful</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  <span className="text-[#FF9900] font-black text-base">{GB_CURRENCY.format(finalBill)}</span> has been charged successfully.
                </p>
                <p className="text-emerald-400 font-semibold text-sm mt-2">Happy Shopping! 🛍️</p>
              </motion.div>
            )}

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition"
            >
              Continue Shopping
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Main BuyPage ────────────────────────────────────────────────────────────
const BuyPage = () => {
  const dispatch = useDispatch();
  const [allListings, setAllListings] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderItem, setOrderItem] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const refresh = () => setAllListings([...publishedListings, ...staticListings]);
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  const categories = ["All", ...new Set(allListings.map((l) => l.category))];
  const filtered = filter === "All" ? allListings : allListings.filter((l) => l.category === filter);

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      id: item.id,
      title: item.title,
      image_small: item.photo || "",
      price: item.price,
      quantity: 1,
      category: item.category,
      conditionLabel: item.conditionLabel,
    }));
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) return prev.map((p) => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { ...item, quantity: 1 }];
    });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  const cartTotal = cartItems.length;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen text-white">
      <FloatingBackground variant="grid" />
      <div className="relative z-10 min-w-[1000px] max-w-[1400px] mx-auto px-6 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-3 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ReCircle — Buy Pre-owned
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Buy Pre-Owned <span className="text-[#FF9900]">🛍️</span>
            </h1>
            <p className="text-white/60 text-base">
              AI-verified products. Real savings. Every purchase helps the planet.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
              🌱 Earn <span className="text-emerald-400 font-black mx-1">+100 Green Credits</span> on every purchase!
            </div>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FF9900] text-white font-bold hover:bg-[#e68a00] transition"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Cart
            {cartTotal > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartTotal}
              </span>
            )}
          </button>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                filter === cat
                  ? "bg-[#FF9900] border-[#FF9900] text-white"
                  : "border-white/20 text-white/60 hover:border-white/40 hover:text-white"
              }`}
            >
              {categoryEmoji[cat] || "🔖"} {cat}
            </button>
          ))}
        </div>

        {/* Listings grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item, i) => {
            const isNew = publishedListings.some((p) => p.id === item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden hover:border-[#FF9900]/40 hover:shadow-[0_8px_32px_rgba(255,153,0,0.15)] transition-all duration-300 flex flex-col"
              >
                <div className="relative h-40 bg-white/5 flex items-center justify-center">
                  {item.photo ? (
                    <img src={item.photo} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-6xl">{categoryEmoji[item.category] || "📦"}</span>
                  )}
                  {isNew && (
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      JUST LISTED
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <GradeBadge grade={item.grade} />
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="font-bold text-white text-base mb-1 line-clamp-1">{item.title}</div>
                  <div className="text-xs text-white/40 mb-2">{item.category} · {item.conditionLabel}</div>
                  <div className="flex gap-2 mb-3">
                    <TrustScoreBadge score={item.trustScore} />
                    <CarbonSavingIndicator kg={item.carbonSavedKg} />
                  </div>
                  <div className="text-xs text-white/50 mb-3 line-clamp-2">{item.summary}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mb-2">🌱 +100 credits on purchase</div>

                  <div className="mt-auto">
                    <div className="text-2xl font-bold text-[#FF9900] mb-3">{GB_CURRENCY.format(item.price)}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-1.5 ${
                          addedId === item.id
                            ? "bg-emerald-500 text-white"
                            : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                        }`}
                      >
                        {addedId === item.id ? (
                          <><CheckCircleIcon className="h-4 w-4" /> Added!</>
                        ) : (
                          <><ShoppingCartIcon className="h-4 w-4" /> Add to Cart</>
                        )}
                      </button>
                      <button
                        onClick={() => setOrderItem(item)}
                        className="flex-1 py-2.5 rounded-xl bg-[#FF9900] text-white font-semibold text-sm hover:bg-[#e68a00] transition"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/40">
            <div className="text-4xl mb-3">🛒</div>
            <div>No listings in this category yet.</div>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowCart(false)}
            />
            <CartDrawer
              cartItems={cartItems}
              onRemove={handleRemoveFromCart}
              onCheckout={() => { setShowCart(false); window.location.href = "/checkout"; }}
              onClose={() => setShowCart(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Order Modal */}
      <AnimatePresence>
        {orderItem && (
          <OrderModal item={orderItem} onClose={() => setOrderItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyPage;
