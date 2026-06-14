import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const STATS = [
  { value: 1.2, decimals: 1, suffix: "M", unit: "kg", label: "CO₂ saved this year", icon: "🌍" },
  { value: 480, decimals: 0, suffix: "K", unit: "", label: "Items diverted from landfill", icon: "♻️" },
  { value: 92, decimals: 0, suffix: "%", unit: "", label: "Returns successfully re-routed", icon: "📦" },
  { value: 840, decimals: 0, suffix: "Cr", unit: "", prefix: "₹", label: "Value recovered for customers", icon: "💰" },
];

const STORIES = [
  {
    img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=60",
    name: "Priya",
    headline: "Saved 15 kg CO₂",
    body: "By reselling her old laptop through ReCircle instead of discarding it.",
    tag: "Electronics",
  },
  {
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60",
    name: "Rahul",
    headline: "Diverted 5 items from landfill",
    body: "Donated a baby monitor and 4 outgrown appliances, earning 600 Green Credits.",
    tag: "Donations",
  },
  {
    img: "https://images.unsplash.com/photo-1558694924-78bf8ba63670?w=600&auto=format&fit=crop&q=60",
    name: "Anita",
    headline: "Earned ₹12,000 from returns",
    body: "Sold 3 returned smartphones via P2P Resell in under 48 hours each.",
    tag: "P2P Resell",
  },
];

const ARTICLES = [
  {
    img: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=60",
    title: "How Refurbished Electronics Reduce Waste",
    body: "Learn how extending product lifecycles helps reduce e-waste and lowers environmental impact.",
  },
  {
    img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=60",
    title: "Understanding the Circular Economy",
    body: "Discover how products can be reused, repaired, refurbished, and recycled instead of discarded.",
  },
  {
    img: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&auto=format&fit=crop&q=60",
    title: "Amazon's Journey to Net-Zero Carbon",
    body: "Explore Amazon's sustainability goals and how ReCircle contributes to reducing emissions.",
  },
];

const MONTHLY_CO2 = [40, 55, 48, 62, 70, 65, 78, 85, 80, 92, 88, 96];

// Hook: trigger once when element scrolls into view (with mount fallback)
const useInView = (options = { threshold: 0.1 }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(el);

    // Fallback: element may already be in view on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true);
      observer.disconnect();
    }

    return () => observer.disconnect();
  }, []);

  return [ref, inView];
};

