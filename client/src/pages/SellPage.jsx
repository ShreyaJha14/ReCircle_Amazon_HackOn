import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { GradeBadge, TrustScoreBadge, CarbonSavingIndicator, FloatingBackground } from "../components";
import { gradeItem, routeItem, createListing } from "../utils/CallApi";
import { GB_CURRENCY } from "../utils/constants";
import { useGreenCredits } from "../utils/useGreenCredits";

const STEPS = ["details", "grading", "publish", "done"];

const SellPage = () => {
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
  const [errors, setErrors] = useState({});
  const [creditsEarned, setCreditsEarned] = useState(0);

  const { awardCredits, user } = useGreenCredits();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, photo: null }));
      // Convert to base64 (resized to max 400px) so it can be stored in the database
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
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = "Product name is required.";
    if (!category) newErrors.category = "Please select a category.";
    if (
      ["Clothing", "Shoes"].includes(category) && !size
    ) {
      newErrors.size = "Please select a size.";
    }
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
      // Demo fallback
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
    setIsPublishing(true);
    try {
      const numericPrice = parseFloat(price) || 0;
      const discountPct = gradingResult?.grading?.estimatedResaleDiscountPct || 35;
      const denom = 1 - discountPct / 100;
      const estimatedOldPrice = denom > 0 ? +(numericPrice / denom).toFixed(2) : +(numericPrice * 2).toFixed(2);

      // Save listing to the database
      await createListing({
        productName,
        category,
        size,
        grade: gradingResult?.grading?.grade || "A",
        trustScore: gradingResult?.grading?.trustScore || 90,
        photoUrl: photoBase64 || null,
        originalPrice: estimatedOldPrice,
        suggestedPrice: numericPrice,
        routeLabel: gradingResult?.routing?.routeLabel || "AI Verified → ReCircle Zone",
        returnReason: "Listed via Sell page",
        conditionLabel: gradingResult?.grading?.conditionLabel || "Like New",
        carbonSavedKg: gradingResult?.grading?.carbonSavedKg || 2,
        sellerId: user?.userId || "anonymous",
      });

      // Award +100 credits for listing an item
      const earned = await awardCredits("sell_item", "Listed a pre-owned item on ReCircle", {
        productName,
        category,
        photoUrl: photoPreview,
        price: numericPrice,
      });
      setCreditsEarned(earned || 100);

      setStep("done");
    } catch (err) {
      console.error("Failed to publish listing:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const reset = () => {
    setStep("details");
    setProductName("");
    setCategory("");
    setSize("");
    setPhoto(null);
    setPhotoPreview(null);
    setGradingResult(null);
    setPrice("");
    setErrors({});
    setCreditsEarned(0);
    setPhotoBase64(null);
  };

  const grading = gradingResult?.grading;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 min-h-screen text-white">
      <FloatingBackground variant="grid" />
      <div className="relative z-10 min-w-[1000px] max-w-[800px] mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-3 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ReCircle — Sell Pre-owned
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Sell an Item <span className="text-[#FF9900]">♻️</span>
          </h1>
          <p className="text-white/60 text-base max-w-xl">
            List your returned or unused item. Our AI grades it, and you set the price before publishing it live on the Buy page.
          </p>
          {/* Credits incentive banner */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300 font-semibold">
            🌱 Earn <span className="text-emerald-400 font-black">+100 Green Credits</span> when you publish a listing!
          </div>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { key: "details", label: "Details" },
            { key: "grading", label: "AI Grading" },
            { key: "publish", label: "Set Price & Publish" },
            { key: "done", label: "Live!" },
          ].map((s, i) => {
            const idx = STEPS.indexOf(step);
            const sIdx = STEPS.indexOf(s.key);
            const active = s.key === step;
            const done = sIdx < idx;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border transition-all ${
                    done
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : active
                      ? "bg-[#FF9900] border-[#FF9900] text-white"
                      : "border-white/20 text-white/40"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-sm font-medium ${active ? "text-white" : done ? "text-emerald-400" : "text-white/40"}`}>
                  {s.label}
                </span>
                {i < 3 && <span className="text-white/20 mx-1">→</span>}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Details */}
          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-xl font-bold mb-6">Item Details</h2>

                {/* Product Name */}
                <label className="block text-sm font-semibold mb-1 text-white/80">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nike Air Max 270"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, productName: null }));
                  }}
                  className={`w-full p-3 rounded-lg bg-white/10 border text-white placeholder-white/40 mb-1 focus:outline-none focus:border-[#FF9900] transition ${
                    errors.productName ? "border-red-400" : "border-white/20"
                  }`}
                />
                {errors.productName && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-4">
                    <ExclamationCircleIcon className="h-3.5 w-3.5" />
                    {errors.productName}
                  </div>
                )}
                {!errors.productName && <div className="mb-4" />}

                {/* Category */}
                <label className="block text-sm font-semibold mb-1 text-white/80">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value) setErrors((prev) => ({ ...prev, category: null }));
                  }}
                  className={`w-full p-3 rounded-lg bg-white/10 border text-white mb-1 focus:outline-none focus:border-[#FF9900] transition ${
                    errors.category ? "border-red-400" : "border-white/20"
                  } ${!category ? "text-white/40" : ""}`}
                >
                  <option value="" disabled className="text-black">Select a category…</option>
                  <option value="Shoes" className="text-black">Shoes</option>
                  <option value="Electronics" className="text-black">Electronics</option>
                  <option value="Home & Kitchen" className="text-black">Home & Kitchen</option>
                  <option value="Baby Products" className="text-black">Baby Products</option>
                  <option value="Clothing" className="text-black">Clothing</option>
                  <option value="Other" className="text-black">Other</option>
                </select>
                {errors.category && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-4">
                    <ExclamationCircleIcon className="h-3.5 w-3.5" />
                    {errors.category}
                  </div>
                )}
                {!errors.category && <div className="mb-4" />}
                {["Clothing", "Shoes"].includes(category) && (
                  <>
                  <label className="block text-sm font-semibold mb-1 text-white/80">
                  Size <span className="text-red-400">*</span>
                  </label>
                  <select 
                  value={size}
                  onChange={(e)=> {
                    setSize(e.target.value);
                    if(e.target.value) {
                      setErrors((prev) => ({ ...prev, size: null }));
                    }
                  }}
                  className={`w-full p-3 rounded-lg bg-white/10 border text-white mb-1 focus:outline-none focus:border-[#FF9900] transition ${
                    errors.size ? "border-red-400" : "border-white/20"}${!size ? "text-white/40" : ""}`}
                  >
                    <option value="" disabled className="text-black">
                      Select a size...
                    </option>
                    <option value="XS" className="text-black">XS</option>
                    <option value="S" className="text-black">S</option>
                    <option value="M" className="text-black">M</option>
                    <option value="L" className="text-black">L</option>
                    <option value="XL" className="text-black">XL</option>
                    <option value="XXL" className="text-black">XXL</option>
                    <option value="One Size" className="text-black">
                      One Size
                    </option>
                  </select>
                  {errors.size && (
                    <div className="flex items-center gap-1 text-red-400 text-xs mb-4">
                      <ExclamationCircleIcon className="h-3.5 w-3.5" />
                      {errors.size}
                    </div>
                  )}
                   {!errors.size && <div className="mb-4" />}
                  </>
                )}

                {/* Photo */}
                <label className="block text-sm font-semibold mb-1 text-white/80">
                  Product Photo <span className="text-red-400">*</span>
                </label>
                <label
                  className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 mb-1 cursor-pointer hover:border-[#FF9900]/60 hover:bg-white/5 transition group ${
                    errors.photo ? "border-red-400/60 bg-red-400/5" : "border-white/20"
                  }`}
                >
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="preview" className="h-32 w-32 object-cover rounded-xl" />
                      <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-0.5">
                        <CheckCircleIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <CameraIcon className={`h-10 w-10 transition ${errors.photo ? "text-red-400" : "text-white/40 group-hover:text-[#FF9900]"}`} />
                      <span className={`text-sm ${errors.photo ? "text-red-400" : "text-white/50"}`}>
                        Tap to upload product photo
                      </span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
                {errors.photo && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-4">
                    <ExclamationCircleIcon className="h-3.5 w-3.5" />
                    {errors.photo}
                  </div>
                )}
                {!errors.photo && <div className="mb-4" />}

                {/* Required fields note */}
                <p className="text-xs text-white/30 mb-5">
                  <span className="text-red-400">*</span> All fields are required before starting AI inspection.
                </p>

                <button
                  onClick={handleStartInspection}
                  className="w-full py-3 rounded-xl bg-[#FF9900] text-white font-bold text-base hover:bg-[#e68a00] transition"
                >
                  Start AI Inspection →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: AI Grading */}
          {step === "grading" && (
            <motion.div key="grading" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                {isGrading ? (
                  <div className="text-center py-16">
                    <div className="flex justify-center mb-6">
                      <div className="w-14 h-14 border-4 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="text-xl font-semibold mb-2">Analysing your item…</div>
                    <div className="text-white/60">Our AI is checking condition, completeness, and estimating value.</div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
                      <div>
                        <div className="text-xl font-bold">{productName} — Inspection Complete</div>
                        <div className="text-white/50 text-sm">AI grading finished</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
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

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-sm mb-6">
                      <div className="font-semibold mb-2 text-white/90">AI Summary</div>
                      <div className="text-white/70 mb-3">{grading?.summary}</div>
                      <div className="font-semibold mb-1 text-white/90">Recommended outcome</div>
                      <div className="text-white/70">
                        {gradingResult?.routing?.routeLabel || "AI Verified → ReCircle Zone"} — suggested at{" "}
                        <span className="font-semibold text-[#FF9900]">{grading?.estimatedResaleDiscountPct || 35}% off</span> RRP via ReCircle.
                      </div>
                    </div>

                    <button
                      onClick={() => setStep("publish")}
                      className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 transition"
                    >
                      Set Price & Publish →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Set Price & Publish */}
          {step === "publish" && (
            <motion.div key="publish" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-xl font-bold mb-2">Set Your Price</h2>
                <p className="text-white/50 text-sm mb-4">
                  AI suggests{" "}
                  <span className="text-[#FF9900] font-semibold">{grading?.estimatedResaleDiscountPct || 35}% off</span> RRP. You can set your own price below.
                </p>

                {/* Credits reward reminder */}
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6 text-sm text-emerald-300">
                  🌱 Publishing this listing will earn you <span className="font-black text-emerald-400 ml-1">+100 Green Credits</span>!
                </div>

                {/* Summary card */}
                <div className="flex gap-4 items-start bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  {photoPreview && (
                    <img src={photoPreview} alt={productName} className="h-20 w-20 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-base mb-1">{productName}</div>
                    <div className="text-sm text-white/50 mb-2">
                    {category}
                    {size && ` • Size: ${size}`}
                    </div>
                    <div className="flex gap-2">
                      <GradeBadge grade={grading?.grade || "A"} />
                      <TrustScoreBadge score={grading?.trustScore || 90} />
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-semibold mb-2 text-white/80">Your Listing Price (₹)</label>
                <div className="relative mb-6">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1299"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 pl-8 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 text-xl font-bold"
                  />
                </div>

                <button
                  onClick={handlePublish}
                  disabled={!price || parseFloat(price) <= 0 || isPublishing}
                  className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    "🚀 Publish Listing — Go Live"
                  )}
                </button>
                <p className="text-center text-xs text-white/40 mt-3">Your item will be immediately visible on the Buy page.</p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Done */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white/[0.06] border border-emerald-500/30 rounded-2xl p-10 backdrop-blur-xl text-center">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-6xl mb-4">
                  🎉
                </motion.div>
                <div className="text-2xl font-bold mb-2">Your item is now live!</div>
                <div className="text-white/60 text-base mb-2">
                  <span className="text-white font-semibold">{productName}</span>
                  {size && (
                    <div className="text-emerald-400 text-sm font-medium mt-1">
                      Size: {size}
                    </div>
                  )}
                  <div className="mt-2">
                    Published at{" "}
                    <span className="text-[#FF9900] font-bold">
                      {GB_CURRENCY.format(parseFloat(price))}
                    </span>
                  </div>
                </div>
                  {/* <span className="text-white font-semibold">{productName}</span> has been published at{" "}

                  <span className="text-[#FF9900] font-bold">{GB_CURRENCY.format(parseFloat(price))}</span>
                </div> */}
                <div className="text-white/40 text-sm mb-5">It's now visible to buyers on the ReCircle Buy page.</div>

                {/* Credits awarded */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 mb-8"
                >
                  <span className="text-2xl">🌱</span>
                  <div className="text-left">
                    <div className="text-emerald-400 font-black text-xl">+{creditsEarned || 100} Green Credits</div>
                    <div className="text-white/50 text-xs">Awarded for listing your item</div>
                  </div>
                </motion.div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={reset}
                    className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition"
                  >
                    Sell Another Item
                  </button>
                  <a
                    href="/recircle/buy"
                    className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
                  >
                    View on Buy Page →
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SellPage;