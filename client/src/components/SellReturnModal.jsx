import { useState } from "react";
import { Modal } from "./";
import { CameraIcon } from "@heroicons/react/24/outline";

const SellReturnModal = ({ onClose, onStartInspection }) => {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Shoes");
  const [photo, setPhoto] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  };

  return (
    <Modal title="ReCircle — Sell or Return" onClose={onClose} icon="♻️">
      <div className="text-sm xl:text-base text-gray-600 mb-4">
        List your returned or unused item. Our AI handles everything —
        grading, pricing, and finding the next owner.
      </div>

      <label className="block text-sm xl:text-base font-semibold mb-1">
        Product Name
      </label>
      <input
        type="text"
        placeholder="e.g. Nike Air Max 270"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        className="w-full p-2 border rounded mb-4 focus:border-indigo-600 focus:outline-none"
      />

      <label className="block text-sm xl:text-base font-semibold mb-1">
        Category
      </label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded mb-4 bg-white focus:border-indigo-600 focus:outline-none"
      >
        <option>Shoes</option>
        <option>Electronics</option>
        <option>Home & Kitchen</option>
        <option>Baby Products</option>
        <option>Clothing</option>
        <option>Other</option>
      </select>

      <label className="block text-sm xl:text-base font-semibold mb-1">
        Product Photo
      </label>
      <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded p-6 mb-4 text-sm xl:text-base text-gray-500 cursor-pointer hover:bg-gray-50">
        <CameraIcon className="h-5 w-5" />
        {photo ? photo.name : "Tap to upload product photo"}
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </label>

      <button
        onClick={() => onStartInspection?.({ productName, category, photo })}
        className="btn w-full bg-amazonclone-light_blue text-white hover:bg-opacity-90"
      >
        Start AI Inspection →
      </button>
    </Modal>
  );
};

export default SellReturnModal;
