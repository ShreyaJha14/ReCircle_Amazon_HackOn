import { Link } from "react-router-dom";

const FeatureCard = ({ title, description, icon, link, linkText }) => {
  return (
    <div className="bg-white rounded p-6 m-3 shadow flex flex-col h-full">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <div className="text-lg xl:text-xl font-semibold mb-2">{title}</div>
      <div className="text-sm xl:text-base text-gray-600 flex-grow">
        {description}
      </div>
      {link && (
        <Link to={link}>
          <div className="text-xs xl:text-sm text-blue-500 mt-3 hover:underline">
            {linkText || "Learn more"}
          </div>
        </Link>
      )}
    </div>
  );
};

export default FeatureCard;
