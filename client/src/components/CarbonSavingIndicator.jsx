const CarbonSavingIndicator = ({ kg = 2.3 }) => {
  return (
    <span className="text-xs xl:text-sm bg-green-100 text-green-800 p-1 rounded font-semibold inline-block mr-1 mt-1">
      🌱 {kg}kg CO₂ saved with ReCircle
    </span>
  );
};

export default CarbonSavingIndicator;
