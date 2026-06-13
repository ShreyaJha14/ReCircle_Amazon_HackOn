import { PageHeader, FeatureCard, TrustScoreBadge } from "../components";

const AIGradingPage = () => {
  return (
    <div className="bg-amazonclone-background min-h-screen">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6">
        <PageHeader
          title="AI Grading"
          subtitle="ReCircle uses computer vision and machine learning to automatically assess the condition of returned and resale items."
        />
        <div className="grid grid-cols-3 gap-4 mb-6">
          <FeatureCard
            icon="📸"
            title="Photo-based assessment"
            description="When an item is returned, our AI analyses uploaded photos to detect wear, damage, and missing parts."
          />
          <FeatureCard
            icon="⭐"
            title="Condition scoring"
            description="Items are scored from 'Like New' to 'Heavily Used', helping set fair resale pricing automatically."
          />
          <FeatureCard
            icon="✅"
            title="AI Verified badge"
            description="Items that pass grading display an AI Verified badge so buyers can shop pre-owned with confidence."
          />
        </div>
        <div className="bg-white rounded p-6 shadow">
          <div className="text-lg xl:text-xl font-semibold mb-2">
            Example grading result
          </div>
          <div className="text-sm xl:text-base text-gray-600 mb-2">
            Wireless Headphones — minor cosmetic wear, fully functional
          </div>
          <TrustScoreBadge score={94} />
        </div>
      </div>
    </div>
  );
};

export default AIGradingPage;
