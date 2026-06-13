import { useState } from "react";
import {
  ReCircleHeroBanner,
  FeatureCard,
  PageHeader,
  ReCircleZoneModal,
  SellReturnModal,
  BuyPreOwnedModal,
  AIInspectionModal,
} from "../components";

const ReCirclePage = () => {
  // modal state machine: null | "zone" | "sell" | "buy" | "inspection"
  const [activeModal, setActiveModal] = useState(null);
  const [inspectionItem, setInspectionItem] = useState(null);

  const closeAll = () => setActiveModal(null);

  return (
    <div className="bg-amazonclone-background">
      <div className="min-w-[1000px] max-w-[1500px] m-auto">
        <ReCircleHeroBanner onOpenZone={() => setActiveModal("zone")} />

        <div className="p-6">
          <PageHeader
            title="What is ReCircle?"
            subtitle="Amazon's new circular commerce initiative: smarter returns, AI-verified quality, transparent product histories, and a measurable reduction in waste."
          />

          <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
            <FeatureCard
              icon="🤖"
              title="AI Grading"
              description="Returned and pre-owned items are automatically graded for condition using AI image analysis."
              link="/ai-grading"
            />
            <FeatureCard
              icon="📦"
              title="Smart Routing"
              description="Returns are routed to resale, repair, recycling, or donation — whichever creates the least waste."
              link="/routing"
            />
            <FeatureCard
              icon="🪪"
              title="Product Passport"
              description="Every ReCircle product carries a digital passport with origin, materials, and repair history."
              link="/passport"
            />
            <FeatureCard
              icon="🛡️"
              title="Return Prevention"
              description="Better descriptions, sizing tools, and AI recommendations reduce unnecessary returns before they happen."
              link="/prevention"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <FeatureCard
              icon="🌍"
              title="Sustainability Impact"
              description="See how ReCircle reduces carbon emissions and landfill waste across the Amazon marketplace."
              link="/sustainability"
              linkText="View our impact"
            />
            <div className="bg-white rounded p-6 m-3 shadow flex flex-col items-center justify-center text-center">
              <div className="text-lg xl:text-xl font-semibold mb-2">
                Ready to get started?
              </div>
              <div className="text-sm xl:text-base text-gray-600 mb-4">
                Sell an item, claim a return, or shop AI-verified pre-owned
                products — all in one place.
              </div>
              <button
                onClick={() => setActiveModal("zone")}
                className="btn"
              >
                Open ReCircle Zone
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal flow */}
      {activeModal === "zone" && (
        <ReCircleZoneModal
          onClose={closeAll}
          onSelectSell={() => setActiveModal("sell")}
          onSelectBuy={() => setActiveModal("buy")}
        />
      )}
      {activeModal === "sell" && (
        <SellReturnModal
          onClose={closeAll}
          onStartInspection={(item) => {
            setInspectionItem(item);
            setActiveModal("inspection");
          }}
        />
      )}
      {activeModal === "buy" && <BuyPreOwnedModal onClose={closeAll} />}
      {activeModal === "inspection" && (
        <AIInspectionModal onClose={closeAll} item={inspectionItem} />
      )}
    </div>
  );
};

export default ReCirclePage;
