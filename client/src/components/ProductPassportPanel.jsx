import { useState } from "react";

const ProductPassportPanel = ({ passport }) => {
  const [open, setOpen] = useState(false);

  if (!passport) return null;

  return (
    <div className="mt-3 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm xl:text-base text-blue-500 font-semibold hover:underline"
      >
        {open ? "Hide" : "View"} Product Passport (ReCircle) {open ? "▲" : "▼"}
      </button>
      {open && (
        <div className="mt-3 bg-amazonclone-background rounded p-4 text-sm xl:text-base">
          <div className="font-semibold mb-2">Product Passport</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">Origin: </span>
              {passport.origin}
            </div>
            <div>
              <span className="font-semibold">Materials: </span>
              {passport.materials}
            </div>
            <div>
              <span className="font-semibold">Repair history: </span>
              {passport.repairHistory}
            </div>
            <div>
              <span className="font-semibold">Recyclability: </span>
              {passport.recyclability}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPassportPanel;
