import { PageHeader, FeatureCard, CarbonSavingIndicator } from "../components";

const SustainabilityPage = () => {
  return (
    <div className="bg-amazonclone-background min-h-screen">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6">
        <PageHeader
          title="Sustainability"
          subtitle="ReCircle is part of Amazon's commitment to reducing waste and carbon emissions across the marketplace."
        />
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded p-6 shadow text-center">
            <div className="text-3xl xl:text-4xl font-bold text-green-700">
              1.2M
            </div>
            <div className="text-sm xl:text-base text-gray-600 mt-1">
              kg CO₂ saved this year
            </div>
          </div>
          <div className="bg-white rounded p-6 shadow text-center">
            <div className="text-3xl xl:text-4xl font-bold text-green-700">
              480K
            </div>
            <div className="text-sm xl:text-base text-gray-600 mt-1">
              items diverted from landfill
            </div>
          </div>
          <div className="bg-white rounded p-6 shadow text-center">
            <div className="text-3xl xl:text-4xl font-bold text-green-700">
              92%
            </div>
            <div className="text-sm xl:text-base text-gray-600 mt-1">
              of returns successfully re-routed
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard
            icon="♻️"
            title="Circular by design"
            description="Items that can't be resold are repaired, recycled, or donated instead of discarded."
          />
          <FeatureCard
            icon="📊"
            title="Track your impact"
            description="Look for the carbon saving indicator on eligible products to see your personal contribution."
          />
        </div>
        <div className="mt-6">
          <CarbonSavingIndicator kg={2.3} />
        </div>
      </div>
    </div>
  );
};

export default SustainabilityPage;
