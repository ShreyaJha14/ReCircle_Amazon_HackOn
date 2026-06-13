import { Link, NavLink } from "react-router-dom";
import { ArrowLeftIcon, ClockIcon } from "@heroicons/react/24/outline";
import GlowButton from "./GlowButton";

const reCircleLinks = [
  { label: "Overview", to: "/recircle" },
  { label: "AI Grading", to: "/ai-grading" },
  { label: "Smart Routing", to: "/routing" },
  { label: "Product Passport", to: "/passport" },
  { label: "Return Prevention", to: "/prevention" },
  { label: "Sustainability", to: "/sustainability" },
];

const ReCircleNavBar = () => {
  return (
    <header className="min-w-[1000px] sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 text-white">
      <div className="min-w-[1000px] max-w-[1500px] m-auto flex items-center justify-between px-6 py-3 gap-4">
        {/* Left: back to Amazon + ReCircle brand */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs xl:text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Amazon
          </Link>
          <div className="w-px h-5 bg-white/15" />
          <Link to="/recircle" className="flex items-center gap-2">
            <span className="text-xl">♻️</span>
            <span className="text-lg xl:text-xl font-bold">
              Re<span className="text-[#FF9900]">Circle</span>
            </span>
          </Link>
        </div>

        {/* Middle: section nav links */}
        <nav className="flex items-center gap-1 xl:gap-2 flex-wrap">
          {reCircleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/30"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Today's Returned Products */}
        <Link to="/recircle/returns-today">
          <GlowButton variant="primary" className="!px-4 !py-2 whitespace-nowrap">
            <ClockIcon className="h-4 w-4" />
            Today's Returns
          </GlowButton>
        </Link>
      </div>
    </header>
  );
};

export default ReCircleNavBar;
