import { FiX, FiClock, FiShoppingCart } from "react-icons/fi";

import StarRating from "./StarRating";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import { formatCurrency } from "../utils/formatters";

const tagConfig = {
  popular: { label: "Popular", bg: "bg-orange-100 text-orange-700" },
  "best-seller": { label: "Best Seller", bg: "bg-amber-100 text-amber-700" },
  new: { label: "New", bg: "bg-emerald-100 text-emerald-700" },
  spicy: { label: "Spicy", bg: "bg-red-100 text-red-700" },
  vegetarian: { label: "Vegetarian", bg: "bg-green-100 text-green-700" },
};

const FoodDetailModal = ({ food, onClose, onAddToCart }) => {
  useBodyScrollLock(true);

  if (!food) return null;

  const handleAdd = () => {
    onAddToCart?.(food);
    onClose();
  };

  return (
    <>
      <div
        className="animate-backdrop fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="animate-modal relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label={food.name}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow backdrop-blur-sm transition hover:bg-white hover:text-gray-900"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>

          <img
            src={food.image}
            alt={food.name}
            className="h-56 w-full object-cover sm:h-64"
          />

          <div className="space-y-4 p-5 sm:p-6">
            {food.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {food.tags.map((tag) => {
                  const conf = tagConfig[tag];
                  if (!conf) return null;
                  return (
                    <span
                      key={tag}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${conf.bg}`}
                    >
                      {conf.label}
                    </span>
                  );
                })}
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {food.name}
              </h2>
              {food.category && (
                <p className="mt-0.5 text-sm text-gray-400">{food.category}</p>
              )}
            </div>

            {food.rating && (
              <StarRating
                rating={food.rating}
                reviewCount={food.reviewCount}
                size="md"
              />
            )}

            {food.description && (
              <p className="text-sm leading-relaxed text-gray-600">
                {food.description}
              </p>
            )}

            {food.ingredients?.length > 0 && (
              <div>
                <h3 className="mb-1.5 text-sm font-semibold text-gray-700">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {food.ingredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(food.price)}
                </p>
                {food.prepTime && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                    <FiClock className="h-3 w-3" />
                    {food.prepTime} min prep
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-95"
              >
                <FiShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodDetailModal;
