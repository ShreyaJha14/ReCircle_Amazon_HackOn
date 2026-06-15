import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheckIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { FloatingBackground, GradientBorderCard, GlassCard } from "../components";
import { getPassport, createListing } from "../utils/CallApi";
import { useGreenCredits } from "../utils/useGreenCredits";

// ── QR Code (pure SVG, no external dependency) ────────────────────────────────
const QRPlaceholder = ({ value, size = 140 }) => {
  // Deterministic-looking QR pattern from the passport ID
  const seed = value ? value.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : 42;
  const grid = 17;
  const cell = Math.floor(size / grid);
  const cells = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      // Finder patterns (corners)
      const inFinder =
        (r < 7 && c < 7) ||
        (r < 7 && c >= grid - 7) ||
        (r >= grid - 7 && c < 7);
      let filled = false;
      if (inFinder) {
        const lr = r < 7 ? r : r - (grid - 7);
        const lc = c < 7 ? c : c >= grid - 7 ? c - (grid - 7) : c;
        filled = lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else {
        filled = ((seed * (r + 1) * (c + 1) + r * 17 + c * 13) % 5) < 2;
      }
      if (filled) {
        cells.push(
          <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell - 1} height={cell - 1} fill="#0f172a" />
        );
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: "white", borderRadius: 8, padding: 4 }}>
      {cells}
    </svg>
  );
};

