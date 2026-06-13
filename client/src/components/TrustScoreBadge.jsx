const TrustScoreBadge = ({ score = 90 }) => {
  return (
    <span className="text-xs xl:text-sm bg-blue-100 text-blue-800 p-1 rounded font-semibold inline-block mr-1 mt-1">
      Trust Score: {score}/100
    </span>
  );
};

export default TrustScoreBadge;
