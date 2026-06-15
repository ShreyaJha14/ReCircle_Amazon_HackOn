import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraIcon, CheckCircleIcon, ExclamationCircleIcon, HeartIcon } from "@heroicons/react/24/outline";
import { FloatingBackground } from "../components";
import { useGreenCredits } from "../utils/useGreenCredits";

const CATEGORIES = [
  "Electronics",
  "Clothing & Apparel",
  "Books",
  "Furniture",
  "Toys & Games",
  "Sports & Outdoors",
  "Kitchen & Home",
  "Other",
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size", "N/A"];

const STEPS = ["details", "confirm", "done"];

const DonatePage = () => {
  const [step, setStep] = useState("details");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [creditsEarned, setCreditsEarned] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { awardCredits, user } = useGreenCredits();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, photo: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!productName.trim()) newErrors.productName = "Product name is required.";
    if (!category) newErrors.category = "Please select a category.";
    if (!size) newErrors.size = "Please select a size.";
    if (!photo) newErrors.photo = "Please upload a product photo.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    setStep("confirm");
  };

  const handleDonate = async () => {
    setSubmitting(true);
    try {
      const earned = await awardCredits("donate", "Donated a product via ReCircle");
      setCreditsEarned(earned || 100);
    } catch (_) {
      setCreditsEarned(100);
    } finally {
      setSubmitting(false);
      setStep("done");
    }
  };

  const reset = () => {
    setStep("details");
    setProductName("");
    setCategory("");
    setSize("");
    setPhoto(null);
    setPhotoPreview(null);
    setErrors({});
    setCreditsEarned(0);
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 min-h-screen text-white">
      <FloatingBackground variant="grid" />
      <div className="relative z-10 min-w-[1000px] max-w-[800px] mx-auto px-6 py-12">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-3 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ReCircle — Donate a Product
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Donate an Item <span className="text-[#FF9900]">💚</span>
          </h1>
          <p className="text-white/60 text-base max-w-xl">
            Give your unused or returned items a second life. Your donation helps those in need and keeps products out of landfill.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300 font-semibold">
            🌱 Earn <span className="text-emerald-400 font-black ml-1">+100 Green Credits</span> when you donate an item!
          </div>
        </motion.div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { key: "details", label: "Item Details" },
            { key: "confirm", label: "Review & Confirm" },
            { key: "done",    label: "Donated!" },
          ].map((s, i) => {
            const idx  = STEPS.indexOf(step);
            const sIdx = STEPS.indexOf(s.key);
            const active = s.key === step;
            const done   = sIdx < idx;
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
                {i < 2 && <span className="text-white/20 mx-1">→</span>}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Details ── */}
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
                  className={`w-full p-3 rounded-lg bg-white/10 border text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 mb-1 ${
                    errors.productName ? "border-red-500" : "border-white/20"
                  }`}
                />
                {errors.productName ? (
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-4">
                    <ExclamationCircleIcon className="h-3.5 w-3.5" />
                    {errors.productName}
                  </div>
                ) : (
                  <div className="mb-4" />
                )}

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
                  className={`w-full p-3 rounded-lg bg-white/10 border text-white focus:outline-none focus:border-emerald-500 mb-1 ${
                    errors.category ? "border-red-500" : "border-white/20"
                  }`}
                >
                  <option value="" className="bg-slate-900">Select a category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
                {errors.category ? (
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-4">
                    <ExclamationCircleIcon className="h-3.5 w-3.5" />
                    {errors.category}
                  </div>
                ) : (
                  <div className="mb-4" />
                )}

                {/* Size */}
                <label className="block text-sm font-semibold mb-2 text-white/80">
                  Size <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-1">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSize(s);
                        setErrors((prev) => ({ ...prev, size: null }));
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        size === s
                          ? "bg-[#FF9900] border-[#FF9900] text-white"
                          : errors.size
                          ? "border-red-500/60 text-white/60 hover:border-red-400"
                          : "border-white/20 text-white/60 hover:border-white/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {errors.size ? (
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-4">
                    <ExclamationCircleIcon className="h-3.5 w-3.5" />
                    {errors.size}
                  </div>
                ) : (
                  <div className="mb-4" />
                )}

                {/* Photo Upload */}
                <label className="block text-sm font-semibold mb-2 text-white/80">
                  Product Photo <span className="text-red-400">*</span>
                </label>
                <label
                  className={`flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition group mb-1 ${
                    errors.photo
                      ? "border-red-500 bg-red-500/5"
                      : "border-white/20 bg-white/5 hover:border-[#FF9900] hover:bg-white/10"
                  }`}
                >
                  {photoPreview ? (
                    <div className="relative w-full h-full">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition">
                        <span className="text-white text-xs font-semibold">Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CameraIcon className={`h-10 w-10 transition ${errors.photo ? "text-red-400" : "text-white/40 group-hover:text-[#FF9900]"}`} />
                      <span className={`text-sm mt-2 ${errors.photo ? "text-red-400" : "text-white/50"}`}>
                        Tap to upload product photo
                      </span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
                {errors.photo ? (
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-4">
                    <ExclamationCircleIcon className="h-3.5 w-3.5" />
                    {errors.photo}
                  </div>
                ) : (
                  <div className="mb-4" />
                )}

                <p className="text-xs text-white/30 mb-5">
                  <span className="text-red-400">*</span> All fields are required to proceed.
                </p>

                <button
                  onClick={handleContinue}
                  className="w-full py-3 rounded-xl bg-[#FF9900] text-white font-bold text-base hover:bg-[#e68a00] transition"
                >
                  Review Donation →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Confirm ── */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <HeartIcon className="h-7 w-7 text-emerald-400" />
                  <div>
                    <div className="text-xl font-bold">Confirm Your Donation</div>
                    <div className="text-white/50 text-sm">Review item details before submitting</div>
                  </div>
                </div>

                {/* Credits reminder */}
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6 text-sm text-emerald-300">
                  🌱 Donating this item will earn you <span className="font-black text-emerald-400 ml-1">+100 Green Credits</span>!
                </div>

                {/* Item summary */}
                <div className="flex gap-5 items-start bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
                  {photoPreview && (
                    <img src={photoPreview} alt={productName} className="h-24 w-24 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-white/40 uppercase tracking-wider">Product</span>
                      <div className="font-bold text-lg">{productName}</div>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <span className="text-xs text-white/40 uppercase tracking-wider">Category</span>
                        <div className="text-sm font-semibold text-white/90">{category}</div>
                      </div>
                      <div>
                        <span className="text-xs text-white/40 uppercase tracking-wider">Size</span>
                        <div className="text-sm font-semibold text-white/90">{size}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("details")}
                    className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition"
                  >
                    ← Edit Details
                  </button>
                  <button
                    onClick={handleDonate}
                    disabled={submitting || !user}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "💚 Confirm Donation"
                    )}
                  </button>
                </div>
                {!user && (
                  <p className="text-center text-xs text-red-400 mt-3">You must be signed in to donate.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Done ── */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white/[0.06] border border-emerald-500/30 rounded-2xl p-10 backdrop-blur-xl text-center">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-6xl mb-4">
                  💚
                </motion.div>
                <div className="text-2xl font-bold mb-2">Thank you for donating!</div>
                <div className="text-white/60 text-base mb-2">
                  <span className="text-white font-semibold">{productName}</span> will go to someone who needs it.
                </div>
                <div className="text-white/40 text-sm mb-5">
                  {category} · Size {size}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 mb-8"
                >
                  <span className="text-2xl">🌱</span>
                  <div className="text-left">
                    <div className="text-emerald-400 font-black text-xl">+{creditsEarned || 100} Green Credits</div>
                    <div className="text-white/50 text-xs">Awarded for your donation</div>
                  </div>
                </motion.div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={reset}
                    className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition"
                  >
                    Donate Another Item
                  </button>
                  <a
                    href="/my-impact"
                    className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
                  >
                    View My Impact →
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

export default DonatePage;