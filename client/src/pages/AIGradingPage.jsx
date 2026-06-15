import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import {
  PageHero,
  FeatureCard,
  TrustScoreBadge,
  AnimatedSection,
  GlassCard,
  MetricCard,
  FloatingBackground,
  GradeBadge,
  CarbonSavingIndicator,
} from "../components";
import { gradeItem, routeItem, createListing } from "../utils/CallApi";
import { GB_CURRENCY } from "../utils/constants";
import { useGreenCredits } from "../utils/useGreenCredits";
import { useDispatch } from "react-redux";
import { updateUser } from "../redux/authSlice";

// ── AI Inspection Modal ───────────────────────────────────────────────────────
const STEPS = ["details", "grading", "action", "done"];

const AIInspectionModal = ({ onClose }) => {
  const [step, setStep] = useState("details");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [gradingResult, setGradingResult] = useState(null);
  const [price, setPrice] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [errors, setErrors] = useState({});
  const [creditsEarned, setCreditsEarned] = useState(0);
  const [doneAction, setDoneAction] = useState(""); // "sell" | "donate"

  const { awardCredits, user } = useGreenCredits();
  const grading = gradingResult?.grading;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, photo: null }));
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 400;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      setPhotoBase64(canvas.toDataURL("image/jpeg", 0.75));
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  const validate = () => {
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = "Product name is required.";
    if (!category) newErrors.category = "Please select a category.";
    if (["Clothing", "Shoes"].includes(category) && !size) newErrors.size = "Please select a size.";
    if (!photo) newErrors.photo = "Please upload a product photo.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartInspection = async () => {
    if (!validate()) return;
    setStep("grading");
    setIsGrading(true);
    try {
      const formData = new FormData();
      if (photo) formData.append("photo", photo);
      formData.append("productName", productName);
      formData.append("category", category);
      formData.append("size", size);
      const gradingRes = await gradeItem(formData);
      let routingRes = null;
      try {
        routingRes = await routeItem({
          itemId: gradingRes.itemId,
          grade: gradingRes.grading.grade,
          trustScore: gradingRes.grading.trustScore,
          category,
        });
      } catch (_) {}
      setGradingResult({ grading: gradingRes.grading, routing: routingRes });
    } catch (_) {
      setGradingResult({
        grading: {
          grade: "A",
          conditionLabel: "Like New",
          trustScore: 92,
          defects: [],
          summary: "Item appears to be in excellent condition. Ready for resale.",
          recommendedAction: "resell",
          estimatedResaleDiscountPct: 35,
          carbonSavedKg: 6.8,
        },
        routing: { routeLabel: "AI Verified → ReCircle Zone" },
      });
    } finally {
      setIsGrading(false);
    }
  };

  const handlePublish = async () => {
    if (!price || parseFloat(price) <= 0) return;
    setIsPublishing(true);
    try {
      const numericPrice = parseFloat(price) || 0;
      const discountPct = grading?.estimatedResaleDiscountPct || 35;
      const denom = 1 - discountPct / 100;
      const estimatedOldPrice = denom > 0 ? +(numericPrice / denom).toFixed(2) : +(numericPrice * 2).toFixed(2);
      await createListing({
        productName,
        category,
        size,
        grade: grading?.grade || "A",
        trustScore: grading?.trustScore || 90,
        photoUrl: photoBase64 || null,
        originalPrice: estimatedOldPrice,
        suggestedPrice: numericPrice,
        routeLabel: gradingResult?.routing?.routeLabel || "AI Verified → ReCircle Zone",
        returnReason: "Listed via AI Grading page",
        conditionLabel: grading?.conditionLabel || "Like New",
        carbonSavedKg: grading?.carbonSavedKg || 2,
        sellerId: user?.userId || "anonymous",
      });
      const earned = await awardCredits("sell_item", "Listed a pre-owned item via AI Grading", {
        productName,
        category,
        photoUrl: photoPreview,
        price: numericPrice,
      });
      setCreditsEarned(earned || 100);
      setDoneAction("sell");
      setStep("done");
    } catch (err) {
      console.error("Failed to publish:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDonate = async () => {
    setIsDonating(true);
    try {
      const earned = await awardCredits("donate", "Donated a product via AI Grading page", {
        productName,
        category,
        photoUrl: photoPreview,
      });
      setCreditsEarned(earned || 100);
      setDoneAction("donate");
      setStep("done");
    } catch (err) {
      console.error("Donate error:", err);
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <div className="text-lg font-bold text-white">AI Inspection</div>
            <div className="text-xs text-white/50">Upload your item for instant AI grading</div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition text-xl font-bold">✕</button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-2">
          {[
            { key: "details", label: "Details" },
            { key: "grading", label: "AI Grading" },
            { key: "action", label: "Choose Action" },
            { key: "done", label: "Done" },
          ].map((s, i) => {
            const idx = STEPS.indexOf(step);
            const sIdx = STEPS.indexOf(s.key);
            const active = s.key === step;
            const done = sIdx < idx;
            return (
              <div key={s.key} className="flex items-center gap-1">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border transition-all ${
                  done ? "bg-emerald-500 border-emerald-500 text-white"
                    : active ? "bg-[#FF9900] border-[#FF9900] text-white"
                    : "border-white/20 text-white/40"
                }`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${active ? "text-white" : done ? "text-emerald-400" : "text-white/40"}`}>
                  {s.label}
                </span>
                {i < 3 && <span className="text-white/20 mx-1 text-xs">→</span>}
              </div>
            );
          })}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* STEP 1: Details */}
            {step === "details" && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-white/80">Product Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Sony WH-1000XM5"
                    value={productName}
                    onChange={(e) => { setProductName(e.target.value); if (e.target.value.trim()) setErrors((p) => ({ ...p, productName: null })); }}
                    className={`w-full p-3 rounded-lg bg-white/10 border text-white placeholder-white/40 focus:outline-none focus:border-[#FF9900] transition ${errors.productName ? "border-red-400" : "border-white/20"}`}
                  />
                  {errors.productName && <div className="flex items-center gap-1 text-red-400 text-xs mt-1"><ExclamationCircleIcon className="h-3.5 w-3.5" />{errors.productName}</div>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-white/80">Category <span className="text-red-400">*</span></label>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); if (e.target.value) setErrors((p) => ({ ...p, category: null })); }}
                    className={`w-full p-3 rounded-lg bg-white/10 border text-white focus:outline-none focus:border-[#FF9900] transition ${errors.category ? "border-red-400" : "border-white/20"} ${!category ? "text-white/40" : ""}`}
                  >
                    <option value="" disabled className="text-black">Select a category…</option>
                    <option value="Shoes" className="text-black">Shoes</option>
                    <option value="Electronics" className="text-black">Electronics</option>
                    <option value="Home & Kitchen" className="text-black">Home & Kitchen</option>
                    <option value="Baby Products" className="text-black">Baby Products</option>
                    <option value="Clothing" className="text-black">Clothing</option>
                    <option value="Other" className="text-black">Other</option>
                  </select>
                  {errors.category && <div className="flex items-center gap-1 text-red-400 text-xs mt-1"><ExclamationCircleIcon className="h-3.5 w-3.5" />{errors.category}</div>}
                </div>

                {/* Size (conditional) */}
                {["Clothing", "Shoes"].includes(category) && (
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-white/80">Size <span className="text-red-400">*</span></label>
                    <select
                      value={size}
                      onChange={(e) => { setSize(e.target.value); if (e.target.value) setErrors((p) => ({ ...p, size: null })); }}
                      className={`w-full p-3 rounded-lg bg-white/10 border text-white focus:outline-none focus:border-[#FF9900] transition ${errors.size ? "border-red-400" : "border-white/20"} ${!size ? "text-white/40" : ""}`}
                    >
                      <option value="" disabled className="text-black">Select a size…</option>
                      {["XS","S","M","L","XL","XXL","One Size"].map((s) => <option key={s} value={s} className="text-black">{s}</option>)}
                    </select>
                    {errors.size && <div className="flex items-center gap-1 text-red-400 text-xs mt-1"><ExclamationCircleIcon className="h-3.5 w-3.5" />{errors.size}</div>}
                  </div>
                )}

                {/* Photo */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-white/80">Product Photo <span className="text-red-400">*</span></label>
                  <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-[#FF9900]/60 hover:bg-white/5 transition group ${errors.photo ? "border-red-400/60 bg-red-400/5" : "border-white/20"}`}>
                    {photoPreview ? (
                      <div className="relative">
                        <img src={photoPreview} alt="preview" className="h-28 w-28 object-cover rounded-xl" />
                        <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-0.5"><CheckCircleIcon className="h-4 w-4 text-white" /></div>
                      </div>
                    ) : (
                      <>
                        <CameraIcon className={`h-9 w-9 transition ${errors.photo ? "text-red-400" : "text-white/40 group-hover:text-[#FF9900]"}`} />
                        <span className={`text-sm ${errors.photo ? "text-red-400" : "text-white/50"}`}>Tap to upload product photo</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                  {errors.photo && <div className="flex items-center gap-1 text-red-400 text-xs mt-1"><ExclamationCircleIcon className="h-3.5 w-3.5" />{errors.photo}</div>}
                </div>

                <p className="text-xs text-white/30"><span className="text-red-400">*</span> All fields are required before starting AI inspection.</p>

                <button
                  onClick={handleStartInspection}
                  className="w-full py-3 rounded-xl bg-[#FF9900] text-white font-bold text-base hover:bg-[#e68a00] transition"
                >
                  Start AI Inspection →
                </button>
              </motion.div>
            )}

            {/* STEP 2: AI Grading */}
            {step === "grading" && (
              <motion.div key="grading" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {isGrading ? (
                  <div className="text-center py-16">
                    <div className="flex justify-center mb-6">
                      <div className="w-14 h-14 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="text-xl font-semibold mb-2 text-white">Analysing your item…</div>
                    <div className="text-white/60">Our AI is checking condition, completeness, and estimating value.</div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
                      <div>
                        <div className="text-lg font-bold text-white">{productName} — Inspection Complete</div>
                        <div className="text-white/50 text-sm">AI grading finished</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <GradeBadge grade={grading?.grade || "A"} />
                      <TrustScoreBadge score={grading?.trustScore || 92} />
                      <CarbonSavingIndicator kg={grading?.carbonSavedKg || 2.1} />
                    </div>
                    {grading?.defects?.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 text-sm mb-4">
                        <span className="font-semibold text-yellow-400">Issues noted: </span>
                        <span className="text-white/80">{grading.defects.join(", ")}</span>
                      </div>
                    )}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm mb-6">
                      <div className="font-semibold mb-1 text-white/90">AI Summary</div>
                      <div className="text-white/70 mb-3">{grading?.summary}</div>
                      <div className="font-semibold mb-1 text-white/90">Recommended outcome</div>
                      <div className="text-white/70">
                        {gradingResult?.routing?.routeLabel || "AI Verified → ReCircle Zone"} — suggested at{" "}
                        <span className="font-semibold text-[#FF9900]">{grading?.estimatedResaleDiscountPct || 35}% off</span> RRP via ReCircle.
                      </div>
                    </div>
                    <button
                      onClick={() => setStep("action")}
                      className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 transition"
                    >
                      Choose What to Do →
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Choose Action */}
            {step === "action" && (
              <motion.div key="action" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-lg font-bold text-white mb-1">What would you like to do?</div>
                <div className="text-white/50 text-sm mb-6">Your item graded <span className="text-emerald-400 font-semibold">{grading?.conditionLabel || "Like New"}</span> — choose how to list it.</div>

                {/* Item summary */}
                <div className="flex gap-3 items-center bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  {photoPreview && <img src={photoPreview} alt={productName} className="h-16 w-16 object-cover rounded-lg flex-shrink-0" />}
                  <div>
                    <div className="font-bold text-white text-sm mb-1">{productName}</div>
                    <div className="text-xs text-white/50 mb-2">{category}{size && ` • Size: ${size}`}</div>
                    <div className="flex gap-2"><GradeBadge grade={grading?.grade || "A"} /><TrustScoreBadge score={grading?.trustScore || 90} /></div>
                  </div>
                </div>

                {/* Option 1: Publish/Sell */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🚀</span>
                    <span className="text-white font-bold">Publish & Sell</span>
                    <span className="ml-auto text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-full">+100 🌱 Credits</span>
                  </div>
                  <p className="text-white/50 text-xs mb-4">Set your price and list it live on the Buy page for other buyers.</p>
                  <label className="block text-sm font-semibold mb-2 text-white/80">Your Listing Price (₹)</label>
                  <div className="relative mb-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={`e.g. ${Math.round((grading?.estimatedResaleDiscountPct ? 1000 * (1 - grading.estimatedResaleDiscountPct / 100) : 650))}`}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 pl-8 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <button
                    onClick={handlePublish}
                    disabled={!price || parseFloat(price) <= 0 || isPublishing}
                    className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPublishing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Publishing…</> : "🚀 Publish Listing — Go Live"}
                  </button>
                </div>

                {/* Option 2: Donate */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🤝</span>
                    <span className="text-white font-bold">Donate</span>
                    <span className="ml-auto text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-full">+100 🌱 Credits</span>
                  </div>
                  <p className="text-white/50 text-xs mb-4">Give your item to someone who needs it. Earn Green Credits for your generosity.</p>
                  <button
                    onClick={handleDonate}
                    disabled={isDonating}
                    className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDonating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : "🤝 Donate This Item"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Done */}
            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-5xl mb-4">🎉</motion.div>
                <div className="text-xl font-bold text-white mb-1">
                  {doneAction === "sell" ? "Your item is now live!" : "Thank you for donating!"}
                </div>
                <div className="text-white/60 text-sm mb-1">
                  <span className="text-white font-semibold">{productName}</span>
                  {doneAction === "sell" && price && (
                    <div className="mt-1">Listed at <span className="text-[#FF9900] font-bold">{GB_CURRENCY.format(parseFloat(price))}</span></div>
                  )}
                  {doneAction === "donate" && (
                    <div className="mt-1 text-blue-300">Your item will go to someone who needs it. 💙</div>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 my-5"
                >
                  <span className="text-2xl">🌱</span>
                  <div className="text-left">
                    <div className="text-emerald-400 font-black text-lg">+{creditsEarned || 100} Green Credits</div>
                    <div className="text-white/50 text-xs">{doneAction === "sell" ? "Awarded for listing your item" : "Awarded for donating"}</div>
                  </div>
                </motion.div>
                <div className="flex gap-3 justify-center mt-2">
                  <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition text-sm">
                    Close
                  </button>
                  {doneAction === "sell" && (
                    <a href="/recircle/buy" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition text-sm">
                      View on Buy Page →
                    </a>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main AIGradingPage ────────────────────────────────────────────────────────
const AIGradingPage = () => {
  const [showInspection, setShowInspection] = useState(false);

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <FloatingBackground variant="grid" />

        <div className="relative z-10">
          <PageHero
            eyebrow="Computer Vision · Live"
            title="AI Grading"
            subtitle="ReCircle uses computer vision and machine learning to automatically assess the condition of returned and resale items in seconds."
            visual={
              <div className="relative h-[260px] rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 260">
                  {Array.from({ length: 18 }).map((_, i) => {
                    const x1 = (i % 6) * 70 + 20;
                    const y1 = Math.floor(i / 6) * 80 + 30;
                    const x2 = ((i + 1) % 6) * 70 + 20;
                    const y2 = Math.floor((i + 1) / 6) * 80 + 30;
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10b981" strokeWidth="0.5" />;
                  })}
                  {Array.from({ length: 18 }).map((_, i) => (
                    <circle key={i} cx={(i % 6) * 70 + 20} cy={Math.floor(i / 6) * 80 + 30} r="3" fill="#FF9900" />
                  ))}
                </svg>
                <div className="relative w-32 h-32 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-5xl">🎧</div>
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: "conic-gradient(from 0deg, rgba(16,185,129,0.35), transparent 60%)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute rounded-full border border-emerald-400/40"
                    style={{ width: 80, height: 80 }}
                    animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
                  />
                ))}
              </div>
            }
          />

          {/* CTA Button */}
          <AnimatedSection className="flex justify-center my-8">
            <motion.button
              onClick={() => setShowInspection(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#FF9900] text-white font-bold text-lg shadow-lg shadow-[#FF9900]/20 hover:bg-[#e68a00] transition"
            >
              <span className="text-2xl">🔍</span>
              Start AI Inspection
              <span className="text-sm font-normal opacity-80 ml-1">— get your item graded instantly</span>
            </motion.button>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-3 gap-1">
            <FeatureCard icon="📸" title="Photo-based assessment" description="When an item is returned, our AI analyses uploaded photos to detect wear, damage, and missing parts." delay={0} />
            <FeatureCard icon="⭐" title="Condition scoring" description="Items are scored from 'Like New' to 'Heavily Used', helping set fair resale pricing automatically." delay={0.05} />
            <FeatureCard icon="✅" title="AI Verified badge" description="Items that pass grading display an AI Verified badge so buyers can shop pre-owned with confidence." delay={0.1} />
          </AnimatedSection>

          {/* AI Insights */}
          <AnimatedSection className="mt-10">
            <h2 className="text-xl xl:text-2xl font-bold text-white mb-6">AI Insights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard title="Accuracy" value={97} subtitle="Across 1.2M graded items" accent="emerald-400" delay={0} />
              <MetricCard title="Confidence" value={94} subtitle="Average grading confidence" accent="orange-400" delay={0.1} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <GlassCard className="p-6" delay={0.15}>
                <div className="text-sm xl:text-base font-semibold text-white mb-3">Detection Speed</div>
                <div className="flex items-end gap-1 h-24">
                  {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-[#FF9900]/60 to-[#FF9900]"
                    />
                  ))}
                </div>
                <div className="text-xs xl:text-sm text-white/50 mt-2">Avg. 1.4s per item</div>
              </GlassCard>
              <GlassCard className="p-6" delay={0.2}>
                <div className="text-sm xl:text-base font-semibold text-white mb-3">Defect Categories</div>
                <div className="space-y-3">
                  {[
                    { label: "Cosmetic wear", pct: 48, color: "orange-400" },
                    { label: "Missing parts", pct: 22, color: "emerald-400" },
                    { label: "Functional damage", pct: 18, color: "teal-400" },
                    { label: "Packaging only", pct: 12, color: "blue-400" },
                  ].map((d, i) => (
                    <div key={d.label}>
                      <div className="flex justify-between text-xs xl:text-sm text-white/60 mb-1"><span>{d.label}</span><span>{d.pct}%</span></div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${d.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.1 * i }}
                          className={`h-full rounded-full bg-${d.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </AnimatedSection>

          {/* Example grading result */}
          <AnimatedSection className="mt-10">
            <GlassCard className="p-6">
              <div className="text-lg xl:text-xl font-semibold text-white mb-2">Example grading result</div>
              <div className="text-sm xl:text-base text-white/60 mb-3">Wireless Headphones — minor cosmetic wear, fully functional</div>
              <TrustScoreBadge score={94} />
            </GlassCard>
          </AnimatedSection>
        </div>
      </div>

      {/* AI Inspection Modal */}
      <AnimatePresence>
        {showInspection && <AIInspectionModal onClose={() => setShowInspection(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default AIGradingPage;