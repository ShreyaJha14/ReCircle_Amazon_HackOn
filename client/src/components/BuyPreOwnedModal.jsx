import { Modal, GradeBadge } from "./";
import { GB_CURRENCY } from "../utils/constants";
import { MapPinIcon } from "@heroicons/react/24/outline";

const dummyListings = [
  {
    id: 1,
    title: "Nike Air Max 270",
    image: "../images/recircle/shoe.png",
    grade: "A",
    price: 12.99,
    oldPrice: 59.99,
    distanceKm: 2.1,
    discount: 78,
  },
  {
    id: 2,
    title: "Philips Baby Monitor",
    image: "../images/recircle/monitor.png",
    grade: "B",
    price: 8.99,
    oldPrice: 34.99,
    distanceKm: 1.4,
    discount: 74,
  },
  {
    id: 3,
    title: "Prestige Induction Cooktop",
    image: "../images/recircle/cooktop.png",
    grade: "A",
    price: 15.99,
    oldPrice: 42.0,
    distanceKm: 3.0,
    discount: 62,
  },
];

const BuyPreOwnedModal = ({ onClose }) => {
  return (
    <Modal title="ReCircle — Buy Pre-owned" onClose={onClose} icon="♻️">
      <div className="text-sm xl:text-base text-gray-600 mb-4">
        Browse AI-verified pre-owned products near you. Each item carries a{" "}
        <span className="font-semibold">Product Health Card™</span>.
      </div>
      <div className="flex flex-col gap-3">
        {dummyListings.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border rounded p-3 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.title}
                className="h-[60px] w-[60px] object-contain"
              />
              <div>
                <div className="font-semibold text-sm xl:text-base">
                  {item.title}
                </div>
                <div className="mt-1">
                  <GradeBadge grade={item.grade} />
                </div>
                <div className="flex items-center gap-1 text-xs xl:text-sm text-gray-500 mt-1">
                  <MapPinIcon className="h-4 w-4" />
                  {item.distanceKm} km away
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg xl:text-xl font-semibold text-red-700">
                {GB_CURRENCY.format(item.price)}
              </div>
              <div className="text-xs xl:text-sm text-gray-500 line-through">
                {GB_CURRENCY.format(item.oldPrice)}
              </div>
              <div className="text-xs xl:text-sm text-green-700 font-semibold">
                {item.discount}% off
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default BuyPreOwnedModal;
