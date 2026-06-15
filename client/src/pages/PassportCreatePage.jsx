import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PageHero,
  FloatingBackground,
  GlassCard,
  GradientBorderCard,
} from "../components";
import { createPassport } from "../utils/CallApi";

const conditionOptions = [
  { label: "Like New", grade: "A", trustScore: 94 },
  { label: "Excellent", grade: "A", trustScore: 88 },
  { label: "Good", grade: "B", trustScore: 78 },
  { label: "Fair", grade: "C", trustScore: 62 },
  { label: "Poor", grade: "D", trustScore: 45 },
];

const sustainabilityOptions = [
  "Plastics",
  "Metals",
  "Glass",
  "Textiles",
  "Electronics",
  "Mixed materials",
];

const PassportCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    productName: "",
    category: "",
    brand: "",
    modelNumber: "",
    purchaseYear: "",
    originalPrice: "",
    currentCondition: "Good",
    materialType: "Electronics",
    recycledMaterials: "Yes",
    remainingLife: "2",
    ownerName: "",
    purchaseDate: "",
    warrantyAvailable: "Yes",
    image: null,
    aiCertifiedId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleChange("image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.productName.trim()) nextErrors.productName = "Product name is required";
    if (!form.category) nextErrors.category = "Category is required";
    if (!form.brand.trim()) nextErrors.brand = "Brand is required";
    if (!form.modelNumber.trim()) nextErrors.modelNumber = "Model number is required";
    if (!form.purchaseYear.trim()) nextErrors.purchaseYear = "Purchase year is required";
    if (!form.originalPrice.trim()) nextErrors.originalPrice = "Original price is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const getGradeData = () => {
    const match = conditionOptions.find((opt) => opt.label === form.currentCondition);
    return match || conditionOptions[2];
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const gradeData = getGradeData();
      const payload = {
        productName: form.productName,
        category: form.category,
        brand: form.brand,
        modelNumber: form.modelNumber,
        manufacturingYear: form.purchaseYear,
        originalPrice: form.originalPrice,
        origin: "User-supplied",
        materials: `${form.materialType} (${form.recycledMaterials === "Yes" ? "Recycled content" : "Standard material"})`,
        recyclability:
          form.recycledMaterials === "Yes"
            ? "Recyclable through most municipal programs"
            : "Check local recycling guidelines",
        grade: gradeData.grade,
        trustScore: gradeData.trustScore,
        defects: [],
        repairHistory: "None — first resale",
        sustainabilityScore: Math.min(100, gradeData.trustScore + 10),
        carbonSavedKg: Math.max(3, Math.min(15, Number(form.remainingLife) * 2 + 5)),
        warrantyStatus: form.warrantyAvailable === "Yes" ? "ReCircle 90-day guarantee" : "Sold as-is",
        aiCertifiedId: form.aiCertifiedId || null,
        image: form.image || null,
      };

      // merge any draft ownership/repair data saved earlier
      try {
        const draft = JSON.parse(localStorage.getItem("passportDraft") || "{}");
        if (draft.ownershipHistory) payload.ownershipHistory = draft.ownershipHistory;
        if (draft.repairHistory) payload.repairHistory = draft.repairHistory;
        if (draft.image && !payload.image) payload.image = draft.image;
      } catch (err) {
        // ignore parse errors
      }

      const response = await createPassport(payload);
      if (response?.success) {
        const passport = response.passport || {
          ...payload,
          passportId: response.passportId,
          passportCode: response.passportCode,
          qrCodeUrl: response.qrCodeUrl,
          passportUrl: response.passportUrl,
        };
        // clear any saved draft now that we've created the passport
        try { localStorage.removeItem("passportDraft"); } catch (e) {}
        navigate(`/passport/preview/${response.passportId}`, { state: { passport } });
      } else {
        // Backend returned failure — generate a local passport preview instead
        const localPassport = {
          ...payload,
          passportId: `local-${Date.now()}`,
          passportCode: `LP-${Math.random().toString(36).slice(2,9).toUpperCase()}`,
          qrCodeUrl: payload.image || null,
        };
        try { localStorage.removeItem("passportDraft"); } catch (e) {}
        navigate(`/passport/preview/${localPassport.passportId}`, { state: { passport: localPassport } });
      }
    } catch (error) {
      // Network or server error: generate a local passport preview
      const gradeData = getGradeData();
      const payload = {
        productName: form.productName,
        category: form.category,
        brand: form.brand,
        modelNumber: form.modelNumber,
        manufacturingYear: form.purchaseYear,
        originalPrice: form.originalPrice,
        origin: "User-supplied",
        materials: `${form.materialType} (${form.recycledMaterials === "Yes" ? "Recycled content" : "Standard material"})`,
        recyclability:
          form.recycledMaterials === "Yes"
            ? "Recyclable through most municipal programs"
            : "Check local recycling guidelines",
        grade: gradeData.grade,
        trustScore: gradeData.trustScore,
        defects: [],
        repairHistory: "None — first resale",
        sustainabilityScore: Math.min(100, gradeData.trustScore + 10),
        carbonSavedKg: Math.max(3, Math.min(15, Number(form.remainingLife) * 2 + 5)),
        warrantyStatus: form.warrantyAvailable === "Yes" ? "ReCircle 90-day guarantee" : "Sold as-is",
        aiCertifiedId: form.aiCertifiedId || null,
        image: form.image || null,
      };
      const localPassport = {
        ...payload,
        passportId: `local-${Date.now()}`,
        passportCode: `LP-${Math.random().toString(36).slice(2,9).toUpperCase()}`,
        qrCodeUrl: payload.image || null,
      };
      try { localStorage.removeItem("passportDraft"); } catch (e) {}
      navigate(`/passport/preview/${localPassport.passportId}`, { state: { passport: localPassport } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <FloatingBackground variant="grid" />
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6 relative">
        <div className="relative z-10">
          <PageHero
            eyebrow="Passport Builder"
            title="Create Your Product Passport"
            subtitle="Enter the product details once, and ReCircle will generate a certified passport card for resale transparency."
            visual={
              <GradientBorderCard>
                <div className="p-6">
                  <div className="text-sm text-emerald-400 uppercase tracking-[0.2em] font-semibold mb-3">
                    ReCircle passport builder
                  </div>
                  <div className="text-white text-lg font-semibold mb-2">Start by answering the first three sections.</div>
                  <div className="text-sm text-white/60">
                    After creating the passport, you will be taken to a preview page with the generated passport card.
                  </div>
                </div>
              </GradientBorderCard>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
            <GlassCard className="p-6">
              <div className="text-lg font-semibold text-white mb-4">Product Information</div>
              <label className="block text-white/70 text-sm mb-2">Product Name *</label>
              <input
                value={form.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none mb-3"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Category *</label>
                  <input
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Brand *</label>
                  <input
                    value={form.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Model Number *</label>
                  <input
                    value={form.modelNumber}
                    onChange={(e) => handleChange("modelNumber", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Purchase Year *</label>
                  <input
                    type="number"
                    value={form.purchaseYear}
                    onChange={(e) => handleChange("purchaseYear", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-white/70 text-sm mb-2">Original Price *</label>
                <input
                  type="number"
                  value={form.originalPrice}
                  onChange={(e) => handleChange("originalPrice", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
                />
              </div>
              <div className="mt-3">
                <label className="block text-white/70 text-sm mb-2">AI Certified ID (optional)</label>
                <input
                  value={form.aiCertifiedId}
                  onChange={(e) => handleChange("aiCertifiedId", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
                  placeholder="RC-AI-2026-001245"
                />
              </div>
              {errors.productName || errors.category || errors.brand || errors.modelNumber || errors.purchaseYear || errors.originalPrice ? (
                <div className="mt-4 text-xs text-rose-300 space-y-1">
                  {Object.values(errors).map(
                    (message) => message && <div key={message}>{message}</div>
                  )}
                </div>
              ) : null}
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-lg font-semibold text-white mb-4">Product Condition</div>
              <label className="block text-white/70 text-sm mb-2">Current Condition *</label>
              <select
                value={form.currentCondition}
                onChange={(e) => handleChange("currentCondition", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
              >
                {conditionOptions.map((option) => (
                  <option key={option.label} value={option.label} className="bg-slate-950">
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="mt-6">
                <label className="block text-white/70 text-sm mb-2">Material Type</label>
                <select
                  value={form.materialType}
                  onChange={(e) => handleChange("materialType", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
                >
                  {sustainabilityOptions.map((type) => (
                    <option key={type} value={type} className="bg-slate-950">
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Recycled Materials?</label>
                  <select
                    value={form.recycledMaterials}
                    onChange={(e) => handleChange("recycledMaterials", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Remaining Life (years)</label>
                  <input
                    type="number"
                    value={form.remainingLife}
                    onChange={(e) => handleChange("remainingLife", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-lg font-semibold text-white mb-4">Ownership Details</div>
              <label className="block text-white/70 text-sm mb-2">Upload product image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-3" />
              {form.image && (
                <div className="mb-3">
                  <img src={form.image} alt="product" className="w-full rounded-lg border border-white/10 object-contain" />
                </div>
              )}
              <label className="block text-white/70 text-sm mb-2">Owner Name</label>
              <input
                value={form.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none mb-3"
              />
              <label className="block text-white/70 text-sm mb-2">Purchase Date</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => handleChange("purchaseDate", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none mb-3"
              />
              <label className="block text-white/70 text-sm mb-2">Warranty Available?</label>
              <select
                value={form.warrantyAvailable}
                onChange={(e) => handleChange("warrantyAvailable", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-emerald-400 outline-none"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </GlassCard>
          </div>

          <GlassCard className="p-6 mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <div className="text-lg font-semibold text-white">Passport Preview</div>
                <div className="text-sm text-white/60">The card below will be generated after creation.</div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Generating passport…" : "Create Passport for ReCircle"}
              </button>
            </div>

            {errors.submit ? (
              <div className="mb-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {errors.submit}
              </div>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/80 rounded-3xl border border-white/10 p-4 flex flex-col">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-3">Product Information</div>
                {form.image ? (
                  <div className="mb-3">
                    <img src={form.image} alt="product" className="w-full h-40 object-contain rounded-lg border border-white/10 bg-white/5" />
                  </div>
                ) : (
                  <div className="mb-3 h-40 flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/5 text-white/50">Product image will appear here</div>
                )}
                <div className="text-white/70 text-sm leading-7">
                  <div>
                    <strong>Name:</strong> {form.productName || "—"}
                  </div>
                  <div>
                    <strong>Category:</strong> {form.category || "—"}
                  </div>
                  <div>
                    <strong>Brand:</strong> {form.brand || "—"}
                  </div>
                  <div>
                    <strong>Model:</strong> {form.modelNumber || "—"}
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/80 rounded-3xl border border-white/10 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-3">Condition Summary</div>
                <div className="text-white/70 text-sm leading-7">
                  <div>
                    <strong>Condition:</strong> {form.currentCondition}
                  </div>
                  <div>
                    <strong>Purchase Year:</strong> {form.purchaseYear || "—"}
                  </div>
                  <div>
                    <strong>Original Price:</strong> {form.originalPrice ? `₹${form.originalPrice}` : "—"}
                  </div>
                  <div>
                    <strong>Warranty:</strong> {form.warrantyAvailable}
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/80 rounded-3xl border border-white/10 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-3">Sustainability</div>
                <div className="text-white/70 text-sm leading-7">
                  <div>
                    <strong>Material:</strong> {form.materialType}
                  </div>
                  <div>
                    <strong>Recycled:</strong> {form.recycledMaterials}
                  </div>
                  <div>
                    <strong>Remaining Life:</strong> {form.remainingLife} year(s)
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default PassportCreatePage;
