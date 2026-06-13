import { Link } from "react-router-dom";

const ReCircleHeroBanner = ({ onOpenZone }) => {
  return (
    <div className="relative h-[400px] bg-amazonclone-light_blue flex items-center text-white overflow-hidden">
      <div className="ml-12 z-10 max-w-[600px]">
        <div className="text-sm xl:text-base font-semibold text-green-400 mb-2">
          A new Amazon initiative
        </div>
        <div className="text-3xl xl:text-5xl font-bold mb-3">ReCircle</div>
        <div className="text-base xl:text-lg mb-6">
          Smarter returns, AI-verified quality, and a more sustainable Amazon
          — powered by ReCircle.
        </div>
        <div className="flex gap-3">
          <button onClick={onOpenZone} className="btn">
            Explore ReCircle Zone
          </button>
          <Link to={"/sustainability"}>
            <button className="border border-white text-white px-4 py-2 rounded-md text-sm xl:text-base font-semibold hover:bg-white hover:text-amazonclone-light_blue transition">
              View Impact
            </button>
          </Link>
        </div>
      </div>
      {/* Decorative graphic */}
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-br from-green-900 to-green-700 opacity-40 flex items-center justify-center">
        <span className="text-[180px]">♻️</span>
      </div>
    </div>
  );
};

export default ReCircleHeroBanner;
