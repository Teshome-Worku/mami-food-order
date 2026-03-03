import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating, reviewCount, size = "sm" }) => {
  const sizeClasses = size === "sm" ? "text-xs" : "text-sm";
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  const stars = [];
  const rounded = Math.round(rating * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(<FaStar key={i} className={`${starSize} text-amber-400`} />);
    } else if (i - 0.5 === rounded) {
      stars.push(<FaStarHalfAlt key={i} className={`${starSize} text-amber-400`} />);
    } else {
      stars.push(<FaRegStar key={i} className={`${starSize} text-amber-400`} />);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className={`${sizeClasses} font-medium text-gray-700`}>{rating}</span>
      {reviewCount != null && (
        <span className={`${sizeClasses} text-gray-400`}>({reviewCount})</span>
      )}
    </div>
  );
};

export default StarRating;
