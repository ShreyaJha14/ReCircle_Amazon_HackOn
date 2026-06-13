import { PageHeader, FeatureCard } from "../components";

const PreventionPage = () => {
  return (
    <div className="bg-amazonclone-background min-h-screen">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6">
        <PageHeader
          title="Return Prevention"
          subtitle="ReCircle helps stop unnecessary returns before they happen, saving time, money, and emissions."
        />
        <div className="grid grid-cols-3 gap-4">
          <FeatureCard
            icon="📏"
            title="Smart sizing"
            description="AI-powered size recommendations based on past orders and reviews reduce fit-related returns."
          />
          <FeatureCard
            icon="🖼️"
            title="Richer listings"
            description="Enhanced photos, videos, and detailed specs help customers know exactly what they're buying."
          />
          <FeatureCard
            icon="💬"
            title="Pre-purchase Q&A"
            description="AI-assisted answers to common questions help avoid mismatched expectations."
          />
        </div>
        <div className="mt-6 bg-white rounded p-6 shadow">
          <div className="text-lg xl:text-xl font-semibold mb-2">
            Impact so far
          </div>
          <div className="text-sm xl:text-base text-gray-600">
            Return Prevention features have helped reduce avoidable returns
            across participating categories, cutting unnecessary shipping and
            packaging waste.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreventionPage;
