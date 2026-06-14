import { useNavigate } from "react-router-dom";
import { Modal } from "./";
import { ArchiveBoxIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

const ReCircleZoneModal = ({ onClose, onSelectSell, onSelectBuy }) => {
  const navigate = useNavigate();

  const handleSell = () => {
    onClose();
    navigate("/recircle/sell");
  };

  const handleBuy = () => {
    onClose();
    navigate("/recircle/buy");
  };

  return (
    <Modal title="ReCircle Zone" onClose={onClose} icon="♻️">
      <div className="text-sm xl:text-base text-gray-600 mb-4 text-center">
        Every returned, unused, or outgrown product automatically finds its
        next best owner.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleSell}
          className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg hover:border-amazonclone-light_blue transition"
        >
          <ArchiveBoxIcon className="h-10 w-10 mb-2 text-amazonclone-light_blue" />
          <div className="font-semibold text-base xl:text-lg mb-1">
            I want to Sell / Return
          </div>
          <div className="text-xs xl:text-sm text-gray-500">
            List an item for resale, peer-to-peer exchange, or donation via AI
            grading.
          </div>
        </button>
        <button
          onClick={handleBuy}
          className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg hover:border-orange-400 transition"
        >
          <ShoppingBagIcon className="h-10 w-10 mb-2 text-orange-400" />
          <div className="font-semibold text-base xl:text-lg mb-1">
            I want to Buy
          </div>
          <div className="text-xs xl:text-sm text-gray-500">
            Browse AI-verified pre-owned products at up to 70% off near you.
          </div>
        </button>
      </div>
    </Modal>
  );
};

export default ReCircleZoneModal;
