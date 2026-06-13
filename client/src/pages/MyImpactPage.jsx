import { useState } from "react";
import { Link } from "react-router-dom";

const STAT_CARDS = [
  {
    value: "18.4 kg",
    label: "CO₂ prevented this year",
    icon: "🌿",
    img: "https://plus.unsplash.com/premium_photo-1661880571980-6b9cbcc25b75?q=80&w=2012&auto=format&fit=crop",
  },
  {
    value: "7",
    label: "Items diverted from landfill",
    icon: "♻️",
    img: "https://media.istockphoto.com/id/1330052283/photo/plant-growing-with-bank-note-on-soil.webp?a=1&b=1&s=612x612&w=0&k=20&c=g3nyUSk-aOEU5sg78iGrmQji33eGEnWHXIE9Jq8sM58=",
  },
  {
    value: "240 L",
    label: "Water saved",
    icon: "💧",
    img: "https://images.unsplash.com/photo-1558694924-78bf8ba63670?w=600&auto=format&fit=crop&q=60",
  },
  {
    value: "₹6,400",
    label: "Earned from returns",
    icon: "💰",
    img: "https://images.unsplash.com/photo-1633158829875-e5316a358c6f?w=600&auto=format&fit=crop&q=60",
  },
];

const OUTCOME_BARS = [
  { label: "Resold (P2P)", count: "3 items", pct: 60, color: "bg-green-600" },
  { label: "Amazon Renewed", count: "2 items", pct: 40, color: "bg-[#007185]" },
  { label: "Donated", count: "1 item", pct: 20, color: "bg-[#E47911]" },
  { label: "Recycled", count: "1 item", pct: 20, color: "bg-gray-500" },
];

const MILESTONES = [
  { icon: "🌱", label: "First Resell", sub: "Earned!", done: true },
  { icon: "♻️", label: "Zero Waste Week", sub: "Earned!", done: true },
  { icon: "📦", label: "10 Items Saved", sub: "3 more to go", done: false },
  { icon: "🏆", label: "50kg CO₂ Hero", sub: "31.6kg to go", done: false },
];

/* ── Redeem Confirmation Modal ── */
const RedeemModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* backdrop */}
    <div className="absolute inset-0 bg-black/60" onClick={onClose} />
    {/* card */}
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      {/* green top bar */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 px-8 pt-8 pb-6 text-center text-white">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold mb-1">Credits Redeemed!</h2>
        <p className="text-green-100 text-sm">Congratulations on going green</p>
      </div>

      {/* body */}
      <div className="px-8 py-6 text-center">
        <div className="bg-[#E3F3FF] border border-[#a8d4ef] rounded-lg p-4 mb-5">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>420 Green Credits</strong> have been applied to your account.
            You will receive a discount on your{" "}
            <strong>next Amazon purchase</strong> — the savings will be
            automatically deducted at checkout.
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center mb-5 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="text-green-600 font-bold text-base">✓</span>
            Discount saved
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <span className="text-green-600 font-bold text-base">✓</span>
            Valid for 90 days
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <span className="text-green-600 font-bold text-base">✓</span>
            Auto-applied
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold py-3 rounded transition-colors text-sm"
        >
          Continue Shopping
        </button>
        <p className="text-xs text-gray-400 mt-3">
          Credits applied · Check your account wallet for details
        </p>
      </div>
    </div>
  </div>
);

