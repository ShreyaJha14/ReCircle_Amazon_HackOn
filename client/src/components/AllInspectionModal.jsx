import { useEffect, useState } from "react";
import { Modal, GradeBadge, TrustScoreBadge, CarbonSavingIndicator } from "./";

const AllInspectionModal = ({ onClose, item }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Modal title="ReCircle — AI Inspection" onClose={onClose} icon="🤖">
      {loading ? (
        <div className="text-center py-10">
          <div className="text-base xl:text-lg font-semibold mb-2">
            Analysing your photo...
          </div>
          <div className="text-sm xl:text-base text-gray-500">
            Our AI is checking condition, completeness, and estimating value.
          </div>
        </div>
      ) : (
        <div>
          <div className="text-base xl:text-lg font-semibold mb-3">
            {item?.productName || "Your item"} — Inspection complete
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <GradeBadge grade="A" />
            <TrustScoreBadge score={92} />
            <CarbonSavingIndicator kg={2.1} />
          </div>
          <div className="bg-amazonclone-background rounded p-4 text-sm xl:text-base mb-4">
            <div className="font-semibold mb-2">Recommended outcome</div>
            <div>
              This item is in great condition — we recommend listing it for
              resale at <span className="font-semibold">70% off</span> RRP via
              ReCircle.
            </div>
          </div>
          <button onClick={onClose} className="btn w-full">
            List Item via ReCircle
          </button>
        </div>
      )}
    </Modal>
  );
};

export default AllInspectionModal;
