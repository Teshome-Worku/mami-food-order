import { Link, useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2, FiX, FiShoppingBag } from "react-icons/fi";

import { ROUTES } from "../constants";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import { useCart } from "../context/cartContext";
import { useToast } from "../context/toastContext";
import { formatCurrency } from "../utils/formatters";

const CartDrawer = () => {
  const {
    cartItems,
    cartTotal,
    cartCount,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQty,
  } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useBodyScrollLock(isCartOpen);

  const handleRemoveItem = (item) => {
    removeFromCart(item.id);
    showToast(`${item.name} removed from cart`, "info");
  };

  const handleUpdateQty = (item, delta) => {
    const willRemove = item.qty === 1 && delta === -1;
    updateQty(item.id, delta);

    if (willRemove) {
      showToast(`${item.name} removed from cart`, "info");
    }
  };

  const handleGoToCheckout = () => {
    closeCart();
    navigate(ROUTES.CART);
  };

  return (
    <>
      {isCartOpen && (
        <div
          className="animate-backdrop fixed inset-0 z-40 bg-black/40"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm transform flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FiShoppingBag className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
            {cartCount > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                {cartCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close cart"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-4xl">
                  🛒
                </div>
                <p className="mb-1 font-semibold text-gray-700">
                  Your cart is empty
                </p>
                <p className="mb-6 text-sm text-gray-400">
                  Add items from the menu to get started
                </p>
                <Link
                  to={ROUTES.MENU}
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl bg-gray-50/80 p-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(item.price)} each
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm transition hover:bg-gray-100"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <FiMinus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold text-gray-800">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm transition hover:bg-gray-100"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <FiPlus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.price * item.qty)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                        aria-label={`Remove ${item.name}`}
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-100 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {cartCount} item{cartCount !== 1 ? "s" : ""}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleGoToCheckout}
                className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