const MyImpactPage = () => {
  const [showRedeem, setShowRedeem] = useState(false);

  return (
    <div className="bg-[#f3f3f3] font-sans min-h-screen">
      {showRedeem && <RedeemModal onClose={() => setShowRedeem(false)} />}

      <div className="min-w-[1000px] max-w-[1500px] mx-auto">

        {/* ── HERO HEADER ── */}
        <div className="bg-gradient-to-br from-[#131921] via-[#1a2e1d] to-[#0a1f2e] px-12 py-10">
          <div className="flex items-end justify-between">
            <div>
              <span className="inline-block bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-4">
                My ReCircle Dashboard
              </span>
              <h1 className="text-4xl font-bold text-white mb-2">
                Your Sustainability Impact
              </h1>
              <p className="text-gray-400 text-sm">
                Every ReCircle action you take keeps products out of landfill
                and reduces your carbon footprint.
              </p>
            </div>
            <Link
              to="/sustainability"
              className="text-[#FF9900] text-sm font-bold hover:underline whitespace-nowrap"
            >
              ← Back to Sustainability Hub
            </Link>
          </div>
        </div>

        {/* ── AMAZON SUB-NAV ── */}
        <div className="bg-[#232F3E] px-8 py-2 flex items-center gap-2">
          <span className="text-gray-400 text-xs">Account</span>
          <span className="text-gray-600 mx-1">›</span>
          <span className="text-[#FF9900] text-xs font-bold">My Sustainability Impact</span>
        </div>

        <div className="p-6 space-y-6">

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-4 gap-4">
            {STAT_CARDS.map((s) => (
              <div key={s.label} className="relative rounded-lg overflow-hidden h-36 group">
                <img
                  src={s.img}
                  alt={s.label}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#131921]/75" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-black">{s.value}</div>
                  <div className="text-xs text-gray-300 leading-snug">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── OUTCOME BARS + GREEN CREDITS ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Outcome bars */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-bold text-[#111] mb-5 pb-2 border-b border-gray-100">
                Items by Outcome
              </h2>
              <div className="space-y-5">
                {OUTCOME_BARS.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">{bar.label}</span>
                      <span className="font-bold text-gray-800">{bar.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${bar.color} h-2.5 rounded-full transition-all duration-700`}
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Green Credits */}
            <div className="bg-gradient-to-br from-[#1a3d1a] to-[#0a2a0a] rounded-lg p-6 flex flex-col items-center justify-center text-center text-white">
              <div className="text-5xl mb-2">🌱</div>
              <div className="text-5xl font-black text-green-400 mb-1">420</div>
              <p className="text-base font-bold text-white mb-1">Green Credits</p>
              <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                Redeem for discounts on your next Amazon purchase
              </p>
              <button
                onClick={() => setShowRedeem(true)}
                className="w-full bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold py-3 rounded text-sm transition-colors"
              >
                Redeem Credits
              </button>
            </div>
          </div>

          {/* ── MILESTONES ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-bold text-[#111] mb-4 pb-2 border-b border-gray-100">
              🏅 Sustainability Milestones
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {MILESTONES.map((m) => (
                <div
                  key={m.label}
                  className={`rounded-lg p-5 text-center border transition-shadow hover:shadow-sm ${
                    m.done
                      ? "bg-[#e8f5ee] border-green-200"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <h3 className="font-bold text-sm text-[#111] mb-1">{m.label}</h3>
                  <p className={`text-xs ${m.done ? "text-green-700 font-semibold" : "text-gray-500"}`}>
                    {m.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── BOTTOM BANNER ── */}
          <div className="bg-[#131921] rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 items-center">
              <div className="p-10 text-white">
                <span className="inline-block bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
                  Amazon ReCircle
                </span>
                <h2 className="text-3xl font-bold mb-3">
                  Go Green with Amazon
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Every product you resell, refurbish, donate, or recycle
                  contributes to a cleaner and more sustainable future.
                </p>
                <button
                  onClick={() => setShowRedeem(true)}
                  className="bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold px-6 py-2.5 rounded text-sm transition-colors"
                >
                  Redeem My Credits →
                </button>
              </div>
              <div className="flex items-center justify-center p-8 bg-gradient-to-br from-green-900/40 to-transparent">
                <div className="text-center text-white">
                  <div className="text-8xl font-black text-green-400 leading-none">420</div>
                  <div className="text-xl font-bold mt-2">Green Credits</div>
                  <div className="text-xs text-gray-400 mt-1">Ready to redeem</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyImpactPage;