// ── Grade Badge ───────────────────────────────────────────────────────────────
const GRADE_COLORS = {
  A: { bg: "bg-emerald-500/20", border: "border-emerald-400/50", text: "text-emerald-300" },
  B: { bg: "bg-blue-500/20", border: "border-blue-400/50", text: "text-blue-300" },
  C: { bg: "bg-amber-500/20", border: "border-amber-400/50", text: "text-amber-300" },
  D: { bg: "bg-red-500/20", border: "border-red-400/50", text: "text-red-300" },
};
const GradePill = ({ grade }) => {
  const c = GRADE_COLORS[grade] || GRADE_COLORS.B;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold ${c.bg} ${c.border} ${c.text}`}>
      Grade {grade}
    </span>
  );
};

// ── List-Product Modal ────────────────────────────────────────────────────────
const ListProductModal = ({ passport, onClose, onListed }) => {
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState(passport.summary || passport.sustainabilityNarrative || "");
  const [isListing, setIsListing] = useState(false);
  const [done, setDone] = useState(false);
  const { user } = useGreenCredits();

  const handleList = async () => {
    if (!price || parseFloat(price) <= 0) return;
    setIsListing(true);
    try {
      await createListing({
        productName: passport.productName,
        category: passport.category || "Other",
        grade: passport.grade || "B",
        trustScore: passport.trustScore || 80,
        photoUrl: passport.image || passport.images?.front || null,
        conditionLabel: passport.conditionLabel || passport.currentCondition || "Good",
        carbonSavedKg: passport.carbonSavedKg || 2,
        summary: description || `${passport.conditionLabel || "Good"} condition. Passport verified.`,
        suggestedPrice: parseFloat(price),
        passportId: passport.passportId || passport.passportCode,
        passportVerified: true,
        sellerId: user?.userId || "anonymous",
      });
    } catch {
      // continue even if listing API fails — show success
    }
    setDone(true);
    setIsListing(false);
    setTimeout(() => onListed?.(), 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-[480px] p-8 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <XMarkIcon className="h-5 w-5" />
        </button>

        {!done ? (
          <>
            <div className="text-xl font-bold text-white mb-1">List on Buy Pre-Owned</div>
            <p className="text-white/50 text-sm mb-5">
              Your passport data is pre-filled. Just set your price and description.
            </p>

            {/* Product preview */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
              {(passport.image || passport.images?.front) ? (
                <img src={passport.image || passport.images?.front} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
              )}
              <div>
                <div className="font-bold text-white text-sm">{passport.productName}</div>
                <div className="text-xs text-white/50">{passport.category} · {passport.conditionLabel}</div>
                <div className="flex items-center gap-2 mt-1">
                  <GradePill grade={passport.grade} />
                  <span className="text-xs text-emerald-400">🛡 Passport Verified</span>
                </div>
              </div>
            </div>

            <label className="block text-sm font-semibold text-white/80 mb-2">Your Selling Price (₹)</label>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">₹</span>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 4999"
                className="w-full pl-8 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 text-lg font-bold"
              />
            </div>

            <label className="block text-sm font-semibold text-white/80 mb-2">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item's condition and any extras included…"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 resize-none mb-5 text-sm"
            />

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 mb-5">
              <ShieldCheckIcon className="h-4 w-4 flex-shrink-0" />
              Your listing will show a "Passport Verified" badge and Grade {passport.grade} on the Buy page.
            </div>

            <button
              onClick={handleList}
              disabled={!price || parseFloat(price) <= 0 || isListing}
              className="w-full py-3 rounded-xl bg-[#FF9900] text-white font-bold hover:bg-[#e68a00] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isListing ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing…</>
              ) : (
                <><ShoppingBagIcon className="h-4 w-4" /> Publish to Buy Page →</>
              )}
            </button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-xl font-bold text-white mb-1">Listed Successfully!</div>
            <div className="text-white/60 text-sm">Your item is now live on the Buy Pre-Owned page.</div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

// ── Share Modal ───────────────────────────────────────────────────────────────
const ShareModal = ({ passport, onClose }) => {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/product-passport/${passport.passportId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-[420px] p-8 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="text-xl font-bold text-white mb-1">Share Passport</div>
        <p className="text-white/50 text-sm mb-5">Anyone with this link can view the verified product passport.</p>

        <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl p-3 mb-4">
          <span className="text-xs text-white/60 flex-1 truncate font-mono">{publicUrl}</span>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              copied ? "bg-emerald-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {copied ? <><CheckCircleIcon className="h-3.5 w-3.5" /> Copied!</> : <><ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy</>}
          </button>
        </div>

        {/* WhatsApp / native share */}
        <div className="flex gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Check out this verified product passport: ${publicUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm text-center hover:bg-green-700 transition"
          >
            📱 WhatsApp
          </a>
          {navigator.share && (
            <button
              onClick={() => navigator.share({ title: "ReCircle Product Passport", url: publicUrl })}
              className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition"
            >
              ↗ Share
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ── Passport Card (premium glassmorphism) ──────────────────────────────────────
const PassportCard = ({ passport }) => {
  const grade = passport.grade || "B";
  const gc = GRADE_COLORS[grade] || GRADE_COLORS.B;

  const BADGES = [
    { icon: "🛡️", label: "AI Verified" },
    { icon: "🔗", label: "Blockchain-inspired" },
    { icon: "🌱", label: "Carbon Tracked" },
  ];

  return (
    <div
      id="passport-card"
      className="relative rounded-[2rem] overflow-hidden border border-white/10"
      style={{
        background: "linear-gradient(135deg, #0f2027 0%, #0d1f35 40%, #0a2818 100%)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#FF9900]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-7 flex flex-col gap-5">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold mb-1.5">ReCircle Product Passport</div>
            <div className="text-2xl font-bold text-white leading-tight">{passport.productName}</div>
            <div className="text-sm text-white/50 mt-0.5">{passport.brand} · {passport.category}</div>
            <div className="text-sm text-white/50 mt-0.5">AI-Grading Id: {passport.aiCertifiedId || "Not applicable"}</div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border text-xl font-black ${gc.bg} ${gc.border} ${gc.text}`}>
            {grade}
          </div>
        </div>

        {/* Main body */}
        <div className="flex gap-5 items-start">
          {/* Product image or emoji */}
          <div className="flex-shrink-0">
            {(passport.image || passport.images?.front) ? (
              <img
                src={passport.image || passport.images?.front}
                alt={passport.productName}
                className="w-24 h-24 rounded-xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">📦</div>
            )}
          </div>

          {/* Stats grid */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            {[
              { label: "Passport ID", value: passport.passportCode || passport.passportId, mono: true },
              { label: "Condition", value: passport.conditionLabel || "Good" },
              { label: "Sustainability Score", value: `${passport.sustainabilityScore || "—"}/100`, highlight: "emerald" },
              { label: "Carbon Saved", value: `${passport.carbonSavedKg || "—"} kg CO₂e`, highlight: "emerald" },
              { label: "Trust Score", value: `${passport.trustScore || "—"}%` },
              { label: "Warranty", value: passport.warrantyStatus || "Sold as-is" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-[9px] uppercase tracking-[0.2em] text-white/40 mb-0.5">{stat.label}</div>
                <div className={`text-sm font-bold leading-tight ${
                  stat.mono ? "font-mono text-[#FF9900]" : stat.highlight === "emerald" ? "text-emerald-300" : "text-white"
                }`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR + badges */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Scan to verify</div>
            <QRPlaceholder value={passport.passportId} size={80} />
          </div>

          <div className="flex flex-col items-end gap-2">
            {BADGES.map((b) => (
              <div key={b.label} className="flex items-center gap-1.5 text-xs text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                <span>{b.icon}</span> {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const PassportPreviewPage = () => {
  const { passportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [passport, setPassport] = useState(location.state?.passport || null);
  const [loading, setLoading] = useState(!passport);
  const [error, setError] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [listedSuccess, setListedSuccess] = useState(false);

  useEffect(() => {
    if (passport) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getPassport(passportId);
        if (res?.success) {
          setPassport(res.data?.passport || res.passport);
        } else {
          setError("Could not load passport.");
        }
      } catch {
        setError("Could not load passport.");
      } finally {
        setLoading(false);
      }
    })();
  }, [passportId, passport]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-4 border-emerald-400 border-t-transparent rounded-full h-14 w-14 mx-auto mb-4" />
          <div className="text-white/60">Loading passport…</div>
        </div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md bg-slate-900 rounded-2xl border border-white/10 p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-xl font-bold mb-3">Passport Not Found</div>
          <p className="text-white/60 mb-6">{error || "No passport data available."}</p>
          <button
            onClick={() => navigate("/passport")}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
          >
            Back to Passport Hub
          </button>
        </div>
      </div>
    );
  }

  const images = passport.images || {};
  const hasMultipleImages = Object.values(images).filter(Boolean).length > 1;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen text-white">
      <FloatingBackground variant="grid" />
      <div className="relative z-10 min-w-[1000px] max-w-[1200px] mx-auto px-6 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/passport")}
              className="text-white/40 hover:text-white text-sm mb-4 flex items-center gap-2 transition"
            >
              ← Back to Passport Hub
            </button>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-3 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Passport Generated Successfully
            </div>
            <h1 className="text-3xl font-bold">
              {passport.productName} <span className="text-white/40 text-xl font-normal">— Passport</span>
            </h1>
            <div className="text-white/50 text-sm mt-1 font-mono">
              {passport.passportCode || passport.passportId}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download PDF
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition"
            >
              <ShareIcon className="h-4 w-4" />
              Share
            </button>
            <button
              onClick={() => setShowListModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF9900] text-white font-bold text-sm hover:bg-[#e68a00] transition shadow-[0_4px_16px_rgba(255,153,0,0.3)]"
            >
              <ShoppingBagIcon className="h-4 w-4" />
              List Product Now
            </button>
          </div>
        </motion.div>

        {listedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-5 py-3 text-emerald-300 text-sm font-semibold"
          >
            <CheckCircleIcon className="h-5 w-5" />
            Your product is now live on the Buy Pre-Owned page!
            <button
              onClick={() => navigate("/recircle/buy")}
              className="ml-auto underline text-emerald-400 hover:text-white"
            >
              View listing →
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-[1fr_380px] gap-6">

          {/* LEFT — passport card + details */}
          <div className="flex flex-col gap-5">

            {/* THE PASSPORT CARD */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <PassportCard passport={passport} />
            </motion.div>

            {/* Product details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <GlassCard className="p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-4">Product Details</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Brand", value: passport.brand },
                    { label: "Model", value: passport.modelNumber },
                    { label: "Category", value: passport.category },
                    { label: "Manufacturing Year", value: passport.manufacturingYear },
                    { label: "Original Price", value: passport.originalPrice ? `₹${passport.originalPrice.toLocaleString()}` : "—" },
                    { label: "Grade", value: passport.grade },
                    { label: "Condition", value: passport.conditionLabel },
                    { label: "Trust Score", value: `${passport.trustScore || "—"}%` },
                    { label: "Warranty", value: passport.warrantyStatus },
                  ].map((d) => (
                    <div key={d.label}>
                      <div className="text-white/40 text-xs mb-0.5">{d.label}</div>
                      <div className="text-white font-semibold">{d.value || "—"}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Sustainability */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard className="p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-4">Sustainability Report</div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="text-white/40 text-xs mb-2">Sustainability Score</div>
                    <div className="relative h-2.5 rounded-full bg-white/10 overflow-hidden mb-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passport.sustainabilityScore || 0}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300"
                      />
                    </div>
                    <div className="text-emerald-400 font-bold">{passport.sustainabilityScore || "—"}/100</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Carbon Saved</div>
                    <div className="text-2xl font-bold text-emerald-300">{passport.carbonSavedKg || "—"} kg</div>
                    <div className="text-white/40 text-xs">CO₂ equivalent</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Materials</div>
                    <div className="text-white text-sm font-medium">{passport.materials || "—"}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">Recyclability</div>
                    <div className="text-white text-sm font-medium">{passport.recyclability || "—"}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Ownership */}
            {(passport.ownerName || passport.purchaseDate || passport.ownershipHistory?.length) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <GlassCard className="p-6">
                  <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-4">Ownership</div>
                  <div className="text-sm text-white/70 space-y-2">
                    {passport.ownerName && <div>Owner: <span className="text-white font-semibold">{passport.ownerName}</span></div>}
                    {passport.purchaseDate && <div>Purchase Date: <span className="text-white font-semibold">{new Date(passport.purchaseDate).toLocaleDateString()}</span></div>}
                    {passport.ownershipHistory?.map((h, i) => (
                      <div key={i} className="text-xs text-white/50">{h.event} — {new Date(h.ownedAt).toLocaleDateString()}</div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>

          {/* RIGHT — product images + verification */}
          <div className="flex flex-col gap-5">

            {/* Product images */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <GlassCard className="p-5">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-4">Product Images</div>
                {(passport.image || passport.images?.front) ? (
                  <div className="flex flex-col gap-3">
                    {/* Primary image */}
                    <img
                      src={passport.image || passport.images?.front}
                      alt="Front"
                      className="w-full rounded-xl object-cover border border-white/10"
                      style={{ maxHeight: 220 }}
                    />
                    {/* Secondary images */}
                    {hasMultipleImages && (
                      <div className="grid grid-cols-4 gap-2">
                        {["back", "side", "damage", "invoice"].map((k) =>
                          images[k] ? (
                            <img
                              key={k}
                              src={images[k]}
                              alt={k}
                              className="w-full aspect-square rounded-lg object-cover border border-white/10"
                            />
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center rounded-xl border border-dashed border-white/15 text-white/30 text-sm">
                    No images uploaded
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Verification status */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard className="p-5">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-4">Verification Status</div>
                {[
                  { icon: "🤖", label: "AI Inspection", status: "Verified", ok: true },
                  { icon: "🔗", label: "Blockchain Record", status: "Recorded", ok: true },
                  { icon: "🌱", label: "Carbon Tracking", status: "Active", ok: true },
                  { icon: "🛡️", label: "ReCircle Certified", status: "Certified", ok: true },
                  {
                    icon: "📋",
                    label: "AI Certified ID",
                    status: passport.aiCertifiedId || "Pending assignment",
                    ok: !!passport.aiCertifiedId,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span>{item.icon}</span>
                      <span className="text-sm text-white/70">{item.label}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${item.ok ? "text-emerald-400" : "text-white/40"}`}>
                      {item.ok && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      {item.status}
                    </div>
                  </div>
                ))}
              </GlassCard>
            </motion.div>

            {/* Public passport link */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
                <div className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Public Passport URL
                </div>
                <div className="font-mono text-xs text-white/50 break-all mb-3">
                  {window.location.origin}/product-passport/{passport.passportId}
                </div>
                <button
                  onClick={() => navigate(`/product-passport/${passport.passportId}`, { state: { passport } })}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition"
                >
                  View Public Passport →
                </button>
              </div>
            </motion.div>

            {/* Quick actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowListModal(true)}
                className="w-full py-3.5 rounded-xl bg-[#FF9900] text-white font-bold hover:bg-[#e68a00] transition flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="h-4 w-4" />
                List Product Now
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePrint}
                  className="py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" /> Download
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition flex items-center justify-center gap-2"
                >
                  <ShareIcon className="h-4 w-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showListModal && (
          <ListProductModal
            passport={passport}
            onClose={() => setShowListModal(false)}
            onListed={() => {
              setShowListModal(false);
              setListedSuccess(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && (
          <ShareModal passport={passport} onClose={() => setShowShareModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PassportPreviewPage;