// Count-up number component
const CountUp = ({ to, decimals = 0, duration = 1500, start, prefix = "", suffix = "" }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime = null;
    let rafId;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(to * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [start, to, duration]);

  return (
    <span>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const SustainabilityPage = () => {
  const navigate = useNavigate();
  const [statsRef, statsInView] = useInView({ threshold: 0.3 });
  const [chartRef, chartInView] = useInView({ threshold: 0.3 });

  return (
    <div className="bg-[#f3f3f3] font-sans min-h-screen">
      <div className="min-w-[1000px] max-w-[1500px] m-auto">

        {/* ── HERO ── */}
        <div className="relative h-[340px] overflow-hidden">
          <img
            src="https://plus.unsplash.com/premium_photo-1668671072689-c30ac7379611?w=1200&auto=format&fit=crop&q=70"
            alt="Amazon Sustainability"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131921]/90 via-[#131921]/60 to-transparent" />
          <div className="absolute inset-0 flex items-center px-10">
            <div className="text-white max-w-xl">
              <span className="inline-block bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-4">
                Amazon ReCircle
              </span>
              <h1 className="text-5xl font-bold leading-tight mb-4">
                Give Products<br />
                <span className="text-green-400">A Second Life</span>
              </h1>
              <p className="text-gray-300 text-base">
                Every refurbished, reused, and recycled product contributes to a greener future.
              </p>
            </div>
          </div>
        </div>

        {/* ── BREADCRUMB BAR ── */}
        <div className="bg-[#232F3E] px-8 py-2 flex items-center gap-2">
          <span className="text-gray-400 text-xs">You are here:</span>
          <span className="text-[#FF9900] text-xs font-bold">Sustainability Hub</span>
          <span className="text-gray-600 mx-1">›</span>
          <span className="text-white text-xs">ReCircle Impact</span>
        </div>

        <div className="p-6 space-y-8">

          {/* ── STAT CARDS ── */}
          <div ref={statsRef} className="grid grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-5 text-center hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-black text-green-700">
                  <CountUp
                    to={s.value}
                    decimals={s.decimals}
                    start={statsInView}
                    prefix={s.prefix || ""}
                    suffix={s.suffix || ""}
                  />
                  {s.unit && <span className="text-xl ml-1">{s.unit}</span>}
                </div>
                <div className="text-xs text-gray-500 mt-2 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── PERSONAL IMPACT CTA ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center text-white text-3xl flex-shrink-0">
                🌱
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111] mb-1">
                  Track Your Personal Sustainability Journey
                </h2>
                <p className="text-sm text-gray-600">
                  See how your choices contribute to a greener future. View your CO₂ savings, green credits, and milestone achievements.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/my-impact")}
              className="bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold px-8 py-3 rounded text-sm transition-colors whitespace-nowrap flex-shrink-0"
            >
              View My Impact →
            </button>
          </div>

          {/* ── CARBON SAVINGS CHART ── */}
          <div ref={chartRef} className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-[#111] pb-2 border-b border-gray-300 mb-4">
              Carbon Saved — Monthly Trend
            </h2>
            <div className="flex items-end gap-2" style={{ height: "160px" }}>
              {MONTHLY_CO2.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-green-700 to-green-400"
                    style={{
                      height: chartInView ? `${v}%` : "2%",
                      minHeight: "4px",
                      transition: `height 800ms cubic-bezier(0.22, 1, 0.36, 1)`,
                      transitionDelay: `${i * 80}ms`,
                    }}
                  />
                  <span className="text-[9px] text-gray-400">
                    {["J","F","M","A","M","J","J","A","S","O","N","D"][i]}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Jan – Dec · trending up 140% YoY</p>
          </div>

          {/* ── CUSTOMER STORIES ── */}
          <div>
            <h2 className="text-lg font-bold text-[#111] pb-2 border-b border-gray-300 mb-4">
              Customer Impact Stories
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {STORIES.map((story) => (
                <div key={story.name} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 group cursor-pointer">
                  <div className="relative h-44 overflow-hidden">
                    <img src={story.img} alt={story.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-3 left-3 bg-green-700 text-white text-[10px] font-bold px-2 py-1 rounded">
                      {story.tag}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{story.name}</p>
                    <h3 className="font-bold text-sm text-[#111] mb-2">{story.headline}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{story.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── ARTICLES ── */}
          <div>
            <h2 className="text-lg font-bold text-[#111] pb-2 border-b border-gray-300 mb-4">
              Our Sustainability Journey
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {ARTICLES.map((a) => (
                <div key={a.title} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
                  <div className="h-44 overflow-hidden">
                    <img src={a.img} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-[#111] mb-2 leading-snug">{a.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{a.body}</p>
                    <span className="text-[#007185] text-xs font-bold hover:underline">Read More →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── BOTTOM BANNER ── */}
          <div className="relative rounded-lg overflow-hidden h-48"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1558694924-78bf8ba63670?w=1200&auto=format&fit=crop&q=60)`,
              backgroundSize: "cover", backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-[#131921]/80" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-8">
              <h2 className="text-2xl font-bold mb-2">Together We Can Build A Greener Amazon</h2>
              <p className="text-gray-300 text-sm max-w-xl">Every return has a second life. Every customer can make a difference.</p>
              <button
                onClick={() => navigate("/my-impact")}
                className="mt-5 bg-[#FF9900] hover:bg-[#E47911] text-[#111] font-bold px-8 py-2 rounded text-sm transition-colors"
              >
                See Your Impact →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SustainabilityPage;
