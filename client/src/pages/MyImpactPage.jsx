import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUser, logout } from "../redux/authSlice";
import { getMe, redeemGreenCredits } from "../utils/CallApi";

const OUTCOME_BARS = [
  { label: "Resold (P2P)",     count: "3 items", pct: 60, color: "bg-green-600" },
  { label: "Amazon Renewed",   count: "2 items", pct: 40, color: "bg-[#007185]" },
  { label: "Donated",          count: "1 item",  pct: 20, color: "bg-[#E47911]" },
  { label: "Recycled",         count: "1 item",  pct: 20, color: "bg-gray-500"  },
];

const MILESTONES = [
  { icon: "🌱", label: "First Resell",   sub: "Earned!",    done: true  },
  { icon: "♻️", label: "Zero Waste Week", sub: "Earned!",    done: true  },
  { icon: "📦", label: "10 Items Saved",  sub: "3 more to go", done: false },
  { icon: "🏆", label: "50kg CO₂ Hero",   sub: "31.6kg to go", done: false },
];

/* ── Redeem Modal ── */
const RedeemModal = ({ credits, discountINR, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/60" onClick={onClose} />
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      <div className="bg-green-700 px-8 pt-8 pb-6 text-center text-white">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold mb-1">Credits Redeemed!</h2>
        <p className="text-green-100 text-sm">Congratulations on going green</p>
      </div>
      <div className="px-8 py-6 text-center">
        <div className="bg-[#E3F3FF] border border-[#a8d4ef] rounded-lg p-4 mb-5">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>{credits} Green Credits</strong> have been applied to your account.
            You will receive a <strong>₹{discountINR} discount</strong> on your{" "}
            <strong>next Amazon purchase</strong> — automatically deducted at checkout.
          </p>
        </div>
        <div className="flex items-center gap-3 justify-center mb-5 text-sm text-gray-600">
          <span className="flex items-center gap-1"><span className="text-green-600 font-bold text-base">✓</span>Discount saved</span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1"><span className="text-green-600 font-bold text-base">✓</span>Valid 90 days</span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1"><span className="text-green-600 font-bold text-base">✓</span>Auto-applied</span>
        </div>
        <button onClick={onClose} className="w-full bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold py-3 rounded transition-colors text-sm">
          Continue Shopping
        </button>
        <p className="text-xs text-gray-400 mt-3">Credits applied · Check your account wallet for details</p>
      </div>
    </div>
  </div>
);

/* ── Login prompt ── */
const LoginPrompt = ({ onLogin }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-10 text-center max-w-md mx-auto mt-16">
    <div className="text-5xl mb-4">🔒</div>
    <h2 className="text-xl font-bold text-[#111] mb-2">Sign in to view your impact</h2>
    <p className="text-sm text-gray-600 mb-6">
      Track your Green Credits, CO₂ savings, and sustainability milestones.
    </p>
    <button
      onClick={onLogin}
      className="bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold px-8 py-3 rounded text-sm transition-colors"
    >
      Sign in / Create account
    </button>
  </div>
);

const MyImpactPage = ({ onShowAuth }) => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const auth      = useSelector((s) => s.auth);
  const user      = auth?.user;
  const token     = auth?.token;

  const [credits,     setCredits]     = useState(user?.greenCredits ?? 0);
  const [showRedeem,  setShowRedeem]  = useState(false);
  const [discountINR, setDiscountINR] = useState(0);
  const [loading,     setLoading]     = useState(false);

  // Refresh user data from backend
  useEffect(() => {
    if (!token) return;
    getMe(token)
      .then((d) => {
        dispatch(updateUser(d.user));
        setCredits(d.user.greenCredits ?? 0);
      })
      .catch(() => {});
  }, [token]);

  const handleRedeem = async () => {
    if (!credits || loading) return;
    setLoading(true);
    try {
      const data = await redeemGreenCredits(user.id, credits, token);
      setDiscountINR(data.discountINR ?? Math.floor(credits * 0.1));
      setCredits(data.greenCredits ?? 0);
      dispatch(updateUser({ ...user, greenCredits: data.greenCredits ?? 0 }));
      setShowRedeem(true);
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to redeem credits");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { value: "18.4 kg", label: "CO₂ prevented this year",      icon: "🌿", color: "text-green-700"  },
    { value: "7",       label: "Items diverted from landfill",  icon: "♻️", color: "text-green-700"  },
    { value: "240 L",   label: "Water saved",                   icon: "💧", color: "text-[#007185]" },
    { value: "₹6,400",  label: "Earned from returns",           icon: "💰", color: "text-[#B12704]" },
  ];

  return (
    <div className="bg-[#f3f3f3] font-sans min-h-screen">
      {showRedeem && (
        <RedeemModal
          credits={credits === 0 ? (user?.greenCredits ?? 0) : credits}
          discountINR={discountINR}
          onClose={() => setShowRedeem(false)}
        />
      )}

      <div className="min-w-[1000px] max-w-[1500px] mx-auto">
        {/* ── HERO ── */}
        <div className="relative h-[260px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200&auto=format&fit=crop&q=70"
            alt="My Impact"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131921]/90 via-[#131921]/60 to-transparent" />
          <div className="absolute inset-0 flex items-center px-16 justify-between">
            <div className="text-white">
              <span className="inline-block bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-4">
                My ReCircle Dashboard
              </span>
              <h1 className="text-4xl font-bold leading-tight mb-2">Your Sustainability Impact</h1>
              <p className="text-gray-300 text-sm">Every ReCircle action keeps products out of landfill and reduces your carbon footprint.</p>
            </div>
            {user && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-8 py-5 text-center text-white">
                <div className="text-4xl font-black text-green-400">{credits}</div>
                <div className="text-sm font-bold mt-1">Green Credits</div>
                <div className="text-xs text-gray-300 mt-0.5">≈ ₹{Math.floor(credits * 0.1)} discount</div>
              </div>
            )}
          </div>
        </div>

        {/* ── BREADCRUMB ── */}
        <div className="bg-[#232F3E] px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Account</span>
            <span className="text-gray-600 mx-1">›</span>
            <span className="text-[#FF9900] text-xs font-bold">My Sustainability Impact</span>
          </div>
          <Link to="/sustainability" className="text-[#FF9900] text-xs font-bold hover:underline">
            ← Back to Sustainability Hub
          </Link>
        </div>

        <div className="p-6 space-y-6">
          {!user ? (
            <LoginPrompt onLogin={() => navigate("/")} />
          ) : (
            <>
              {/* ── STAT CARDS ── */}
              <div className="grid grid-cols-4 gap-4">
                {statCards.map((s) => (
                  <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-5 text-center hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-gray-500 mt-2 leading-snug">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* ── OUTCOME BARS + GREEN CREDITS ── */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-base font-bold text-[#111] mb-5 pb-2 border-b border-gray-100">Items by Outcome</h2>
                  <div className="space-y-5">
                    {OUTCOME_BARS.map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-700">{bar.label}</span>
                          <span className="font-bold text-gray-800">{bar.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div className={`${bar.color} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${bar.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── GREEN CREDITS CARD ── */}
                <div className="bg-[#131921] rounded-lg p-6 flex flex-col items-center justify-center text-center text-white border border-gray-700">
                  <div className="text-5xl mb-2">🌱</div>
                  <div className="text-5xl font-black text-green-400 mb-1">{credits}</div>
                  <p className="text-base font-bold text-white mb-1">
                    {credits > 0 ? "Green Credits" : "Credits Redeemed"}
                  </p>
                  <p className="text-xs text-gray-400 mb-1 leading-relaxed">
                    1 credit = ₹0.10 discount
                  </p>
                  {credits > 0 && (
                    <p className="text-xs text-green-400 font-semibold mb-4">
                      ≈ ₹{Math.floor(credits * 0.1)} off next purchase
                    </p>
                  )}
                  {credits === 0 && (
                    <p className="text-xs text-gray-500 mb-4">Sell or buy resell items to earn credits</p>
                  )}
                  <button
                    onClick={handleRedeem}
                    disabled={credits === 0 || loading}
                    className={`w-full py-3 rounded text-sm font-bold ${
                      credits === 0
                        ? "bg-gray-600 cursor-not-allowed text-gray-400"
                        : "bg-[#FF9900] hover:bg-[#E47911] text-[#111]"
                    }`}
                  >
                    {loading ? "Processing…" : credits === 0 ? "Redeemed ✓" : `Redeem ₹${Math.floor(credits * 0.1)} Discount`}
                  </button>
                  <p className="text-xs text-gray-500 mt-3">Earn credits by reselling & buying pre-owned</p>
                </div>
              </div>

              {/* ── HOW TO EARN ── */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-base font-bold text-[#111] mb-4 pb-2 border-b border-gray-100">💡 How to Earn Green Credits</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: "🛒", label: "Sell a pre-owned item",      credits: "+100 credits" },
                    { icon: "📦", label: "Buy from ReCircle Resell",    credits: "+50 credits"  },
                    { icon: "♻️", label: "Return & donate an item",     credits: "+75 credits"  },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4 bg-green-50 rounded-lg p-4 border border-green-100">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.label}</p>
                        <p className="text-green-700 font-black text-sm">{item.credits}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── MILESTONES ── */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-base font-bold text-[#111] mb-4 pb-2 border-b border-gray-100">🏅 Sustainability Milestones</h2>
                <div className="grid grid-cols-4 gap-4">
                  {MILESTONES.map((m) => (
                    <div
                      key={m.label}
                      className={`rounded-lg p-5 text-center border transition-all duration-200 hover:shadow-sm hover:-translate-y-1 ${
                        m.done ? "bg-[#e8f5ee] border-green-200" : "bg-gray-50 border-gray-200 opacity-60"
                      }`}
                    >
                      <div className="text-2xl mb-2">{m.icon}</div>
                      <h3 className="font-bold text-sm text-[#111] mb-1">{m.label}</h3>
                      <p className={`text-xs ${m.done ? "text-green-700 font-semibold" : "text-gray-500"}`}>{m.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── BOTTOM BANNER ── */}
              <div className="bg-[#131921] rounded-lg overflow-hidden border border-gray-700">
                <div className="grid grid-cols-2 items-center">
                  <div className="p-10 text-white">
                    <span className="inline-block bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
                      Amazon ReCircle
                    </span>
                    <h2 className="text-3xl font-bold mb-3">Go Green with Amazon</h2>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      Every product you resell, refurbish, donate, or recycle contributes to a cleaner and more sustainable future.
                    </p>
                    <button
                      onClick={handleRedeem}
                      disabled={credits === 0}
                      className="bg-[#FF9900] hover:bg-[#E47911] disabled:bg-gray-600 disabled:cursor-not-allowed text-[#111] font-bold px-6 py-2.5 rounded text-sm transition-colors"
                    >
                      {credits > 0 ? `Redeem My ${credits} Credits →` : "No credits to redeem"}
                    </button>
                  </div>
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center text-white">
                      <div className="text-8xl font-black text-green-400 leading-none">{credits}</div>
                      <div className="text-xl font-bold mt-2">Green Credits</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {credits > 0 ? `≈ ₹${Math.floor(credits * 0.1)} discount` : "Earn by recycling & reselling"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyImpactPage;
