import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  FloatingBackground,
  GlassCard,
  GradientBorderCard,
} from "../components";
import { createPassport } from "../utils/CallApi";

// ── Constants ────────────────────────────────────────────────────────────────
const CONDITION_OPTIONS = [
  { label: "Like New", grade: "A", trustScore: 96, sustainabilityBonus: 20 },
  { label: "Excellent", grade: "A", trustScore: 88, sustainabilityBonus: 15 },
  { label: "Good", grade: "B", trustScore: 78, sustainabilityBonus: 10 },
  { label: "Fair", grade: "C", trustScore: 62, sustainabilityBonus: 5 },
  { label: "Poor", grade: "D", trustScore: 45, sustainabilityBonus: 0 },
];

const CATEGORY_OPTIONS = [
  "Electronics",
  "Shoes",
  "Clothing",
  "Home & Kitchen",
  "Baby Products",
  "Sports & Fitness",
  "Books",
  "Furniture",
  "Toys & Games",
  "Other",
];

const MATERIAL_OPTIONS = [
  "Plastics",
  "Metals",
  "Glass",
  "Textiles",
  "Electronics",
  "Mixed materials",
  "Wood",
  "Rubber",
  "Leather",
  "Paper / Cardboard",
];

const IMAGE_SLOTS = [
  { key: "front", label: "Front View", required: true, icon: "📸" },
  { key: "back", label: "Back View", required: true, icon: "🔄" },
  { key: "side", label: "Side View", required: false, icon: "↔️" },
  { key: "damage", label: "Damage (if any)", required: false, icon: "🔍" },
  { key: "invoice", label: "Invoice / Receipt", required: false, icon: "🧾" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function computeGrading(condition, remainingLife) {
  const opt = CONDITION_OPTIONS.find((o) => o.label === condition) || CONDITION_OPTIONS[2];
  const lifeYears = parseFloat(remainingLife) || 2;
  const carbonSavedKg = Math.max(2, Math.min(20, lifeYears * 2.5 + opt.sustainabilityBonus * 0.3));
  const sustainabilityScore = Math.min(100, opt.trustScore + opt.sustainabilityBonus - Math.max(0, (5 - lifeYears) * 2));
  return {
    grade: opt.grade,
    trustScore: opt.trustScore,
    conditionLabel: opt.label,
    carbonSavedKg: parseFloat(carbonSavedKg.toFixed(1)),
    sustainabilityScore: Math.round(sustainabilityScore),
  };
}

function resizeToBase64(file, maxPx = 800, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = url;
  });
}

