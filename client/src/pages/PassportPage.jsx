import { PageHeader, FeatureCard } from "../components";

const PassportPage = () => {
  return (
    <div className="bg-amazonclone-background min-h-screen">
      <div className="min-w-[1000px] max-w-[1500px] m-auto p-6">
        <PageHeader
          title="Product Passport"
          subtitle="A digital record that travels with each ReCircle product, giving buyers full transparency."
        />
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard
            icon="🌍"
            title="Origin"
            description="See where a product was manufactured and how far it has travelled."
          />
          <FeatureCard
            icon="🧵"
            title="Materials"
            description="View a breakdown of the materials used, including recycled content."
          />
          <FeatureCard
            icon="🔧"
            title="Repair history"
            description="Check whether an item has been repaired or refurbished, and what was done."
          />
          <FeatureCard
            icon="♻️"
            title="Recyclability"
            description="Find out how the product (or its packaging) can be recycled at end of life."
          />
        </div>
        <div className="mt-6 bg-white rounded p-6 shadow text-sm xl:text-base text-gray-600">
          Look for the "View Product Passport (ReCircle)" link on eligible
          product pages to see this information for a specific item.
        </div>
      </div>
    </div>
  );
};

export default PassportPage;
