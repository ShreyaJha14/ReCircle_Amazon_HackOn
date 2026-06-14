import { useEffect, useState } from "react";

const CreditToast = ({ amount, onDone }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#131921] border border-green-600 rounded-xl shadow-2xl px-5 py-4 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="text-3xl">🌱</div>
      <div>
        <p className="text-green-400 font-black text-lg">+{amount} Green Credits!</p>
        <p className="text-gray-300 text-xs">Added to your account</p>
      </div>
    </div>
  );
};

export default CreditToast;
