const ProcessStepCard = ({ step, title, description }) => {
  return (
    <div className="bg-white rounded p-6 m-3 shadow flex items-start">
      <div className="bg-amazonclone text-white rounded-full h-10 w-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
        {step}
      </div>
      <div>
        <div className="text-lg xl:text-xl font-semibold mb-1">{title}</div>
        <div className="text-sm xl:text-base text-gray-600">
          {description}
        </div>
      </div>
    </div>
  );
};

export default ProcessStepCard;