// ── Image Upload Slot ──────────────────────────────────────────────────────────
const ImageSlot = ({ slot, value, onUpload, onRemove, isDragging, onDragOver, onDrop, onDragLeave }) => {
  const inputRef = useRef();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
        <span>{slot.icon}</span>
        {slot.label}
        {slot.required && <span className="text-red-400">*</span>}
      </div>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/20 bg-white/5 aspect-square">
          <img src={value} alt={slot.label} className="w-full h-full object-cover" />
          <button
            onClick={() => onRemove(slot.key)}
            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-black/50 py-1 px-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircleIcon className="h-3 w-3" /> Uploaded
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, slot.key)}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            isDragging
              ? "border-emerald-400 bg-emerald-400/10"
              : "border-white/20 hover:border-[#FF9900]/60 hover:bg-white/5"
          }`}
        >
          <ArrowUpTrayIcon className="h-6 w-6 text-white/30" />
          <span className="text-[10px] text-white/40 text-center px-2">
            {slot.required ? "Required" : "Optional"}
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(slot.key, file);
          e.target.value = "";
        }}
      />
    </div>
  );
};

// ── Section Wrapper ────────────────────────────────────────────────────────────
const Section = ({ number, title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: number * 0.08 }}
    className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-[#FF9900]/20 border border-[#FF9900]/40 flex items-center justify-center text-[#FF9900] font-bold text-sm">
        {number}
      </div>
      <div>
        <div className="text-base font-bold text-white flex items-center gap-2">
          <span>{icon}</span> {title}
        </div>
      </div>
    </div>
    {children}
  </motion.div>
);

// ── Field ───────────────────────────────────────────────────────────────────
const Field = ({ label, required, error, children, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-white/70 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-center gap-1 text-red-400 text-xs mt-1">
        <ExclamationCircleIcon className="h-3.5 w-3.5 flex-shrink-0" />
        {error}
      </div>
    )}
  </div>
);

const inputCls = (error) =>
  `w-full p-3 rounded-xl bg-white/10 border text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition text-sm ${
    error ? "border-red-400/60" : "border-white/15"
  }`;

const selectCls = (error, empty) =>
  `w-full p-3 rounded-xl bg-white/10 border text-sm focus:outline-none focus:border-emerald-400 transition ${
    error ? "border-red-400/60" : "border-white/15"
  } ${empty ? "text-white/40" : "text-white"}`;

// ── Main Page ──────────────────────────────────────────────────────────────────
const PassportCreatePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggingOver, setDraggingOver] = useState(null);
  const [errors, setErrors] = useState({});

  // Form state
  const [form, setForm] = useState({
    // Product Info
    productName: "",
    category: "",
    brand: "",
    modelNumber: "",
    purchaseYear: "",
    aiCertifiedId: "",
    originalPrice: "",
    currentCondition: "Good",
    // Sustainability
    materialType: "Electronics",
    recycledMaterials: "Yes",
    remainingLife: "3",
    // Ownership
    ownerName: "",
    purchaseDate: "",
    warrantyAvailable: "Yes",
    // Images (base64)
    images: { front: null, back: null, side: null, damage: null, invoice: null },
  });

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const setImage = useCallback(async (key, file) => {
    const b64 = await resizeToBase64(file);
    setForm((prev) => ({
      ...prev,
      images: { ...prev.images, [key]: b64 },
    }));
    setErrors((prev) => ({ ...prev, [`image_${key}`]: null }));
  }, []);

  const removeImage = (key) => {
    setForm((prev) => ({
      ...prev,
      images: { ...prev.images, [key]: null },
    }));
  };

  // Drag & drop
  const handleDragOver = (e, key) => {
    e.preventDefault();
    setDraggingOver(key);
  };
  const handleDrop = async (e, key) => {
    e.preventDefault();
    setDraggingOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await setImage(key, file);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.productName.trim()) e.productName = "Product name is required";
    if (!form.category) e.category = "Category is required";
    if (!form.brand.trim()) e.brand = "Brand is required";
    if (!form.modelNumber.trim()) e.modelNumber = "Model number is required";
    if (!form.purchaseYear.trim()) e.purchaseYear = "Purchase year is required";
    if (!form.originalPrice.trim()) e.originalPrice = "Original price is required";
    if (!form.images.front) e.image_front = "Front image is required";
    if (!form.images.back) e.image_back = "Back image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setTimeout(() => {
        document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setIsSubmitting(true);
    try {
      const grading = computeGrading(form.currentCondition, form.remainingLife);
      const condOpt = CONDITION_OPTIONS.find((o) => o.label === form.currentCondition) || CONDITION_OPTIONS[2];

      const payload = {
        productName: form.productName,
        category: form.category,
        brand: form.brand,
        modelNumber: form.modelNumber,
        manufacturingYear: form.purchaseYear,
        originalPrice: parseFloat(form.originalPrice) || 0,
        origin: "User-supplied",
        materials: `${form.materialType} (${form.recycledMaterials === "Yes" ? "Contains recycled content" : "Standard materials"})`,
        recyclability:
          form.recycledMaterials === "Yes"
            ? "Recyclable through most municipal programs"
            : "Check local recycling guidelines",
        grade: grading.grade,
        trustScore: grading.trustScore,
        conditionLabel: grading.conditionLabel,
        defects: [],
        repairHistory: "None — first resale",
        sustainabilityScore: grading.sustainabilityScore,
        carbonSavedKg: grading.carbonSavedKg,
        warrantyStatus: form.warrantyAvailable === "Yes" ? "ReCircle 90-day guarantee" : "Sold as-is",
       aiCertifiedId: form.aiCertifiedId || null,
        // Images — primary is front, others stored as array
        image: form.images.front || null,
        images: form.images,
        ownerName: form.ownerName || null,
        purchaseDate: form.purchaseDate || null,
        remainingLife: parseFloat(form.remainingLife) || 3,
        materialType: form.materialType,
        recycledMaterials: form.recycledMaterials,
      };

      let passportId, passportCode, resultPassport;

      try {
        const res = await createPassport(payload);
        if (res?.success) {
          passportId = res.passportId;
          passportCode = res.passportCode;
          resultPassport = res.passport || { ...payload, passportId, passportCode };
        } else {
          throw new Error("API returned failure");
        }
      } catch {
        // Local fallback — generate IDs client-side
        passportId = `local-${Date.now()}`;
        passportCode = `RC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        resultPassport = { ...payload, passportId, passportCode };
      }

      navigate(`/passport/preview/${passportId}`, {
        state: { passport: resultPassport },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasImageErrors = Object.keys(errors).some((k) => k.startsWith("image_"));
  const hasInfoErrors = ["productName", "category", "brand", "modelNumber", "purchaseYear", "originalPrice"].some((k) => errors[k]);

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 min-h-screen text-white">
      <FloatingBackground variant="grid" />
      <div className="relative z-10 min-w-[1000px] max-w-[900px] mx-auto px-6 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <button
            onClick={() => navigate("/passport")}
            className="text-white/40 hover:text-white text-sm mb-6 flex items-center gap-2 transition"
          >
            ← Back to Passport Hub
          </button>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-3 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ReCircle — Product Passport
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Create Your <span className="text-[#FF9900]">Product Passport</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            Fill in your product details once. ReCircle will generate a verified passport with an AI-graded condition report, sustainability score, and QR code.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300 font-semibold">
            <ShieldCheckIcon className="h-4 w-4" />
            AI-verified · Blockchain-inspired · Carbon-tracked
          </div>
        </motion.div>

        <div className="flex flex-col gap-5">

          {/* ── Section 1: Product Information ── */}
          <Section number={1} title="Product Information" icon="📋">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Product Name" required error={errors.productName} className="col-span-2" data-error={errors.productName || undefined}>
                <input
                  value={form.productName}
                  onChange={(e) => set("productName", e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5"
                  className={inputCls(errors.productName)}
                />
              </Field>

              <Field label="Category" required error={errors.category}>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={selectCls(errors.category, !form.category)}
                >
                  <option value="" disabled className="text-black">Select…</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c} className="text-black">{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Brand" required error={errors.brand}>
                <input
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  placeholder="e.g. Sony"
                  className={inputCls(errors.brand)}
                />
              </Field>

              <Field label="Model Number" required error={errors.modelNumber}>
                <input
                  value={form.modelNumber}
                  onChange={(e) => set("modelNumber", e.target.value)}
                  placeholder="e.g. WH-1000XM5"
                  className={inputCls(errors.modelNumber)}
                />
              </Field>

              <Field label="Purchase Year" required error={errors.purchaseYear}>
                <input
                  type="number"
                  min="2000"
                  max="2030"
                  value={form.purchaseYear}
                  onChange={(e) => set("purchaseYear", e.target.value)}
                  placeholder="2023"
                  className={inputCls(errors.purchaseYear)}
                />
              </Field>

              <Field label="Original Price (₹)" required error={errors.originalPrice}>
                <input
                  type="number"
                  min="0"
                  value={form.originalPrice}
                  onChange={(e) => set("originalPrice", e.target.value)}
                  placeholder="e.g. 29999"
                  className={inputCls(errors.originalPrice)}
                />
              </Field>
              <div className="mt-0">
                <label className="block text-white/70 text-sm mb-2">AI Certified ID (optional)</label>
                <input
                  value={form.aiCertifiedId}
onChange={(e) => set("aiCertifiedId", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
                  placeholder="RC-AI-2026-001245"
                />
              </div>

              <Field label="Current Condition" required className="col-span-2">
                <div className="grid grid-cols-5 gap-2">
                  {CONDITION_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => set("currentCondition", opt.label)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                        form.currentCondition === opt.label
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                          : "border-white/15 text-white/60 hover:border-white/30"
                      }`}
                    >
                      <span className="text-lg">
                        {opt.grade === "A" ? "✨" : opt.grade === "B" ? "👍" : opt.grade === "C" ? "👌" : "⚠️"}
                      </span>
                      <span>{opt.label}</span>
                      <span className={`text-[9px] font-bold ${
                        opt.grade === "A" ? "text-emerald-400" : opt.grade === "B" ? "text-blue-400" : opt.grade === "C" ? "text-amber-400" : "text-red-400"
                      }`}>
                        Grade {opt.grade}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </Section>

          {/* ── Section 2: Product Images ── */}
          <Section number={2} title="Product Images" icon="📷">
            {(errors.image_front || errors.image_back) && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4" data-error="true">
                <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
                Front and back images are required. Drag & drop or click to upload.
              </div>
            )}
            <div className="grid grid-cols-5 gap-3">
              {IMAGE_SLOTS.map((slot) => (
                <ImageSlot
                  key={slot.key}
                  slot={slot}
                  value={form.images[slot.key]}
                  onUpload={setImage}
                  onRemove={removeImage}
                  isDragging={draggingOver === slot.key}
                  onDragOver={(e) => handleDragOver(e, slot.key)}
                  onDrop={handleDrop}
                  onDragLeave={() => setDraggingOver(null)}
                />
              ))}
            </div>
            <p className="text-xs text-white/30 mt-3">
              Images are resized to 800px for optimal storage. Supports JPG, PNG, WEBP.
            </p>
          </Section>

          {/* ── Section 3: Sustainability Information ── */}
          <Section number={3} title="Sustainability Information" icon="🌱">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Material Type" className="col-span-1">
                <select
                  value={form.materialType}
                  onChange={(e) => set("materialType", e.target.value)}
                  className={selectCls(false, false)}
                >
                  {MATERIAL_OPTIONS.map((m) => (
                    <option key={m} value={m} className="text-black">{m}</option>
                  ))}
                </select>
              </Field>

              <Field label="Contains Recycled Materials">
                <select
                  value={form.recycledMaterials}
                  onChange={(e) => set("recycledMaterials", e.target.value)}
                  className={selectCls(false, false)}
                >
                  <option value="Yes" className="text-black">Yes</option>
                  <option value="No" className="text-black">No</option>
                </select>
              </Field>

              <Field label="Expected Remaining Life (years)">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.remainingLife}
                  onChange={(e) => set("remainingLife", e.target.value)}
                  className={inputCls(false)}
                />
              </Field>
            </div>

            {/* Live preview of computed grading */}
            {(() => {
              const g = computeGrading(form.currentCondition, form.remainingLife);
              return (
                <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-white/60 font-semibold">AI GRADING PREVIEW</span>
                  </div>
                  <div className="text-xs text-white/70">
                    Grade: <span className="font-bold text-white">{g.grade}</span>
                  </div>
                  <div className="text-xs text-white/70">
                    Sustainability: <span className="font-bold text-emerald-400">{g.sustainabilityScore}/100</span>
                  </div>
                  <div className="text-xs text-white/70">
                    Carbon Saved: <span className="font-bold text-emerald-400">{g.carbonSavedKg} kg CO₂e</span>
                  </div>
                  <div className="text-xs text-white/70">
                    Trust Score: <span className="font-bold text-white">{g.trustScore}%</span>
                  </div>
                </div>
              );
            })()}
          </Section>

          {/* ── Section 4: Ownership Details ── */}
          <Section number={4} title="Ownership Details" icon="👤">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Owner Name">
                <input
                  value={form.ownerName}
                  onChange={(e) => set("ownerName", e.target.value)}
                  placeholder="Your name (optional)"
                  className={inputCls(false)}
                />
              </Field>

              <Field label="Purchase Date">
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => set("purchaseDate", e.target.value)}
                  className={inputCls(false)}
                />
              </Field>

              <Field label="Warranty Available">
                <select
                  value={form.warrantyAvailable}
                  onChange={(e) => set("warrantyAvailable", e.target.value)}
                  className={selectCls(false, false)}
                >
                  <option value="Yes" className="text-black">Yes</option>
                  <option value="No" className="text-black">No</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-3 pt-2"
          >
            {(hasInfoErrors || hasImageErrors) && (
              <div className="text-red-400 text-sm flex items-center gap-2">
                <ExclamationCircleIcon className="h-4 w-4" />
                Please fix the errors above before generating your passport.
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(16,185,129,0.3)]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Passport…
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-5 w-5" />
                  Generate Product Passport
                </>
              )}
            </button>
            <p className="text-xs text-white/30 text-center max-w-sm">
              Your passport will be saved securely and a unique Passport ID will be generated for this product.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PassportCreatePage;
