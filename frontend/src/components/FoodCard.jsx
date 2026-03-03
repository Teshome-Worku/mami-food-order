import { FiClock, FiPlus } from "react-icons/fi";

import StarRating from "./StarRating";
import { useToast } from "../context/toastContext";
import { formatCurrency } from "../utils/formatters";

const tagConfig = {
  popular: { label: "Popular", bg: "bg-orange-500" },
  "best-seller": { label: "Best Seller", bg: "bg-amber-500" },
  new: { label: "New", bg: "bg-emerald-500 badge-pulse" },
  spicy: { label: "Spicy", bg: "bg-red-500" },
  vegetarian: { label: "Veg", bg: "bg-green-600" },
};

const FoodCard = ({ food, onAddToCart, onViewDetail }) => {
  const { showToast } = useToast();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(food);
    showToast(`${food.name} added to cart`, "success");
  };

  const primaryTag = food.tags?.find((t) => tagConfig[t]);

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={() => onViewDetail?.(food)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onViewDetail?.(food)}
    >
      <div className="relative overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-110 sm:h-48"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {primaryTag && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-md ${tagConfig[primaryTag].bg}`}
          >
            {tagConfig[primaryTag].label}
          </span>
        )}

        {food.prepTime && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow backdrop-blur-sm">
            <FiClock className="h-3 w-3" />
            {food.prepTime} min
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-gray-900 sm:text-lg">
              {food.name}
            </h3>
            {food.category && (
              <p className="mt-0.5 text-xs uppercase tracking-wider text-gray-400">
                {food.category}
              </p>
            )}
          </div>
          <p className="whitespace-nowrap text-base font-bold text-orange-600 sm:text-lg">
            {formatCurrency(food.price)}
          </p>
        </div>

        {food.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
            {food.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          {food.rating ? (
            <StarRating rating={food.rating} reviewCount={food.reviewCount} />
          ) : (
            <span />
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 active:scale-[0.98]"
        >
          <FiPlus className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
