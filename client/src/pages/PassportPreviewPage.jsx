import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getPassport } from "../utils/CallApi";
import { FloatingBackground, GradientBorderCard } from "../components";

const PassportPreviewPage = () => {
  const { passportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [passport, setPassport] = useState(location.state?.passport || null);
  const [loading, setLoading] = useState(!passport);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [repairDone, setRepairDone] = useState("No");
  const [repairDetails, setRepairDetails] = useState("");
  const [suggestedHistory, setSuggestedHistory] = useState([]);

  useEffect(() => {
    if (passport) return;
    async function loadPassport() {
      try {
        setLoading(true);
        const response = await getPassport(passportId);
        if (response?.success) {
          setPassport(response.data.passport);
        } else {
          setError("Could not load passport details.");
        }
      } catch (err) {
        setError("Could not load passport details.");
      } finally {
        setLoading(false);
      }
    }
    loadPassport();
  }, [passportId, passport]);

  // initialize local UI state when passport is loaded
  useEffect(() => {
    if (!passport) return;
    setImagePreview(passport.image || passport.imageUrl || null);
    setRepairDone(passport.repairHistory && passport.repairHistory.length ? "Yes" : "No");
    setRepairDetails(
      passport.repairLog && passport.repairLog.length ? (passport.repairLog[0].result || "") : ""
    );
    // basic recommended history entries based on available passport data
    const recs = [];
    if (passport.purchaseDate) recs.push({ event: `Purchased on ${new Date(passport.purchaseDate).toLocaleDateString()}`, ownedAt: passport.purchaseDate });
    if (passport.verifiedAt) recs.push({ event: `AI verified on ${new Date(passport.verifiedAt).toLocaleDateString()}`, ownedAt: passport.verifiedAt });
    if (!recs.length) {
      recs.push({ event: "Purchased new", ownedAt: new Date().toISOString() });
      recs.push({ event: "ReCircle inspection", ownedAt: new Date().toISOString() });
    }
    setSuggestedHistory(recs);
  }, [passport]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-4 border-emerald-400 border-t-transparent rounded-full h-14 w-14 mx-auto mb-4" />
          <div>Loading passport details…</div>
        </div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-xl bg-slate-900 rounded-3xl border border-white/10 p-8 text-center">
          <div className="text-xl font-semibold mb-4">Passport preview unavailable</div>
          <p className="text-white/70 mb-6">{error || "No passport data could be loaded."}</p>
          <button
            onClick={() => navigate("/passport")}
            className="rounded-2xl bg-emerald-500 px-6 py-3 text-white font-semibold hover:bg-emerald-600 transition"
          >
            Back to Passport Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen relative">
      <FloatingBackground variant="grid" />
      <div className="min-w-[1000px] max-w-[1500px] mx-auto p-6">
        <div className="relative z-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-semibold mb-2">
                Product Passport Created
              </div>
              <h1 className="text-4xl font-bold text-white">ReCircle Passport Preview</h1>
              <p className="text-white/60 mt-2 max-w-2xl">
                This page shows the passport created for your product, including the generated passport card and verified details.
              </p>
            </div>
            <button
              onClick={() => navigate("/recircle/buy")}
              className="rounded-2xl bg-emerald-500 px-6 py-3 text-white font-semibold hover:bg-emerald-600 transition"
            >
              View on Buy Page
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="space-y-6">
              <GradientBorderCard>
                <div className="p-8 bg-slate-950/95 rounded-3xl border border-white/10">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-semibold">ReCircle passport</div>
                      <div className="text-3xl font-bold text-white">{passport.productName || "Unknown product"}</div>
                      <div className="text-sm text-white/60">{passport.category || "General"}</div>
                    </div>
                    <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-4 text-right">
                      <div className="text-xs uppercase tracking-[0.3em] text-white/50">Passport ID</div>
                      <div className="text-xl font-semibold text-white mt-2">{passport.passportCode || passport.passportId}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 mt-8">
                    <div className="rounded-3xl bg-slate-900/80 p-5 border border-white/10">
                      <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 mb-3">Verified status</div>
                      <div className="space-y-3 text-sm text-white/75">
                        <div>AI inspected: <span className="font-semibold text-white">Yes</span></div>
                        <div>Carbon tracked: <span className="font-semibold text-white">Yes</span></div>
                        <div>Blockchain-inspired record: <span className="font-semibold text-white">Yes</span></div>
                      </div>
                    </div>
                    <div className="rounded-3xl bg-slate-900/80 p-5 border border-white/10">
                      <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 mb-3">Sustainability</div>
                      <div className="text-sm text-white/75 space-y-3">
                        <div>Sustainability score: <span className="font-semibold text-white">{passport.sustainabilityScore || "—"}/100</span></div>
                        <div>Carbon saved: <span className="font-semibold text-white">{passport.carbonSavedKg || "—"} kg CO₂e</span></div>
                        <div>Recyclability: <span className="font-semibold text-white">{passport.recyclability || "—"}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </GradientBorderCard>

              <GradientBorderCard>
                <div className="p-8 bg-slate-950/95 rounded-3xl border border-white/10">
                  <div className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-semibold mb-3">Passport details</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 text-sm text-white/70">
                      <div><span className="text-white font-semibold">Brand:</span> {passport.brand || "—"}</div>
                      <div><span className="text-white font-semibold">Model:</span> {passport.modelNumber || "—"}</div>
                      <div><span className="text-white font-semibold">Manufacturing year:</span> {passport.manufacturingYear || "—"}</div>
                    </div>
                    <div className="space-y-3 text-sm text-white/70">
                      <div><span className="text-white font-semibold">Grade:</span> {passport.grade || "—"}</div>
                      <div><span className="text-white font-semibold">Trust score:</span> {passport.trustScore || "—"}</div>
                      <div><span className="text-white font-semibold">Warranty:</span> {passport.warrantyStatus || "—"}</div>
                    </div>
                  </div>
                </div>
              </GradientBorderCard>

              <GradientBorderCard>
                <div className="p-8 bg-slate-950/95 rounded-3xl border border-white/10">
                  <div className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-semibold mb-3">Sustainability narrative</div>
                  <p className="text-sm text-white/70 leading-7">{passport.sustainabilityNarrative || "This product has been verified by ReCircle and is ready for resale with trusted transparency."}</p>
                </div>
              </GradientBorderCard>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2.5rem] border border-amber-300/10 bg-indigo-950/95 p-8 shadow-[0_24px_80px_rgba(30,64,175,0.12)]">
                <div className="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold mb-4">Passport card</div>
                <div className="rounded-[2rem] bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 p-6 text-gray-100 border border-amber-200/10">
                  <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] items-start">
                    <div className="space-y-4">
                      <div className="text-2xl font-bold">{passport.productName || "Product"}</div>
                      <div className="text-sm text-white/50">{passport.category || "Category"}</div>
                      <div className="text-xs uppercase tracking-[0.25em] text-emerald-300 font-semibold">AI Certified ID</div>
                      <div className="text-sm text-white/80">{passport.aiCertifiedId || "Not assigned"}</div>
                      <div className="rounded-3xl bg-white/5 p-4 border border-white/10 text-sm text-white/70">
                        <div className="text-xs uppercase tracking-[0.25em] text-emerald-300 mb-2">Passport code</div>
                        <div className="font-semibold text-white">{passport.passportCode || passport.passportId}</div>
                      </div>
                    </div>
                    <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-4">
                      {(passport.image || passport.qrCodeUrl) ? (
                          <img
                            src={passport.image || passport.qrCodeUrl}
                            alt="Passport image"
                            className="w-full rounded-3xl border border-white/10 bg-white/5 object-contain"
                          />
                        ) : (
                        <div className="flex h-[220px] items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 text-xs text-white/50">
                          QR code will appear here
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 text-sm text-white/75">
                    <div className="flex items-center justify-between rounded-3xl bg-white/5 p-3 border border-white/10">
                      <span className="text-xs uppercase tracking-[0.25em] text-emerald-300">Carbon saved</span>
                      <span className="font-semibold text-white">{passport.carbonSavedKg || "—"} kg</span>
                    </div>
                    <div className="flex items-center justify-between rounded-3xl bg-white/5 p-3 border border-white/10">
                      <span className="text-xs uppercase tracking-[0.25em] text-emerald-300">Score</span>
                      <span className="font-semibold text-white">{passport.sustainabilityScore || "—"}/100</span>
                    </div>
                    <div className="flex items-center justify-between rounded-3xl bg-white/5 p-3 border border-white/10">
                      <span className="text-xs uppercase tracking-[0.25em] text-emerald-300">Status</span>
                      <span className="font-semibold text-white">Resale ready</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button onClick={() => window.print()} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 font-semibold">Download PDF</button>
                  <button onClick={() => navigate('/passport/create')} className="rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 font-semibold">List product</button>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-3">Ownership details</div>
                <div className="space-y-3 text-sm text-white/70">
                  {passport.ownershipHistory?.slice(-3).map((event, index) => (
                    <div key={index}>
                      <div className="text-white/90">{event.event}</div>
                      <div className="text-white/50 text-xs">{new Date(event.ownedAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassportPreviewPage;
