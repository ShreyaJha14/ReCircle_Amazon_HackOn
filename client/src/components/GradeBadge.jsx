const gradeStyles = {
  A: "bg-green-600",
  B: "bg-yellow-500",
  C: "bg-orange-500",
};

const GradeBadge = ({ grade = "A" }) => {
  return (
    <span
      className={`${gradeStyles[grade] || "bg-gray-500"} text-white text-xs xl:text-sm font-bold px-2 py-1 rounded`}
    >
      Grade {grade}
    </span>
  );
};

export default GradeBadge;
