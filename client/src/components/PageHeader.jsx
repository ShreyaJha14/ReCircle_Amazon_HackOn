const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <div className="text-2xl xl:text-3xl font-semibold">{title}</div>
      {subtitle && (
        <div className="text-sm xl:text-base text-gray-600 mt-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
